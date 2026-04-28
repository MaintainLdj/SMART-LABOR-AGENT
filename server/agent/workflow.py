from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict
from dotenv import load_dotenv
import os
from zhipuai import ZhipuAI
from rag.labor_knowledge_base import retrieve_relevant_knowledge
from tools.labor_tools import TOOL_MAP

load_dotenv()
client = ZhipuAI(api_key=os.getenv("ZHIPU_API_KEY", ""))

# 状态结构体
class LaborState(TypedDict):
    question: str
    history: list[str]    # 新增：对话历史
    labor_data: List[Dict]
    checkin_data: List[Dict]
    salary_result: Dict
    warning_msg: List[str]
    audit_result: str
    rag_context: str
    final_answer: str
    task_intent: str
    tool_name: str       # 新增：AI选中的工具
    tool_result: str     # 新增：工具执行结果

# 1. 加载基础数据
def load_business_data(state: LaborState):
    labor_data = [
        {"id":1,"name":"张三","work_id":"LA2024001","department":"施工一组","status":"在岗","work_days":28},
        {"id":2,"name":"李四","work_id":"LA2024002","department":"机电组","status":"在岗","work_days":27},
        {"id":3,"name":"王五","work_id":"LA2024003","department":"安全组","status":"请假","work_days":20},
    ]
    return {"labor_data": labor_data}

# 新增：拼接多轮对话，实现上下文连续理解
def concat_history(state: LaborState):
    history_text = ""
    if state["history"]:
        history_text = "历史对话：\n" + "\n".join(state["history"][-6:])
    return {"history_text": history_text}

# 2. AI自主决策：选择需要调用的工具
def ai_tool_choose(state: LaborState):
    prompt = """
你是劳务管理AI决策器，请根据用户问题，只返回对应工具标识：
可选工具：
query_staff-查询全部人员
query_abnormal-筛查异常人员
calc_salary-核算全员薪资
query_dept-按部门查人
rag_only-仅法规咨询，无需工具
weekly_report-生成劳务周报
full_risk-全维度风险排查

用户问题：""" + state["question"]
    try:
        resp = client.chat.completions.create(model="glm-4",messages=[{"role":"user","content":prompt}])
        tool_name = resp.choices[0].message.content.strip()
    except:
        tool_name = "rag_only"
    return {"tool_name": tool_name}

# 3. 执行选中的工具
def run_tool(state: LaborState):
    tool_name = state["tool_name"]
    q = state["question"]
    res = ""
    if tool_name == "query_staff":
        res = TOOL_MAP["query_staff"]()
    elif tool_name == "query_abnormal":
        res = TOOL_MAP["query_abnormal"]()
    elif tool_name == "calc_salary":
        res = TOOL_MAP["calc_salary"]()
    elif tool_name == "query_dept":
        # 简单提取部门关键词
        dept = "施工" if "施工" in q else "机电" if "机电" in q else "安全"
        res = TOOL_MAP["query_dept"](dept)
    elif tool_name == "weekly_report":
        res = TOOL_MAP["weekly_report"]()
    elif tool_name == "full_risk":
        res = TOOL_MAP["full_risk"]()
    else:
        res = "无需调用业务工具"
    return {"tool_result": res}

# 4. RAG法规检索
def rag_retrieve(state: LaborState):
    context = retrieve_relevant_knowledge(state["question"])
    return {"rag_context": context}

# 5. 合规审计
def compliance_audit(state: LaborState):
    warnings = []
    for p in state["labor_data"]:
        if p["work_days"] < 22:
            warnings.append(f"{p['name']} 出勤不足")
    return {"warning_msg": warnings,"audit_result":f"共检测{len(state['labor_data'])}人"}

# 6. 整合工具结果+RAG+业务数据生成最终回答
def ai_final_answer(state: LaborState):
    prompt = f"""
你是智慧劳务自治服务Agent，支持多轮连续对话。
{state.get("history_text", "")}

当前用户问题：{state['question']}
工具执行结果：{state['tool_result']}
合规预警：{state['warning_msg']}
法规参考(RAG)：{state['rag_context']}

要求：
1. 结合上文上下文连贯回答
2. 贴合建筑劳务场景、用词专业
3. 分点简洁输出
"""
    try:
        resp = client.chat.completions.create(model="glm-4",messages=[{"role":"user","content":prompt}])
        answer = resp.choices[0].message.content.strip()
    except Exception as e:
        answer = f"""
【AI自主执行结果】
工具返回：{state['tool_result']}
合规提示：{';'.join(state['warning_msg'])}
法规依据：{state['rag_context']}
"""
    return {"final_answer": answer}

# ============ 重构完整自治工作流 ============
workflow = StateGraph(LaborState)
workflow.add_node("load_data", load_business_data)
workflow.add_node("concat_history", concat_history)
workflow.add_node("choose_tool", ai_tool_choose)
workflow.add_node("exec_tool", run_tool)
workflow.add_node("rag", rag_retrieve)
workflow.add_node("audit", compliance_audit)
workflow.add_node("gen_answer", ai_final_answer)

# 全新执行链路：数据加载→AI选工具→执行工具→RAG检索→合规审计→生成回答
workflow.set_entry_point("load_data")
workflow.add_edge("load_data", "concat_history")
workflow.add_edge("concat_history", "choose_tool")
workflow.add_edge("choose_tool", "exec_tool")
workflow.add_edge("exec_tool", "rag")
workflow.add_edge("rag", "audit")
workflow.add_edge("audit", "gen_answer")
workflow.add_edge("gen_answer", END)

agent_workflow = workflow.compile()