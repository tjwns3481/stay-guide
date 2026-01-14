import type { UserProfile } from '@/contracts'

export const mockUsers: UserProfile[] = [
  {
    id: 'user_1',
    clerkId: 'clerk_user_1',
    email: 'host@example.com',
    name: '김호스트',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=host',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    license: {
      plan: 'free',
      status: 'active',
      features: {
        maxGuides: 1,
        maxBlocksPerGuide: 10,
        aiConcierge: false,
        customTheme: false,
        noWatermark: false,
        analytics: false,
      },
      expiresAt: null,
    },
    stats: {
      guidesCount: 2,
      totalViews: 150,
    },
  },
  {
    id: 'user_2',
    clerkId: 'clerk_user_2',
    email: 'pro@example.com',
    name: '박프로',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    license: {
      plan: 'monthly',
      status: 'active',
      features: {
        maxGuides: 5,
        maxBlocksPerGuide: 50,
        aiConcierge: true,
        customTheme: true,
        noWatermark: true,
        analytics: true,
      },
      expiresAt: '2024-02-20T00:00:00Z',
    },
    stats: {
      guidesCount: 3,
      totalViews: 520,
    },
  },
]

export const currentUser = mockUsers[0]
