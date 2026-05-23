from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from chat import stream_chat

app = FastAPI(title="AI Chat Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    messages: list[dict]
    system: str = ""


@app.post("/api/chat")
async def chat(req: ChatRequest):
    async def event_stream():
        messages = req.messages
        if req.system:
            messages = [{"role": "system", "content": req.system}] + messages
        async for token in stream_chat(messages):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
