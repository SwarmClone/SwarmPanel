import json
import asyncio
import random
from datetime import datetime
from pathlib import Path
from typing import Any, List, Dict
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "get_config.json"

app = FastAPI(title="SwarmPanel Backend(Test)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 注意：生产环境应指定具体域名！
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

@app.get("/api/get_version")
async def get_version():
    return {"version": "1.0.0"}

@app.get("/api/startup_param")
async def get_startup_parameters():
    try:
        with CONFIG_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        log(f"未找到配置文件: {CONFIG_PATH}")
        raise HTTPException(status_code=404, detail="配置文件缺失")

class Payload(BaseModel):
    cfg: Any = Field(..., description="前端表单配置")
    selected: List[str] = Field(..., description="勾选的模块")

@app.post("/save")
async def save_endpoint(data: Payload):
    log("[/save] 收到的 JSON:")
    log(json.dumps(data.model_dump(), ensure_ascii=False, indent=2))
    return {"status": "saved"}

@app.post("/api/start")
async def start_endpoint(data: Payload):
    log("[/start] 收到的 JSON:")
    log(json.dumps(data.model_dump(), ensure_ascii=False, indent=2))
    await asyncio.sleep(2)
    return {"status": "started"}

_status_store: Dict[str, Dict[str, Any]] = {}
_all_modules: set[str] = set()
_lifecycle_task: asyncio.Task | None = None

@app.get("/api/get_status")
async def get_status(selected: str):
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
    await asyncio.sleep(5)
    for n in _all_modules:
        _status_store[n]["loaded"] = True

    await asyncio.sleep(5)
    for n in _all_modules:
        _status_store[n]["running"] = True

    await asyncio.sleep(2)
    error_count = min(random.randint(1, 2), len(_all_modules))
    error_names = random.sample(list(_all_modules), error_count)
    for n in error_names:
        _status_store[n]["err"] = "模拟错误信息"

@app.get("/health")
async def health():
    return {"status": "ok"}

class Getter(BaseModel):
    name: str
    time: int

class Msg(BaseModel):
    message_name: str
    send_time: int
    message_type: str
    message_source: str
    message_destinations: List[str]
    message: List[Dict[str, str]]
    getters: List[Getter]

messages_buffer: List[Msg] = []

@app.get("/api/get_messages")
async def get_messages():
    count = random.randint(1, 3)
    for _ in range(count):
        msg = Msg(
            message_name=f"Msg{random.randint(1000, 9999)}",
            send_time=int(datetime.now().timestamp()),
            message_type=random.choice(["DATA", "SIGNAL"]),
            message_source=random.choice(["LLM.LLMBase", "TTS.TTSCosyVoice", "ASR.FastWhisper"]),
            message_destinations=random.sample(["TTS.TTSCosyVoice", "ASR.FastWhisper"], k=1),
            message=[{"key": "text", "value": ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=random.randint(5, 500)))}],
            getters=[Getter(name="TTS", time=int(datetime.now().timestamp()))]
        )
        messages_buffer.append(msg)
    res = [m.dict() for m in messages_buffer]
    messages_buffer.clear()
    return res

# 静态文件服务
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

# SPA路由
@app.get("/{path:path}")
async def serve_spa(request: Request, path: str):
    # 排除API路由和静态资源
    if path.startswith("api/") or path.startswith("health") or path.startswith("assets/"):
        raise HTTPException(status_code=404)
    
    # 返回index.html让Vue Router处理
    return FileResponse("dist/index.html")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
    )