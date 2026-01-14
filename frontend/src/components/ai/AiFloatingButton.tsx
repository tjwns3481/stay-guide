'use client'

import { MessageCircle } from 'lucide-react'

interface AiFloatingButtonProps {
  onClick: () => void
}

export function AiFloatingButton({ onClick }: AiFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50"
      aria-label="AI 컨시어지 열기"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  )
}
