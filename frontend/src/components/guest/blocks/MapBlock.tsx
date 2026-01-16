'use client'

import { MapPin, ExternalLink, Navigation } from 'lucide-react'
import { NaverMap } from '@/components/common/NaverMap'

interface MapBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const getNumber = (value: unknown): number | null => {
  return typeof value === 'number' ? value : null
}

const getBoolean = (value: unknown, defaultValue: boolean = true): boolean => {
  return typeof value === 'boolean' ? value : defaultValue
}

export function MapBlock({ content }: MapBlockProps) {
  const address = getString(content.address)
  const description = getString(content.description)
  const naverMapUrl = getString(content.naverMapUrl)
  const kakaoMapUrl = getString(content.kakaoMapUrl)
  const tmapUrl = getString(content.tmapUrl)
  const latitude = getNumber(content.latitude)
  const longitude = getNumber(content.longitude)
  const showNaviButtons = getBoolean(content.showNaviButtons, true)

  if (!address && !naverMapUrl && !kakaoMapUrl) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 theme-primary" />
        위치
      </h3>

      {/* 네이버 지도 */}
      <div className="mb-4">
        <NaverMap
          address={address}
          latitude={latitude}
          longitude={longitude}
          height="200px"
          className="rounded-lg overflow-hidden"
        />
      </div>

      {/* 주소 */}
      {address && (
        <p className="text-sm text-gray-700 mb-3 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          {address}
        </p>
      )}

      {/* 위치 설명 */}
      {description && (
        <p className="text-sm text-gray-500 mb-4 pl-6">{description}</p>
      )}

      {/* 지도 링크 버튼 */}
      {(naverMapUrl || kakaoMapUrl) && (
        <div className="flex gap-2 mb-4">
          {naverMapUrl && (
            <a
              href={naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              네이버 지도
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {kakaoMapUrl && (
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm"
            >
              카카오맵
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 길안내 앱 바로가기 버튼 */}
      {showNaviButtons && (naverMapUrl || kakaoMapUrl || tmapUrl) && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5" />
            길안내 앱으로 열기
          </p>
          <div className="flex gap-2">
            {kakaoMapUrl && (
              <a
                href={`kakaomap://route?ep=${encodeURIComponent(address || '')}&by=CAR`}
                className="flex-1 flex flex-col items-center gap-1 py-2 bg-yellow-50 text-yellow-800 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-yellow-900" />
                </div>
                <span className="text-xs">카카오내비</span>
              </a>
            )}

            {tmapUrl && (
              <a
                href={`tmap://route?goalname=${encodeURIComponent(address || '')}`}
                className="flex-1 flex flex-col items-center gap-1 py-2 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <span className="text-xs">T맵</span>
              </a>
            )}

            {naverMapUrl && (
              <a
                href={`nmap://route/car?dlat=&dlng=&dname=${encodeURIComponent(address || '')}&appname=roomy`}
                className="flex-1 flex flex-col items-center gap-1 py-2 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs">네이버지도</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
