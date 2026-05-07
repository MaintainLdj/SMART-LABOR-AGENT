import os
import uuid
from datetime import datetime

# 确保上传目录
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(file, suffix: str) -> str:
    """保存上传文件，返回访问路径"""
    filename = f"{datetime.now().strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}{suffix}"
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as f:
        f.write(await file.read())
    return f"/uploads/{filename}"