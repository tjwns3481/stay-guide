'use client'

import { Clock, Users, Car, MapPin } from 'lucide-react'

interface QuickInfoBlockProps {
  content: Record<string, unknown>
}

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const getNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' ? value : undefined
}

export function QuickInfoBlock({ content }: QuickInfoBlockProps) {
  const checkIn = getString(content.checkIn)
  const checkOut = getString(content.checkOut)
  const maxGuests = getNumber(content.maxGuests)
  const parking = getString(content.parking)
  const address = getString(content.address)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 정보</h3>
      <div className="grid grid-cols-2 gap-4">
        {checkIn && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 theme-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">체크인</p>
              <p className="font-medium text-gray-900">{checkIn}</p>
            </div>
          </div>
        )}

        {checkOut && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 theme-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">체크아웃</p>
              <p className="font-medium text-gray-900">{checkOut}</p>
            </div>
          </div>
        )}

        {maxGuests && (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 theme-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">최대 인원</p>
              <p className="font-medium text-gray-900">{maxGuests}명</p>
            </div>
          </div>
        )}

        {parking && (
          <div className="flex items-start gap-3">
            <Car className="w-5 h-5 theme-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">주차</p>
              <p className="font-medium text-gray-900">{parking}</p>
            </div>
          </div>
        )}
      </div>

      {address && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 theme-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">주소</p>
              <p className="font-medium text-gray-900">{address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
