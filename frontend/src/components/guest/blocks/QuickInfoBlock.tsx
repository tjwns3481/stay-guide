'use client'

import { Clock, DoorOpen, Users, Car, MapPin, Wifi } from 'lucide-react'

interface QuickInfoBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const getNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' ? value : undefined
}

const getBoolean = (value: unknown): boolean => {
  return typeof value === 'boolean' ? value : false
}

export function QuickInfoBlock({ content }: QuickInfoBlockProps) {
  const checkIn = getString(content.checkIn)
  const checkOut = getString(content.checkOut)
  const maxGuests = getNumber(content.maxGuests)
  const parking = getString(content.parking)
  const address = getString(content.address)
  const hasWifi = getBoolean(content.hasWifi)

  const items = [
    checkIn && {
      icon: Clock,
      label: '체크인',
      value: checkIn,
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    checkOut && {
      icon: DoorOpen,
      label: '체크아웃',
      value: checkOut,
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary-500',
    },
    maxGuests && {
      icon: Users,
      label: '최대인원',
      value: `${maxGuests}명`,
      bgColor: 'bg-accent-100',
      iconColor: 'text-amber-600',
    },
    hasWifi && {
      icon: Wifi,
      label: '와이파이',
      value: '무료',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
  ].filter(Boolean) as Array<{
    icon: typeof Clock
    label: string
    value: string
    bgColor: string
    iconColor: string
  }>

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 -mt-6 relative z-10 mx-4 sm:mx-0">
      <div className={`grid gap-3 ${items.length <= 4 ? `grid-cols-${items.length}` : 'grid-cols-4'}`}>
        {items.map((item, idx) => (
          <div key={idx} className="text-center">
            <div className={`w-10 h-10 mx-auto mb-1 rounded-xl ${item.bgColor} flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="font-semibold text-sm text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 주차 정보 (있으면 하단에 표시) */}
      {parking && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 justify-center">
          <Car className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">주차: {parking}</span>
        </div>
      )}

      {/* 주소 정보 */}
      {address && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 justify-center">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">{address}</span>
          </div>
        </div>
      )}
    </div>
  )
}
