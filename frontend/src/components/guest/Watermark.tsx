'use client'

interface WatermarkProps {
  show?: boolean
}

const ROOMY_LANDING_URL = 'https://roomy.app' // 실제 랜딩 페이지 URL로 변경

/**
 * Watermark 컴포넌트
 * 무료 플랜 사용자의 안내서에 표시되는 워터마크
 * 클릭 시 Roomy 랜딩 페이지로 이동
 */
export function Watermark({ show = true }: WatermarkProps) {
  if (!show) return null

  const handleClick = () => {
    // UTM 파라미터 추가하여 전환 추적
    const utmUrl = `${ROOMY_LANDING_URL}?utm_source=watermark&utm_medium=guest_page&utm_campaign=free_plan`
    window.open(utmUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleClick}
        className="group rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
        aria-label="Roomy로 만든 안내서"
      >
        <span className="text-xs text-gray-500 group-hover:text-primary-600 transition-colors">
          Powered by <span className="font-medium">Roomy</span>
        </span>
      </button>
    </div>
  )
}

export default Watermark
