'use client'

import { useState, useMemo } from 'react'
import type { GuideDetail } from '@/contracts/guide.contract'
import { BlockRenderer } from './BlockRenderer'
import { ThemeProvider } from './ThemeProvider'
import { Watermark } from './Watermark'
import { OpeningAnimation } from './OpeningAnimation'
import type { ThemeSettings } from '@/contracts/types'
import { AiFloatingButton, ChatInterface } from '@/components/ai'
import { SeasonalEffects, getCurrentSeason } from './SeasonalEffects'

interface GuideRendererProps {
  guide: GuideDetail
  showWatermark?: boolean
}

export function GuideRenderer({ guide, showWatermark = true }: GuideRendererProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showOpening, setShowOpening] = useState(true)
  const [currentSeason] = useState(() => getCurrentSeason())

  // 보이는 블록만 필터링하고 order 순서로 정렬
  const visibleBlocks = guide.blocks
    .filter((block) => block.isVisible)
    .sort((a, b) => a.order - b.order)

  // Hero 블록에서 이미지와 타이틀 추출
  const heroData = useMemo(() => {
    const heroBlock = visibleBlocks.find((b) => b.type === 'hero')
    if (!heroBlock) return null
    return {
      imageUrl: heroBlock.content?.imageUrl as string | undefined,
      title: heroBlock.content?.title as string | undefined,
      subtitle: heroBlock.content?.subtitle as string | undefined,
    }
  }, [visibleBlocks])

  return (
    <ThemeProvider themeSettings={guide.themeSettings as ThemeSettings | null}>
      {/* 시즌 이펙트 */}
      <SeasonalEffects season={currentSeason} intensity="normal" />

      {/* 오프닝 애니메이션 */}
      {showOpening && (
        <OpeningAnimation
          title={heroData?.title || guide.title}
          subtitle={guide.accommodationName}
          imageUrl={heroData?.imageUrl}
          onComplete={() => setShowOpening(false)}
        />
      )}

      <div className={`min-h-screen transition-opacity duration-500 ${showOpening ? 'opacity-0' : 'opacity-100'}`}>
        {/* 안내서 헤더 (선택사항) */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">{guide.title}</h1>
            <p className="text-sm text-gray-500">{guide.accommodationName}</p>
          </div>
        </div>

        {/* 블록 렌더링 */}
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {visibleBlocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>아직 작성된 내용이 없습니다</p>
            </div>
          ) : (
            visibleBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                type={block.type as any}
                content={block.content}
              />
            ))
          )}
        </div>

        {/* 푸터 (선택사항) */}
        <div className="max-w-2xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
          <p>Powered by Roomy</p>
        </div>

        {/* AI 플로팅 버튼 */}
        <AiFloatingButton onClick={() => setIsChatOpen(true)} />

        {/* AI 채팅 인터페이스 */}
        <ChatInterface
          guideId={guide.id}
          accommodationName={guide.accommodationName}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        {/* 워터마크 */}
        <Watermark show={showWatermark} />
      </div>
    </ThemeProvider>
  )
}
