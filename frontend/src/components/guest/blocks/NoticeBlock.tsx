'use client'

import { AlertCircle, Info } from 'lucide-react'

interface NoticeBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

export function NoticeBlock({ content }: NoticeBlockProps) {
  const noticeType = getString(content.type) || 'banner'
  const title = getString(content.title) || '공지사항'
  const noticeContent = getString(content.content)

  if (!noticeContent && !title) {
    return null
  }

  const isPopup = noticeType === 'popup'

  return (
    <div
      className={`rounded-xl p-5 ${
        isPopup
          ? 'bg-primary-50 border-2 border-primary-200 shadow-md'
          : 'bg-yellow-50 border-l-4 border-yellow-400'
      }`}
    >
      <div className="flex items-start gap-3">
        {isPopup ? (
          <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        )}

        <div className="flex-1">
          <h4
            className={`font-semibold mb-1 ${
              isPopup ? 'text-primary-900' : 'text-yellow-900'
            }`}
          >
            {title}
          </h4>
          {noticeContent && (
            <p
              className={`text-sm whitespace-pre-wrap ${
                isPopup ? 'text-primary-800' : 'text-yellow-800'
              }`}
            >
              {noticeContent}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
