'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// 블록 타입 정의
export type BlockType = 'hero' | 'quick_info' | 'amenities' | 'map' | 'host_pick' | 'notice'

export interface Block {
  id: string
  type: BlockType
  order: number
  content: Record<string, unknown>
  isVisible: boolean
}

export interface Guide {
  id: string
  userId: string
  slug: string
  title: string
  accommodationName: string
  isPublished: boolean
  themeId: string | null
  themeSettings: Record<string, unknown> | null
  blocks: Block[]
  createdAt: string
  updatedAt: string
}

// 에디터 뷰 모드
export type EditorViewMode = 'edit' | 'preview'
export type EditorPanelType = 'blocks' | 'settings' | 'theme'

// 저장 상태
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface EditorState {
  // 가이드 데이터
  guide: Guide | null
  originalGuide: Guide | null // 변경 감지용

  // UI 상태
  viewMode: EditorViewMode
  activePanel: EditorPanelType
  selectedBlockId: string | null
  isMobileSheetOpen: boolean

  // 저장 상태
  saveStatus: SaveStatus
  lastSavedAt: Date | null

  // 로딩 상태
  isLoading: boolean
  error: string | null

  // Actions - 가이드 관리
  setGuide: (guide: Guide) => void
  updateGuide: (updates: Partial<Omit<Guide, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'blocks'>>) => void
  resetGuide: () => void

  // Actions - 블록 관리
  addBlock: (type: BlockType, afterBlockId?: string) => void
  updateBlock: (blockId: string, updates: Partial<Omit<Block, 'id' | 'type'>>) => void
  removeBlock: (blockId: string) => void
  reorderBlocks: (fromIndex: number, toIndex: number) => void
  toggleBlockVisibility: (blockId: string) => void
  duplicateBlock: (blockId: string) => void

  // Actions - UI 상태
  setViewMode: (mode: EditorViewMode) => void
  setActivePanel: (panel: EditorPanelType) => void
  selectBlock: (blockId: string | null) => void
  toggleMobileSheet: (open?: boolean) => void

  // Actions - 저장 관련
  setSaveStatus: (status: SaveStatus) => void
  markAsSaved: () => void

  // Actions - 로딩 상태
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed
  hasUnsavedChanges: () => boolean
  getBlockById: (blockId: string) => Block | undefined
  getSelectedBlock: () => Block | undefined
}

// ID 생성 헬퍼
const generateBlockId = () => `block_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

// 기본 블록 콘텐츠
const getDefaultBlockContent = (type: BlockType): Record<string, unknown> => {
  switch (type) {
    case 'hero':
      return {
        title: '환영합니다',
        subtitle: '',
        imageUrl: '',
        style: 'full',
      }
    case 'quick_info':
      return {
        checkIn: '15:00',
        checkOut: '11:00',
        maxGuests: 2,
        parking: '',
        address: '',
      }
    case 'amenities':
      return {
        wifi: null,
        items: [],
      }
    case 'map':
      return {
        address: '',
        latitude: null,
        longitude: null,
        naverMapUrl: '',
        kakaoMapUrl: '',
      }
    case 'host_pick':
      return {
        title: '호스트 추천',
        items: [],
      }
    case 'notice':
      return {
        type: 'banner',
        title: '',
        content: '',
        isActive: true,
      }
    default:
      return {}
  }
}

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // 초기 상태
    guide: null,
    originalGuide: null,
    viewMode: 'edit',
    activePanel: 'blocks',
    selectedBlockId: null,
    isMobileSheetOpen: false,
    saveStatus: 'saved',
    lastSavedAt: null,
    isLoading: false,
    error: null,

    // 가이드 관리
    setGuide: (guide) => {
      set({
        guide,
        originalGuide: JSON.parse(JSON.stringify(guide)),
        saveStatus: 'saved',
        selectedBlockId: null,
        error: null,
      })
    },

    updateGuide: (updates) => {
      set((state) => {
        if (!state.guide) return state
        return {
          guide: { ...state.guide, ...updates },
          saveStatus: 'unsaved',
        }
      })
    },

    resetGuide: () => {
      set((state) => ({
        guide: state.originalGuide ? JSON.parse(JSON.stringify(state.originalGuide)) : null,
        saveStatus: 'saved',
        selectedBlockId: null,
      }))
    },

    // 블록 관리
    addBlock: (type, afterBlockId) => {
      set((state) => {
        if (!state.guide) return state

        const newBlock: Block = {
          id: generateBlockId(),
          type,
          order: 0,
          content: getDefaultBlockContent(type),
          isVisible: true,
        }

        let blocks = [...state.guide.blocks]

        if (afterBlockId) {
          const afterIndex = blocks.findIndex((b) => b.id === afterBlockId)
          if (afterIndex !== -1) {
            blocks.splice(afterIndex + 1, 0, newBlock)
          } else {
            blocks.push(newBlock)
          }
        } else {
          blocks.push(newBlock)
        }

        // order 재계산
        blocks = blocks.map((block, index) => ({ ...block, order: index }))

        return {
          guide: { ...state.guide, blocks },
          selectedBlockId: newBlock.id,
          saveStatus: 'unsaved',
        }
      })
    },

    updateBlock: (blockId, updates) => {
      set((state) => {
        if (!state.guide) return state

        const blocks = state.guide.blocks.map((block) =>
          block.id === blockId ? { ...block, ...updates } : block
        )

        return {
          guide: { ...state.guide, blocks },
          saveStatus: 'unsaved',
        }
      })
    },

    removeBlock: (blockId) => {
      set((state) => {
        if (!state.guide) return state

        let blocks = state.guide.blocks.filter((b) => b.id !== blockId)
        blocks = blocks.map((block, index) => ({ ...block, order: index }))

        return {
          guide: { ...state.guide, blocks },
          selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
          saveStatus: 'unsaved',
        }
      })
    },

    reorderBlocks: (fromIndex, toIndex) => {
      set((state) => {
        if (!state.guide) return state

        const blocks = [...state.guide.blocks]
        const [removed] = blocks.splice(fromIndex, 1)
        blocks.splice(toIndex, 0, removed)

        const reorderedBlocks = blocks.map((block, index) => ({
          ...block,
          order: index,
        }))

        return {
          guide: { ...state.guide, blocks: reorderedBlocks },
          saveStatus: 'unsaved',
        }
      })
    },

    toggleBlockVisibility: (blockId) => {
      set((state) => {
        if (!state.guide) return state

        const blocks = state.guide.blocks.map((block) =>
          block.id === blockId ? { ...block, isVisible: !block.isVisible } : block
        )

        return {
          guide: { ...state.guide, blocks },
          saveStatus: 'unsaved',
        }
      })
    },

    duplicateBlock: (blockId) => {
      set((state) => {
        if (!state.guide) return state

        const blockIndex = state.guide.blocks.findIndex((b) => b.id === blockId)
        if (blockIndex === -1) return state

        const originalBlock = state.guide.blocks[blockIndex]
        const newBlock: Block = {
          ...originalBlock,
          id: generateBlockId(),
          content: JSON.parse(JSON.stringify(originalBlock.content)),
        }

        const blocks = [...state.guide.blocks]
        blocks.splice(blockIndex + 1, 0, newBlock)

        const reorderedBlocks = blocks.map((block, index) => ({
          ...block,
          order: index,
        }))

        return {
          guide: { ...state.guide, blocks: reorderedBlocks },
          selectedBlockId: newBlock.id,
          saveStatus: 'unsaved',
        }
      })
    },

    // UI 상태
    setViewMode: (mode) => set({ viewMode: mode }),
    setActivePanel: (panel) => set({ activePanel: panel }),
    selectBlock: (blockId) => set({ selectedBlockId: blockId }),
    toggleMobileSheet: (open) =>
      set((state) => ({ isMobileSheetOpen: open ?? !state.isMobileSheetOpen })),

    // 저장 관련
    setSaveStatus: (status) => set({ saveStatus: status }),
    markAsSaved: () =>
      set((state) => ({
        saveStatus: 'saved',
        lastSavedAt: new Date(),
        originalGuide: state.guide ? JSON.parse(JSON.stringify(state.guide)) : null,
      })),

    // 로딩 상태
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error, isLoading: false }),

    // Computed
    hasUnsavedChanges: () => {
      const state = get()
      return state.saveStatus === 'unsaved'
    },

    getBlockById: (blockId) => {
      const state = get()
      return state.guide?.blocks.find((b) => b.id === blockId)
    },

    getSelectedBlock: () => {
      const state = get()
      if (!state.selectedBlockId || !state.guide) return undefined
      return state.guide.blocks.find((b) => b.id === state.selectedBlockId)
    },
  }))
)

// 블록 타입 메타데이터
export const BLOCK_TYPE_META: Record<
  BlockType,
  { label: string; icon: string; description: string }
> = {
  hero: {
    label: '히어로',
    icon: 'Image',
    description: '메인 이미지와 환영 문구',
  },
  quick_info: {
    label: '빠른 정보',
    icon: 'Clock',
    description: '체크인/아웃, 인원, 주차 정보',
  },
  amenities: {
    label: '편의시설',
    icon: 'Wifi',
    description: 'Wi-Fi, 기기 사용법 등',
  },
  map: {
    label: '지도',
    icon: 'MapPin',
    description: '숙소 위치 및 지도 링크',
  },
  host_pick: {
    label: '호스트 추천',
    icon: 'Heart',
    description: '맛집, 카페, 명소 추천',
  },
  notice: {
    label: '공지사항',
    icon: 'Bell',
    description: '팝업 또는 배너 공지',
  },
}
