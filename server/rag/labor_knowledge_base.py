# ==================== 智慧劳务 RAG 专家知识库（企业级）====================
KNOWLEDGE_BASE = [
    {
        "id": 1,
        "title": "建筑工人实名制管理办法",
        "category": "合规",
        "content": """施工现场必须严格落实建筑工人实名制，一人一卡、进场必录、退场必销。
未落实实名制的项目，可处以工程合同造价2%以下罚款，并纳入建筑市场信用黑名单。
住建部 EDI 平台会定期自动核验人员身份有效性。"""
    },
    {
        "id": 2,
        "title": "劳动合同法",
        "category": "合同",
        "content": """建立劳动关系必须签订书面劳动合同，必须明确工资标准、工时制度、支付周期。
禁止不签合同用工，禁止拖欠农民工工资，工资必须按月足额发放。
电子合同经可靠签名后，与纸质合同具有同等法律效力。"""
    },
    {
        "id": 3,
        "title": "安全生产规范",
        "category": "安全",
        "content": """进入施工现场必须佩戴安全帽，高空作业必须系安全带。
特种作业人员（电工、焊工、塔吊）必须持证上岗。
未培训合格人员严禁上岗作业。"""
    },
    {
        "id": 4,
        "title": "工资支付条例",
        "category": "薪资",
        "content": """工资不得低于当地最低工资标准，必须按月足额支付。
严禁以实物、消费券抵扣工资，严禁克扣、拖欠工资。
出现欠薪可向住建部门、劳动监察投诉，可申请仲裁。"""
    },
    {
        "id": 5,
        "title": "劳务纠纷处理",
        "category": "合规",
        "content": """劳务纠纷优先内部调解，调解不成可向住建部门投诉。
涉及工资、合同、工伤的纠纷，可申请劳动仲裁或向法院起诉。
AI 可自动识别纠纷风险并提前预警。"""
    },
    {
        "id": 6,
        "title": "考勤合规要求",
        "category": "考勤",
        "content": """建筑工人必须每日上下班打卡，缺勤必须登记原因。
月度出勤不足 22 天属于异常，可能影响薪资发放与社保缴纳。
打卡数据必须实时上传监管平台，不得篡改。"""
    }
]

# ==================== 语义检索引擎（RAG核心）====================
def retrieve_relevant_knowledge(query: str, top_k=3):
    """
    RAG 检索：输入问题 → 返回最相关的法规知识
    """
    query = query.lower()
    matched = []

    for doc in KNOWLEDGE_BASE:
        score = 0
        # 标题匹配（权重最高）
        if any(w in query for w in doc["title"].lower()):
            score += 3
        # 分类匹配
        if any(w in query for w in doc["category"].lower()):
            score += 2
        # 内容关键词匹配
        keywords = ["实名制", "合同", "工资", "安全", "考勤", "纠纷", "罚款", "合规", "欠薪", "打卡"]
        for w in keywords:
            if w in query and w in doc["content"]:
                score += 1

        if score > 0:
            matched.append({"score": score, "doc": doc})

    # 按得分排序
    matched = sorted(matched, key=lambda x: x["score"], reverse=True)
    results = [item["doc"] for item in matched[:top_k]]

    # 拼接成 RAG 上下文
    context = "\n\n=== 相关劳务法规 ===\n"
    for r in results:
        context += f"【{r['title']}】\n{r['content']}\n\n"

    return context if results else "未匹配到相关劳务法规知识"