'use client'

import { useState } from 'react'
import { Heart, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { useEditorStore, Block } from '@/stores/editor'

interface PickItem {
  id: string
  name: string
  category: string
  description?: string
  address?: string
  imageUrl?: string
  tags?: string[]
}

interface HostPickContent {
  title: string
  items: PickItem[]
}

interface HostPickEditorProps {
  block: Block
}

// 카테고리 옵션
const CATEGORY_OPTIONS = [
  { id: 'restaurant', label: '맛집', emoji: '🍽️' },
  { id: 'cafe', label: '카페', emoji: '☕' },
  { id: 'attraction', label: '명소', emoji: '🏞️' },
  { id: 'activity', label: '액티비티', emoji: '🎯' },
  { id: 'shopping', label: '쇼핑', emoji: '🛍️' },
  { id: 'nightlife', label: '나이트라이프', emoji: '🌙' },
  { id: 'other', label: '기타', emoji: '📍' },
]

export function HostPickEditor({ block }: HostPickEditorProps) {
  const { updateBlock } = useEditorStore()
  const content = block.content as unknown as HostPickContent
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState<Partial<PickItem>>({
    name: '',
    category: 'restaurant',
    description: '',
  })

  const updateContent = (updates: Partial<HostPickContent>) => {
    updateBlock(block.id, {
      content: { ...content, ...updates },
    })
  }

  const addItem = () => {
    if (!newItem.name?.trim()) return

    const item: PickItem = {
      id: `pick_${Date.now()}`,
      name: newItem.name.trim(),
      category: newItem.category || 'restaurant',
      description: newItem.description?.trim(),
      address: newItem.address?.trim(),
    }

    updateContent({
      items: [...(content.items || []), item],
    })

    setNewItem({ name: '', category: 'restaurant', description: '' })
    setShowAddForm(false)
  }

  const removeItem = (itemId: string) => {
    updateContent({
      items: (content.items || []).filter((item) => item.id !== itemId),
    })
  }

  const updateItem = (itemId: string, updates: Partial<PickItem>) => {
    updateContent({
      items: (content.items || []).map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORY_OPTIONS.find((c) => c.id === categoryId) || CATEGORY_OPTIONS[6]
  }

  return (
    <div className="space-y-4">
      {/* 섹션 제목 */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
          <Heart className="w-4 h-4" />
          섹션 제목
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="호스트 추천"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 추천 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            추천 장소 ({(content.items || []).length})
          </label>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>

        {/* 기존 아이템 목록 */}
        {(content.items || []).length > 0 ? (
          <div className="space-y-2">
            {content.items.map((item) => {
              const category = getCategoryInfo(item.category)
              const isExpanded = expandedItemId === item.id

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* 아이템 헤더 */}
                  <div
                    className="flex items-center gap-2 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  >
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <span className="text-lg">{category.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{category.label}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(item.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* 아이템 편집 폼 */}
                  {isExpanded && (
                    <div className="p-3 space-y-3 border-t border-gray-100">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">이름</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">카테고리</label>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, { category: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.emoji} {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">설명</label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="이 장소를 추천하는 이유를 적어주세요"
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">주소 (선택)</label>
                        <input
                          type="text"
                          value={item.address || ''}
                          onChange={(e) => updateItem(item.id, { address: e.target.value })}
                          placeholder="주소 또는 위치 힌트"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
            <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">추천 장소를 추가해주세요</p>
            <p className="text-xs mt-1">맛집, 카페, 명소 등을 소개하세요</p>
          </div>
        )}

        {/* 새 아이템 추가 폼 */}
        {showAddForm && (
          <div className="mt-3 p-4 border-2 border-dashed border-primary-200 rounded-lg bg-primary-50">
            <h4 className="font-medium text-gray-900 mb-3">새 추천 장소</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">이름 *</label>
                  <input
                    type="text"
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="장소 이름"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">카테고리</label>
                  <select
                    value={newItem.category || 'restaurant'}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">설명</label>
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="추천 이유를 간단히 적어주세요"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewItem({ name: '', category: 'restaurant', description: '' })
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  onClick={addItem}
                  disabled={!newItem.name?.trim()}
                  className="px-4 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
