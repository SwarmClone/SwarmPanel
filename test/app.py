import json
import asyncio
import random
from datetime import datetime
from pathlib import Path
from typing import Any, List, Dict

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "get_config.json"

app = FastAPI(title="SwarmPanel Backend(Test)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_status_store: Dict[str, Dict[str, Any]] = {}
_all_modules: set[str] = set()
_lifecycle_task: asyncio.Task | None = None 

class Payload(BaseModel):
    cfg: Any = Field(..., description="前端表单配置")
    selected: List[str] = Field(..., description="勾选的模块")

def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def server_500():
    """30% 概率返回 500"""
    if random.random() < 0.3:
        raise HTTPException(status_code=500, detail="Random server error")

@app.get("/api/get_version")
async def get_version():
    server_500()
    return {"version": "1.0.0"}

@app.get("/api/startup_param")
async def get_startup_parameters():
    server_500()
    try:
        with CONFIG_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        log(f"未找到配置文件: {CONFIG_PATH}")
        raise HTTPException(status_code=404, detail="配置文件缺失")

@app.post("/save")
async def save_endpoint(data: Payload):
    log("[/save] 收到的 JSON:")
    log(json.dumps(data.model_dump(), ensure_ascii=False, indent=2))
    return {"status": "saved"}

@app.post("/api/start")
async def start_endpoint(data: Payload):
    log("[/start] 收到的 JSON:")
    log(json.dumps(data.model_dump(), ensure_ascii=False, indent=2))
    # 模拟异步耗时启动
    await asyncio.sleep(2)
    return {"status": "started"}

@app.get("/api/get_status")
async def get_status(selected: str):
    """
    统一时间线：
    0s   : 所有模块 loading
    15s  : 所有模块 ready
    17s  : 所有模块 running
    19s  : 随机 1-2 个模块 error，其余 running
    之后保持不变
    """
    global _lifecycle_task
    names = [s.strip() for s in selected.split(",") if s.strip()]
    for n in names:
        if n not in _status_store:
            _status_store[n] = {"running": False, "loaded": False, "err": None}

    _all_modules.update(names)

    if _lifecycle_task is None:
        _lifecycle_task = asyncio.create_task(_lifecycle())

    return [
        {"role_name": "dynamic", "modules": [{"module_name": n, **_status_store[n]} for n in names]}
    ]

async def _lifecycle() -> None:
    # 15 秒后全部 ready
    await asyncio.sleep(15)
    for n in _all_modules:
        _status_store[n]["loaded"] = True

    # 17 秒后全部 running
    await asyncio.sleep(2)
    for n in _all_modules:
        _status_store[n]["running"] = True

    # 19 秒后随机 1-2 个 error
    await asyncio.sleep(2)
    error_count = min(random.randint(1, 2), len(_all_modules))
    error_names = random.sample(list(_all_modules), error_count)
    for n in error_names:
        _status_store[n]["err"] = "模拟错误信息"

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
    )