'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Eye, ExternalLink } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api/client'

interface Guide {
  id: string
  slug: string
  title: string
  accommodationName: string
  isPublished: boolean
  blocksCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface GuidesResponse {
  items: Guide[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function GuidesList() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [guides, setGuides] = useState<Guide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGuides() {
      if (!isLoaded || !isSignedIn) return

      try {
        setIsLoading(true)

        // API 클라이언트에 토큰 getter 설정 (혹시 안되어 있을 경우 대비)
        api.setTokenGetter(async () => {
          try {
            return await getToken()
          } catch {
            return null
          }
        })

        const response = await api.get<GuidesResponse>('/guides')
        if (response.success && response.data) {
          setGuides(response.data.items)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '안내서를 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuides()
  }, [isLoaded, isSignedIn, getToken])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-neutral-200" />
              <div className="flex-1">
                <div className="h-4 w-1/3 rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-1/4 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-body-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (guides.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <FileText className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-heading-sm font-semibold text-text-primary">
          아직 안내서가 없어요
        </h3>
        <p className="mt-2 text-body-sm text-text-secondary">
          첫 번째 안내서를 만들고 게스트에게 공유해보세요
        </p>
        <Link
          href="/editor/new"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          안내서 만들기
        </Link>
      </div>
    )
  }

  // 상대적 시간 포맷
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guides.map((guide) => (
        <Link
          key={guide.id}
          href={`/editor/${guide.id}`}
          className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          {/* 썸네일 영역 */}
          <div className="relative h-36 bg-gradient-to-br from-primary-100 to-secondary-100">
            {/* 기본 아이콘 (이미지 없을 때) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-12 h-12 text-primary-300" />
            </div>
            {/* 발행 상태 배지 */}
            <span className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full font-medium ${
              guide.isPublished
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            }`}>
              {guide.isPublished ? '발행됨' : '초안'}
            </span>
          </div>

          {/* 정보 영역 */}
          <div className="p-4">
            <h3 className="font-semibold text-text-primary mb-1 truncate group-hover:text-primary-600 transition-colors">
              {guide.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{guide.accommodationName}</p>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {guide.viewCount.toLocaleString()}
              </span>
              <span>수정됨 {getRelativeTime(guide.updatedAt)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
