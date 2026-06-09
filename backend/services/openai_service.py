import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("MODEL_NAME", "gemini-2.0-flash")

SYSTEM_PROMPT = """당신은 JABIS(Just A Brilliant Intelligence System)입니다.
사용자의 학습을 돕는 개인 AI 비서입니다.

역할:
- 학습 개념을 친절하고 명확하게 설명
- 사용자 수준에 맞춰 설명 조절
- 학습 플랜 수립 및 진도 관리 도움
- 격려와 동기부여 제공

말투: 친근하고 전문적으로. 너무 딱딱하지 않게.

중요: 응답할 때 마크다운 기호(*, **, #, -, ` 등)를 절대 사용하지 마세요.
음성으로 읽히는 환경이므로 자연스러운 문장으로만 답변하세요.
"""

PLAN_PROMPT = """당신은 학습 플랜 전문가입니다.
사용자의 목표와 기간을 바탕으로 체계적인 학습 커리큘럼을 JSON 형식으로 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "플랜 제목",
  "overview": "전체 목표 요약",
  "weeks": [
    {
      "week": 1,
      "theme": "주제",
      "daily_goals": ["월요일 목표", "화요일 목표", "수요일 목표", "목요일 목표", "금요일 목표"],
      "resources": ["참고 자료 1", "참고 자료 2"],
      "review": "주말 복습 내용"
    }
  ]
}
"""


def _build_history(history: list) -> list:
    result = []
    for msg in history:
        role = "user" if msg["role"] == "user" else "model"
        result.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))
    return result


async def chat(message: str, history: list) -> str:
    contents = _build_history(history)
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    response = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    )
    return response.text


async def chat_stream(message: str, history: list):
    contents = _build_history(history)
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    for chunk in client.models.generate_content_stream(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    ):
        if chunk.text:
            yield chunk.text


async def generate_plan(goal: str, duration_weeks: int, level: str) -> str:
    prompt = f"목표: {goal}\n기간: {duration_weeks}주\n현재 수준: {level}"

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(system_instruction=PLAN_PROMPT),
    )

    text = response.text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    return text
