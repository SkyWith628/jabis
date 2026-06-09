const BASE_URL = 'http://127.0.0.1:8000'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  reply: string
  session_id: string
}

export async function sendMessage(
  message: string,
  history: Message[],
  sessionId: string = ''
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, session_id: sessionId }),
  })
  if (!res.ok) throw new Error('서버 오류가 발생했습니다.')
  return res.json()
}

export async function* sendMessageStream(
  message: string,
  history: Message[],
  sessionId: string = ''
): AsyncGenerator<string> {
  const res = await fetch(`${BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, session_id: sessionId }),
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value)
    const lines = text.split('\n')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        yield data
      }
    }
  }
}

export async function createPlan(goal: string, durationWeeks: number, level: string) {
  const res = await fetch(`${BASE_URL}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, duration_weeks: durationWeeks, level }),
  })
  if (!res.ok) throw new Error('플랜 생성 실패')
  return res.json()
}

export async function getPlans() {
  const res = await fetch(`${BASE_URL}/plan`)
  return res.json()
}

export async function getPlan(id: number) {
  const res = await fetch(`${BASE_URL}/plan/${id}`)
  return res.json()
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}
