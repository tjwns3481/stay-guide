'use client'

import { Bell, AlertTriangle, Info, Megaphone } from 'lucide-react'
import { useEditorStore, Block } from '@/stores/editor'

interface NoticeContent {
  type: 'banner' | 'popup'
  title: string
  content: string
  isActive: boolean
  style?: 'info' | 'warning' | 'success'
}

interface NoticeEditorProps {
  block: Block
}

const NOTICE_STYLES = [
  { id: 'info', label: '정보', icon: Info, bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-800' },
  { id: 'warning', label: '주의', icon: AlertTriangle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-800' },
  { id: 'success', label: '안내', icon: Megaphone, bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-800' },
]

export function NoticeEditor({ block }: NoticeEditorProps) {
  const { updateBlock } = useEditorStore()
  const content = block.content as unknown as NoticeContent

  const updateContent = (updates: Partial<NoticeContent>) => {
    updateBlock(block.id, {
      content: { ...content, ...updates },
    })
  }

  const currentStyle = NOTICE_STYLES.find((s) => s.id === content.style) || NOTICE_STYLES[0]

  return (
    <div className="space-y-4">
      {/* 공지 타입 선택 */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
          <Bell className="w-4 h-4" />
          공지 타입
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateContent({ type: 'banner' })}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              content.type === 'banner'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-6 bg-yellow-100 rounded flex items-center justify-center border-l-4 border-yellow-400">
              <span className="text-xs text-yellow-700">배너</span>
            </div>
            <span className="text-sm font-medium">배너</span>
            <span className="text-xs text-gray-500">상단에 표시</span>
          </button>
          <button
            onClick={() => updateContent({ type: 'popup' })}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              content.type === 'popup'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-8 bg-white rounded shadow-md flex items-center justify-center border border-gray-200">
              <span className="text-xs">팝업</span>
            </div>
            <span className="text-sm font-medium">팝업</span>
            <span className="text-xs text-gray-500">첫 방문 시 표시</span>
          </button>
        </div>
      </div>

      {/* 스타일 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          스타일
        </label>
        <div className="grid grid-cols-3 gap-2">
          {NOTICE_STYLES.map((style) => {
            const Icon = style.icon
            return (
              <button
                key={style.id}
                onClick={() => updateContent({ style: style.id as NoticeContent['style'] })}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border-2 transition-colors ${
                  content.style === style.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${style.textColor}`} />
                <span className="text-sm">{style.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="공지 제목을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          내용
        </label>
        <textarea
          value={content.content || ''}
          onChange={(e) => updateContent({ content: e.target.value })}
          placeholder="공지 내용을 입력하세요"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* 활성화 토글 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">공지 표시</p>
          <p className="text-xs text-gray-500">비활성화하면 게스트에게 표시되지 않습니다</p>
        </div>
        <button
          onClick={() => updateContent({ isActive: !content.isActive })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            content.isActive !== false ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              content.isActive !== false ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* 미리보기 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          미리보기
        </label>
        {content.type === 'banner' ? (
          <div
            className={`p-3 rounded-lg border-l-4 ${currentStyle.bgColor} ${currentStyle.borderColor}`}
          >
            {content.title && (
              <p className={`font-medium ${currentStyle.textColor}`}>{content.title}</p>
            )}
            {content.content && (
              <p className={`text-sm mt-1 ${currentStyle.textColor} opacity-80`}>
                {content.content}
              </p>
            )}
            {!content.title && !content.content && (
              <p className="text-sm text-gray-400">제목과 내용을 입력하세요</p>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
            <div
              className={`bg-white rounded-xl shadow-lg p-4 max-w-[250px] w-full border ${currentStyle.borderColor}`}
            >
              <div className="flex items-start gap-2">
                <currentStyle.icon className={`w-5 h-5 ${currentStyle.textColor} flex-shrink-0 mt-0.5`} />
                <div>
                  {content.title && (
                    <p className="font-medium text-gray-900">{content.title}</p>
                  )}
                  {content.content && (
                    <p className="text-sm text-gray-600 mt-1">{content.content}</p>
                  )}
                  {!content.title && !content.content && (
                    <p className="text-sm text-gray-400">팝업 미리보기</p>
                  )}
                </div>
              </div>
              <button className="w-full mt-3 py-2 bg-primary-500 text-white text-sm rounded-lg">
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
