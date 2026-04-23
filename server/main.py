from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from datetime import datetime
from agent.workflow import agent_workflow
from typing import List

load_dotenv()
app = FastAPI(title="智慧劳务自治服务Agent", version="2.0")

# ✅ 正确跨域配置（兼容 WebSocket）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- WebSocket 连接管理器 -------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except:
                pass

manager = ConnectionManager()

# ------------------- 数据模型 -------------------
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

# ------------------- 全局数据 -------------------
labor_list = [
    {"id": 1, "name": "张三", "work_id": "LA2024001", "position": "建筑工人", "entry_time": "2024-01-15", "department": "施工一组", "status": "在岗", "work_days": 28},
    {"id": 2, "name": "李四", "work_id": "LA2024002", "position": "电工", "entry_time": "2024-02-20", "department": "机电组", "status": "在岗", "work_days": 27},
    {"id": 3, "name": "王五", "work_id": "LA2024003", "position": "安全员", "entry_time": "2024-03-10", "department": "安全组", "status": "请假", "work_days": 20},
    {"id": 4, "name": "赵六", "work_id": "LA2024004", "position": "焊工", "entry_time": "2024-04-05", "department": "施工二组", "status": "在岗", "work_days": 29}
]
next_id = 5
checkin_records = []

# ------------------- ✅ WebSocket 接口（修复 403） -------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ------------------- 人员管理 -------------------
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
async def add_labor(item: LaborItem):
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
    await manager.broadcast({"type": "labor_add", "msg": f"【人员】{item.name} 已录入"})
    return {"code": 200, "message": "添加成功"}

@app.put("/api/labor/update/{labor_id}")
async def update_labor(labor_id: int, item: LaborItem):
    for obj in labor_list:
        if obj["id"] == labor_id:
            obj["name"] = item.name
            obj["work_id"] = item.work_id
            obj["position"] = item.position
            obj["department"] = item.department
            obj["status"] = item.status
            obj["work_days"] = item.work_days
            await manager.broadcast({"type": "labor_update", "msg": f"【人员】{item.name} 已更新"})
            return {"code": 200, "message": "更新成功"}
    return {"code": 404, "message": "未找到"}

@app.delete("/api/labor/delete/{labor_id}")
async def delete_labor(labor_id: int):
    global labor_list
    labor_list = [x for x in labor_list if x["id"] != labor_id]
    await manager.broadcast({"type": "labor_delete", "msg": "【人员】已删除"})
    return {"code": 200, "message": "删除成功"}

# ------------------- 考勤打卡 -------------------
@app.post("/api/checkin/submit")
async def submit_checkin(record: CheckinRecord):
    new_record = {
        "id": len(checkin_records) + 1,
        "labor_id": record.labor_id,
        "work_id": record.work_id,
        "name": record.name,
        "checkin_type": record.checkin_type,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    checkin_records.append(new_record)
    await manager.broadcast({
        "type": "checkin",
        "msg": f"【打卡】{record.name} {record.checkin_type} 成功"
    })
    return {"code": 200, "message": "打卡成功", "data": new_record}

@app.get("/api/checkin/list")
def get_checkin_list():
    return {"code": 200, "data": checkin_records}

# ------------------- AI 自治 -------------------
@app.post("/api/agent/auto_work")
async def agent_auto_work(req: dict):
    try:
        result = agent_workflow.invoke({
            "question": req.get("question", ""),
            "labor_data": [],
            "checkin_data": {},
            "salary_result": {},
            "warning_msg": [],
            "audit_result": "",
            "rag_context": "",
            "final_answer": ""
        })
        if result.get("warning_msg"):
            for w in result["warning_msg"]:
                await manager.broadcast({"type": "warning", "msg": f"【预警】{w}"})
        return {"code": 200, "data": result}
    except Exception as e:
        return {"code": 500, "message": str(e)}

@app.get("/")
def index():
    return {"status": "running", "msg": "智慧劳务Agent + WebSocket 正常运行"}