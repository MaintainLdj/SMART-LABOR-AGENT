from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from datetime import datetime
from agent.workflow import agent_workflow

load_dotenv()
app = FastAPI(title="智慧劳务自治服务Agent", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 人员模型
class LaborItem(BaseModel):
    name: str
    work_id: str
    position: str
    department: str
    status: str
    work_days: int

# 考勤模型
class CheckinRecord(BaseModel):
    labor_id: int
    work_id: str
    name: str
    checkin_type: str  # 上班/下班

# 全局人员数据
labor_list = [
    {"id": 1, "name": "张三", "work_id": "LA2024001", "position": "建筑工人", "entry_time": "2024-01-15", "department": "施工一组", "status": "在岗", "work_days": 28},
    {"id": 2, "name": "李四", "work_id": "LA2024002", "position": "电工", "entry_time": "2024-02-20", "department": "机电组", "status": "在岗", "work_days": 27},
    {"id": 3, "name": "王五", "work_id": "LA2024003", "position": "安全员", "entry_time": "2024-03-10", "department": "安全组", "status": "请假", "work_days": 20},
    {"id": 4, "name": "赵六", "work_id": "LA2024004", "position": "焊工", "entry_time": "2024-04-05", "department": "施工二组", "status": "在岗", "work_days": 29}
]

next_id = 5

# 考勤记录
checkin_records = []

# ==================== 人员接口 ====================
@app.get("/api/labor/list")
def get_labor_list():
    return {"code": 200, "data": labor_list}

@app.get("/api/labor/search")
def search_labor(work_id: str = ""):
    if not work_id:
        return {"code": 400, "message": "工号不能为空"}
    item = next((x for x in labor_list if x["work_id"] == work_id), None)
    return {"code": 200, "data": item} if item else {"code": 404, "message": "未找到人员"}

@app.post("/api/labor/add")
def add_labor(item: LaborItem):
    global next_id
    new_item = {
        "id": next_id,
        "name": item.name,
        "work_id": item.work_id,
        "position": item.position,
        "entry_time": datetime.now().strftime("%Y-%m-%d"),
        "department": item.department,
        "status": item.status,
        "work_days": item.work_days
    }
    labor_list.append(new_item)
    next_id += 1
    return {"code": 200, "message": "添加成功"}

@app.put("/api/labor/update/{labor_id}")
def update_labor(labor_id: int, item: LaborItem):
    for obj in labor_list:
        if obj["id"] == labor_id:
            obj["name"] = item.name
            obj["work_id"] = item.work_id
            obj["position"] = item.position
            obj["department"] = item.department
            obj["status"] = item.status
            obj["work_days"] = item.work_days
            return {"code": 200, "message": "更新成功"}
    return {"code": 404, "message": "未找到"}

@app.delete("/api/labor/delete/{labor_id}")
def delete_labor(labor_id: int):
    global labor_list
    labor_list = [x for x in labor_list if x["id"] != labor_id]
    return {"code": 200, "message": "删除成功"}

# ==================== Day8 考勤接口 ====================
@app.post("/api/checkin/submit")
def submit_checkin(record: CheckinRecord):
    new_record = {
        "id": len(checkin_records) + 1,
        "labor_id": record.labor_id,
        "work_id": record.work_id,
        "name": record.name,
        "checkin_type": record.checkin_type,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    checkin_records.append(new_record)
    return {"code": 200, "message": "打卡成功", "data": new_record}

@app.get("/api/checkin/list")
def get_checkin_list():
    return {"code": 200, "data": checkin_records}

# ==================== AI自治接口 ====================
@app.post("/api/agent/auto_work")
def agent_auto_work(req: dict):
    try:
        result = agent_workflow.invoke({
            "question": req.get("question", ""),
            "labor_data": [],
            "checkin_data": {},
            "salary_result": {},
            "warning_msg": [],
            "final_answer": ""
        })
        return {
            "code": 200,
            "data": {
                "checkin": result["checkin_data"],
                "warning": result["warning_msg"],
                "salary": result["salary_result"],
                "answer": result["final_answer"]
            }
        }
    except Exception as e:
        return {"code": 500, "message": f"异常：{str(e)}"}

@app.get("/")
def index():
    return {"msg": "Day8 考勤模块运行成功"}