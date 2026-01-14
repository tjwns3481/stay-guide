'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (input.trim() && !isStreaming && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus()
    }
  }, [isStreaming])

  return (
    <div className="flex items-end gap-2 p-4 border-t border-gray-200 bg-white">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="질문을 입력하세요..."
        disabled={disabled || isStreaming}
        rows={1}
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        style={{ maxHeight: '120px' }}
      />
      {isStreaming ? (
        <button
          onClick={onStop}
          className="flex-shrink-0 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors"
          aria-label="중지"
        >
          <Square className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors"
          aria-label="전송"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
