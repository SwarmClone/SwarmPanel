import json
import os
import random
from pathlib import Path
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, List
from pydantic import BaseModel, Field
    
app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "get_config.json"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class Payload(BaseModel):
    cfg: Any = Field(..., description="前端表单配置")
    selected: List[str] = Field(..., description="勾选的模块")

@app.get("/api/get_version")
async def get_version():
    server_500()
    return {"version": "1.0.0"}

@app.get("/api/startup_param")
async def get_startup_parameters():
    server_500()
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)

@app.post("/save")
async def save_endpoint(data: Payload):
    print("[/save] 收到的 JSON:")
    print(json.dumps(data.model_dump(), ensure_ascii=False, indent=2))
    return {"status": "saved"}

@app.post("/start")
async def start_endpoint(data: Payload):
    server_500()
    print("[/start] 收到的 JSON:")
    print(json.dumps(data.model_dump(), ensure_ascii=False, indent=2))
    return {"status": "started"}

def server_500():
    if random.random() < 0.3:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Random server error")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)