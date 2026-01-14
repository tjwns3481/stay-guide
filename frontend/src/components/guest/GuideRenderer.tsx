'use client'

import { useState } from 'react'
import type { GuideDetail } from '@/contracts/guide.contract'
import { BlockRenderer } from './BlockRenderer'
import { ThemeProvider } from './ThemeProvider'
import type { ThemeSettings } from '@/contracts/types'
import { AiFloatingButton, ChatInterface } from '@/components/ai'

interface GuideRendererProps {
  guide: GuideDetail
}

export function GuideRenderer({ guide }: GuideRendererProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // 보이는 블록만 필터링하고 order 순서로 정렬
  const visibleBlocks = guide.blocks
    .filter((block) => block.isVisible)
    .sort((a, b) => a.order - b.order)

  return (
    <ThemeProvider themeSettings={guide.themeSettings as ThemeSettings | null}>
      <div className="min-h-screen">
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
      </div>
    </ThemeProvider>
  )
}
