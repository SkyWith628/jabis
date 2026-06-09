# J.A.B.I.S
### Just A Brilliant Intelligence System

> 아이언맨의 자비스에서 영감을 받은 AI 기반 개인 학습 비서

![JABIS Demo](https://img.shields.io/badge/status-active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![Electron](https://img.shields.io/badge/Electron-32-47848f)

---

## 소개

JABIS는 음성 대화, 학습 플랜 생성, JARVIS 스타일 홀로그램 UI를 갖춘 AI 학습 비서 데스크탑 앱입니다.

- 🎤 **음성 입력** — 말하면 인식해서 AI에게 전달
- 🔊 **음성 출력** — AI 응답을 자연스러운 한국어 TTS로 읽어줌
- 🌀 **JARVIS 애니메이션** — 말할 때 반응하는 홀로그램 HUD
- 📚 **학습 플랜 생성** — 목표와 기간 입력 시 주별 커리큘럼 자동 생성
- 💾 **대화 기록 저장** — SQLite에 대화 내용 자동 저장

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| 데스크탑 앱 | Electron |
| 프론트엔드 | React + TypeScript + Vite |
| 백엔드 | Python + FastAPI |
| AI | Google Gemini API |
| TTS | Edge TTS (Microsoft) |
| STT | Web Speech API |
| DB | SQLite + SQLAlchemy |

---

## 시작하기

### 사전 준비

- Python 3.12
- Node.js 20+
- Google Gemini API 키 ([발급받기](https://aistudio.google.com/apikey))

### 설치 및 실행

**1. 저장소 클론**
```bash
git clone https://github.com/SkyWith628/jabis.git
cd jabis
```

**2. 백엔드 설정**
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**3. 환경변수 설정**
```bash
# backend/.env 파일 생성
GEMINI_API_KEY=your-gemini-api-key
MODEL_NAME=gemini-1.5-flash
```

**4. 백엔드 실행**
```bash
python main.py
```

**5. 프론트엔드 실행 (새 터미널)**
```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 프로젝트 구조

```
jabis/
├── backend/
│   ├── main.py               # FastAPI 서버
│   ├── requirements.txt
│   ├── database/
│   │   └── db.py             # SQLite 모델
│   ├── routers/
│   │   ├── chat.py           # 대화 API (스트리밍)
│   │   ├── plan.py           # 학습 플랜 API
│   │   └── tts.py            # TTS API (Edge TTS)
│   └── services/
│       └── openai_service.py # Gemini API 연동
└── frontend/
    ├── electron/
    │   └── main.js           # Electron 메인 프로세스
    └── src/
        ├── components/
        │   ├── ChatWindow.tsx    # 메인 UI
        │   └── JarvisAnimation.tsx # 홀로그램 애니메이션
        ├── hooks/
        │   └── useSpeech.ts   # STT/TTS 훅
        └── api/
            └── client.ts      # API 클라이언트
```

---

## 주요 기능 설명

### 음성 대화
마이크 버튼을 누르거나 텍스트를 입력하면 Gemini AI가 응답하고, Edge TTS가 자연스러운 한국어 음성으로 읽어줍니다.

### JARVIS 애니메이션
AI가 응답 중일 때 중앙 홀로그램 애니메이션이 활성화되어 회전 속도가 빨라지고 코어가 밝아집니다.

### 학습 플랜
목표, 기간, 현재 수준을 입력하면 AI가 주별 커리큘럼을 자동 생성하고 SQLite에 저장합니다.

---

## 라이선스

MIT License
