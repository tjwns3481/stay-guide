'use client'

import { FONT_OPTIONS } from '@/lib/theme'

interface FontSelectorProps {
  value: string
  onChange: (fontFamily: string) => void
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        폰트
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {FONT_OPTIONS.map((font) => (
          <option
            key={font.value}
            value={font.family}
            style={{ fontFamily: font.family }}
          >
            {font.label}
          </option>
        ))}
      </select>
    </div>
  )
}
