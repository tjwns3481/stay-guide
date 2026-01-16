'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Palette,
  Layers,
  Image,
  Images,
  Clock,
  Wifi,
  MapPin,
  Heart,
  Bell,
} from 'lucide-react'
import { useEditorStore, BlockType, BLOCK_TYPE_META } from '@/stores/editor'
import { BlockList } from './BlockList'
import { ThemeCustomizer } from './ThemeCustomizer'
import type { ThemeSettings } from '@/contracts/types'

type PanelSection = 'blocks' | 'settings' | 'theme'

// 블록 타입 아이콘 매핑
const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: <Image className="w-4 h-4" />,
  quick_info: <Clock className="w-4 h-4" />,
  amenities: <Wifi className="w-4 h-4" />,
  map: <MapPin className="w-4 h-4" />,
  host_pick: <Heart className="w-4 h-4" />,
  notice: <Bell className="w-4 h-4" />,
  gallery: <Images className="w-4 h-4" />,
}

export function ControlPanel() {
  const {
    guide,
    setActivePanel,
    addBlock,
    updateGuide,
  } = useEditorStore()
  const [expandedSection, setExpandedSection] = useState<PanelSection>('blocks')
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false)

  if (!guide) return null

  const toggleSection = (section: PanelSection) => {
    setExpandedSection(expandedSection === section ? 'blocks' : section)
    setActivePanel(section)
  }

  const handleAddBlock = (type: BlockType) => {
    addBlock(type)
    setShowAddBlockMenu(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 블록 섹션 */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('blocks')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">블록</span>
            <span className="text-sm text-gray-400">({guide.blocks.length})</span>
          </div>
          {expandedSection === 'blocks' ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'blocks' && (
          <div className="px-4 pb-4">
            {/* 블록 추가 버튼 */}
            <div className="relative mb-3">
              <button
                onClick={() => setShowAddBlockMenu(!showAddBlockMenu)}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">블록 추가</span>
              </button>

              {/* 블록 타입 선택 메뉴 */}
              {showAddBlockMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAddBlockMenu(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2">
                    {(Object.keys(BLOCK_TYPE_META) as BlockType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleAddBlock(type)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-500">{BLOCK_ICONS[type]}</span>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {BLOCK_TYPE_META[type].label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {BLOCK_TYPE_META[type].description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 블록 목록 */}
            <BlockList />

            {/* 블록 선택 안내 */}
            {guide.blocks.length > 0 && (
              <p className="mt-3 text-xs text-center text-gray-400">
                블록을 클릭하면 편집할 수 있습니다
              </p>
            )}
          </div>
        )}
      </div>

      {/* 설정 섹션 */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('settings')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">기본 설정</span>
          </div>
          {expandedSection === 'settings' ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'settings' && (
          <div className="px-4 pb-4 space-y-4">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                안내서 제목
              </label>
              <input
                type="text"
                value={guide.title}
                onChange={(e) => updateGuide({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="안내서 제목을 입력하세요"
              />
            </div>

            {/* 숙소명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                숙소명
              </label>
              <input
                type="text"
                value={guide.accommodationName}
                onChange={(e) => updateGuide({ accommodationName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="숙소명을 입력하세요"
              />
            </div>

            {/* 슬러그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL 슬러그
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/g/</span>
                <input
                  type="text"
                  value={guide.slug}
                  onChange={(e) => updateGuide({ slug: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="my-guide"
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                영문 소문자, 숫자, 하이픈만 사용 가능
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 테마 섹션 */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('theme')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">테마</span>
          </div>
          {expandedSection === 'theme' ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'theme' && (
          <div className="px-4 pb-4">
            <ThemeCustomizer
              themeSettings={guide.themeSettings as ThemeSettings | null}
              onChange={(settings) => updateGuide({ themeSettings: settings as Record<string, unknown> })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
