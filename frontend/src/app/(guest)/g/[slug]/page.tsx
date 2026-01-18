import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { GuideRenderer } from '@/components/guest/GuideRenderer'
import type { GuideDetail } from '@/contracts/guide.contract'

// 동적 라우트 설정: 요청 시 페이지 생성
export const dynamic = 'force-dynamic'

// 요청 헤더에서 API base URL 동적 생성
async function getApiBaseUrl(): Promise<string> {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  return `${protocol}://${host}/api`
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// 슬러그로 안내서 가져오기 (서버 컴포넌트에서 직접 fetch)
async function getGuideBySlug(slug: string): Promise<GuideDetail | null> {
  try {
    const apiBase = await getApiBaseUrl()
    const res = await fetch(`${apiBase}/guides/slug/${slug}`, {
      cache: 'no-store', // 항상 최신 데이터 fetch
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()

    if (!data.success || !data.data) {
      return null
    }

    const guide = data.data as GuideDetail

    // 발행되지 않은 안내서는 404
    if (!guide.isPublished) {
      return null
    }

    return guide
  } catch (error) {
    console.error('Failed to fetch guide:', error)
    return null
  }
}

// SEO 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) {
    return {
      title: '안내서를 찾을 수 없습니다',
    }
  }

  // Hero 블록에서 이미지 가져오기
  const heroBlock = guide.blocks.find((b) => b.type === 'hero' && b.isVisible)
  const imageUrl = heroBlock?.content?.imageUrl as string | undefined

  return {
    title: `${guide.title} - ${guide.accommodationName}`,
    description: `${guide.accommodationName}의 숙소 안내서입니다.`,
    openGraph: {
      title: `${guide.title} - ${guide.accommodationName}`,
      description: `${guide.accommodationName}의 숙소 안내서입니다.`,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  }
}

export default async function GuestGuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) {
    notFound()
  }

  // 워터마크 표시 여부 결정: noWatermark 기능이 있으면 숨김
  const showWatermark = !guide.ownerLicense?.features?.noWatermark

  return <GuideRenderer guide={guide} showWatermark={showWatermark} />
}
