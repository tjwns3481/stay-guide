'use client'

// 자주 사용되는 색상 팔레트
const COLOR_PALETTE = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // purple
]

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  showPalette?: boolean
}

export function ColorPicker({ label, value, onChange, showPalette = true }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* 색상 팔레트 */}
      {showPalette && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                value === color ? 'border-gray-800 ring-1 ring-gray-400' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* 색상 선택기 + 입력 */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="#3B82F6"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </div>
  )
}
