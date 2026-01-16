import { describe, it, expect } from 'vitest'
import {
  GuideSchema,
  GuideListItemSchema,
  GuideDetailSchema,
  CreateGuideRequestSchema,
  UpdateGuideRequestSchema,
  PublishGuideRequestSchema,
  GetGuidesRequestSchema,
} from '@/contracts/guide.contract'

describe('Guide Contract 스키마 검증', () => {
  describe('GuideSchema', () => {
    it('유효한 가이드 데이터를 파싱할 수 있다', () => {
      const validGuide = {
        id: 'guide-1',
        userId: 'user-1',
        slug: 'test-guide',
        title: '테스트 안내서',
        accommodationName: '테스트 숙소',
        isPublished: false,
        themeId: null,
        themeSettings: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const result = GuideSchema.safeParse(validGuide)
      expect(result.success).toBe(true)
    })

    it('필수 필드가 없으면 실패한다', () => {
      const invalidGuide = {
        id: 'guide-1',
        // userId 누락
        slug: 'test-guide',
        title: '테스트 안내서',
      }

      const result = GuideSchema.safeParse(invalidGuide)
      expect(result.success).toBe(false)
    })

    it('themeSettings가 객체일 때 파싱된다', () => {
      const guideWithTheme = {
        id: 'guide-1',
        userId: 'user-1',
        slug: 'test-guide',
        title: '테스트 안내서',
        accommodationName: '테스트 숙소',
        isPublished: false,
        themeId: 'theme-1',
        themeSettings: {
          primaryColor: '#FF5733',
          fontFamily: 'Noto Sans KR',
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const result = GuideSchema.safeParse(guideWithTheme)
      expect(result.success).toBe(true)
    })
  })

  describe('GuideListItemSchema', () => {
    it('목록 아이템 데이터를 파싱할 수 있다', () => {
      const listItem = {
        id: 'guide-1',
        slug: 'test-guide',
        title: '테스트 안내서',
        accommodationName: '테스트 숙소',
        isPublished: true,
        blocksCount: 5,
        viewCount: 100,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const result = GuideListItemSchema.safeParse(listItem)
      expect(result.success).toBe(true)
    })

    it('음수 blocksCount는 실패한다', () => {
      const invalidItem = {
        id: 'guide-1',
        slug: 'test-guide',
        title: '테스트 안내서',
        accommodationName: '테스트 숙소',
        isPublished: true,
        blocksCount: -1,
        viewCount: 100,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const result = GuideListItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
    })
  })

  describe('GuideDetailSchema', () => {
    it('블록을 포함한 상세 데이터를 파싱할 수 있다', () => {
      const detail = {
        id: 'guide-1',
        userId: 'user-1',
        slug: 'test-guide',
        title: '테스트 안내서',
        accommodationName: '테스트 숙소',
        isPublished: true,
        themeId: null,
        themeSettings: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        blocks: [
          {
            id: 'block-1',
            type: 'hero',
            order: 0,
            content: { title: '환영합니다' },
            isVisible: true,
          },
          {
            id: 'block-2',
            type: 'quick_info',
            order: 1,
            content: { checkIn: '15:00' },
            isVisible: true,
          },
        ],
      }

      const result = GuideDetailSchema.safeParse(detail)
      expect(result.success).toBe(true)
    })

    it('빈 블록 배열도 유효하다', () => {
      const detail = {
        id: 'guide-1',
        userId: 'user-1',
        slug: 'test-guide',
        title: '테스트 안내서',
        accommodationName: '테스트 숙소',
        isPublished: false,
        themeId: null,
        themeSettings: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        blocks: [],
      }

      const result = GuideDetailSchema.safeParse(detail)
      expect(result.success).toBe(true)
    })
  })

  describe('CreateGuideRequestSchema', () => {
    it('유효한 생성 요청을 파싱할 수 있다', () => {
      const request = {
        title: '새 안내서',
        accommodationName: '새 숙소',
      }

      const result = CreateGuideRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('slug는 선택적이다', () => {
      const withSlug = {
        title: '새 안내서',
        accommodationName: '새 숙소',
        slug: 'custom-slug',
      }

      const result = CreateGuideRequestSchema.safeParse(withSlug)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe('custom-slug')
      }
    })

    it('빈 제목은 실패한다', () => {
      const invalidRequest = {
        title: '',
        accommodationName: '숙소',
      }

      const result = CreateGuideRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('100자를 초과하는 제목은 실패한다', () => {
      const invalidRequest = {
        title: 'a'.repeat(101),
        accommodationName: '숙소',
      }

      const result = CreateGuideRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('유효하지 않은 slug 형식은 실패한다', () => {
      const invalidSlug = {
        title: '안내서',
        accommodationName: '숙소',
        slug: 'Invalid Slug!', // 공백과 특수문자
      }

      const result = CreateGuideRequestSchema.safeParse(invalidSlug)
      expect(result.success).toBe(false)
    })

    it('유효한 slug 형식은 성공한다', () => {
      const validSlug = {
        title: '안내서',
        accommodationName: '숙소',
        slug: 'valid-slug-123',
      }

      const result = CreateGuideRequestSchema.safeParse(validSlug)
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateGuideRequestSchema', () => {
    it('부분 업데이트 요청을 파싱할 수 있다', () => {
      const request = {
        title: '수정된 제목',
      }

      const result = UpdateGuideRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('빈 객체도 유효하다', () => {
      const result = UpdateGuideRequestSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('themeId를 null로 설정할 수 있다', () => {
      const request = {
        themeId: null,
      }

      const result = UpdateGuideRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })
  })

  describe('PublishGuideRequestSchema', () => {
    it('발행 요청을 파싱할 수 있다', () => {
      const publishRequest = { isPublished: true }
      const result = PublishGuideRequestSchema.safeParse(publishRequest)
      expect(result.success).toBe(true)
    })

    it('발행 취소 요청을 파싱할 수 있다', () => {
      const unpublishRequest = { isPublished: false }
      const result = PublishGuideRequestSchema.safeParse(unpublishRequest)
      expect(result.success).toBe(true)
    })

    it('isPublished가 boolean이 아니면 실패한다', () => {
      const invalidRequest = { isPublished: 'yes' }
      const result = PublishGuideRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })
  })

  describe('GetGuidesRequestSchema', () => {
    it('페이지네이션 파라미터를 파싱할 수 있다', () => {
      const request = {
        page: '2',
        limit: '20',
      }

      const result = GetGuidesRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(20)
      }
    })

    it('기본값이 적용된다', () => {
      const result = GetGuidesRequestSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20) // PaginationRequestSchema의 기본값
      }
    })

    it('검색어를 포함할 수 있다', () => {
      const request = {
        search: '테스트',
      }

      const result = GetGuidesRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.search).toBe('테스트')
      }
    })

    it('isPublished 필터를 사용할 수 있다', () => {
      const request = {
        isPublished: 'true',
      }

      const result = GetGuidesRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublished).toBe(true)
      }
    })
  })
})
