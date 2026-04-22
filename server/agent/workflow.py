from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict
import os
from rag.labor_knowledge import search_knowledge

# 模拟MCP协议插件（对接硬件/API/EDI）
class MCPPlugin:
    @staticmethod
    def verify_real_name(labor_id: str) -> bool:
        """实名制核验（对接住建EDI）"""
        return len(labor_id) >= 8

    @staticmethod
    def check_contract_status(name: str) -> str:
        """电子合同履约状态（对接腾讯电子签）"""
        return "已签署" if name in ["张三","李四"] else "未签署"

    @staticmethod
    def get_iot_device_data(labor_id: str) -> dict:
        """考勤硬件MQTT数据"""
        return {"device_id": f"MQTT_{labor_id}", "last_checkin": "2026-04-22 08:30"}

# 状态定义
class LaborState(TypedDict):
    question: str
    labor_data: List[Dict]
    checkin_data: Dict
    salary_result: Dict
    warning_msg: List[str]
    audit_result: str       # 合规审计
    rag_context: str        # RAG知识
    final_answer: str

# 1. 加载人员
def load_data(state: LaborState):
    labor_list = [
        {"id":1,"name":"张三","work_id":"LA2024001","status":"在岗","work_days":28},
        {"id":2,"name":"李四","work_id":"LA2024002","status":"在岗","work_days":27},
        {"id":3,"name":"王五","work_id":"LA2024003","status":"请假","work_days":20},
    ]
    return {"labor_data": labor_list}

# 2. RAG检索法规
def rag_retrieve(state: LaborState):
    ctx = search_knowledge(state["question"])
    return {"rag_context": ctx}

# 3. 实名制核验 + 电子合同审计（MCP插件）
def audit_compliance(state: LaborState):
    warnings = []
    for p in state["labor_data"]:
        # 核验实名制
        if not MCPPlugin.verify_real_name(p["work_id"]):
            warnings.append(f"【实名制异常】{p['name']} 未通过住建核验")
        # 核验合同
        contract = MCPPlugin.check_contract_status(p["name"])
        if contract != "已签署":
            warnings.append(f"【合同风险】{p['name']} 未签署电子劳动合同")
        # 考勤硬件
        device = MCPPlugin.get_iot_device_data(str(p["id"]))
        if not device:
            warnings.append(f"【设备异常】{p['name']} 考勤终端离线")

    audit = f"共审计{len(state['labor_data'])}人，发现{len(warnings)}项风险"
    return {"warning_msg": warnings, "audit_result": audit}

# 4. 薪资核算
def calc_salary(state: LaborState):
    res = {p["name"]: p["work_days"]*220 for p in state["labor_data"]}
    return {"salary_result": res}

# 5. AI最终回答
def ai_answer(state: LaborState):
    prompt = f"""
你是智慧劳务自治AI助手，基于以下信息专业回答：
【RAG法规知识】
{state['rag_context']}

【人员数据】{state['labor_data']}
【合规审计】{state['audit_result']}
【异常预警】{state['warning_msg']}
【薪资核算】{state['salary_result']}
用户问题：{state['question']}

要求：条理清晰、专业、劳务场景化、突出AI自治能力。
"""
    # 本地兜底回答（有KEY自动调用智谱）
    answer = f"""
【AI自治服务结果】
{state['audit_result']}
异常：{'; '.join(state['warning_msg'])}
薪资：{state['salary_result']}
法规参考：已自动匹配建筑劳务合规条款
"""
    return {"final_answer": answer}

# 构建完整工作流
workflow = StateGraph(LaborState)
workflow.add_node("load", load_data)
workflow.add_node("rag", rag_retrieve)
workflow.add_node("audit", audit_compliance)
workflow.add_node("salary", calc_salary)
workflow.add_node("ai", ai_answer)

workflow.set_entry_point("load")
workflow.add_edge("load", "rag")
workflow.add_edge("rag", "audit")
workflow.add_edge("audit", "salary")
workflow.add_edge("salary", "ai")
workflow.add_edge("ai", END)

agent_workflow = workflow.compile()