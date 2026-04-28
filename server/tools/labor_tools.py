"""
Day17 AI工具调用合集
AI 可自主调用这些函数完成业务操作
"""
from typing import List, Dict

# 模拟全局业务数据（与main统一）
labor_list = [
    {"id":1,"name":"张三","work_id":"LA2024001","position":"建筑工人","department":"施工一组","status":"在岗","work_days":28},
    {"id":2,"name":"李四","work_id":"LA2024002","position":"电工","department":"机电组","status":"在岗","work_days":27},
    {"id":3,"name":"王五","work_id":"LA2024003","position":"安全员","department":"安全组","status":"请假","work_days":20},
    {"id":4,"name":"赵六","work_id":"LA2024004","position":"焊工","department":"施工二组","status":"在岗","work_days":29}
]

checkin_records = []

def query_all_staff() -> str:
    """工具1：查询全部劳务人员信息"""
    res = ""
    for item in labor_list:
        res += f"{item['name']} | {item['work_id']} | {item['department']} | {item['status']} | 出勤：{item['work_days']}天\n"
    return res

def query_abnormal_staff() -> str:
    """工具2：自动筛查异常人员（工时不足/信息不规范）"""
    warn = []
    for p in labor_list:
        if p["work_days"] < 22:
            warn.append(f"{p['name']} 月度出勤不达标")
        if len(p["work_id"]) < 8:
            warn.append(f"{p['name']} 实名制工号不合规")
    return "\n".join(warn) if warn else "暂无异常人员"

def calculate_all_salary() -> str:
    """工具3：批量自动核算全员薪资"""
    lines = []
    day_wage = 220
    for p in labor_list:
        salary = p["work_days"] * day_wage
        lines.append(f"{p['name']}：{salary} 元")
    return "\n".join(lines)

def query_department_staff(dept_name:str) -> str:
    """工具4：按部门筛选人员"""
    filter_list = [i for i in labor_list if dept_name in i["department"]]
    if not filter_list:
        return "未查询到该部门人员"
    return "\n".join([f"{x['name']} - {x['position']}" for x in filter_list])

# 工具注册表
TOOL_MAP = {
    "query_staff": query_all_staff,
    "query_abnormal": query_abnormal_staff,
    "calc_salary": calculate_all_salary,
    "query_dept": query_department_staff
}