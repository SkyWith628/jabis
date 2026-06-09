import { useState, useRef, useEffect } from 'react'
import { sendMessageStream, Message } from '../api/client'
import { useSpeech } from '../hooks/useSpeech'
import JarvisAnimation from './JarvisAnimation'

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState('')
  const [lastReply, setLastReply] = useState('')
  const [showChat, setShowChat] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { isListening, isSpeaking, startListening, speak, stopSpeaking, isSupported } = useSpeech()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text: string = input) {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      let fullReply = ''
      for await (const chunk of sendMessageStream(text, messages, sessionId)) {
        fullReply += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullReply }
          return updated
        })
      }
      setLastReply(fullReply)
      speak(fullReply)
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '오류가 발생했습니다. 서버를 확인해주세요.',
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  function handleVoice() {
    if (isListening) return
    startListening((text) => {
      setInput(text)
      handleSend(text)
    })
  }

  return (
    <div className="jarvis-fullscreen">
      {/* 배경 그리드 */}
      <div className="bg-grid" />

      {/* 상단 로고 */}
      <div className="top-bar">
        <span className="top-logo">J.A.B.I.S</span>
        <span className="top-sub">Just A Brilliant Intelligence System</span>
      </div>

      {/* 중앙 애니메이션 */}
      <div className="center-animation">
        <JarvisAnimation isActive={isSpeaking || loading} />

        {/* 상태 텍스트 */}
        <div className="status-text">
          {isListening && <span className="status listening">음성 인식 중...</span>}
          {loading && !isListening && <span className="status processing">처리 중...</span>}
          {isSpeaking && <span className="status speaking">응답 중...</span>}
          {!isListening && !loading && !isSpeaking && (
            <span className="status standby">대기 중</span>
          )}
        </div>

        {/* 마지막 응답 텍스트 */}
        {lastReply && (
          <div className="last-reply">
            <p>{lastReply}</p>
          </div>
        )}
      </div>

      {/* 대화 기록 토글 */}
      <button className="chat-toggle" onClick={() => setShowChat(!showChat)}>
        {showChat ? '대화 숨기기' : '대화 기록'}
      </button>

      {/* 대화 기록 오버레이 */}
      {showChat && (
        <div className="chat-overlay">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="bubble">
                  {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* 하단 입력창 */}
      <div className="bottom-input">
        {isSpeaking && (
          <button className="stop-btn" onClick={stopSpeaking}>
            ■ 중지
          </button>
        )}
        <div className="input-row">
          {isSupported && (
            <button
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoice}
              disabled={loading}
              title="음성 입력"
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="JABIS에게 말하세요..."
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
