'use client'

interface WatermarkProps {
  show?: boolean
}

/**
 * Watermark 컴포넌트
 * 무료 플랜 사용자의 안내서에 표시되는 워터마크
 */
export function Watermark({ show = true }: WatermarkProps) {
  if (!show) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50">
      <div className="rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur-sm">
        <span className="text-xs text-gray-500">Powered by Roomy</span>
      </div>
    </div>
  )
}

export default Watermark
