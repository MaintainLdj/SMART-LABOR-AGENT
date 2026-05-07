from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from typing import List
from jose import JWTError, jwt
from passlib.context import CryptContext
from mcp.mcp_protocol import mcp_client
from utils.logger import add_oper_log
from utils.file_util import save_upload_file
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
# AI工作流
from agent.workflow import agent_workflow

load_dotenv()
app = FastAPI(title="智慧劳务自治服务Agent", version="3.0")

# 跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局异常拦截
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(content={"code": exc.status_code, "msg": exc.detail, "data": None}, status_code=200)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(content={"code": 400, "msg": "参数校验失败", "data": None}, status_code=200)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(content={"code": 500, "msg": "服务器内部错误：" + str(exc), "data": None}, status_code=200)

# ==================== JWT 登录配置 ====================
SECRET_KEY = "smart-labor-agent-2025"  # JWT签名密钥
ALGORITHM = "HS256"                     # 加密算法
ACCESS_TOKEN_EXPIRE_MINUTES = 120       # Token有效期120分钟
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # 密码加密上下文
# 安全处理 bcrypt 72字节限制 + 版本兼容
raw_pwd = "123456"
safe_pwd = raw_pwd.encode('utf-8')[:72].decode('utf-8', 'ignore')

# 模拟用户
fake_users = {
    "admin": {
        "username": "admin",
        "password": pwd_context.hash("123456"),
        "role": "admin"   # 管理员
    },
    "operator": {
        "username": "operator",
        "password": pwd_context.hash("123456"),
        "role": "operator" # 普通操作员
    }
}

class UserLogin(BaseModel):
    username: str
    password: str

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/api/login")
def login(user: UserLogin):
    account = fake_users.get(user.username)
    if not account or not pwd_context.verify(user.password, account["password"]):
        raise HTTPException(status_code=400, detail="账号或密码错误")
    token = create_token({"sub": user.username, "role": account["role"]})
    return {"code":200, "token":token, "username":user.username, "role": account["role"]}

# ==================== WebSocket ====================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self, msg: dict):
        for c in self.active_connections:
            try: await c.send_json(msg)
            except: pass

manager = ConnectionManager()

@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ==================== 数据模型 ====================
class LaborItem(BaseModel):
    name: str
    work_id: str
    position: str
    department: str
    status: str
    work_days: int

class CheckinRecord(BaseModel):
    labor_id: int
    work_id: str
    name: str
    checkin_type: str

# ==================== 全局数据 ====================
labor_list = [
    {"id":1,"name":"张三","work_id":"LA2024001","position":"建筑工人","entry_time":"2024-01-15","department":"施工一组","status":"在岗","work_days":28},
    {"id":2,"name":"李四","work_id":"LA2024002","position":"电工","entry_time":"2024-02-20","department":"机电组","status":"在岗","work_days":27},
    {"id":3,"name":"王五","work_id":"LA2024003","position":"安全员","entry_time":"2024-03-10","department":"安全组","status":"请假","work_days":20},
    {"id":4,"name":"赵六","work_id":"LA2024004","position":"焊工","entry_time":"2024-04-05","department":"施工二组","status":"在岗","work_days":29}
]
next_id = 5
checkin_records = []

# ==================== 人员接口 ====================
@app.get("/api/labor/list")
def labor_list_api():
    return {"code":200, "data":labor_list}

@app.get("/api/labor/search")
def labor_search(work_id:str=""):
    if not work_id: return {"code":400}
    item = next((x for x in labor_list if x["work_id"]==work_id), None)
    return {"code":200,"data":item} if item else {"code":404}

@app.post("/api/labor/add")
async def labor_add(item:LaborItem):
    global next_id
    new_item = {"id":next_id,**item.model_dump(),"entry_time":datetime.now().strftime("%Y-%m-%d")}
    labor_list.append(new_item)
    next_id +=1

    # 写入操作日志
    add_oper_log(opt_type="人员管理", content=f"新增人员：{item.name}")

    await manager.broadcast({"type":"labor","msg":f"新增 {item.name}"})
    return {"code":200}

@app.put("/api/labor/update/{lid}")
async def labor_update(lid:int, item:LaborItem):
    for o in labor_list:
        if o["id"]==lid:
            o.update(item.model_dump())
            await manager.broadcast({"type":"labor","msg":f"{item.name} 已更新"})
            return {"code":200}
    return {"code":404}

@app.delete("/api/labor/delete/{lid}")
async def labor_del(lid:int):
    global labor_list
    labor_list = [x for x in labor_list if x["id"]!=lid]
    await manager.broadcast({"type":"labor","msg":"人员已删除"})
    return {"code":200}

# ==================== 考勤接口 ====================
@app.post("/api/checkin/submit")
async def checkin_submit(record:CheckinRecord):
    new_rec = {
        "id":len(checkin_records)+1,**record.model_dump(),
        "time":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    checkin_records.append(new_rec)
    await manager.broadcast({"type":"checkin","msg":f"{record.name} {record.checkin_type} 打卡"})
    return {"code":200}

@app.get("/api/checkin/list")
def checkin_list():
    return {"code":200,"data":checkin_records}

# ==================== 统计接口（给图表用） ====================
@app.get("/api/dashboard/statistics")
def dashboard_stat():
    total = len(labor_list)
    on_job = len([x for x in labor_list if x["status"]=="在岗"])
    leave = total - on_job
    abnormal = len([x for x in labor_list if x["work_days"]<22])
    return {
        "code":200,
        "data":{
            "total":total, "on_job":on_job, "leave":leave, "abnormal":abnormal,
            "checkin_total":len(checkin_records)
        }
    }


# 简易全局会话内存（单用户）
chat_history = []

# ==================== AI 接口 ====================
@app.post("/api/agent/auto_work")
async def agent_auto_work(req: dict):
    global chat_history
    question = req.get("question", "")
    try:
        result = agent_workflow.invoke({
            "question": question,
            "history": chat_history,
            "labor_data": [],
            "checkin_data": [],
            "salary_result": {},
            "warning_msg": [],
            "audit_result": "",
            "rag_context": "",
            "final_answer": "",
            "task_intent": "",
            "tool_name": "",
            "tool_result": ""
        })
        # 保存本轮问答到历史
        chat_history.append(f"用户：{question}")
        chat_history.append(f"AI：{result['final_answer'][:200]}")

        # 预警推送
        if result.get("warning_msg"):
            for w in result["warning_msg"]:
                await manager.broadcast({"type": "warning", "msg": w})
        return {"code": 200, "data": result}
    except Exception as e:
        return {"code": 500, "message": str(e)}

@app.get("/")
def index():
    return {"msg":"智慧劳务Agent v3.0 运行成功"}

# ==================== Day15 新增：AI生成Excel报表 ====================
import pandas as pd
from openpyxl import Workbook
import uuid

@app.get("/api/export/labor-report")
async def export_labor_report():
    """AI一键导出劳务综合报表：人员+考勤+薪资"""
    salary_data = {p["name"]: p["work_days"] * 220 for p in labor_list}
    # 组装报表数据
    report_data = []
    for item in labor_list:
        report_data.append({
            "工号": item["work_id"],
            "姓名": item["name"],
            "部门": item["department"],
            "岗位": item["position"],
            "在岗状态": item["status"],
            "月度工时": item["work_days"],
            "核算薪资(元)": salary_data.get(item["name"], 0)
        })
    # 生成临时文件
    file_name = f"劳务综合报表_{uuid.uuid4().hex[:8]}.xlsx"
    save_path = f"./{file_name}"
    df = pd.DataFrame(report_data)
    df.to_excel(save_path, index=False)

    # 自动广播报表生成通知
    await manager.broadcast({
        "type": "system",
        "msg": "✅ AI已自动生成劳务人员&薪资综合Excel报表"
    })
    return {"code": 200, "url": save_path, "fileName": file_name}

# ==================== Day15 新增：全局主动预警推送 ====================
@app.post("/api/system/auto-warning")
async def system_auto_warning():
    """系统定时自动巡检，主动推送风险预警"""
    warn_list = []
    for p in labor_list:
        if p["work_days"] < 22:
            warn_list.append(f"{p['name']} 月度工时不达标，存在薪资合规风险")
        if len(p["work_id"]) < 8:
            warn_list.append(f"{p['name']} 实名制信息不完善，不符合住建监管要求")

    for msg in warn_list:
        await manager.broadcast({"type": "warning", "msg": msg})
    return {"code": 200, "warningList": warn_list, "count": len(warn_list)}

# MCP 硬件设备心跳接口
@app.get("/api/mcp/heartbeat")
async def mcp_heart():
    return await mcp_client.device_heartbeat()

# 日志查询接口
@app.get("/api/system/logs")
def get_system_logs():
    from utils.logger import get_all_logs
    return {"code": 200, "data": get_all_logs()}

# 合同/协议文件上传
@app.post("/api/upload/contract")
async def upload_contract(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[-1]
        url = await save_upload_file(file, suffix)
        add_oper_log("文件管理", f"上传合同文件：{file.filename}")
        return {"code": 200, "msg": "上传成功", "url": url}
    except Exception as e:
        return {"code": 500, "msg": str(e)}
    
# 黑名单数据
black_list = []

class BlackItem(BaseModel):
    name: str
    work_id: str
    reason: str
def get_black_list():
    return black_list

# 新增黑名单
@app.post("/api/black/add")
async def add_black(item: BlackItem):
    black_list.append({
        "id": len(black_list)+1,
        "name": item.name,
        "work_id": item.work_id,
        "reason": item.reason,
        "create_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    add_oper_log("黑名单", f"封禁人员：{item.name}")
    await manager.broadcast({"type":"warning","msg":f"⚠️ 人员【{item.name}】已加入劳务黑名单"})
    return {"code":200,"msg":"加入黑名单成功"}

# 查询黑名单
@app.get("/api/black/list")
def black_list_api():
    return {"code":200,"data":black_list}

# ==================== 薪资规则配置 ====================
salary_rule = {
    "daily_wage": 220,        # 基础日薪
    "overtime_rate": 1.5,    # 加班倍率
    "late_deduct": 20,       # 迟到扣款
    "absent_deduct": 100     # 旷工单日扣款
}

# ==================== 考勤异常记录 ====================
attendance_exception_list = []

# ==================== 薪资规则配置 ====================
class SalaryRuleItem(BaseModel):
    daily_wage: float
    overtime_rate: float
    late_deduct: float
    absent_deduct: float

# 获取薪资配置
@app.get("/api/salary/rule")
def get_salary_rule():
    return {"code": 200, "data": salary_rule}

# 修改薪资配置
@app.post("/api/salary/rule")
async def edit_salary_rule(item: SalaryRuleItem):
    global salary_rule
    salary_rule["daily_wage"] = item.daily_wage
    salary_rule["overtime_rate"] = item.overtime_rate
    salary_rule["late_deduct"] = item.late_deduct
    salary_rule["absent_deduct"] = item.absent_deduct

    add_oper_log("薪资配置", "修改薪资核算规则")
    await manager.broadcast({"type": "system", "msg": "薪资核算规则已更新生效"})
    return {"code": 200, "msg": "规则修改成功"}

# 智能薪资核算
@app.get("/api/salary/calc-all")
def calc_all_salary():
    res_list = []
    rule = salary_rule
    for p in labor_list:
        # 基础工资
        base = p["work_days"] * rule["daily_wage"]
        # 模拟加班3天
        overtime_money = 3 * rule["daily_wage"] * rule["overtime_rate"]
        # 模拟迟到2次
        late_money = 2 * rule["late_deduct"]
        # 模拟旷工0天
        absent_money = 0 * rule["absent_deduct"]

        real_salary = base + overtime_money - late_money - absent_money

        res_list.append({
            "name": p["name"],
            "work_id": p["work_id"],
            "work_days": p["work_days"],
            "base_salary": round(base, 2),
            "overtime_money": round(overtime_money, 2),
            "deduct_money": round(late_money + absent_money, 2),
            "real_salary": round(real_salary, 2)
        })
    return {"code": 200, "data": res_list}

# AI 考勤异常智能研判接口
class CheckinAnalyzeReq(BaseModel):
    name: str
    check_time: str
    standard_start: str = "08:00"

@app.post("/api/attendance/ai-analyze")
async def ai_attendance_analyze(req: CheckinAnalyzeReq):
    # 简易时间比对研判
    hour, minute = map(int, req.check_time.split(":"))
    std_h, std_m = map(int, req.standard_start.split(":"))

    status = "正常打卡"
    if hour > std_h or (hour == std_h and minute > 30):
        status = "迟到"
    if hour >= 10:
        status = "严重迟到"

    record = {
        "id": len(attendance_exception_list) + 1,
        "name": req.name,
        "check_time": req.check_time,
        "status": status,
        "create_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    attendance_exception_list.append(record)

    if status != "正常打卡":
        await manager.broadcast({"type": "warning", "msg": f"AI考勤研判：{req.name} {status}"})
        add_oper_log("考勤异常", f"{req.name} 被判定为{status}")

    return {"code": 200, "data": record}

# 获取考勤异常列表
@app.get("/api/attendance/exception-list")
def get_attendance_exception():
    return {"code": 200, "data": attendance_exception_list}