'use client'

import { useState, useRef } from 'react'
import { Images, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react'
import { useEditorStore, Block } from '@/stores/editor'

interface GalleryImage {
  url: string
  caption?: string
}

interface GalleryContent {
  title: string
  images: GalleryImage[]
}

interface GalleryEditorProps {
  block: Block
}

export function GalleryEditor({ block }: GalleryEditorProps) {
  const { updateBlock } = useEditorStore()
  const content = block.content as unknown as GalleryContent
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateContent = (updates: Partial<GalleryContent>) => {
    updateBlock(block.id, {
      content: { ...content, ...updates },
    })
  }

  const addImage = (url: string, caption?: string) => {
    updateContent({
      images: [...(content.images || []), { url, caption }],
    })
  }

  const removeImage = (index: number) => {
    const newImages = [...(content.images || [])]
    newImages.splice(index, 1)
    updateContent({ images: newImages })
  }

  const updateImage = (index: number, updates: Partial<GalleryImage>) => {
    const newImages = [...(content.images || [])]
    newImages[index] = { ...newImages[index], ...updates }
    updateContent({ images: newImages })
  }

  const handleAddByUrl = () => {
    const url = prompt('이미지 URL을 입력해주세요')
    if (url?.trim()) {
      addImage(url.trim())
    }
  }

  // 드래그 앤 드롭으로 순서 변경
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...(content.images || [])]
    const draggedItem = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)
    updateContent({ images: newImages })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* 섹션 제목 */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
          <Images className="w-4 h-4" />
          섹션 제목
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="갤러리"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 이미지 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            이미지 ({(content.images || []).length})
          </label>
          <button
            onClick={handleAddByUrl}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            URL로 추가
          </button>
        </div>

        {/* 이미지 그리드 */}
        {(content.images || []).length > 0 ? (
          <div className="space-y-2">
            {content.images.map((image, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-start gap-3 p-3 border rounded-lg bg-white ${
                  draggedIndex === index ? 'opacity-50 border-primary-500' : 'border-gray-200'
                }`}
              >
                {/* 드래그 핸들 */}
                <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 pt-1">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* 썸네일 */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.caption || `이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>

                {/* 캡션 입력 */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImage(index, { caption: e.target.value })}
                    placeholder="캡션 (선택사항)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-400 truncate">{image.url}</p>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => removeImage(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">이미지를 추가해주세요</p>
            <p className="text-xs mt-1">URL로 이미지를 추가할 수 있습니다</p>
            <button
              onClick={handleAddByUrl}
              className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              이미지 추가
            </button>
          </div>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            // 파일 업로드 기능은 추후 구현
            console.log('File upload not yet implemented', e.target.files)
          }}
        />
      </div>

      {/* 도움말 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">갤러리 사용 팁</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>이미지를 드래그하여 순서를 변경할 수 있습니다</li>
          <li>캡션을 추가하면 이미지 하단에 표시됩니다</li>
          <li>게스트 화면에서 스와이프로 이미지를 넘길 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}
