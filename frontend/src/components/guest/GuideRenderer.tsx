// @TASK T4 - 게스트 안내서 렌더러
// @SPEC docs/planning/03-user-flow.md#게스트-뷰
'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { GuideDetail } from '@/contracts/guide.contract'
import type { BlockType } from '@/stores/editor'
import { BlockRenderer } from './BlockRenderer'
import { ThemeProvider } from './ThemeProvider'
import { Watermark } from './Watermark'
import type { ThemeSettings } from '@/contracts/types'
import { AiFloatingButton } from '@/components/ai'
import { getCurrentSeason, type Season as SeasonType } from './SeasonalEffects'

// 동적 import: AI 채팅 인터페이스 (모달로 열리므로 지연 로딩)
const ChatInterface = dynamic(
  () => import('@/components/ai/ChatInterface').then((mod) => ({ default: mod.ChatInterface })),
  { ssr: false }
)

// 동적 import: 시즌 이펙트 (조건부 렌더링, 애니메이션 무거움)
const SeasonalEffects = dynamic(
  () => import('./SeasonalEffects').then((mod) => ({ default: mod.SeasonalEffects })),
  { ssr: false }
)

// 동적 import: 오프닝 애니메이션 (조건부 렌더링)
const OpeningAnimation = dynamic(
  () => import('./OpeningAnimation').then((mod) => ({ default: mod.OpeningAnimation })),
  { ssr: false }
)

interface GuideRendererProps {
  guide: GuideDetail
  showWatermark?: boolean
}

export function GuideRenderer({ guide, showWatermark = true }: GuideRendererProps) {
  const themeSettings = guide.themeSettings as ThemeSettings | null

  // 효과 설정 추출
  const seasonEffectSettings = themeSettings?.seasonEffect
  const openingAnimationSettings = themeSettings?.openingAnimation

  // 시즌 이펙트 활성화 여부 (기본값: true)
  const isSeasonEffectEnabled = seasonEffectSettings?.enabled ?? true
  // 오프닝 애니메이션 활성화 여부 (기본값: true)
  const isOpeningEnabled = openingAnimationSettings?.enabled ?? true
  const isSkipEnabled = openingAnimationSettings?.skipEnabled ?? true

  // 시즌 결정: 'auto'이면 getCurrentSeason() 사용, 아니면 설정값 사용
  const configuredSeason = seasonEffectSettings?.season ?? 'auto'
  const effectiveSeason: SeasonType = useMemo(() => {
    if (configuredSeason === 'auto') {
      return getCurrentSeason()
    }
    return configuredSeason as SeasonType
  }, [configuredSeason])

  const seasonIntensity = seasonEffectSettings?.intensity ?? 'normal'

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showOpening, setShowOpening] = useState(isOpeningEnabled)

  // 보이는 블록만 필터링하고 order 순서로 정렬
  const visibleBlocks = guide.blocks
    .filter((block) => block.isVisible)
    .sort((a, b) => a.order - b.order)

  // Hero 블록과 QuickInfo 블록 분리 (특별 레이아웃 처리)
  // NOTE: BlockType은 'quick_info' (snake_case)를 사용함
  const heroBlock = visibleBlocks.find((b) => b.type === 'hero')
  const quickInfoBlock = visibleBlocks.find((b) => b.type === 'quick_info')
  const otherBlocks = visibleBlocks.filter((b) => b.type !== 'hero' && b.type !== 'quick_info')

  // Hero 블록에서 이미지와 타이틀 추출
  const heroData = useMemo(() => {
    if (!heroBlock) return null
    return {
      imageUrl: heroBlock.content?.imageUrl as string | undefined,
      title: heroBlock.content?.title as string | undefined,
      subtitle: heroBlock.content?.subtitle as string | undefined,
    }
  }, [heroBlock])

  return (
    <ThemeProvider themeSettings={themeSettings}>
      {/* 시즌 이펙트 (설정에 따라 표시) */}
      {isSeasonEffectEnabled && effectiveSeason !== 'none' && (
        <SeasonalEffects season={effectiveSeason} intensity={seasonIntensity} />
      )}

      {/* 오프닝 애니메이션 (설정에 따라 표시) */}
      {showOpening && (
        <OpeningAnimation
          title={heroData?.title || guide.title}
          subtitle={guide.accommodationName}
          imageUrl={heroData?.imageUrl}
          onComplete={() => setShowOpening(false)}
          skipEnabled={isSkipEnabled}
        />
      )}

      <div className={`min-h-screen bg-cream transition-opacity duration-500 ${showOpening ? 'opacity-0' : 'opacity-100'}`}>
        {visibleBlocks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>아직 작성된 내용이 없습니다</p>
          </div>
        ) : (
          <>
            {/* Hero 블록 (전체 너비) */}
            {heroBlock && (
              <BlockRenderer
                type={heroBlock.type as BlockType}
                content={heroBlock.content}
              />
            )}

            {/* QuickInfo 블록 (Hero 아래 오버레이) */}
            {quickInfoBlock && (
              <div className="max-w-2xl mx-auto">
                <BlockRenderer
                  type={quickInfoBlock.type as BlockType}
                  content={quickInfoBlock.content}
                />
              </div>
            )}

            {/* 나머지 블록 렌더링 */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
              {otherBlocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  type={block.type as BlockType}
                  content={block.content}
                />
              ))}
            </div>
          </>
        )}

        {/* 푸터 */}
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-xs text-gray-400">Powered by Roomy</p>
        </div>

        {/* AI 플로팅 버튼 - aiEnabled가 true일 때만 표시 */}
        {guide.aiEnabled !== false && (
          <>
            <AiFloatingButton onClick={() => setIsChatOpen(true)} />

            {/* AI 채팅 인터페이스 */}
            <ChatInterface
              guideId={guide.id}
              accommodationName={guide.accommodationName}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </>
        )}

        {/* 워터마크 */}
        <Watermark show={showWatermark} />
      </div>
    </ThemeProvider>
  )
}
