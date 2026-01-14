'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useEditorStore, Block } from '@/stores/editor'

interface HeroContent {
  title: string
  subtitle: string
  imageUrl: string
  style: 'full' | 'half'
}

interface HeroEditorProps {
  block: Block
}

export function HeroEditor({ block }: HeroEditorProps) {
  const { updateBlock } = useEditorStore()
  const content = block.content as unknown as HeroContent
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const updateContent = (updates: Partial<HeroContent>) => {
    updateBlock(block.id, {
      content: { ...content, ...updates },
    })
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)

    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('file', file)

      // 이미지 업로드 API 호출
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || '업로드 실패')
      }

      const result = await response.json()

      if (result.success && result.data?.url) {
        updateContent({ imageUrl: result.data.url })
      } else {
        throw new Error('업로드된 URL을 받지 못했습니다')
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          배경 이미지
        </label>

        {content.imageUrl ? (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={content.imageUrl}
              alt="Hero"
              className="w-full h-32 object-cover"
            />
            <button
              onClick={() => updateContent({ imageUrl: '' })}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isUploading
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">업로드 중...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  클릭하거나 이미지를 드래그하세요
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP (최대 5MB)</p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
          className="hidden"
        />

        {/* URL 직접 입력 */}
        <div className="mt-2">
          <input
            type="url"
            value={content.imageUrl}
            onChange={(e) => updateContent({ imageUrl: e.target.value })}
            placeholder="또는 이미지 URL을 직접 입력하세요"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          환영 문구
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="환영합니다"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 부제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          부제목
          <span className="text-gray-400 font-normal ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => updateContent({ subtitle: e.target.value })}
          placeholder="편안한 휴식이 되시길 바랍니다"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 스타일 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          레이아웃 스타일
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateContent({ style: 'full' })}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
              content.style === 'full'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-12 bg-gray-200 rounded flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-sm font-medium">전체 화면</span>
          </button>
          <button
            onClick={() => updateContent({ style: 'half' })}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
              content.style === 'half'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-12 bg-gray-100 rounded flex">
              <div className="w-1/2 bg-gray-200 rounded-l flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="w-1/2 flex items-center justify-center text-xs text-gray-400">
                텍스트
              </div>
            </div>
            <span className="text-sm font-medium">반반</span>
          </button>
        </div>
      </div>
    </div>
  )
}
