'use client'

import { useEditorStore, BlockType, BLOCK_TYPE_META } from '@/stores/editor'
import { useMemo } from 'react'
import { THEME_PRESETS, DEFAULT_THEME, ThemePreset } from '@/lib/theme'
import type { ThemeSettings, Season, SeasonIntensity } from '@/contracts/types'
import { Snowflake, Flower2, Sun, Leaf, Sparkles, Play } from 'lucide-react'

// 시즌 이모지 매핑
const SEASON_EMOJI: Record<string, string> = {
  auto: '✨',
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
  none: '🚫',
}

export function PreviewPanel() {
  const { guide } = useEditorStore()

  // 테마 스타일 계산 - 훅은 조건문 전에 호출되어야 함
  const themeStyle = useMemo(() => {
    if (!guide) return {} as React.CSSProperties

    const themeSettings = guide.themeSettings as ThemeSettings | null
    const theme =
      themeSettings?.preset && THEME_PRESETS[themeSettings.preset as ThemePreset]
        ? THEME_PRESETS[themeSettings.preset as ThemePreset]
        : DEFAULT_THEME

    return {
      '--theme-primary': themeSettings?.primaryColor || theme.primaryColor,
      '--theme-secondary': themeSettings?.secondaryColor || theme.secondaryColor,
      '--theme-background': themeSettings?.backgroundColor || theme.backgroundColor,
      '--theme-font': themeSettings?.fontFamily || theme.fontFamily,
    } as React.CSSProperties
  }, [guide])

  // 효과 설정 추출
  const effectSettings = useMemo(() => {
    if (!guide) return { seasonEnabled: true, season: 'auto', intensity: 'normal', openingEnabled: true }
    const themeSettings = guide.themeSettings as ThemeSettings | null
    return {
      seasonEnabled: themeSettings?.seasonEffect?.enabled ?? true,
      season: themeSettings?.seasonEffect?.season ?? 'auto',
      intensity: themeSettings?.seasonEffect?.intensity ?? 'normal',
      openingEnabled: themeSettings?.openingAnimation?.enabled ?? true,
    }
  }, [guide])

  if (!guide) return null

  const visibleBlocks = guide.blocks.filter((b) => b.isVisible)

  return (
    <div className="flex flex-col items-center">
      {/* 효과 설정 인디케이터 */}
      <div className="mb-3 flex items-center gap-2">
        {/* 시즌 이펙트 인디케이터 */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
            effectSettings.seasonEnabled && effectSettings.season !== 'none'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-400'
          }`}
          title={`시즌 이펙트: ${effectSettings.season}`}
        >
          <span>{SEASON_EMOJI[effectSettings.season]}</span>
          <span className="font-medium">
            {effectSettings.seasonEnabled && effectSettings.season !== 'none'
              ? effectSettings.season === 'auto' ? '자동' : effectSettings.season
              : '없음'
            }
          </span>
        </div>

        {/* 오프닝 애니메이션 인디케이터 */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
            effectSettings.openingEnabled
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-400'
          }`}
          title={`오프닝: ${effectSettings.openingEnabled ? 'ON' : 'OFF'}`}
        >
          <Play className="w-3 h-3" />
          <span className="font-medium">{effectSettings.openingEnabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      {/* 폰 목업 컨테이너 */}
      <div className="relative">
        {/* 폰 프레임 (검은색 외곽) */}
        <div className="w-[320px] h-[640px] bg-black rounded-[40px] p-3 shadow-2xl">
          {/* 폰 스크린 (흰색 내부) */}
          <div
            className="w-full h-full bg-white rounded-[32px] overflow-hidden theme-root relative"
            style={themeStyle}
          >
            {/* 시즌 이펙트 미니 미리보기 (simplified) */}
            {effectSettings.seasonEnabled && effectSettings.season !== 'none' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {[...Array(effectSettings.intensity === 'light' ? 5 : effectSettings.intensity === 'normal' ? 10 : 15)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute text-xs animate-fall opacity-60"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${8 + Math.random() * 4}s`,
                    }}
                  >
                    {SEASON_EMOJI[effectSettings.season === 'auto' ? 'winter' : effectSettings.season]}
                  </span>
                ))}
              </div>
            )}

            {/* 스크린 컨텐츠 (스크롤 가능) */}
            <div className="h-full overflow-y-auto relative z-0">
              {visibleBlocks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 px-6">
                  <p className="text-sm">블록이 없습니다</p>
                  <p className="text-xs mt-1">오른쪽에서 블록을 추가해보세요</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {visibleBlocks.map((block) => (
                    <BlockPreview key={block.id} type={block.type} content={block.content} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 폰 노치 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
      </div>
    </div>
  )
}

// 타입 가드 헬퍼 함수들
const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const getNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' ? value : undefined
}

const getArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? value : []
}

// 블록 프리뷰 컴포넌트
interface BlockPreviewProps {
  type: BlockType
  content: Record<string, unknown>
}

function BlockPreview({ type, content }: BlockPreviewProps) {
  const meta = BLOCK_TYPE_META[type]

  switch (type) {
    case 'hero': {
      const imageUrl = getString(content.imageUrl)
      const title = getString(content.title) || '환영합니다'
      const subtitle = getString(content.subtitle)

      return (
        <div className="relative h-48">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="font-bold text-sm">{title}</h2>
            {subtitle && (
              <p className="text-xs opacity-80">{subtitle}</p>
            )}
          </div>
        </div>
      )
    }

    case 'quick_info': {
      const checkIn = getString(content.checkIn)
      const checkOut = getString(content.checkOut)
      const maxGuests = getNumber(content.maxGuests)
      const hasWifi = content.hasWifi as boolean | undefined

      return (
        <div className="p-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {checkIn && (
                <div>
                  <p className="text-gray-400">체크인</p>
                  <p className="font-medium">{checkIn}</p>
                </div>
              )}
              {checkOut && (
                <div>
                  <p className="text-gray-400">체크아웃</p>
                  <p className="font-medium">{checkOut}</p>
                </div>
              )}
              {maxGuests && (
                <div>
                  <p className="text-gray-400">인원</p>
                  <p className="font-medium">{maxGuests}명</p>
                </div>
              )}
              {hasWifi && (
                <div>
                  <p className="text-gray-400">WiFi</p>
                  <p className="font-medium">무료</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'amenities': {
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      const items = getArray<{ icon: string; label: string }>(content.items)

      return (
        <div className="px-4 py-2">
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <h4 className="font-medium text-gray-900 text-xs">편의시설</h4>
            {wifi && wifi.ssid && (
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-500">Wi-Fi: {wifi.ssid}</p>
              </div>
            )}
            {items.length > 0 && (
              <div className="grid grid-cols-3 gap-1">
                {items.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-1.5 border border-gray-200 text-xs text-center">
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'map': {
      const address = getString(content.address)

      return (
        <div className="px-4 py-2">
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <h4 className="font-medium text-gray-900 text-xs">위치</h4>
            <div className="bg-gray-200 rounded-lg h-20 flex items-center justify-center text-gray-400 text-xs">
              지도 미리보기
            </div>
            {address && <p className="text-xs text-gray-600 truncate">{address}</p>}
          </div>
        </div>
      )
    }

    case 'host_pick': {
      const title = getString(content.title) || '호스트 추천'
      const items = getArray<{ name: string; category: string; description?: string }>(content.items)

      return (
        <div className="px-4 py-2">
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <h4 className="font-medium text-gray-900 text-xs">{title}</h4>
            {items.length > 0 ? (
              <div className="space-y-1">
                {items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-2 border border-gray-200">
                    <p className="font-medium text-xs">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">추천 항목이 없습니다</p>
            )}
          </div>
        </div>
      )
    }

    case 'notice': {
      const title = getString(content.title) || '알려드립니다'
      const noticeContent = getString(content.content)

      return (
        <div className="px-4 py-2">
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-xs text-amber-800"><strong>{title}</strong></p>
            {noticeContent && (
              <p className="text-xs text-amber-700 mt-1 line-clamp-2">{noticeContent}</p>
            )}
          </div>
        </div>
      )
    }

    case 'gallery': {
      const images = getArray<{ url: string }>(content.images)

      return (
        <div className="px-4 py-2">
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <h4 className="font-medium text-gray-900 text-xs">공간 둘러보기</h4>
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {images.slice(0, 3).map((image, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img src={image.url} alt={`이미지 ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg h-16 flex items-center justify-center text-gray-400 text-xs">
                이미지 없음
              </div>
            )}
          </div>
        </div>
      )
    }

    default:
      return (
        <div className="px-4 py-2">
          <div className="bg-gray-100 rounded-xl p-3 text-gray-500">
            <p className="text-xs">{meta.label} 블록</p>
          </div>
        </div>
      )
  }
}
