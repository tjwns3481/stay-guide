'use client'

import { Wifi, Check, Copy, Snowflake, Tv, Flame, Home, Box, Coffee } from 'lucide-react'
import { useState } from 'react'

interface AmenitiesBlockProps {
  content: Record<string, unknown>
}

const getArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? value : []
}

// 편의시설 아이콘 매핑
const amenityIcons: Record<string, typeof Snowflake> = {
  '에어컨': Snowflake,
  '스마트TV': Tv,
  'TV': Tv,
  '바베큐': Flame,
  '주차장': Home,
  '세탁기': Box,
  '조식제공': Coffee,
  '조식': Coffee,
}

export function AmenitiesBlock({ content }: AmenitiesBlockProps) {
  const wifi = content.wifi as { ssid?: string; password?: string } | null
  const items = getArray<{ icon?: string; label: string }>(content.items)
  const [copied, setCopied] = useState(false)

  const handleCopyPassword = () => {
    if (wifi?.password) {
      navigator.clipboard.writeText(wifi.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary-500 rounded-full" />
          편의시설
        </h3>
      </div>

      <div className="p-4">
        {/* Wi-Fi 하이라이트 카드 */}
        {wifi && wifi.ssid && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{wifi.ssid}</p>
                  {wifi.password && (
                    <p className="text-sm text-gray-500">비밀번호: {wifi.password}</p>
                  )}
                </div>
              </div>
              {wifi.password && (
                <button
                  onClick={handleCopyPassword}
                  className="px-3 py-1.5 bg-white rounded-lg text-sm text-blue-600 font-medium shadow-sm hover:shadow transition-all"
                >
                  {copied ? '복사됨!' : '복사'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 편의시설 그리드 */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {items.map((item, idx) => {
              const IconComponent = amenityIcons[item.label] || Check
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-xl"
                >
                  <IconComponent className="w-5 h-5 text-primary-500 mb-1" />
                  <span className="text-xs text-gray-600 text-center">{item.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {!wifi?.ssid && items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            등록된 편의시설이 없습니다
          </p>
        )}
      </div>
    </div>
  )
}
