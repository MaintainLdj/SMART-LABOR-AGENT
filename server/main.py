from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from typing import List
from jose import JWTError, jwt
from passlib.context import CryptContext

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

# ==================== JWT 登录配置 ====================
SECRET_KEY = "smart-labor-agent-2025"  # JWT签名密钥
ALGORITHM = "HS256"                     # 加密算法
ACCESS_TOKEN_EXPIRE_MINUTES = 120       # Token有效期120分钟
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # 密码加密上下文

# 模拟用户
fake_users = {
    "admin": {
        "username": "admin",
        "password": pwd_context.hash("123456"), # 密码被bcrypt加密
        "role": "admin"
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
    return {"code":200, "token":token, "username":user.username}

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

# ==================== AI 接口 ====================
@app.post("/api/agent/auto_work")
async def agent_api(req:dict):
    try:
        res = agent_workflow.invoke({
            "question":req.get("question",""),
            "labor_data":[],"checkin_data":{},"salary_result":{},
            "warning_msg":[],"audit_result":"","rag_context":"","final_answer":""
        })
        for w in res.get("warning_msg",[]):
            await manager.broadcast({"type":"warning","msg":w})
        return {"code":200,"data":res}
    except Exception as e:
        return {"code":500,"msg":str(e)}

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