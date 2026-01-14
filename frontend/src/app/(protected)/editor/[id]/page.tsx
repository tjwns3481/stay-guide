'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { EditorLayout } from '@/components/editor'
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

  // API 클라이언트에 토큰 getter 설정
  useEffect(() => {
    api.setTokenGetter(getToken)
  }, [getToken])

  // "new" 케이스 처리: 새 안내서 생성 후 리다이렉트
  useEffect(() => {
    if (guideId === 'new' && !isCreating) {
      setIsCreating(true)

      const createNewGuide = async () => {
        try {
          const response = await api.post<CreateGuideResponse>('/guides', {
            title: '새 안내서',
            accommodationName: '숙소 이름',
          })

          if (response.data?.id) {
            router.replace(`/editor/${response.data.id}`)
          } else {
            setError('안내서 생성에 실패했습니다')
          }
        } catch (err) {
          console.error('Failed to create guide:', err)
          setError(err instanceof Error ? err.message : '안내서 생성에 실패했습니다')
        }
      }

      createNewGuide()
    }
  }, [guideId, isCreating, router])

  if (!guideId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">안내서 ID가 필요합니다</p>
      </div>
    )
  }

  // "new" 케이스: 로딩 또는 에러 표시
  if (guideId === 'new') {
    if (error) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">!</div>
            <p className="text-gray-900 font-medium">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setIsCreating(false)
              }}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">새 안내서를 만드는 중...</p>
        </div>
      </div>
    )
  }

  return <EditorLayout guideId={guideId} />
}
