import re
import edge_tts
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io

router = APIRouter(prefix="/tts", tags=["tts"])

# 자비스 스타일에 가까운 영국 남성 음성
VOICE = "ko-KR-InJoonNeural"


class TTSRequest(BaseModel):
    text: str


def clean_text(text: str) -> str:
    text = re.sub(r'\*+', '', text)
    text = re.sub(r'#{1,6}\s?', '', text)
    text = re.sub(r'`{1,3}.*?`{1,3}', '', text, flags=re.DOTALL)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'[-_~>|]', '', text)
    text = re.sub(r'\n{2,}', '. ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


@router.post("")
async def text_to_speech(req: TTSRequest):
    cleaned = clean_text(req.text)

    communicate = edge_tts.Communicate(cleaned, VOICE, rate="+50%", pitch="-5Hz")

    audio_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    audio_buffer.seek(0)
    audio_data = audio_buffer.read()

    return StreamingResponse(
        iter([audio_data]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=response.mp3"},
    )
