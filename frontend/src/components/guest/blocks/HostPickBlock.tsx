'use client'

import { MapPin, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface HostPickBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const getArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? value : []
}

// 카테고리별 색상
const categoryColors: Record<string, { bg: string; text: string }> = {
  '해산물': { bg: 'bg-primary-100', text: 'text-primary-700' },
  '카페': { bg: 'bg-secondary-100', text: 'text-secondary-700' },
  '맛집': { bg: 'bg-amber-100', text: 'text-amber-700' },
  '관광': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '액티비티': { bg: 'bg-purple-100', text: 'text-purple-700' },
}

export function HostPickBlock({ content }: HostPickBlockProps) {
  const title = getString(content.title) || '호스트 추천'
  const items = getArray<{
    name: string
    category?: string
    description?: string
    distance?: string
    imageUrl?: string
  }>(content.items)

  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-secondary-500 rounded-full" />
          {title}
        </h3>
      </div>

      {/* 리스트 */}
      <div className="divide-y divide-gray-50">
        {items.map((item, idx) => {
          const colorStyle = item.category
            ? categoryColors[item.category] || { bg: 'bg-gray-100', text: 'text-gray-700' }
            : null

          return (
            <div
              key={idx}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* 썸네일 */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MapPin className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    {item.category && colorStyle && (
                      <span className={`px-2 py-0.5 ${colorStyle.bg} ${colorStyle.text} text-xs rounded-full`}>
                        {item.category}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-1">
                      {item.description}
                    </p>
                  )}

                  {item.distance && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.distance}
                    </p>
                  )}
                </div>

                {/* 화살표 */}
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
