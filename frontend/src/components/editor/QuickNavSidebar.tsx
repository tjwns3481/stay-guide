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
import {
  GripVertical,
  Image,
  Clock,
  Wifi,
  MapPin,
  Heart,
  Bell,
} from 'lucide-react'
import { useEditorStore, BlockType, Block, BLOCK_TYPE_META } from '@/stores/editor'

// 블록 타입 아이콘 매핑
const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: <Image className="w-4 h-4" />,
  quick_info: <Clock className="w-4 h-4" />,
  amenities: <Wifi className="w-4 h-4" />,
  map: <MapPin className="w-4 h-4" />,
  host_pick: <Heart className="w-4 h-4" />,
  notice: <Bell className="w-4 h-4" />,
}

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
    // 블록 리스트에서 해당 블록으로 스크롤
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`)
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Menu</h3>
      </div>

      {/* 블록 네비게이션 리스트 */}
      <div className="flex-1 overflow-y-auto py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={guide.blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
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

      {/* 푸터 안내 */}
      <div className="px-4 py-3 border-t border-gray-100">
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

  // 블록 제목 가져오기
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
        mx-2 px-2 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        ${isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'}
      `}
      onClick={onClick}
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          e.stopPropagation()
          const onPointerDown = listeners?.onPointerDown as ((e: React.PointerEvent) => void) | undefined
          onPointerDown?.(e)
        }}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* 토글 스위치 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility()
        }}
        className={`
          relative w-8 h-4 rounded-full transition-colors flex-shrink-0
          ${block.isVisible ? 'bg-primary-500' : 'bg-gray-300'}
        `}
        title={block.isVisible ? '숨기기' : '보이기'}
      >
        <span
          className={`
            absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform
            ${block.isVisible ? 'left-4' : 'left-0.5'}
          `}
        />
      </button>

      {/* 활성 상태 인디케이터 */}
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          block.isVisible ? 'bg-orange-400' : 'bg-gray-300'
        }`}
      />

      {/* 블록 아이콘 & 이름 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`flex-shrink-0 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
          {BLOCK_ICONS[block.type]}
        </span>
        <span
          className={`
            text-sm truncate
            ${isSelected ? 'font-medium text-primary-700' : 'text-gray-600'}
            ${!block.isVisible ? 'opacity-50' : ''}
          `}
        >
          {getBlockTitle()}
        </span>
      </div>
    </div>
  )
}
