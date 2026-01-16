'use client'

import { Sparkles, Play, Snowflake, Flower2, Sun, Leaf } from 'lucide-react'
import { ThemeSelector } from './ThemeSelector'
import { ColorPicker } from './ColorPicker'
import { FontSelector } from './FontSelector'
import { THEME_PRESETS, ThemePreset, DEFAULT_THEME } from '@/lib/theme'
import type { ThemeSettings, Season, SeasonIntensity } from '@/contracts/types'

interface ThemeCustomizerProps {
  themeSettings: ThemeSettings | null
  onChange: (settings: ThemeSettings) => void
}

// 시즌 옵션
const SEASON_OPTIONS: { value: Season; label: string; icon: React.ReactNode; emoji: string }[] = [
  { value: 'auto', label: '자동', icon: <Sparkles className="w-4 h-4" />, emoji: '✨' },
  { value: 'spring', label: '봄', icon: <Flower2 className="w-4 h-4" />, emoji: '🌸' },
  { value: 'summer', label: '여름', icon: <Sun className="w-4 h-4" />, emoji: '☀️' },
  { value: 'autumn', label: '가을', icon: <Leaf className="w-4 h-4" />, emoji: '🍂' },
  { value: 'winter', label: '겨울', icon: <Snowflake className="w-4 h-4" />, emoji: '❄️' },
  { value: 'none', label: '없음', icon: null, emoji: '🚫' },
]

// 강도 옵션
const INTENSITY_OPTIONS: { value: SeasonIntensity; label: string }[] = [
  { value: 'light', label: '약하게' },
  { value: 'normal', label: '보통' },
  { value: 'heavy', label: '강하게' },
]

export function ThemeCustomizer({ themeSettings, onChange }: ThemeCustomizerProps) {
  const currentPreset = themeSettings?.preset as ThemePreset | undefined

  // 프리셋 선택 시
  const handlePresetSelect = (preset: ThemePreset) => {
    const presetTheme = THEME_PRESETS[preset]
    onChange({
      preset,
      primaryColor: presetTheme.primaryColor,
      secondaryColor: presetTheme.secondaryColor,
      backgroundColor: presetTheme.backgroundColor,
      fontFamily: presetTheme.fontFamily,
    })
  }

  // 커스텀 값 변경 시 (프리셋 선택 해제)
  const handleCustomChange = (updates: Partial<ThemeSettings>) => {
    onChange({
      ...themeSettings,
      ...updates,
      preset: undefined, // 커스텀 변경 시 프리셋 해제
    })
  }

  // 효과 설정 변경 (프리셋 유지)
  const handleEffectChange = (updates: Partial<ThemeSettings>) => {
    onChange({
      ...themeSettings,
      ...updates,
    })
  }

  // 현재 효과 설정
  const seasonEffect = themeSettings?.seasonEffect ?? { enabled: true, season: 'auto' as Season, intensity: 'normal' as SeasonIntensity }
  const openingAnimation = themeSettings?.openingAnimation ?? { enabled: true, skipEnabled: true }

  // 현재 값 (프리셋이 있으면 프리셋 값, 없으면 커스텀 값 또는 기본값)
  const currentTheme = currentPreset
    ? THEME_PRESETS[currentPreset]
    : {
        primaryColor: themeSettings?.primaryColor || DEFAULT_THEME.primaryColor,
        secondaryColor: themeSettings?.secondaryColor || DEFAULT_THEME.secondaryColor,
        backgroundColor: themeSettings?.backgroundColor || DEFAULT_THEME.backgroundColor,
        fontFamily: themeSettings?.fontFamily || DEFAULT_THEME.fontFamily,
      }

  return (
    <div className="space-y-4">
      {/* 빠른 포인트 컬러 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          포인트 컬러
        </label>
        <div className="flex flex-wrap gap-2">
          {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
            <button
              key={color}
              onClick={() => handleCustomChange({ primaryColor: color })}
              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                currentTheme.primaryColor === color
                  ? 'border-gray-800 ring-2 ring-gray-300'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* 프리셋 선택 */}
      <ThemeSelector selectedPreset={currentPreset} onSelectPreset={handlePresetSelect} />

      {/* 커스텀 색상 - 접이식 */}
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer py-2 border-t border-gray-200 text-sm font-medium text-gray-700">
          <span>커스텀 설정</span>
          <svg
            className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="pt-3 space-y-3">
          <ColorPicker
            label="포인트 컬러"
            value={currentTheme.primaryColor}
            onChange={(color) => handleCustomChange({ primaryColor: color })}
            showPalette={false}
          />

          <ColorPicker
            label="보조 컬러"
            value={currentTheme.secondaryColor}
            onChange={(color) => handleCustomChange({ secondaryColor: color })}
            showPalette={false}
          />

          <ColorPicker
            label="배경색"
            value={currentTheme.backgroundColor}
            onChange={(color) => handleCustomChange({ backgroundColor: color })}
            showPalette={false}
          />

          <FontSelector
            value={currentTheme.fontFamily}
            onChange={(fontFamily) => handleCustomChange({ fontFamily })}
          />

          {currentPreset && (
            <p className="text-xs text-amber-600">
              커스텀 값을 변경하면 프리셋이 해제됩니다
            </p>
          )}
        </div>
      </details>

      {/* 효과 설정 섹션 */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          효과 설정
        </h4>

        {/* 시즌 이펙트 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">시즌 이펙트</label>
            <button
              onClick={() => handleEffectChange({
                seasonEffect: { ...seasonEffect, enabled: !seasonEffect.enabled }
              })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                seasonEffect.enabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  seasonEffect.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {seasonEffect.enabled && (
            <>
              {/* 시즌 선택 */}
              <div className="grid grid-cols-3 gap-1.5">
                {SEASON_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleEffectChange({
                      seasonEffect: { ...seasonEffect, season: option.value }
                    })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                      seasonEffect.season === option.value
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className="text-base">{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>

              {/* 강도 선택 */}
              {seasonEffect.season !== 'none' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">이펙트 강도</label>
                  <div className="flex gap-1.5">
                    {INTENSITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleEffectChange({
                          seasonEffect: { ...seasonEffect, intensity: option.value }
                        })}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-xs transition-all ${
                          seasonEffect.intensity === option.value
                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 오프닝 애니메이션 */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              오프닝 애니메이션
            </label>
            <button
              onClick={() => handleEffectChange({
                openingAnimation: { ...openingAnimation, enabled: !openingAnimation.enabled }
              })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                openingAnimation.enabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  openingAnimation.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {openingAnimation.enabled && (
            <div className="flex items-center justify-between pl-5">
              <label className="text-xs text-gray-500">스킵 버튼 표시</label>
              <button
                onClick={() => handleEffectChange({
                  openingAnimation: { ...openingAnimation, skipEnabled: !openingAnimation.skipEnabled }
                })}
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  openingAnimation.skipEnabled ? 'bg-primary-400' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                    openingAnimation.skipEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {openingAnimation.enabled && (
            <p className="text-xs text-gray-400 pl-5">
              게스트가 처음 방문할 때 환영 애니메이션을 표시합니다
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
