from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db, Message
from services import openai_service
import uuid

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: str = ""
    history: list = []


class ChatResponse(BaseModel):
    reply: str
    session_id: str


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    session_id = req.session_id or str(uuid.uuid4())

    # DB에서 이전 대화 불러오기 (history가 없을 때)
    if not req.history:
        past = (
            db.query(Message)
            .filter(Message.session_id == session_id)
            .order_by(Message.created_at)
            .all()
        )
        history = [{"role": m.role, "content": m.content} for m in past]
    else:
        history = req.history

    reply = await openai_service.chat(req.message, history)

    # 대화 저장
    db.add(Message(session_id=session_id, role="user", content=req.message))
    db.add(Message(session_id=session_id, role="assistant", content=reply))
    db.commit()

    return ChatResponse(reply=reply, session_id=session_id)


@router.post("/stream")
async def chat_stream(req: ChatRequest, db: Session = Depends(get_db)):
    session_id = req.session_id or str(uuid.uuid4())

    history = req.history
    full_reply = []

    async def generate():
        async for chunk in openai_service.chat_stream(req.message, history):
            full_reply.append(chunk)
            yield f"data: {chunk}\n\n"

        # 스트리밍 완료 후 DB 저장
        db.add(Message(session_id=session_id, role="user", content=req.message))
        db.add(Message(session_id=session_id, role="assistant", content="".join(full_reply)))
        db.commit()
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/history/{session_id}")
async def get_history(session_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at)
        .all()
    )
    return [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]


@router.delete("/history/{session_id}")
async def clear_history(session_id: str, db: Session = Depends(get_db)):
    db.query(Message).filter(Message.session_id == session_id).delete()
    db.commit()
    return {"message": "대화 기록이 삭제되었습니다."}
