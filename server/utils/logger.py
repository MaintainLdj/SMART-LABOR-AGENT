from datetime import datetime
log_list = []

def add_oper_log(opt_type: str, content: str, operator: str = "admin"):
    """新增操作日志"""
    log_item = {
        "id": len(log_list) + 1,
        "optType": opt_type,
        "content": content,
        "operator": operator,
        "createTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    log_list.append(log_item)

def get_all_logs():
    return log_list