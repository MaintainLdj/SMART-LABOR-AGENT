import jieba

# 建筑劳务全量行业知识库
KNOWLEDGE_BASE = [
    {
        "id": 1,
        "title": "建筑工人实名制管理办法",
        "category": "合规监管",
        "content": """施工现场必须严格落实建筑工人实名制闭环管理。
实行一人一卡、人脸识别进场、每日考勤上传监管平台。
未落实实名制的项目，主管部门可处以合同造价2%以内罚款，列入建筑市场不良信用名单。
住建部EDI系统会定时抓取项目用工数据，进行线上合规核验。"""
    },
    {
        "id": 2,
        "title": "劳动合同与电子签规范",
        "category": "合同管理",
        "content": """建筑用工必须签订书面劳动合同或合法电子劳动合同。
电子签名需符合《电子签名法》，对接合规电子签平台方可生效。
禁止零合同用工、口头用工，杜绝劳务纠纷隐患。"""
    },
    {
        "id": 3,
        "title": "施工现场安全生产管理条例",
        "category": "安全管理",
        "content": """进场必须佩戴防护用品，高空作业强制安全带、安全绳。
特种作业人员持证上岗，无证人员禁止操作特种设备。
项目部需每日开展班前安全技术交底，留存记录归档。"""
    },
    {
        "id": 4,
        "title": "农民工工资支付管理条例",
        "category": "薪资合规",
        "content": """工资按月足额发放，严禁拖欠、克扣、延时发放。
严禁实物抵扣工资，工资台账需保留至少2年备查。
发生欠薪可向住建主管部门、劳动监察大队投诉维权。"""
    },
    {
        "id": 5,
        "title": "劳务纠纷预防与处置规范",
        "category": "风险处置",
        "content": """劳资纠纷优先项目内部调解，调解无效启动属地住建调解机制。
完善考勤记录、工资台账、合同文件，作为纠纷举证依据。"""
    }
]

# ---------------------- 文本分片工具 ----------------------
def split_text_chunk(text: str, chunk_size=150, overlap=30):
    """长文本分片，防止大模型上下文溢出"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
    return chunks

# ---------------------- 分词相似度打分 ----------------------
def calc_similarity(query: str, content: str) -> int:
    """基于jieba分词做关键词重合度打分"""
    q_words = set(jieba.lcut(query))
    c_words = set(jieba.lcut(content))
    common = q_words & c_words
    return len(common)

# ---------------------- 高阶RAG检索 ----------------------
def retrieve_relevant_knowledge(query: str, top_k=3):
    all_docs = []
    for doc in KNOWLEDGE_BASE:
        chunks = split_text_chunk(doc["content"])
        for ck in chunks:
            score = calc_similarity(query, ck)
            all_docs.append({
                "title": doc["title"],
                "category": doc["category"],
                "chunk": ck,
                "score": score
            })
    # 按相似度倒序
    all_docs.sort(key=lambda x: x["score"], reverse=True)
    # 取top
    top_docs = all_docs[:top_k]
    # 拼接上下文
    context = "===== RAG 行业知识库参考 =====\n"
    for item in top_docs:
        context += f"【{item['title']}｜{item['category']}】\n{item['chunk']}\n\n"
    return context