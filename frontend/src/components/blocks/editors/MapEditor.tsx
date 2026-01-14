'use client'

import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { useEditorStore, Block } from '@/stores/editor'

interface MapContent {
  address: string
  latitude: number | null
  longitude: number | null
  naverMapUrl: string
  kakaoMapUrl: string
  description?: string
}

interface MapEditorProps {
  block: Block
}

export function MapEditor({ block }: MapEditorProps) {
  const { updateBlock } = useEditorStore()
  const content = block.content as unknown as MapContent

  const updateContent = (updates: Partial<MapContent>) => {
    updateBlock(block.id, {
      content: { ...content, ...updates },
    })
  }

  // 주소로 지도 URL 자동 생성
  const generateMapUrls = (address: string) => {
    if (!address.trim()) return

    const encodedAddress = encodeURIComponent(address)
    updateContent({
      naverMapUrl: `https://map.naver.com/v5/search/${encodedAddress}`,
      kakaoMapUrl: `https://map.kakao.com/?q=${encodedAddress}`,
    })
  }

  return (
    <div className="space-y-4">
      {/* 주소 입력 */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-4 h-4" />
          숙소 주소
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={content.address || ''}
            onChange={(e) => updateContent({ address: e.target.value })}
            placeholder="도로명 주소를 입력하세요"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={() => generateMapUrls(content.address || '')}
            disabled={!content.address?.trim()}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            URL 생성
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          주소 입력 후 &quot;URL 생성&quot;을 클릭하면 지도 링크가 자동으로 생성됩니다
        </p>
      </div>

      {/* 위치 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          위치 안내
          <span className="text-gray-400 font-normal ml-1">(선택)</span>
        </label>
        <textarea
          value={content.description || ''}
          onChange={(e) => updateContent({ description: e.target.value })}
          placeholder="예: 건물 뒤편 주차장에서 2층으로 올라오세요"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* 지도 링크 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          지도 링크
        </label>

        {/* 네이버 지도 */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-green-800">네이버 지도</span>
          </div>
          <input
            type="url"
            value={content.naverMapUrl || ''}
            onChange={(e) => updateContent({ naverMapUrl: e.target.value })}
            placeholder="https://map.naver.com/..."
            className="w-full px-3 py-2 border border-green-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          {content.naverMapUrl && (
            <a
              href={content.naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 hover:text-green-700"
            >
              <ExternalLink className="w-3 h-3" />
              링크 확인
            </a>
          )}
        </div>

        {/* 카카오맵 */}
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
              <MapPin className="w-4 h-4 text-yellow-900" />
            </div>
            <span className="font-medium text-yellow-800">카카오맵</span>
          </div>
          <input
            type="url"
            value={content.kakaoMapUrl || ''}
            onChange={(e) => updateContent({ kakaoMapUrl: e.target.value })}
            placeholder="https://map.kakao.com/..."
            className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
          />
          {content.kakaoMapUrl && (
            <a
              href={content.kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-yellow-700 hover:text-yellow-800"
            >
              <ExternalLink className="w-3 h-3" />
              링크 확인
            </a>
          )}
        </div>
      </div>

      {/* 좌표 입력 (선택) */}
      <div>
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() => {
            const section = document.getElementById('coordinates-section')
            if (section) {
              section.classList.toggle('hidden')
            }
          }}
        >
          ▶ 좌표 직접 입력 (고급)
        </button>
        <div id="coordinates-section" className="hidden mt-2 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">위도</label>
            <input
              type="number"
              step="any"
              value={content.latitude ?? ''}
              onChange={(e) =>
                updateContent({
                  latitude: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              placeholder="37.5665"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">경도</label>
            <input
              type="number"
              step="any"
              value={content.longitude ?? ''}
              onChange={(e) =>
                updateContent({
                  longitude: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              placeholder="126.9780"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
