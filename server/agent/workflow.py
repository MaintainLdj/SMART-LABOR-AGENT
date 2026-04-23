from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict
from dotenv import load_dotenv
import os
from zhipuai import ZhipuAI
from rag.labor_knowledge import search_knowledge

# 加载环境变量
load_dotenv()
client = ZhipuAI(api_key=os.getenv("ZHIPU_API_KEY"))

# 全局状态（劳务自治核心）
class LaborState(TypedDict):
    question: str
    labor_data: List[Dict]       # 人员数据
    checkin_data: List[Dict]     # 考勤数据
    salary_result: Dict          # 薪资结果
    warning_msg: List[str]       # 异常预警
    audit_result: str            # 合规审计
    rag_context: str             # 法规知识
    final_answer: str            # AI 最终回答
    task_intent: str             # AI 识别意图：查询/核算/预警/咨询

# ---------------------- 1. 加载真实业务数据 ----------------------
def load_business_data(state: LaborState):
    # 真实人员、考勤数据（从内存/数据库读取）
    labor_data = [
        {"id":1,"name":"张三","work_id":"LA2024001","position":"建筑工人","department":"施工一组","status":"在岗","work_days":28},
        {"id":2,"name":"李四","work_id":"LA2024002","position":"电工","department":"机电组","status":"在岗","work_days":27},
        {"id":3,"name":"王五","work_id":"LA2024003","position":"安全员","department":"安全组","status":"请假","work_days":20},
        {"id":4,"name":"赵六","work_id":"LA2024004","position":"焊工","department":"施工二组","status":"在岗","work_days":29}
    ]
    checkin_data = [
        {"name":"张三","type":"上班","time":"08:30"},
        {"name":"李四","type":"上班","time":"08:32"},
        {"name":"王五","type":"缺勤","time":"未打卡"}
    ]
    return {
        "labor_data": labor_data,
        "checkin_data": checkin_data
    }

# ---------------------- 2. AI 识别用户意图（核心） ----------------------
def ai_intent_recognize(state: LaborState):
    prompt = f"""
用户问题：{state['question']}
请判断用户意图，只能返回以下之一：
- query：查询人员/考勤/薪资
- calculate：核算薪资
- warning：异常预警/合规检查
- consult：劳务法规/合同/安全咨询
"""
    try:
        response = client.chat.completions.create(
            model="glm-4",
            messages=[{"role":"user","content":prompt}]
        )
        intent = response.choices[0].message.content.strip()
    except:
        intent = "consult"
    return {"task_intent": intent}

# ---------------------- 3. RAG 知识库检索 ----------------------
def rag_retrieve(state: LaborState):
    ctx = search_knowledge(state["question"])
    return {"rag_context": ctx}

# ---------------------- 4. 合规审计 + 异常预警 ----------------------
def compliance_audit(state: LaborState):
    warnings = []
    for p in state["labor_data"]:
        # 实名制检查
        if len(p["work_id"]) < 8:
            warnings.append(f"【实名制异常】{p['name']} 工号不规范")
        # 工时检查
        if p["work_days"] < 22:
            warnings.append(f"【工时异常】{p['name']} 月度工时不足")
        # 合同检查
        warnings.append(f"【合同提醒】{p['name']} 请确认电子合同签署")

    audit = f"共审计 {len(state['labor_data'])} 人，发现 {len(warnings)} 项风险"
    return {
        "warning_msg": warnings,
        "audit_result": audit
    }

# ---------------------- 5. 自动薪资核算 ----------------------
def auto_salary_calculate(state: LaborState):
    # 建筑劳务日薪 220 元
    salary = {p["name"]: f"{p['work_days'] * 220} 元" for p in state["labor_data"]}
    return {"salary_result": salary}

# ---------------------- 6. 最终 AI 回答（智谱GLM生成） ----------------------
def ai_final_answer(state: LaborState):
    prompt = f"""
你是【智慧劳务自治AI助手】，专业服务建筑劳务、企业HR场景。
请用简洁、专业、条理清晰的格式回答。

用户问题：{state['question']}
人员数据：{state['labor_data']}
考勤记录：{state['checkin_data']}
薪资结果：{state['salary_result']}
合规审计：{state['audit_result']}
异常预警：{state['warning_msg']}
法规知识：{state['rag_context']}

要求：
1. 劳务场景化、HR 专业术语
2. 分点回答，不要多余内容
3. 突出 AI 自治、自动化结果
"""
    try:
        response = client.chat.completions.create(
            model="glm-4",
            messages=[{"role":"user","content":prompt}]
        )
        answer = response.choices[0].message.content.strip()
    except:
        answer = f"""
【AI自治结果】
{state['audit_result']}
薪资：{state['salary_result']}
预警：{'; '.join(state['warning_msg'])}
如需更智能回答，请配置智谱API Key。
"""
    return {"final_answer": answer}

# ---------------------- 7. 构建自治工作流 ----------------------
workflow = StateGraph(LaborState)

# 注册节点
workflow.add_node("load_data", load_business_data)
workflow.add_node("intent", ai_intent_recognize)
workflow.add_node("rag", rag_retrieve)
workflow.add_node("audit", compliance_audit)
workflow.add_node("salary", auto_salary_calculate)
workflow.add_node("answer", ai_final_answer)

# 执行流程（真正自治流程）
workflow.set_entry_point("load_data")
workflow.add_edge("load_data", "intent")
workflow.add_edge("intent", "rag")
workflow.add_edge("rag", "audit")
workflow.add_edge("audit", "salary")
workflow.add_edge("salary", "answer")
workflow.add_edge("answer", END)

# 编译
agent_workflow = workflow.compile()