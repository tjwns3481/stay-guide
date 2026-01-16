import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GuideRenderer } from '@/components/guest/GuideRenderer'
import type { GuideDetail } from '@/contracts/guide.contract'

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (!envUrl) return 'http://localhost:3000/api'
  if (envUrl.startsWith('http')) return envUrl
  // 상대 경로인 경우 절대 경로로 변환 (SSR 대응)
  return `http://localhost:3000${envUrl}`
}
const API_BASE = getApiBaseUrl()

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// 슬러그로 안내서 가져오기 (서버 컴포넌트에서 직접 fetch)
async function getGuideBySlug(slug: string): Promise<GuideDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/guides/slug/${slug}`, {
      cache: 'no-store',
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
