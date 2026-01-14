'use client'

import { MapPin, ExternalLink } from 'lucide-react'

interface MapBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

export function MapBlock({ content }: MapBlockProps) {
  const address = getString(content.address)
  const naverMapUrl = getString(content.naverMapUrl)
  const kakaoMapUrl = getString(content.kakaoMapUrl)

  if (!address && !naverMapUrl && !kakaoMapUrl) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 theme-primary" />
        위치
      </h3>

      {/* 지도 플레이스홀더 */}
      <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">지도 미리보기</p>
        </div>
      </div>

      {/* 주소 */}
      {address && (
        <p className="text-sm text-gray-700 mb-4 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          {address}
        </p>
      )}

      {/* 지도 링크 버튼 */}
      {(naverMapUrl || kakaoMapUrl) && (
        <div className="flex gap-3">
          {naverMapUrl && (
            <a
              href={naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              네이버 지도
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {kakaoMapUrl && (
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              카카오맵
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
