import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")


async def stream_chat(messages: list[dict]):
    if not API_KEY or API_KEY == "sk-your-key-here":
        async for token in mock_stream(messages):
            yield token
        return

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream(
            "POST", f"{BASE_URL}/v1/chat/completions", headers=headers, json=payload
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        return
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue


async def mock_stream(messages: list[dict]):
    """无 API Key 时的模拟回复，方便开发调试"""
    last_msg = messages[-1]["content"] if messages else ""
    reply = f'这是模拟回复。你说的是：「{last_msg}」\n\n请设置 DeepSeek API Key 以获得真实回复。在 backend/.env 中填写你的 DEEPSEEK_API_KEY。'
    for char in reply:
        yield char
