'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  referencedBlockIds?: string[]
  createdAt: Date
}

interface UseAiChatOptions {
  guideId: string
  onError?: (error: string) => void
}

export function useAiChat({ guideId, onError }: UseAiChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isStreaming) return

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // 어시스턴트 메시지 플레이스홀더
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, assistantMessage])

    setIsStreaming(true)
    abortControllerRef.current = new AbortController()

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api'
      const response = await fetch(`${API_BASE}/guides/${guideId}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (line.includes('event: message')) {
              // 스트리밍 청크 추가
              setMessages(prev => {
                const updated = [...prev]
                const lastMsg = updated[updated.length - 1]
                if (lastMsg.role === 'assistant') {
                  lastMsg.content += data.chunk
                }
                return updated
              })
            } else if (line.includes('event: done')) {
              // 완료
              setSessionId(data.sessionId)
              setMessages(prev => {
                const updated = [...prev]
                const lastMsg = updated[updated.length - 1]
                if (lastMsg.role === 'assistant') {
                  lastMsg.referencedBlockIds = data.referencedBlockIds
                }
                return updated
              })
            } else if (line.includes('event: error')) {
              onError?.(data.message)
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        onError?.((error as Error).message)
        // 실패한 어시스턴트 메시지 제거
        setMessages(prev => prev.slice(0, -1))
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [guideId, sessionId, isStreaming, onError])

  const clearMessages = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return {
    messages,
    isStreaming,
    sessionId,
    sendMessage,
    clearMessages,
    stopStreaming,
  }
}
