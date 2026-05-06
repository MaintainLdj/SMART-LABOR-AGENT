import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from rag.labor_knowledge_base import KNOWLEDGE_BASE
import os
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

# 加载轻量中文嵌入模型
model = SentenceTransformer("all-MiniLM-L6-v2")

# 全局向量库 & 文本映射
index: faiss.IndexFlatL2
doc_texts = []

def init_vector_store():
    """初始化向量库，写入全部劳务知识库"""
    global index, doc_texts
    texts = []
    for item in KNOWLEDGE_BASE:
        text = f"【{item['title']}】{item['content']}"
        texts.append(text)
    doc_texts = texts

    # 向量化
    embeddings = model.encode(texts)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))

def vector_search(query: str, top_k=3) -> str:
    """语义向量检索，真正RAG语义匹配"""
    query_emb = model.encode([query])
    D, I = index.search(np.array(query_emb).astype("float32"), top_k)
    res_text = "===== 向量语义检索结果 =====\n"
    for idx in I[0]:
        if 0 <= idx < len(doc_texts):
            res_text += doc_texts[idx] + "\n\n"
    return res_text

# 项目启动初始化
init_vector_store()