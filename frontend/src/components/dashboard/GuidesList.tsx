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

  return (
    <div className="space-y-3">
      {guides.map((guide) => (
        <Link
          key={guide.id}
          href={`/editor/${guide.id}`}
          className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm"
        >
          {/* 아이콘 */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
            <FileText className="h-6 w-6" />
          </div>

          {/* 정보 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-heading-sm font-semibold text-text-primary">
                {guide.title}
              </h3>
              {guide.isPublished ? (
                <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-body-xs font-medium text-green-700">
                  발행됨
                </span>
              ) : (
                <span className="flex-shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-body-xs font-medium text-neutral-600">
                  임시저장
                </span>
              )}
            </div>
            <p className="mt-0.5 text-body-sm text-text-secondary">
              {guide.accommodationName}
            </p>
          </div>

          {/* 통계 */}
          <div className="hidden items-center gap-4 sm:flex">
            <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
              <Eye className="h-4 w-4" />
              <span>{guide.viewCount}</span>
            </div>
          </div>

          {/* 외부 링크 (발행된 경우) */}
          {guide.isPublished && (
            <a
              href={`/g/${guide.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-primary-500"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </Link>
      ))}
    </div>
  )
}
