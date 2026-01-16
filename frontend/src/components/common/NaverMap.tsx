'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

declare global {
  interface Window {
    naver: typeof naver
  }
}

/* eslint-disable @typescript-eslint/no-namespace */
declare namespace naver {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions)
      setCenter(coord: LatLng): void
      setZoom(zoom: number): void
    }

    class LatLng {
      constructor(lat: number, lng: number)
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
    }

    interface MapOptions {
      center: LatLng
      zoom: number
      zoomControl?: boolean
      zoomControlOptions?: {
        position: number
      }
    }

    interface MarkerOptions {
      position: LatLng
      map: Map
    }

    namespace Event {
      function addListener(instance: unknown, eventName: string, handler: () => void): void
    }

    const Position: {
      TOP_RIGHT: number
    }
  }
}

interface NaverMapProps {
  address?: string
  latitude?: number | null
  longitude?: number | null
  height?: string
  className?: string
}

// 네이버 지도 SDK 로드 상태
let isScriptLoading = false
let isScriptLoaded = false
const scriptLoadCallbacks: (() => void)[] = []

function loadNaverMapScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드됨
    if (isScriptLoaded && window.naver?.maps) {
      resolve()
      return
    }

    // 로드 중이면 콜백에 추가
    if (isScriptLoading) {
      scriptLoadCallbacks.push(resolve)
      return
    }

    isScriptLoading = true

    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`
    script.async = true

    script.onload = () => {
      isScriptLoaded = true
      isScriptLoading = false
      resolve()
      scriptLoadCallbacks.forEach(cb => cb())
      scriptLoadCallbacks.length = 0
    }

    script.onerror = () => {
      isScriptLoading = false
      reject(new Error('네이버 지도 SDK 로드 실패'))
    }

    document.head.appendChild(script)
  })
}

export function NaverMap({
  address,
  latitude,
  longitude,
  height = '200px',
  className = ''
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapInstanceRef = useRef<naver.maps.Map | null>(null)

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

  useEffect(() => {
    if (!clientId) {
      setError('네이버 지도 API 키가 설정되지 않았습니다')
      setIsLoading(false)
      return
    }

    if (!mapRef.current) return

    const initMap = async () => {
      try {
        await loadNaverMapScript(clientId)

        if (!mapRef.current || !window.naver?.maps) return

        // 좌표가 있으면 바로 사용, 없으면 기본 위치
        let lat = latitude ?? 37.5665
        let lng = longitude ?? 126.9780

        // 주소가 있고 좌표가 없으면 지오코딩
        if (address && (!latitude || !longitude)) {
          try {
            const coords = await geocodeAddress(address)
            if (coords) {
              lat = coords.lat
              lng = coords.lng
            }
          } catch (e) {
            console.warn('지오코딩 실패:', e)
          }
        }

        const mapOptions: naver.maps.MapOptions = {
          center: new window.naver.maps.LatLng(lat, lng),
          zoom: 16,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        }

        const map = new window.naver.maps.Map(mapRef.current, mapOptions)
        mapInstanceRef.current = map

        // 마커 추가
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map: map,
        })

        setIsLoading(false)
      } catch (err) {
        console.error('지도 초기화 실패:', err)
        setError('지도를 불러오는데 실패했습니다')
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      mapInstanceRef.current = null
    }
  }, [clientId, address, latitude, longitude])

  // API 키가 없으면 플레이스홀더 표시
  if (!clientId) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">지도 API 키 설정 필요</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">지도 로딩 중...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  )
}

// 주소를 좌표로 변환 (지오코딩)
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!window.naver?.maps?.Service) {
      resolve(null)
      return
    }

    window.naver.maps.Service.geocode(
      { query: address },
      (status: string, response: { v2: { addresses: Array<{ x: string; y: string }> } }) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          resolve(null)
          return
        }

        const result = response.v2.addresses[0]
        if (result) {
          resolve({
            lat: parseFloat(result.y),
            lng: parseFloat(result.x),
          })
        } else {
          resolve(null)
        }
      }
    )
  })
}

// Service 타입 추가
declare namespace naver.maps {
  namespace Service {
    function geocode(
      options: { query: string },
      callback: (status: string, response: { v2: { addresses: Array<{ x: string; y: string }> } }) => void
    ): void
    const Status: {
      OK: string
    }
  }
}
