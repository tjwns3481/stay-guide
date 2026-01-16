'use client'

import { Bell, Info } from 'lucide-react'

interface NoticeBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

export function NoticeBlock({ content }: NoticeBlockProps) {
  const noticeType = getString(content.type) || 'banner'
  const title = getString(content.title) || '알려드립니다'
  const noticeContent = getString(content.content)

  if (!noticeContent && !title) {
    return null
  }

  const isPopup = noticeType === 'popup'

  return (
    <div
      className={`rounded-2xl p-5 ${
        isPopup
          ? 'bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200'
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isPopup ? 'bg-primary-100' : 'bg-amber-100'
        }`}>
          {isPopup ? (
            <Info className="w-4 h-4 text-primary-600" />
          ) : (
            <Bell className="w-4 h-4 text-amber-600" />
          )}
        </div>

        <div className="flex-1">
          <h4
            className={`font-semibold mb-1 ${
              isPopup ? 'text-primary-900' : 'text-amber-900'
            }`}
          >
            {title}
          </h4>
          {noticeContent && (
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap ${
                isPopup ? 'text-primary-800' : 'text-amber-800'
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
