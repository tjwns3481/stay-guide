'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { EditorLayout } from '@/components/editor'
import { SlugInputModal } from '@/components/editor/SlugInputModal'
import { api } from '@/lib/api/client'

interface CreateGuideResponse {
  id: string
  slug: string
  title: string
  accommodationName: string
}

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const { getToken } = useAuth()
  const guideId = params.id as string
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(true) // 새 안내서일 때 모달 표시

  // 안내서 생성 처리
  const handleCreateGuide = async (slug: string, title: string, accommodationName: string) => {
    setIsCreating(true)
    setError(null)

    try {
      // API 클라이언트에 토큰 getter 설정
      api.setTokenGetter(getToken)

      const response = await api.post<CreateGuideResponse>('/guides', {
        slug,
        title,
        accommodationName,
      })

      if (response.data?.id) {
        router.replace(`/editor/${response.data.id}`)
      } else {
        setError('안내서 생성에 실패했습니다')
        setIsCreating(false)
      }
    } catch (err) {
      console.error('Failed to create guide:', err)
      setError(err instanceof Error ? err.message : '안내서 생성에 실패했습니다')
      setIsCreating(false)
    }
  }

  // 모달 취소 시 대시보드로 이동
  const handleCancel = () => {
    router.push('/dashboard')
  }

  if (!guideId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">안내서 ID가 필요합니다</p>
      </div>
    )
  }

  // "new" 케이스: 모달 표시
  if (guideId === 'new') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* 에러 메시지 */}
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </div>
        )}

        {/* 배경 컨텐츠 */}
        <div className="flex h-screen items-center justify-center">
          <div className="text-center text-gray-400">
            <p>새 안내서 정보를 입력해주세요</p>
          </div>
        </div>

        {/* URL 입력 모달 */}
        <SlugInputModal
          isOpen={showModal}
          onConfirm={handleCreateGuide}
          onCancel={handleCancel}
          isLoading={isCreating}
        />
      </div>
    )
  }

  return <EditorLayout guideId={guideId} />
}
