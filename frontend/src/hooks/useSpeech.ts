import { useState, useRef, useCallback } from 'react'

const BASE_URL = 'http://127.0.0.1:8000'

interface UseSpeechReturn {
  isListening: boolean
  isSpeaking: boolean
  startListening: (onResult: (text: string) => void) => void
  stopListening: () => void
  speak: (text: string) => void
  stopSpeaking: () => void
  isSupported: boolean
}

export function useSpeech(): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const isSupported =
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!isSupported) return

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      onResult(text)
    }

    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback(async (text: string) => {
    // 이전 음성 중지
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setIsSpeaking(true)

    try {
      const res = await fetch(`${BASE_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) throw new Error('TTS 실패')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => setIsSpeaking(false)

      await audio.play()
    } catch {
      // Fish Audio 실패 시 브라우저 TTS로 폴백
      setIsSpeaking(false)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking, isSupported }
}
