import json
import os
from pathlib import Path
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "get_config.json"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/get_version")
async def get_version():
    return {"version": "1.0.0"}

@app.get("/api/startup_param")
async def get_startup_parameters():
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)