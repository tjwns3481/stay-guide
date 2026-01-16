import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore, Guide, Block } from '@/stores/editor'

// 테스트용 가이드 데이터
const createMockGuide = (overrides: Partial<Guide> = {}): Guide => ({
  id: 'guide-1',
  userId: 'user-1',
  slug: 'test-guide',
  title: '테스트 안내서',
  accommodationName: '테스트 숙소',
  isPublished: false,
  themeId: null,
  themeSettings: null,
  blocks: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockBlock = (overrides: Partial<Block> = {}): Block => ({
  id: 'block-1',
  type: 'hero',
  order: 0,
  content: { title: '환영합니다', subtitle: '', imageUrl: '' },
  isVisible: true,
  ...overrides,
})

describe('useEditorStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useEditorStore.setState({
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
    })
  })

  describe('가이드 관리', () => {
    it('setGuide로 가이드를 설정할 수 있다', () => {
      const guide = createMockGuide()
      useEditorStore.getState().setGuide(guide)

      const state = useEditorStore.getState()
      expect(state.guide).toEqual(guide)
      expect(state.originalGuide).toEqual(guide)
      expect(state.saveStatus).toBe('saved')
    })

    it('updateGuide로 가이드 정보를 업데이트할 수 있다', () => {
      const guide = createMockGuide()
      useEditorStore.getState().setGuide(guide)

      useEditorStore.getState().updateGuide({ title: '수정된 제목' })

      const state = useEditorStore.getState()
      expect(state.guide?.title).toBe('수정된 제목')
      expect(state.saveStatus).toBe('unsaved')
    })

    it('resetGuide로 원래 가이드로 복원할 수 있다', () => {
      const guide = createMockGuide()
      useEditorStore.getState().setGuide(guide)
      useEditorStore.getState().updateGuide({ title: '수정된 제목' })

      useEditorStore.getState().resetGuide()

      const state = useEditorStore.getState()
      expect(state.guide?.title).toBe('테스트 안내서')
      expect(state.saveStatus).toBe('saved')
    })
  })

  describe('블록 관리', () => {
    beforeEach(() => {
      const guide = createMockGuide({ blocks: [] })
      useEditorStore.getState().setGuide(guide)
    })

    it('addBlock으로 블록을 추가할 수 있다', () => {
      useEditorStore.getState().addBlock('hero')

      const state = useEditorStore.getState()
      expect(state.guide?.blocks).toHaveLength(1)
      expect(state.guide?.blocks[0].type).toBe('hero')
      expect(state.saveStatus).toBe('unsaved')
    })

    it('addBlock 시 기본 콘텐츠가 설정된다', () => {
      useEditorStore.getState().addBlock('quick_info')

      const state = useEditorStore.getState()
      const block = state.guide?.blocks[0]
      expect(block?.content).toHaveProperty('checkIn', '15:00')
      expect(block?.content).toHaveProperty('checkOut', '11:00')
    })

    it('addBlock 시 afterBlockId를 지정하면 해당 블록 뒤에 추가된다', () => {
      useEditorStore.getState().addBlock('hero')
      const firstBlockId = useEditorStore.getState().guide?.blocks[0].id
      useEditorStore.getState().addBlock('quick_info', firstBlockId)

      const state = useEditorStore.getState()
      expect(state.guide?.blocks).toHaveLength(2)
      expect(state.guide?.blocks[0].type).toBe('hero')
      expect(state.guide?.blocks[1].type).toBe('quick_info')
    })

    it('updateBlock으로 블록을 업데이트할 수 있다', () => {
      useEditorStore.getState().addBlock('hero')
      const blockId = useEditorStore.getState().guide?.blocks[0].id!

      useEditorStore.getState().updateBlock(blockId, {
        content: { title: '수정된 제목', subtitle: '부제목' },
      })

      const state = useEditorStore.getState()
      expect(state.guide?.blocks[0].content).toEqual({
        title: '수정된 제목',
        subtitle: '부제목',
      })
    })

    it('removeBlock으로 블록을 삭제할 수 있다', () => {
      useEditorStore.getState().addBlock('hero')
      useEditorStore.getState().addBlock('quick_info')
      const blockId = useEditorStore.getState().guide?.blocks[0].id!

      useEditorStore.getState().removeBlock(blockId)

      const state = useEditorStore.getState()
      expect(state.guide?.blocks).toHaveLength(1)
      expect(state.guide?.blocks[0].type).toBe('quick_info')
    })

    it('removeBlock 후 order가 재계산된다', () => {
      useEditorStore.getState().addBlock('hero')
      useEditorStore.getState().addBlock('quick_info')
      useEditorStore.getState().addBlock('amenities')

      const secondBlockId = useEditorStore.getState().guide?.blocks[1].id!
      useEditorStore.getState().removeBlock(secondBlockId)

      const state = useEditorStore.getState()
      expect(state.guide?.blocks[0].order).toBe(0)
      expect(state.guide?.blocks[1].order).toBe(1)
    })

    it('reorderBlocks로 블록 순서를 변경할 수 있다', () => {
      useEditorStore.getState().addBlock('hero')
      useEditorStore.getState().addBlock('quick_info')
      useEditorStore.getState().addBlock('amenities')

      useEditorStore.getState().reorderBlocks(0, 2)

      const state = useEditorStore.getState()
      expect(state.guide?.blocks[0].type).toBe('quick_info')
      expect(state.guide?.blocks[1].type).toBe('amenities')
      expect(state.guide?.blocks[2].type).toBe('hero')
    })

    it('toggleBlockVisibility로 블록 가시성을 토글할 수 있다', () => {
      useEditorStore.getState().addBlock('hero')
      const blockId = useEditorStore.getState().guide?.blocks[0].id!

      useEditorStore.getState().toggleBlockVisibility(blockId)
      expect(useEditorStore.getState().guide?.blocks[0].isVisible).toBe(false)

      useEditorStore.getState().toggleBlockVisibility(blockId)
      expect(useEditorStore.getState().guide?.blocks[0].isVisible).toBe(true)
    })

    it('duplicateBlock으로 블록을 복제할 수 있다', () => {
      useEditorStore.getState().addBlock('hero')
      const blockId = useEditorStore.getState().guide?.blocks[0].id!
      useEditorStore.getState().updateBlock(blockId, {
        content: { title: '원본 제목' },
      })

      useEditorStore.getState().duplicateBlock(blockId)

      const state = useEditorStore.getState()
      expect(state.guide?.blocks).toHaveLength(2)
      expect(state.guide?.blocks[0].id).not.toBe(state.guide?.blocks[1].id)
      expect(state.guide?.blocks[1].content).toEqual({ title: '원본 제목' })
    })
  })

  describe('UI 상태', () => {
    it('setViewMode로 뷰 모드를 변경할 수 있다', () => {
      useEditorStore.getState().setViewMode('preview')
      expect(useEditorStore.getState().viewMode).toBe('preview')

      useEditorStore.getState().setViewMode('edit')
      expect(useEditorStore.getState().viewMode).toBe('edit')
    })

    it('setActivePanel로 활성 패널을 변경할 수 있다', () => {
      useEditorStore.getState().setActivePanel('theme')
      expect(useEditorStore.getState().activePanel).toBe('theme')
    })

    it('selectBlock으로 블록을 선택할 수 있다', () => {
      useEditorStore.getState().selectBlock('block-1')
      expect(useEditorStore.getState().selectedBlockId).toBe('block-1')

      useEditorStore.getState().selectBlock(null)
      expect(useEditorStore.getState().selectedBlockId).toBeNull()
    })

    it('toggleMobileSheet로 모바일 시트를 토글할 수 있다', () => {
      useEditorStore.getState().toggleMobileSheet()
      expect(useEditorStore.getState().isMobileSheetOpen).toBe(true)

      useEditorStore.getState().toggleMobileSheet()
      expect(useEditorStore.getState().isMobileSheetOpen).toBe(false)

      useEditorStore.getState().toggleMobileSheet(true)
      expect(useEditorStore.getState().isMobileSheetOpen).toBe(true)
    })
  })

  describe('저장 상태', () => {
    it('setSaveStatus로 저장 상태를 변경할 수 있다', () => {
      useEditorStore.getState().setSaveStatus('saving')
      expect(useEditorStore.getState().saveStatus).toBe('saving')
    })

    it('markAsSaved로 저장 완료 상태로 변경할 수 있다', () => {
      const guide = createMockGuide()
      useEditorStore.getState().setGuide(guide)
      useEditorStore.getState().updateGuide({ title: '수정됨' })

      useEditorStore.getState().markAsSaved()

      const state = useEditorStore.getState()
      expect(state.saveStatus).toBe('saved')
      expect(state.lastSavedAt).toBeInstanceOf(Date)
      expect(state.originalGuide?.title).toBe('수정됨')
    })

    it('hasUnsavedChanges가 올바르게 동작한다', () => {
      const guide = createMockGuide()
      useEditorStore.getState().setGuide(guide)

      expect(useEditorStore.getState().hasUnsavedChanges()).toBe(false)

      useEditorStore.getState().updateGuide({ title: '수정됨' })
      expect(useEditorStore.getState().hasUnsavedChanges()).toBe(true)
    })
  })

  describe('Computed 함수', () => {
    beforeEach(() => {
      const guide = createMockGuide({
        blocks: [
          createMockBlock({ id: 'block-1', type: 'hero' }),
          createMockBlock({ id: 'block-2', type: 'quick_info' }),
        ],
      })
      useEditorStore.getState().setGuide(guide)
    })

    it('getBlockById로 블록을 찾을 수 있다', () => {
      const block = useEditorStore.getState().getBlockById('block-1')
      expect(block).toBeDefined()
      expect(block?.type).toBe('hero')

      const notFound = useEditorStore.getState().getBlockById('nonexistent')
      expect(notFound).toBeUndefined()
    })

    it('getSelectedBlock으로 선택된 블록을 가져올 수 있다', () => {
      useEditorStore.getState().selectBlock('block-2')
      const block = useEditorStore.getState().getSelectedBlock()
      expect(block?.id).toBe('block-2')
    })

    it('블록이 선택되지 않았으면 getSelectedBlock은 undefined를 반환한다', () => {
      const block = useEditorStore.getState().getSelectedBlock()
      expect(block).toBeUndefined()
    })
  })

  describe('로딩 및 에러 상태', () => {
    it('setLoading으로 로딩 상태를 변경할 수 있다', () => {
      useEditorStore.getState().setLoading(true)
      expect(useEditorStore.getState().isLoading).toBe(true)
    })

    it('setError로 에러를 설정하면 로딩이 false가 된다', () => {
      useEditorStore.getState().setLoading(true)
      useEditorStore.getState().setError('에러 발생')

      const state = useEditorStore.getState()
      expect(state.error).toBe('에러 발생')
      expect(state.isLoading).toBe(false)
    })
  })
})
