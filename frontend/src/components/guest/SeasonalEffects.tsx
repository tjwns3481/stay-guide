'use client'

import { useEffect, useState, useMemo } from 'react'

type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'none'

interface SeasonalEffectsProps {
  season?: Season
  intensity?: 'light' | 'normal' | 'heavy'
  className?: string
}

interface Particle {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
  swing: number
}

// 시즌별 파티클 설정
const seasonConfig = {
  spring: {
    emoji: '🌸',
    colors: ['#FFB7C5', '#FF69B4', '#FFC0CB'],
    particleCount: { light: 15, normal: 25, heavy: 40 },
  },
  summer: {
    emoji: '✨',
    colors: ['#FFD700', '#FFA500', '#FFEC8B'],
    particleCount: { light: 10, normal: 20, heavy: 30 },
  },
  autumn: {
    emoji: '🍂',
    colors: ['#D2691E', '#CD853F', '#8B4513', '#A0522D'],
    particleCount: { light: 12, normal: 22, heavy: 35 },
  },
  winter: {
    emoji: '❄️',
    colors: ['#FFFFFF', '#E0FFFF', '#B0E0E6'],
    particleCount: { light: 20, normal: 35, heavy: 50 },
  },
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 8,
    size: 0.8 + Math.random() * 0.8,
    opacity: 0.6 + Math.random() * 0.4,
    swing: 20 + Math.random() * 40,
  }))
}

export function SeasonalEffects({
  season = 'none',
  intensity = 'normal',
  className = '',
}: SeasonalEffectsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const particles = useMemo(() => {
    if (season === 'none') return []
    const config = seasonConfig[season]
    const count = config.particleCount[intensity]
    return generateParticles(count)
  }, [season, intensity])

  if (!mounted || season === 'none') return null

  const config = seasonConfig[season]

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-40 ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-fall"
          style={{
            left: `${particle.left}%`,
            top: '-5%',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            fontSize: `${particle.size}rem`,
            opacity: particle.opacity,
            ['--swing' as string]: `${particle.swing}px`,
          }}
        >
          {config.emoji}
        </div>
      ))}

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: ${season === 'winter' ? 1 : 0.8};
          }
          90% {
            opacity: ${season === 'winter' ? 0.8 : 0.6};
          }
          100% {
            transform: translateY(110vh) translateX(var(--swing)) rotate(${season === 'autumn' ? '720deg' : '360deg'});
            opacity: 0;
          }
        }

        .animate-fall {
          animation: fall linear infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  )
}

// 자동 시즌 감지 헬퍼
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1 // 1-12

  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}
