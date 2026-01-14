'use client'

import { useEffect, useRef } from 'react'
import { X, Trash2 } from 'lucide-react'
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
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* 채팅 패널 */}
      <div className="fixed inset-0 lg:inset-auto lg:bottom-24 lg:right-6 lg:w-96 lg:h-[600px] bg-white lg:rounded-2xl lg:shadow-2xl z-50 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-primary-500 text-white lg:rounded-t-2xl">
          <div>
            <h3 className="font-semibold">AI 컨시어지</h3>
            <p className="text-sm opacity-90">{accommodationName}</p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="대화 초기화"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg mb-2">안녕하세요!</p>
              <p className="text-sm">
                숙소에 대해 궁금한 점을 물어보세요.
              </p>
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
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </>
  )
}
