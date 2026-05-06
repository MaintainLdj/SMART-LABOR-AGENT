"""
MCP 劳务设备对接协议
适配：人脸识别考勤机、实名制闸机、工地IoT设备
"""
from datetime import datetime

class MCPClient:
    def __init__(self):
        self.device_online = True
        self.device_name = "工地实名制考勤一体机"

    async def device_heartbeat(self):
        # 设备心跳包
        return {
            "deviceCode": "MCP-2026-LAB-001",
            "online": self.device_online,
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    async def face_checkin(name: str, work_id: str, check_type: str):
        # MCP 人脸识别打卡上报
        return {
            "code": 200,
            "msg": "机具核验成功",
            "data": {
                "name": name,
                "workId": work_id,
                "checkType": check_type,
                "deviceSource": "MCP实名制闸机",
                "checkTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        }

# 单例导出
mcp_client = MCPClient()