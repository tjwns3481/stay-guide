'use client'

import { ThemeSelector } from './ThemeSelector'
import { ColorPicker } from './ColorPicker'
import { FontSelector } from './FontSelector'
import { THEME_PRESETS, ThemePreset, DEFAULT_THEME } from '@/lib/theme'
import type { ThemeSettings } from '@/contracts/types'

interface ThemeCustomizerProps {
  themeSettings: ThemeSettings | null
  onChange: (settings: ThemeSettings) => void
}

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
    </div>
  )
}
