'use client'

import { X, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useEditorStore, Block, BLOCK_TYPE_META } from '@/stores/editor'
import {
  HeroEditor,
  QuickInfoEditor,
  AmenitiesEditor,
  MapEditor,
  HostPickEditor,
  NoticeEditor,
} from './editors'

interface BlockEditorProps {
  block: Block
  onClose: () => void
  isInline?: boolean
}

export function BlockEditor({ block, onClose, isInline = false }: BlockEditorProps) {
  const { toggleBlockVisibility, removeBlock } = useEditorStore()
  const meta = BLOCK_TYPE_META[block.type]

  const handleDelete = () => {
    if (confirm('이 블록을 삭제하시겠습니까?')) {
      removeBlock(block.id)
      onClose()
    }
  }

  const renderEditor = () => {
    switch (block.type) {
      case 'hero':
        return <HeroEditor block={block} />
      case 'quick_info':
        return <QuickInfoEditor block={block} />
      case 'amenities':
        return <AmenitiesEditor block={block} />
      case 'map':
        return <MapEditor block={block} />
      case 'host_pick':
        return <HostPickEditor block={block} />
      case 'notice':
        return <NoticeEditor block={block} />
      default:
        return null
    }
  }

  // 인라인 모드: 헤더 없이 편집기만 표시
  if (isInline) {
    return (
      <div className="p-4">
        {renderEditor()}
        {/* 숨김 상태 배너 */}
        {!block.isVisible && (
          <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-lg text-center">
            <span className="text-sm text-yellow-700">
              이 블록은 현재 숨김 상태입니다
            </span>
          </div>
        )}
      </div>
    )
  }

  // 기존 전체 화면 모드
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{meta.label}</span>
          <span className="text-xs text-gray-400">편집</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleBlockVisibility(block.id)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
            title={block.isVisible ? '숨기기' : '보이기'}
          >
            {block.isVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 에디터 본문 */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
      </div>

      {/* 숨김 상태 배너 */}
      {!block.isVisible && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100 text-center">
          <span className="text-sm text-yellow-700">
            이 블록은 현재 숨김 상태입니다
          </span>
        </div>
      )}
    </div>
  )
}
