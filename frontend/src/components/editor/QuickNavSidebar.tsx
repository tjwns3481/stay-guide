'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useEditorStore, Block, BLOCK_TYPE_META } from '@/stores/editor'

export function QuickNavSidebar() {
  const {
    guide,
    selectedBlockId,
    selectBlock,
    toggleBlockVisibility,
    reorderBlocks,
  } = useEditorStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!guide) return null

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = guide.blocks.findIndex((b) => b.id === active.id)
      const newIndex = guide.blocks.findIndex((b) => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex)
      }
    }
  }

  const handleBlockClick = (blockId: string) => {
    selectBlock(blockId)
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`)
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-sm">
      {/* 헤더 - FeelCard 스타일 */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Menu</span>
        </div>
      </div>

      {/* 블록 네비게이션 리스트 */}
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={guide.blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="py-2">
              {guide.blocks.map((block) => (
                <SortableNavItem
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onClick={() => handleBlockClick(block.id)}
                  onToggleVisibility={() => toggleBlockVisibility(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 푸터 */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          드래그로 순서 변경
        </p>
      </div>
    </div>
  )
}

interface SortableNavItemProps {
  block: Block
  isSelected: boolean
  onClick: () => void
  onToggleVisibility: () => void
}

function SortableNavItem({
  block,
  isSelected,
  onClick,
  onToggleVisibility,
}: SortableNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const meta = BLOCK_TYPE_META[block.type]

  const getBlockTitle = () => {
    const content = block.content
    switch (block.type) {
      case 'hero':
        return typeof content.title === 'string' && content.title ? content.title : meta.label
      case 'notice':
        return typeof content.title === 'string' && content.title ? content.title : meta.label
      case 'host_pick':
        return typeof content.title === 'string' && content.title ? content.title : meta.label
      default:
        return meta.label
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all
        ${isDragging ? 'opacity-50 shadow-lg bg-white' : ''}
        ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}
      `}
      onClick={onClick}
    >
      {/* FeelCard 스타일 토글 스위치 (dd_wrap) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility()
        }}
        className={`
          relative flex-shrink-0 rounded-md transition-colors
          ${block.isVisible
            ? 'bg-[#FAE6D5]' // FeelCard on 배경색
            : 'bg-[#EAECEE]' // FeelCard off 배경색
          }
        `}
        style={{ width: '30px', height: '12px' }}
        title={block.isVisible ? '숨기기' : '보이기'}
      >
        {/* 스위치 노브 (dd-switch) */}
        <span
          className={`
            absolute rounded-full shadow-sm transition-all duration-200
            ${block.isVisible
              ? 'bg-[#F5CDAA] left-[14px]' // FeelCard on 노브색 + 위치
              : 'bg-[#F7F8F8] left-[-2px]' // FeelCard off 노브색 + 위치
            }
          `}
          style={{
            width: '18px',
            height: '18px',
            top: '-3px',
          }}
        />
      </button>

      {/* 블록 이름 */}
      <span
        className={`
          flex-1 text-sm truncate transition-colors
          ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}
          ${!block.isVisible ? 'opacity-50' : ''}
        `}
      >
        {getBlockTitle()}
      </span>

      {/* 드래그 핸들 - FeelCard 스타일 */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          e.stopPropagation()
          const onPointerDown = listeners?.onPointerDown as ((e: React.PointerEvent) => void) | undefined
          onPointerDown?.(e)
        }}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 touch-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  )
}
