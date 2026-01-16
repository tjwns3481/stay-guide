'use client'

import { useEffect, useRef } from 'react'
import { X, Trash2, Sparkles } from 'lucide-react'
import { useAiChat } from '@/hooks/useAiChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface ChatInterfaceProps {
  guideId: string
  accommodationName: string
  isOpen: boolean
  onClose: () => void
}

export function ChatInterface({
  guideId,
  accommodationName,
  isOpen,
  onClose,
}: ChatInterfaceProps) {
  const { messages, isStreaming, sendMessage, clearMessages, stopStreaming } =
    useAiChat({
      guideId,
      onError: (error) => console.error('Chat error:', error),
    })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) return null

  return (
    <>
      {/* 백드롭 (모바일) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* 채팅 패널 */}
      <div className="fixed inset-0 lg:inset-auto lg:bottom-24 lg:right-6 lg:w-[400px] lg:h-[620px] bg-white lg:rounded-3xl lg:shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white lg:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI 컨시어지</h3>
              <p className="text-sm text-white/80">{accommodationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
                aria-label="대화 초기화"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">안녕하세요!</h4>
              <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
                숙소에 대해 궁금한 점을 편하게 물어보세요. 빠르게 답변해 드릴게요.
              </p>

              {/* 추천 질문 */}
              <div className="mt-6 space-y-2">
                <p className="text-xs text-gray-400 mb-2">이런 것들을 물어보세요</p>
                {['체크인 시간이 언제예요?', '주변 맛집 추천해주세요', 'Wi-Fi 비밀번호가 뭐예요?'].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="block w-full text-left px-4 py-2.5 bg-white rounded-xl text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors border border-gray-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming && idx === messages.length - 1 && msg.role === 'assistant'
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-100 bg-white">
          <ChatInput
            onSend={sendMessage}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </>
  )
}
