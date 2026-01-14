'use client'

import { Heart, MapPin } from 'lucide-react'

interface HostPickBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const getArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? value : []
}

export function HostPickBlock({ content }: HostPickBlockProps) {
  const title = getString(content.title) || '호스트 추천'
  const items = getArray<{
    name: string
    category?: string
    description?: string
    distance?: string
  }>(content.items)

  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary-600" />
        {title}
      </h3>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  {item.category && (
                    <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                      {item.category}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}

                {item.distance && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.distance}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
