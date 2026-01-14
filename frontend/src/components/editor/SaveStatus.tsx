'use client'

import { Check, Loader2, AlertCircle, Circle } from 'lucide-react'
import { useEditorStore } from '@/stores/editor'

export function SaveStatus() {
  const { saveStatus, lastSavedAt } = useEditorStore()

  const getStatusDisplay = () => {
    switch (saveStatus) {
      case 'saved':
        return {
          icon: <Check className="w-4 h-4 text-green-500" />,
          text: '저장됨',
          color: 'text-green-600',
        }
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
          text: '저장 중...',
          color: 'text-blue-600',
        }
      case 'unsaved':
        return {
          icon: <Circle className="w-4 h-4 text-orange-500 fill-orange-500" />,
          text: '변경됨',
          color: 'text-orange-600',
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          text: '저장 실패',
          color: 'text-red-600',
        }
      default:
        return null
    }
  }

  const formatLastSaved = () => {
    if (!lastSavedAt) return null

    const now = new Date()
    const diff = now.getTime() - lastSavedAt.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (seconds < 60) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    return lastSavedAt.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const status = getStatusDisplay()
  if (!status) return null

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {status.icon}
      <span className={`hidden sm:inline ${status.color}`}>
        {status.text}
      </span>
      {saveStatus === 'saved' && lastSavedAt && (
        <span className="hidden md:inline text-gray-400 text-xs">
          ({formatLastSaved()})
        </span>
      )}
    </div>
  )
}
