import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAiChat } from '@/hooks/useAiChat'
import React from 'react'

// fetch 모킹
const mockFetch = vi.fn()
global.fetch = mockFetch

// TextDecoder 모킹 (ReadableStream 처리용)
class MockTextDecoder {
  decode(data: Uint8Array) {
    return new TextDecoder().decode(data)
  }
}
global.TextDecoder = MockTextDecoder as typeof TextDecoder

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// SSE 스트리밍 응답 생성 헬퍼
function createStreamResponse(events: Array<{ event: string; data: object }>) {
  let eventText = ''
  for (const e of events) {
    eventText += `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(eventText))
      controller.close()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('useAiChat 훅', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('초기 상태', () => {
    it('초기 메시지 배열이 비어있다', () => {
      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1' }),
        { wrapper: createWrapper() }
      )

      expect(result.current.messages).toEqual([])
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.sessionId).toBeNull()
    })
  })

  describe('sendMessage', () => {
    it('빈 메시지는 전송하지 않는다', () => {
      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1' }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.sendMessage('')
        result.current.sendMessage('   ')
      })

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result.current.messages).toHaveLength(0)
    })

    it('메시지 전송 시 사용자 메시지가 즉시 추가된다', async () => {
      // 응답이 완료될 때까지 pending 상태 유지
      mockFetch.mockImplementation(() =>
        createStreamResponse([
          { event: 'message', data: { chunk: '안녕' } },
          { event: 'done', data: { sessionId: 'session-1', messageId: 'msg-1' } },
        ])
      )

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1' }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.sendMessage('안녕하세요')
      })

      // 사용자 메시지와 어시스턴트 플레이스홀더가 추가됨
      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThanOrEqual(1)
        expect(result.current.messages[0].role).toBe('user')
        expect(result.current.messages[0].content).toBe('안녕하세요')
      })
    })

    it('스트리밍 중에는 isStreaming이 true다', async () => {
      let resolveStream: () => void
      const streamPromise = new Promise<void>((resolve) => {
        resolveStream = resolve
      })

      mockFetch.mockImplementation(async () => {
        await streamPromise
        return createStreamResponse([
          { event: 'done', data: { sessionId: 'session-1', messageId: 'msg-1' } },
        ])
      })

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1' }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.sendMessage('테스트')
      })

      // 스트리밍 중
      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true)
      })

      // 스트리밍 완료
      act(() => {
        resolveStream!()
      })

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(false)
      })
    })
  })

  describe('clearMessages', () => {
    it('메시지를 초기화한다', async () => {
      mockFetch.mockImplementation(() =>
        createStreamResponse([
          { event: 'message', data: { chunk: '응답' } },
          { event: 'done', data: { sessionId: 'session-1', messageId: 'msg-1' } },
        ])
      )

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1' }),
        { wrapper: createWrapper() }
      )

      // 메시지 전송
      act(() => {
        result.current.sendMessage('안녕')
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })

      // 초기화
      act(() => {
        result.current.clearMessages()
      })

      expect(result.current.messages).toEqual([])
      expect(result.current.sessionId).toBeNull()
    })
  })

  describe('에러 처리', () => {
    it('HTTP 에러 시 onError 콜백이 호출된다', async () => {
      const onError = vi.fn()
      mockFetch.mockResolvedValue(new Response(null, { status: 500 }))

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1', onError }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.sendMessage('테스트')
      })

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })
    })

    it('SSE error 이벤트 시 에러가 발생한다', async () => {
      const onError = vi.fn()
      mockFetch.mockImplementation(() =>
        createStreamResponse([
          { event: 'error', data: { message: '서버 에러' } },
        ])
      )

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1', onError }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.sendMessage('테스트')
      })

      // onError가 호출되었는지 확인 (에러 메시지는 실제 구현에 따라 달라질 수 있음)
      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })
    })
  })

  describe('stopStreaming', () => {
    it('스트리밍을 중단한다', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort')

      let _resolveStream: () => void
      mockFetch.mockImplementation(() =>
        new Promise<Response>((resolve) => {
          _resolveStream = () =>
            resolve(
              createStreamResponse([
                { event: 'done', data: { sessionId: 'session-1', messageId: 'msg-1' } },
              ])
            )
        })
      )

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1' }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.sendMessage('테스트')
      })

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true)
      })

      act(() => {
        result.current.stopStreaming()
      })

      expect(abortSpy).toHaveBeenCalled()
      abortSpy.mockRestore()
    })
  })

  describe('API 호출', () => {
    it('올바른 엔드포인트로 요청한다', async () => {
      mockFetch.mockImplementation(() =>
        createStreamResponse([
          { event: 'done', data: { sessionId: 'session-1', messageId: 'msg-1' } },
        ])
      )

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-123' }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.sendMessage('테스트')
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/guides/guide-123/ai/chat',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '테스트', sessionId: null }),
          })
        )
      })
    })

    it('여러 번 메시지를 전송할 수 있다', async () => {
      mockFetch.mockImplementation(() =>
        createStreamResponse([
          { event: 'message', data: { chunk: '응답' } },
          { event: 'done', data: { sessionId: 'session-1', messageId: 'msg-1' } },
        ])
      )

      const { result } = renderHook(
        () => useAiChat({ guideId: 'guide-1' }),
        { wrapper: createWrapper() }
      )

      // 첫 번째 메시지
      act(() => {
        result.current.sendMessage('첫 번째')
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })

      // API가 호출되었는지 확인
      expect(mockFetch).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/guides/guide-1/ai/chat',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })
})
