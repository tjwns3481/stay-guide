'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface OpeningAnimationProps {
  title: string
  subtitle?: string
  imageUrl?: string
  onComplete: () => void
}

export function OpeningAnimation({
  title,
  subtitle,
  imageUrl,
  onComplete,
}: OpeningAnimationProps) {
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'exit'>('initial')

  useEffect(() => {
    // Phase 1: 초기 상태에서 reveal로 전환 (타이틀 애니메이션 시작)
    const revealTimer = setTimeout(() => {
      setPhase('reveal')
    }, 100)

    // Phase 2: 자동으로 exit 시작 (3.5초 후)
    const exitTimer = setTimeout(() => {
      setPhase('exit')
    }, 3500)

    // Phase 3: 완전히 사라진 후 콜백 호출
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 4500)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  const handleSkip = () => {
    setPhase('exit')
    setTimeout(onComplete, 800)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleSkip}
    >
      {/* 배경 이미지 */}
      {imageUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-transform duration-[4000ms] ease-out ${
            phase === 'reveal' ? 'scale-100' : 'scale-110'
          }`}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* 콘텐츠 컨테이너 */}
      <div className="relative z-10 text-center px-8 max-w-lg">
        {/* 상단 장식선 */}
        <div
          className={`w-12 h-px bg-white/60 mx-auto mb-8 transition-all duration-1000 delay-300 ${
            phase === 'reveal'
              ? 'opacity-100 scale-x-100'
              : 'opacity-0 scale-x-0'
          }`}
        />

        {/* 서브타이틀 (숙소명) */}
        {subtitle && (
          <p
            className={`text-white/80 text-sm tracking-[0.3em] uppercase mb-4 transition-all duration-700 delay-500 ${
              phase === 'reveal'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            {subtitle}
          </p>
        )}

        {/* 메인 타이틀 */}
        <h1
          className={`text-white text-3xl md:text-4xl font-light tracking-wide leading-relaxed transition-all duration-1000 delay-700 ${
            phase === 'reveal'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          {title}
        </h1>

        {/* 하단 장식선 */}
        <div
          className={`w-12 h-px bg-white/60 mx-auto mt-8 transition-all duration-1000 delay-900 ${
            phase === 'reveal'
              ? 'opacity-100 scale-x-100'
              : 'opacity-0 scale-x-0'
          }`}
        />

        {/* 스크롤 힌트 */}
        <div
          className={`mt-16 transition-all duration-700 delay-1200 ${
            phase === 'reveal' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-white/60 text-xs tracking-widest mb-2">
            TAP TO ENTER
          </p>
          <ChevronDown className="w-5 h-5 text-white/60 mx-auto animate-bounce" />
        </div>
      </div>

      {/* 하단 로고 */}
      <div
        className={`absolute bottom-8 left-0 right-0 text-center transition-all duration-700 delay-1000 ${
          phase === 'reveal' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-white/40 text-xs tracking-widest">Powered by Roomy</p>
      </div>
    </div>
  )
}
