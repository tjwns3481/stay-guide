'use client'

import { useState } from 'react'
import {
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

  const _toggleSection = (section: PanelSection) => {
    setExpandedSection(expandedSection === section ? 'blocks' : section)
    setActivePanel(section)
  }
  void _toggleSection // 향후 섹션 접기/펼치기 UI에서 사용 예정

  const handleAddBlock = (type: BlockType) => {
    addBlock(type)
    setShowAddBlockMenu(false)
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      {/* 기본 정보 섹션 */}
      <div className="bg-gray-50 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary-500" />
          </span>
          기본 정보
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">숙소 이름</label>
            <input
              type="text"
              value={guide.accommodationName}
              onChange={(e) => updateGuide({ accommodationName: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              placeholder="숙소명을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">안내서 제목</label>
            <input
              type="text"
              value={guide.title}
              onChange={(e) => updateGuide({ title: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              placeholder="안내서 제목을 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 블록 섹션 */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-secondary-100 flex items-center justify-center">
            <Layers className="w-4 h-4 text-secondary-600" />
          </span>
          블록
        </h3>
        <div className="space-y-2">
          {/* 블록 목록 */}
          <BlockList />

          {/* 블록 추가 버튼 */}
          <div className="relative">
            <button
              onClick={() => setShowAddBlockMenu(!showAddBlockMenu)}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all"
            >
              <Plus className="w-5 h-5" />
              블록 추가
            </button>

            {/* 블록 타입 선택 메뉴 */}
            {showAddBlockMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddBlockMenu(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
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
        </div>
      </div>

      {/* 테마 섹션 */}
      <div className="bg-gray-50 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-500" />
          </span>
          테마
        </h3>
        <ThemeCustomizer
          themeSettings={guide.themeSettings as ThemeSettings | null}
          onChange={(settings) => updateGuide({ themeSettings: settings as Record<string, unknown> })}
        />
      </div>
    </div>
  )
}
