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
  GripVertical,
  Copy,
  Trash2,
  Image,
  Clock,
  Wifi,
  MapPin,
  Heart,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useEditorStore, BlockType, Block, BLOCK_TYPE_META } from '@/stores/editor'
import { BlockEditor } from '@/components/blocks'

// 블록 타입 아이콘 매핑
const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: <Image className="w-4 h-4" />,
  quick_info: <Clock className="w-4 h-4" />,
  amenities: <Wifi className="w-4 h-4" />,
  map: <MapPin className="w-4 h-4" />,
  host_pick: <Heart className="w-4 h-4" />,
  notice: <Bell className="w-4 h-4" />,
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
        distance: 8, // 8px 이동 후 드래그 시작
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms 터치 후 드래그 시작
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
  onDuplicate,
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

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      } ${!block.isVisible ? 'opacity-50' : ''} ${
        isDragOverlay ? 'shadow-lg bg-white' : ''
      }`}
    >
      {/* 드래그 핸들 */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* 블록 아이콘 */}
      <div
        className={`p-2 rounded-lg ${
          isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {BLOCK_ICONS[block.type]}
      </div>

      {/* 블록 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getBlockTitle()}
        </p>
        <p className="text-xs text-gray-400">{meta.label}</p>
      </div>

      {/* 확장/축소 아이콘 */}
      {!isDragOverlay && (
        <div className="text-gray-400">
          {isSelected ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      )}

      {/* 토글 스위치 - 항상 표시 */}
      {!isDragOverlay && (
        <div className="flex items-center gap-2">
          {/* 토글 스위치 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility?.()
            }}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              block.isVisible ? 'bg-primary-500' : 'bg-gray-300'
            }`}
            title={block.isVisible ? '숨기기' : '보이기'}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                block.isVisible ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>

          {/* 액션 버튼들 - hover 시 표시 */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate?.()
              }}
              className="p-1 rounded hover:bg-gray-200 text-gray-400"
              title="복제"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('이 블록을 삭제하시겠습니까?')) {
                  onDelete?.()
                }
              }}
              className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
