import { useState, useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import { checkHealth } from './api/client'

export default function App() {
  const [serverReady, setServerReady] = useState(false)

  useEffect(() => {
    const poll = setInterval(async () => {
      const ok = await checkHealth()
      if (ok) {
        setServerReady(true)
        clearInterval(poll)
      }
    }, 1000)
    return () => clearInterval(poll)
  }, [])

  if (!serverReady) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>JABIS 초기화 중...</p>
      </div>
    )
  }

  return <ChatWindow />
}
