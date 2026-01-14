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
      {/* 프리셋 선택 */}
      <ThemeSelector selectedPreset={currentPreset} onSelectPreset={handlePresetSelect} />

      {/* 커스텀 색상 */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-3">커스텀 설정</p>

        <div className="space-y-3">
          <ColorPicker
            label="포인트 컬러"
            value={currentTheme.primaryColor}
            onChange={(color) => handleCustomChange({ primaryColor: color })}
          />

          <ColorPicker
            label="보조 컬러"
            value={currentTheme.secondaryColor}
            onChange={(color) => handleCustomChange({ secondaryColor: color })}
          />

          <ColorPicker
            label="배경색"
            value={currentTheme.backgroundColor}
            onChange={(color) => handleCustomChange({ backgroundColor: color })}
          />

          <FontSelector
            value={currentTheme.fontFamily}
            onChange={(fontFamily) => handleCustomChange({ fontFamily })}
          />
        </div>

        {currentPreset && (
          <p className="mt-3 text-xs text-amber-600">
            커스텀 값을 변경하면 프리셋이 해제됩니다
          </p>
        )}
      </div>
    </div>
  )
}
