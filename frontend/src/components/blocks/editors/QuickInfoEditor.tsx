'use client'

import { Clock, Users, Car, MapPin } from 'lucide-react'
import { useEditorStore, Block } from '@/stores/editor'

interface QuickInfoContent {
  checkIn: string
  checkOut: string
  maxGuests: number
  parking: string
  address: string
}

interface QuickInfoEditorProps {
  block: Block
}

export function QuickInfoEditor({ block }: QuickInfoEditorProps) {
  const { updateBlock } = useEditorStore()
  const content = block.content as unknown as QuickInfoContent

  const updateContent = (updates: Partial<QuickInfoContent>) => {
    updateBlock(block.id, {
      content: { ...content, ...updates },
    })
  }

  return (
    <div className="space-y-4">
      {/* 체크인/체크아웃 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
            <Clock className="w-4 h-4" />
            체크인
          </label>
          <input
            type="time"
            value={content.checkIn || '15:00'}
            onChange={(e) => updateContent({ checkIn: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
            <Clock className="w-4 h-4" />
            체크아웃
          </label>
          <input
            type="time"
            value={content.checkOut || '11:00'}
            onChange={(e) => updateContent({ checkOut: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 최대 인원 */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
          <Users className="w-4 h-4" />
          최대 인원
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={50}
            value={content.maxGuests || 2}
            onChange={(e) => updateContent({ maxGuests: parseInt(e.target.value) || 2 })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="text-gray-500">명</span>
        </div>
      </div>

      {/* 주차 정보 */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
          <Car className="w-4 h-4" />
          주차 정보
        </label>
        <input
          type="text"
          value={content.parking || ''}
          onChange={(e) => updateContent({ parking: e.target.value })}
          placeholder="예: 무료 주차 가능 (1대), 주변 유료 주차장 이용"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 주소 */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-4 h-4" />
          주소
        </label>
        <input
          type="text"
          value={content.address || ''}
          onChange={(e) => updateContent({ address: e.target.value })}
          placeholder="도로명 주소를 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-400">
          주소를 입력하면 게스트가 쉽게 찾아올 수 있습니다
        </p>
      </div>

      {/* 미리보기 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-2">미리보기</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {content.checkIn && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>체크인: {content.checkIn}</span>
            </div>
          )}
          {content.checkOut && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>체크아웃: {content.checkOut}</span>
            </div>
          )}
          {content.maxGuests > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span>최대 {content.maxGuests}명</span>
            </div>
          )}
          {content.parking && (
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span>{content.parking}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
