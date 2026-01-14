/**
 * Prisma Client Mock for Testing
 */

import { mockUser, mockGuide, mockBlock } from '../setup'

// Mock 데이터 저장소
let users: Array<typeof mockUser & { id: string; clerkId: string }> = []
let guides: Array<
  typeof mockGuide & {
    createdAt: Date
    updatedAt: Date
    blocks?: Array<typeof mockBlock & { createdAt: Date; updatedAt: Date }>
  }
> = []
let blocks: Array<typeof mockBlock & { createdAt: Date; updatedAt: Date }> = []

// 테스트 데이터 초기화
export function resetMockData() {
  const now = new Date()

  users = [
    {
      ...mockUser,
      createdAt: now,
      updatedAt: now,
    } as typeof mockUser & { id: string; clerkId: string; createdAt: Date; updatedAt: Date },
  ]

  guides = [
    {
      ...mockGuide,
      createdAt: now,
      updatedAt: now,
    },
  ]

  blocks = [
    {
      ...mockBlock,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

// 다른 사용자의 안내서 Mock
export const otherUserGuide = {
  id: 'other-user-guide-id',
  userId: 'other_user_id',
  slug: 'other-user-guide',
  title: '다른 사용자 안내서',
  accommodationName: '다른 숙소',
  isPublished: false,
  themeId: null,
  themeSettings: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// 발행된 안내서 Mock
export const publishedGuide = {
  id: 'published-guide-id',
  userId: mockUser.id,
  slug: 'published-guide',
  title: '발행된 안내서',
  accommodationName: '발행 숙소',
  isPublished: true,
  themeId: null,
  themeSettings: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Prisma Mock Client
export const prismaMock = {
  user: {
    findFirst: async (args: { where: { clerkId?: string } }) => {
      if (args.where.clerkId === 'clerk_test_123') {
        return users[0]
      }
      return null
    },
    findUnique: async (args: { where: { id?: string; clerkId?: string } }) => {
      return users.find((u) => u.id === args.where.id || u.clerkId === args.where.clerkId) || null
    },
  },
  guide: {
    findMany: async (args?: {
      where?: { userId?: string; isPublished?: boolean }
      include?: { _count?: { select: { blocks: boolean } } }
      orderBy?: { updatedAt: 'desc' }
      skip?: number
      take?: number
    }) => {
      let result = [...guides, otherUserGuide, publishedGuide]

      if (args?.where?.userId) {
        result = result.filter((g) => g.userId === args.where?.userId)
      }
      if (typeof args?.where?.isPublished === 'boolean') {
        result = result.filter((g) => g.isPublished === args.where?.isPublished)
      }

      if (args?.include?._count) {
        result = result.map((g) => ({
          ...g,
          _count: { blocks: blocks.filter((b) => b.guideId === g.id).length },
        }))
      }

      if (args?.skip) {
        result = result.slice(args.skip)
      }
      if (args?.take) {
        result = result.slice(0, args.take)
      }

      return result
    },
    findUnique: async (args: {
      where: { id?: string; slug?: string }
      include?: { blocks?: { orderBy?: { order: 'asc' } } }
    }) => {
      const allGuides = [...guides, otherUserGuide, publishedGuide]
      let guide = allGuides.find((g) => g.id === args.where.id || g.slug === args.where.slug)

      if (guide && args.include?.blocks) {
        return {
          ...guide,
          blocks: blocks.filter((b) => b.guideId === guide?.id),
        }
      }

      return guide || null
    },
    findFirst: async (args: {
      where: { slug?: string; isPublished?: boolean }
      include?: { blocks?: { where?: { isVisible: boolean }; orderBy?: { order: 'asc' } } }
    }) => {
      const allGuides = [...guides, otherUserGuide, publishedGuide]
      let guide = allGuides.find((g) => {
        if (args.where.slug && g.slug !== args.where.slug) return false
        if (typeof args.where.isPublished === 'boolean' && g.isPublished !== args.where.isPublished) return false
        return true
      })

      if (guide && args.include?.blocks) {
        let guideBlocks = blocks.filter((b) => b.guideId === guide?.id)
        if (args.include.blocks.where?.isVisible) {
          guideBlocks = guideBlocks.filter((b) => b.isVisible)
        }
        return {
          ...guide,
          blocks: guideBlocks,
        }
      }

      return guide || null
    },
    count: async (args?: { where?: { userId?: string; isPublished?: boolean } }) => {
      let result = [...guides, otherUserGuide, publishedGuide]

      if (args?.where?.userId) {
        result = result.filter((g) => g.userId === args.where?.userId)
      }
      if (typeof args?.where?.isPublished === 'boolean') {
        result = result.filter((g) => g.isPublished === args.where?.isPublished)
      }

      return result.length
    },
    create: async (args: {
      data: {
        userId: string
        title: string
        accommodationName: string
        slug: string
        isPublished?: boolean
        themeId?: string | null
        themeSettings?: unknown
        blocks?: { create: Array<{ type: string; order: number; content: unknown; isVisible: boolean }> }
      }
      include?: { blocks?: { orderBy?: { order: 'asc' } } }
    }) => {
      const now = new Date()
      const newGuide = {
        id: `guide_${Date.now()}`,
        userId: args.data.userId,
        title: args.data.title,
        accommodationName: args.data.accommodationName,
        slug: args.data.slug,
        isPublished: args.data.isPublished || false,
        themeId: args.data.themeId || null,
        themeSettings: args.data.themeSettings || null,
        createdAt: now,
        updatedAt: now,
      }

      guides.push(newGuide)

      let createdBlocks: Array<typeof mockBlock & { createdAt: Date; updatedAt: Date }> = []
      if (args.data.blocks?.create) {
        createdBlocks = args.data.blocks.create.map((b, idx) => ({
          id: `block_${Date.now()}_${idx}`,
          guideId: newGuide.id,
          type: b.type,
          order: b.order,
          content: b.content as Record<string, unknown>,
          isVisible: b.isVisible,
          createdAt: now,
          updatedAt: now,
        }))
        blocks.push(...createdBlocks)
      }

      if (args.include?.blocks) {
        return { ...newGuide, blocks: createdBlocks }
      }

      return newGuide
    },
    update: async (args: {
      where: { id: string }
      data: {
        title?: string
        accommodationName?: string
        slug?: string
        isPublished?: boolean
        themeId?: string | null
        themeSettings?: unknown
      }
      include?: { blocks?: { orderBy?: { order: 'asc' } } }
    }) => {
      const idx = guides.findIndex((g) => g.id === args.where.id)
      if (idx === -1) throw new Error('Guide not found')

      const updated = {
        ...guides[idx],
        ...args.data,
        updatedAt: new Date(),
      }
      guides[idx] = updated

      if (args.include?.blocks) {
        return { ...updated, blocks: blocks.filter((b) => b.guideId === updated.id) }
      }

      return updated
    },
    delete: async (args: { where: { id: string } }) => {
      const idx = guides.findIndex((g) => g.id === args.where.id)
      if (idx === -1) throw new Error('Guide not found')

      const deleted = guides[idx]
      guides.splice(idx, 1)

      // 관련 블록도 삭제
      blocks = blocks.filter((b) => b.guideId !== deleted.id)

      return deleted
    },
  },
  block: {
    findMany: async (args?: { where?: { guideId?: string }; orderBy?: { order: 'asc' } }) => {
      let result = [...blocks]

      if (args?.where?.guideId) {
        result = result.filter((b) => b.guideId === args.where?.guideId)
      }

      return result
    },
  },
}

// 초기화
resetMockData()
