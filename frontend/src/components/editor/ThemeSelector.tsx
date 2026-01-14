'use client'

import { THEME_PRESETS, ThemePreset } from '@/lib/theme'

interface ThemeSelectorProps {
  selectedPreset?: ThemePreset
  onSelectPreset: (preset: ThemePreset) => void
}

export function ThemeSelector({ selectedPreset, onSelectPreset }: ThemeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        프리셋
      </label>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((preset) => {
          const theme = THEME_PRESETS[preset]
          return (
            <button
              key={preset}
              onClick={() => onSelectPreset(preset)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                selectedPreset === preset
                  ? 'border-primary-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* 색상 프리뷰 */}
              <div className="h-16 flex flex-col">
                <div
                  className="flex-1"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: theme.secondaryColor }}
                />
              </div>

              {/* 프리셋 이름 */}
              <div className="py-2 text-center bg-white">
                <p className="text-xs font-medium text-gray-700">{theme.name}</p>
              </div>

              {/* 선택 표시 */}
              {selectedPreset === preset && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
