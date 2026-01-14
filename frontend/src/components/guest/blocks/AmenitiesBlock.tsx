'use client'

import { Wifi, Check } from 'lucide-react'

interface AmenitiesBlockProps {
  content: Record<string, unknown>
}

const getArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? value : []
}

export function AmenitiesBlock({ content }: AmenitiesBlockProps) {
  const wifi = content.wifi as { ssid?: string; password?: string } | null
  const items = getArray<{ icon?: string; label: string }>(content.items)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">편의시설</h3>

      {/* Wi-Fi 정보 */}
      {wifi && wifi.ssid && (
        <div className="bg-primary-50 rounded-lg p-4 mb-4 border border-primary-100">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-5 h-5 text-primary-600" />
            <p className="font-medium text-primary-900">Wi-Fi</p>
          </div>
          <div className="ml-7">
            <p className="text-sm text-gray-700">
              <span className="text-gray-500">네트워크:</span> {wifi.ssid}
            </p>
            {wifi.password && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="text-gray-500">비밀번호:</span> {wifi.password}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 편의시설 목록 */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-gray-50 rounded-lg p-3"
            >
              <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span className="text-sm text-gray-900">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {!wifi?.ssid && items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          등록된 편의시설이 없습니다
        </p>
      )}
    </div>
  )
}
