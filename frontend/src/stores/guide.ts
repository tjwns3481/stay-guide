import { create } from 'zustand'

export interface Block {
  id: string
  type: string
  order: number
  content: Record<string, unknown>
  isVisible: boolean
}

export interface Guide {
  id: string
  slug: string
  title: string
  accommodationName: string
  isPublished: boolean
  themeId?: string
  themeSettings?: Record<string, unknown>
  blocks: Block[]
  createdAt: string
  updatedAt: string
}

interface GuideState {
  currentGuide: Guide | null
  isDirty: boolean
  selectedBlockId: string | null

  // Actions
  setCurrentGuide: (guide: Guide | null) => void
  updateGuide: (updates: Partial<Guide>) => void
  setSelectedBlock: (blockId: string | null) => void
  addBlock: (block: Block) => void
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  removeBlock: (blockId: string) => void
  reorderBlocks: (fromIndex: number, toIndex: number) => void
  markClean: () => void
}

export const useGuideStore = create<GuideState>((set) => ({
  currentGuide: null,
  isDirty: false,
  selectedBlockId: null,

  setCurrentGuide: (guide) =>
    set({ currentGuide: guide, isDirty: false, selectedBlockId: null }),

  updateGuide: (updates) =>
    set((state) => ({
      currentGuide: state.currentGuide
        ? { ...state.currentGuide, ...updates }
        : null,
      isDirty: true,
    })),

  setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),

  addBlock: (block) =>
    set((state) => ({
      currentGuide: state.currentGuide
        ? {
            ...state.currentGuide,
            blocks: [...state.currentGuide.blocks, block],
          }
        : null,
      isDirty: true,
    })),

  updateBlock: (blockId, updates) =>
    set((state) => ({
      currentGuide: state.currentGuide
        ? {
            ...state.currentGuide,
            blocks: state.currentGuide.blocks.map((b) =>
              b.id === blockId ? { ...b, ...updates } : b
            ),
          }
        : null,
      isDirty: true,
    })),

  removeBlock: (blockId) =>
    set((state) => ({
      currentGuide: state.currentGuide
        ? {
            ...state.currentGuide,
            blocks: state.currentGuide.blocks.filter((b) => b.id !== blockId),
          }
        : null,
      isDirty: true,
      selectedBlockId:
        state.selectedBlockId === blockId ? null : state.selectedBlockId,
    })),

  reorderBlocks: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.currentGuide) return state

      const blocks = [...state.currentGuide.blocks]
      const [removed] = blocks.splice(fromIndex, 1)
      blocks.splice(toIndex, 0, removed)

      // Update order property
      const reorderedBlocks = blocks.map((block, index) => ({
        ...block,
        order: index,
      }))

      return {
        currentGuide: {
          ...state.currentGuide,
          blocks: reorderedBlocks,
        },
        isDirty: true,
      }
    }),

  markClean: () => set({ isDirty: false }),
}))
