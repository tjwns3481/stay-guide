'use client'

import { MessageCircle } from 'lucide-react'

interface AiFloatingButtonProps {
  onClick: () => void
}

export function AiFloatingButton({ onClick }: AiFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl z-50 animate-pulse-glow"
      style={{
        animation: 'pulse-glow 2s ease-in-out infinite',
      }}
      aria-label="AI 컨시어지 열기"
    >
      <MessageCircle className="w-6 h-6" />
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(224, 122, 95, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(224, 122, 95, 0.5); }
        }
      `}</style>
    </button>
  )
}
