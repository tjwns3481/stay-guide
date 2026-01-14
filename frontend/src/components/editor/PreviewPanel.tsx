'use client'

import { useEditorStore, BlockType, BLOCK_TYPE_META } from '@/stores/editor'
import { Smartphone, Monitor } from 'lucide-react'
import { useState, useMemo } from 'react'
import { THEME_PRESETS, DEFAULT_THEME, ThemePreset } from '@/lib/theme'
import type { ThemeSettings } from '@/contracts/types'

type PreviewDevice = 'mobile' | 'desktop'

export function PreviewPanel() {
  const { guide } = useEditorStore()
  const [device, setDevice] = useState<PreviewDevice>('mobile')

  if (!guide) return null

  const visibleBlocks = guide.blocks.filter((b) => b.isVisible)

  // 테마 스타일 계산
  const themeStyle = useMemo(() => {
    const themeSettings = guide.themeSettings as ThemeSettings | null
    const theme =
      themeSettings?.preset && THEME_PRESETS[themeSettings.preset as ThemePreset]
        ? THEME_PRESETS[themeSettings.preset as ThemePreset]
        : DEFAULT_THEME

    return {
      '--theme-primary': themeSettings?.primaryColor || theme.primaryColor,
      '--theme-secondary': themeSettings?.secondaryColor || theme.secondaryColor,
      '--theme-background': themeSettings?.backgroundColor || theme.backgroundColor,
      '--theme-font': themeSettings?.fontFamily || theme.fontFamily,
    } as React.CSSProperties
  }, [guide.themeSettings])

  return (
    <div className="flex flex-col items-center">
      {/* 디바이스 토글 (PC에서만 표시) */}
      <div className="hidden lg:flex items-center gap-2 mb-4">
        <button
          onClick={() => setDevice('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            device === 'mobile'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          모바일
        </button>
        <button
          onClick={() => setDevice('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            device === 'desktop'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Monitor className="w-4 h-4" />
          데스크탑
        </button>
      </div>

      {/* 프리뷰 컨테이너 */}
      <div
        className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all theme-root ${
          device === 'mobile'
            ? 'w-full max-w-[375px]'
            : 'w-full max-w-[768px]'
        }`}
        style={{
          minHeight: device === 'mobile' ? '667px' : '500px',
          ...themeStyle,
        }}
      >
        {/* 프리뷰 헤더 */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="text-center">
            <h2 className="font-medium text-gray-900">{guide.title}</h2>
            <p className="text-sm text-gray-500">{guide.accommodationName}</p>
          </div>
        </div>

        {/* 프리뷰 컨텐츠 */}
        <div className="p-4 space-y-4">
          {visibleBlocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>블록이 없습니다</p>
              <p className="text-sm mt-1">왼쪽에서 블록을 추가해보세요</p>
            </div>
          ) : (
            visibleBlocks.map((block) => (
              <BlockPreview key={block.id} type={block.type} content={block.content} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// 타입 가드 헬퍼 함수들
const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const getNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' ? value : undefined
}

const getArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? value : []
}

// 블록 프리뷰 컴포넌트
interface BlockPreviewProps {
  type: BlockType
  content: Record<string, unknown>
}

function BlockPreview({ type, content }: BlockPreviewProps) {
  const meta = BLOCK_TYPE_META[type]

  switch (type) {
    case 'hero': {
      const imageUrl = getString(content.imageUrl)
      const title = getString(content.title) || '환영합니다'
      const subtitle = getString(content.subtitle)

      return (
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Hero"
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600" />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-center p-4">
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              {subtitle && (
                <p className="text-sm mt-1 opacity-90">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'quick_info': {
      const checkIn = getString(content.checkIn)
      const checkOut = getString(content.checkOut)
      const maxGuests = getNumber(content.maxGuests)
      const parking = getString(content.parking)

      return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-gray-900">빠른 정보</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {checkIn && (
              <div>
                <span className="text-gray-500">체크인</span>
                <p className="font-medium">{checkIn}</p>
              </div>
            )}
            {checkOut && (
              <div>
                <span className="text-gray-500">체크아웃</span>
                <p className="font-medium">{checkOut}</p>
              </div>
            )}
            {maxGuests && (
              <div>
                <span className="text-gray-500">최대 인원</span>
                <p className="font-medium">{maxGuests}명</p>
              </div>
            )}
            {parking && (
              <div>
                <span className="text-gray-500">주차</span>
                <p className="font-medium">{parking}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'amenities': {
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      const items = getArray<{ icon: string; label: string }>(content.items)

      return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-gray-900">편의시설</h4>
          {wifi && wifi.ssid && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-500">Wi-Fi</p>
              <p className="font-medium">{wifi.ssid}</p>
              {wifi.password && (
                <p className="text-sm text-gray-400">비밀번호: {wifi.password}</p>
              )}
            </div>
          )}
          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-2 border border-gray-200 text-sm">
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'map': {
      const address = getString(content.address)
      const naverMapUrl = getString(content.naverMapUrl)
      const kakaoMapUrl = getString(content.kakaoMapUrl)

      return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-gray-900">위치</h4>
          <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center text-gray-400">
            지도 미리보기
          </div>
          {address && <p className="text-sm text-gray-600">{address}</p>}
          <div className="flex gap-2">
            {naverMapUrl && (
              <button className="flex-1 py-2 bg-green-500 text-white text-sm rounded-lg">
                네이버 지도
              </button>
            )}
            {kakaoMapUrl && (
              <button className="flex-1 py-2 bg-yellow-400 text-gray-900 text-sm rounded-lg">
                카카오맵
              </button>
            )}
          </div>
        </div>
      )
    }

    case 'host_pick': {
      const title = getString(content.title) || '호스트 추천'
      const items = getArray<{ name: string; category: string; description?: string }>(content.items)

      return (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">{title}</h4>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">추천 항목이 없습니다</p>
          )}
        </div>
      )
    }

    case 'notice': {
      const noticeType = getString(content.type) || 'banner'
      const title = getString(content.title) || '공지사항'
      const noticeContent = getString(content.content)

      return (
        <div
          className={`rounded-xl p-4 ${
            noticeType === 'popup'
              ? 'bg-primary-50 border-2 border-primary-200'
              : 'bg-yellow-50 border-l-4 border-yellow-400'
          }`}
        >
          <h4 className="font-medium text-gray-900">{title}</h4>
          {noticeContent && (
            <p className="text-sm text-gray-600 mt-1">{noticeContent}</p>
          )}
        </div>
      )
    }

    default:
      return (
        <div className="bg-gray-100 rounded-xl p-4 text-gray-500">
          <p className="text-sm">{meta.label} 블록</p>
        </div>
      )
  }
}
