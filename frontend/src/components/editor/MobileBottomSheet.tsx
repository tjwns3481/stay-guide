'use client'

import { useEffect, useRef } from 'react'
import { X, Image, Clock, Wifi, MapPin, Heart, Bell } from 'lucide-react'
import { useEditorStore, BlockType, BLOCK_TYPE_META } from '@/stores/editor'

// 블록 타입 아이콘 매핑
const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: <Image className="w-5 h-5" />,
  quick_info: <Clock className="w-5 h-5" />,
  amenities: <Wifi className="w-5 h-5" />,
  map: <MapPin className="w-5 h-5" />,
  host_pick: <Heart className="w-5 h-5" />,
  notice: <Bell className="w-5 h-5" />,
}

export function MobileBottomSheet() {
  const { isMobileSheetOpen, toggleMobileSheet, addBlock } = useEditorStore()
  const sheetRef = useRef<HTMLDivElement>(null)

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSheetOpen) {
        toggleMobileSheet(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileSheetOpen, toggleMobileSheet])

  // 바깥 클릭으로 닫기
  useEffect(() => {
    if (!isMobileSheetOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        toggleMobileSheet(false)
      }
    }

    // 약간의 딜레이를 주어 열기 클릭과 충돌 방지
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileSheetOpen, toggleMobileSheet])

  // 스크롤 방지
  useEffect(() => {
    if (isMobileSheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileSheetOpen])

  const handleAddBlock = (type: BlockType) => {
    addBlock(type)
    toggleMobileSheet(false)
  }

  if (!isMobileSheetOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 바텀 시트 */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-slide-up"
        style={{
          maxHeight: '80vh',
        }}
      >
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">블록 추가</h3>
          <button
            onClick={() => toggleMobileSheet(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 블록 목록 */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(BLOCK_TYPE_META) as BlockType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleAddBlock(type)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm text-gray-600">
                  {BLOCK_ICONS[type]}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {BLOCK_TYPE_META[type].label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {BLOCK_TYPE_META[type].description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
