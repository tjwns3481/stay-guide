// @TASK T3 - 블록 에디터 리스트 (드래그앤드롭)
// @SPEC docs/planning/03-user-flow.md#블록-순서-변경
'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Image,
  Images,
  Clock,
  Wifi,
  MapPin,
  Heart,
  Bell,
} from 'lucide-react'
import { useEditorStore, BlockType, Block, BLOCK_TYPE_META } from '@/stores/editor'
import { BlockEditor } from '@/components/blocks'

/**
 * 블록 타입 아이콘 매핑
 * @description 향후 블록 추가 메뉴 UI에서 사용 예정
 */
export const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: <Image className="w-4 h-4" />,
  quick_info: <Clock className="w-4 h-4" />,
  amenities: <Wifi className="w-4 h-4" />,
  map: <MapPin className="w-4 h-4" />,
  host_pick: <Heart className="w-4 h-4" />,
  notice: <Bell className="w-4 h-4" />,
  gallery: <Images className="w-4 h-4" />,
}

export function BlockList() {
  const {
    guide,
    selectedBlockId,
    selectBlock,
    toggleBlockVisibility,
    duplicateBlock,
    removeBlock,
    reorderBlocks,
  } = useEditorStore()

  const [activeId, setActiveId] = useState<string | null>(null)

  // 센서 설정 - 포인터, 터치, 키보드 지원
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px 이동 후 드래그 시작 (더 민감하게)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms 터치 후 드래그 시작 (더 빠르게)
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!guide) return null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = guide.blocks.findIndex((b) => b.id === active.id)
      const newIndex = guide.blocks.findIndex((b) => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex)
      }
    }
  }

  const activeBlock = activeId ? guide.blocks.find((b) => b.id === activeId) : null

  if (guide.blocks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">아직 블록이 없습니다</p>
        <p className="text-xs mt-1">위의 버튼으로 블록을 추가해보세요</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={guide.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {guide.blocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              isDragging={activeId === block.id}
              onSelect={() => selectBlock(selectedBlockId === block.id ? null : block.id)}
              onClose={() => selectBlock(null)}
              onToggleVisibility={() => toggleBlockVisibility(block.id)}
              onDuplicate={() => duplicateBlock(block.id)}
              onDelete={() => removeBlock(block.id)}
            />
          ))}
        </div>
      </SortableContext>

      {/* 드래그 오버레이 - 드래그 중인 아이템의 미리보기 */}
      <DragOverlay>
        {activeBlock ? (
          <BlockItemContent
            block={activeBlock}
            isSelected={false}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface SortableBlockItemProps {
  block: Block
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onClose: () => void
  onToggleVisibility: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function SortableBlockItem({
  block,
  isSelected,
  isDragging,
  onSelect,
  onClose,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      className={isDragging ? 'opacity-50' : ''}
    >
      <BlockItemContent
        block={block}
        isSelected={isSelected}
        onSelect={onSelect}
        onClose={onClose}
        onToggleVisibility={onToggleVisibility}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
      {/* 인라인 블록 편집기 */}
      {isSelected && (
        <div className="mt-2 border border-primary-200 rounded-lg bg-white overflow-hidden">
          <BlockEditor block={block} onClose={onClose} isInline />
        </div>
      )}
    </div>
  )
}

interface BlockItemContentProps {
  block: Block
  isSelected: boolean
  isDragOverlay?: boolean
  onSelect?: () => void
  onClose?: () => void
  onToggleVisibility?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  dragHandleProps?: Record<string, unknown>
}

function BlockItemContent({
  block,
  isSelected,
  isDragOverlay = false,
  onSelect,
  onClose: _onClose,
  onToggleVisibility,
  onDuplicate: _onDuplicate,
  onDelete,
  dragHandleProps,
}: BlockItemContentProps) {
  const meta = BLOCK_TYPE_META[block.type]

  // 블록 제목 가져오기
  const getBlockTitle = () => {
    const content = block.content
    switch (block.type) {
      case 'hero':
        return typeof content.title === 'string' ? content.title : meta.label
      case 'notice':
        return typeof content.title === 'string' ? content.title : meta.label
      case 'host_pick':
        return typeof content.title === 'string' ? content.title : meta.label
      default:
        return meta.label
    }
  }

  // 블록 타입별 색상
  const getBlockColor = () => {
    switch (block.type) {
      case 'hero': return { bg: 'bg-primary-100', text: 'text-primary-600', initial: 'H' }
      case 'quick_info': return { bg: 'bg-secondary-100', text: 'text-secondary-600', initial: 'Q' }
      case 'amenities': return { bg: 'bg-blue-100', text: 'text-blue-600', initial: 'A' }
      case 'gallery': return { bg: 'bg-purple-100', text: 'text-purple-600', initial: 'G' }
      case 'host_pick': return { bg: 'bg-pink-100', text: 'text-pink-600', initial: 'P' }
      case 'notice': return { bg: 'bg-amber-100', text: 'text-amber-600', initial: 'N' }
      case 'map': return { bg: 'bg-green-100', text: 'text-green-600', initial: 'M' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', initial: '?' }
    }
  }

  const color = getBlockColor()

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      }}
      role="button"
      tabIndex={isDragOverlay ? -1 : 0}
      aria-pressed={isSelected}
      aria-label={`${meta.label} 블록 ${isSelected ? '선택됨' : '선택하려면 Enter'}`}
      className={`group flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-300 bg-white shadow-sm'
          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
      } ${!block.isVisible ? 'opacity-50' : ''} ${
        isDragOverlay ? 'shadow-lg bg-white' : ''
      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1`}
    >
      {/* 블록 타입 배지 */}
      <div className={`w-6 h-6 rounded ${color.bg} flex items-center justify-center ${color.text} text-xs font-bold flex-shrink-0`}>
        {color.initial}
      </div>

      {/* 블록 정보 */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {getBlockTitle()}
        </p>
        <p className="text-xs text-gray-400">{meta.description}</p>
      </div>

      {/* 액션 버튼들 - hover 시 표시 */}
      {!isDragOverlay && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility?.()
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100"
            title={block.isVisible ? '숨기기' : '보이기'}
            aria-label={block.isVisible ? '블록 숨기기' : '블록 보이기'}
          >
            {block.isVisible ? (
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
          {/* TODO: confirm() 대신 커스텀 확인 모달 사용 권장 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              // 브라우저 기본 confirm 사용 (향후 커스텀 모달로 교체 예정)
              if (window.confirm('이 블록을 삭제하시겠습니까?')) {
                onDelete?.()
              }
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100"
            title="삭제"
            aria-label="블록 삭제"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* 드래그 핸들 */}
      <div
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          e.stopPropagation()
          const onPointerDown = dragHandleProps?.onPointerDown as ((e: React.PointerEvent) => void) | undefined
          onPointerDown?.(e)
        }}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 touch-none flex-shrink-0"
        role="button"
        aria-label="드래그하여 블록 순서 변경"
        aria-roledescription="드래그 핸들"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  )
}
