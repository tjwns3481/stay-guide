'use client'

import { useState, useCallback, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

interface ChatResponse {
  sessionId: string
  messageId: string
}

interface UseAiChatOptions {
  guideId: string
  onError?: (error: string) => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * SSE 스트리밍 채팅 함수
 */
async function streamChat(
  guideId: string,
  message: string,
  sessionId: string | null,
  signal: AbortSignal,
  onChunk: (chunk: string) => void,
  onDone: (data: ChatResponse) => void,
  onError: (message: string) => void
): Promise<void> {
  const response = await fetch(`${API_BASE}/guides/${guideId}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No reader available')

  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim()
        continue
      }

      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))

          if (currentEvent === 'message' && data.chunk) {
            onChunk(data.chunk)
          } else if (currentEvent === 'done') {
            onDone(data)
          } else if (currentEvent === 'error') {
            onError(data.message)
          }
        } catch {
          // JSON 파싱 실패 무시
        }
      }
    }
  }
}

/**
 * 대화 기록 조회 API
 */
async function fetchConversations(
  guideId: string,
  sessionId: string
): Promise<ChatMessage[]> {
  const response = await fetch(
    `${API_BASE}/guides/${guideId}/ai/conversations/${sessionId}`
  )

  if (!response.ok) {
    if (response.status === 404) return []
    throw new Error(`HTTP ${response.status}`)
  }

  const json = await response.json()
  return json.data.messages.map((msg: { id: string; role: string; content: string; createdAt: string }) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    createdAt: new Date(msg.createdAt),
  }))
}

/**
 * AI 채팅 훅 (React Query 기반)
 */
export function useAiChat({ guideId, onError }: UseAiChatOptions) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 대화 기록 조회 (세션이 있을 때만)
  const conversationsQuery = useQuery({
    queryKey: ['ai-conversations', guideId, sessionId],
    queryFn: () => fetchConversations(guideId, sessionId!),
    enabled: !!sessionId && messages.length === 0,
    staleTime: Infinity,
  })

  // 대화 기록 로드 시 메시지 동기화
  if (conversationsQuery.data && messages.length === 0) {
    setMessages(conversationsQuery.data)
  }

  // 메시지 전송 mutation
  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      abortControllerRef.current = new AbortController()

      // 사용자 메시지 즉시 추가
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date(),
      }

      // 어시스턴트 플레이스홀더
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, userMessage, assistantMessage])

      return new Promise<ChatResponse>((resolve, reject) => {
        streamChat(
          guideId,
          message,
          sessionId,
          abortControllerRef.current!.signal,
          // onChunk: 스트리밍 청크 추가
          (chunk) => {
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1 && msg.role === 'assistant'
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            )
          },
          // onDone: 완료
          (data) => {
            setSessionId(data.sessionId)
            resolve(data)
          },
          // onError: 에러
          (errorMessage) => {
            reject(new Error(errorMessage))
          }
        ).catch(reject)
      })
    },
    onError: (error: Error) => {
      if (error.name !== 'AbortError') {
        onError?.(error.message)
        // 실패한 어시스턴트 메시지 제거
        setMessages((prev) => prev.slice(0, -1))
      }
    },
    onSuccess: () => {
      // 대화 기록 캐시 무효화
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: ['ai-conversations', guideId, sessionId],
        })
      }
    },
  })

  // 메시지 전송
  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || sendMutation.isPending) return
      sendMutation.mutate(message)
    },
    [sendMutation]
  )

  // 대화 초기화
  const clearMessages = useCallback(() => {
    setMessages([])
    setSessionId(null)
    abortControllerRef.current?.abort()
  }, [])

  // 스트리밍 중단
  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return {
    messages,
    isStreaming: sendMutation.isPending,
    sessionId,
    sendMessage,
    clearMessages,
    stopStreaming,
    // 추가 상태
    isLoadingHistory: conversationsQuery.isLoading,
    error: sendMutation.error?.message,
  }
}
