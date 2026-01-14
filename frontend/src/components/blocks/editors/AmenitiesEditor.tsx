'use client'

import { useState } from 'react'
import { Wifi, Plus, Trash2, GripVertical } from 'lucide-react'
import { useEditorStore, Block } from '@/stores/editor'

interface WifiInfo {
  ssid: string
  password: string
}

interface AmenityItem {
  id: string
  icon: string
  label: string
  description?: string
}

interface AmenitiesContent {
  wifi: WifiInfo | null
  items: AmenityItem[]
}

interface AmenitiesEditorProps {
  block: Block
}

// 편의시설 아이콘 옵션
const AMENITY_ICONS = [
  { id: 'tv', label: 'TV' },
  { id: 'aircon', label: '에어컨' },
  { id: 'heater', label: '난방' },
  { id: 'washer', label: '세탁기' },
  { id: 'dryer', label: '건조기' },
  { id: 'kitchen', label: '주방' },
  { id: 'microwave', label: '전자레인지' },
  { id: 'fridge', label: '냉장고' },
  { id: 'coffee', label: '커피머신' },
  { id: 'iron', label: '다리미' },
  { id: 'hairdryer', label: '드라이기' },
  { id: 'bath', label: '욕조' },
  { id: 'pool', label: '수영장' },
  { id: 'bbq', label: '바베큐' },
  { id: 'pet', label: '반려동물' },
]

export function AmenitiesEditor({ block }: AmenitiesEditorProps) {
  const { updateBlock } = useEditorStore()
  const content = block.content as unknown as AmenitiesContent
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [newItemIcon, setNewItemIcon] = useState('tv')

  const updateContent = (updates: Partial<AmenitiesContent>) => {
    updateBlock(block.id, {
      content: { ...content, ...updates },
    })
  }

  const updateWifi = (updates: Partial<WifiInfo>) => {
    const currentWifi = content.wifi || { ssid: '', password: '' }
    updateContent({
      wifi: { ...currentWifi, ...updates },
    })
  }

  const addItem = () => {
    if (!newItemLabel.trim()) return

    const newItem: AmenityItem = {
      id: `item_${Date.now()}`,
      icon: newItemIcon,
      label: newItemLabel.trim(),
    }

    updateContent({
      items: [...(content.items || []), newItem],
    })

    setNewItemLabel('')
    setShowAddItem(false)
  }

  const removeItem = (itemId: string) => {
    updateContent({
      items: (content.items || []).filter((item) => item.id !== itemId),
    })
  }

  const updateItem = (itemId: string, updates: Partial<AmenityItem>) => {
    updateContent({
      items: (content.items || []).map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })
  }

  return (
    <div className="space-y-5">
      {/* Wi-Fi 정보 */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Wi-Fi 정보</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-blue-800 mb-1">
              네트워크 이름 (SSID)
            </label>
            <input
              type="text"
              value={content.wifi?.ssid || ''}
              onChange={(e) => updateWifi({ ssid: e.target.value })}
              placeholder="예: MyHome_5G"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-blue-800 mb-1">
              비밀번호
            </label>
            <input
              type="text"
              value={content.wifi?.password || ''}
              onChange={(e) => updateWifi({ password: e.target.value })}
              placeholder="Wi-Fi 비밀번호"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-blue-600">
            게스트가 터치 한 번으로 비밀번호를 복사할 수 있습니다
          </p>
        </div>
      </div>

      {/* 편의시설 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            편의시설 목록
          </label>
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>

        {/* 기존 아이템 목록 */}
        {(content.items || []).length > 0 ? (
          <div className="space-y-2">
            {content.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group"
              >
                <GripVertical className="w-4 h-4 text-gray-300" />
                <select
                  value={item.icon}
                  onChange={(e) => updateItem(item.id, { icon: e.target.value })}
                  className="px-2 py-1 text-sm border border-gray-200 rounded bg-white"
                >
                  {AMENITY_ICONS.map((icon) => (
                    <option key={icon.id} value={icon.id}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(item.id, { label: e.target.value })}
                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg">
            <p className="text-sm">편의시설을 추가해주세요</p>
          </div>
        )}

        {/* 새 아이템 추가 폼 */}
        {showAddItem && (
          <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <select
                value={newItemIcon}
                onChange={(e) => setNewItemIcon(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded"
              >
                {AMENITY_ICONS.map((icon) => (
                  <option key={icon.id} value={icon.id}>
                    {icon.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder="편의시설 이름"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addItem()
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddItem(false)
                  setNewItemLabel('')
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={addItem}
                disabled={!newItemLabel.trim()}
                className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        )}

        {/* 빠른 추가 버튼들 */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">빠른 추가</p>
          <div className="flex flex-wrap gap-1.5">
            {AMENITY_ICONS.slice(0, 8).map((icon) => {
              const isAdded = content.items?.some((item) => item.icon === icon.id)
              return (
                <button
                  key={icon.id}
                  onClick={() => {
                    if (!isAdded) {
                      updateContent({
                        items: [
                          ...(content.items || []),
                          {
                            id: `item_${Date.now()}_${icon.id}`,
                            icon: icon.id,
                            label: icon.label,
                          },
                        ],
                      })
                    }
                  }}
                  disabled={isAdded}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    isAdded
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  {icon.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
