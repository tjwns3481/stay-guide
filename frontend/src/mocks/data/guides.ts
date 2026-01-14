import type { GuideDetail, GuideListItem } from '@/contracts'

export const mockGuides: GuideDetail[] = [
  {
    id: 'guide_1',
    userId: 'user_1',
    slug: 'jeju-pension',
    title: '제주 감성 펜션',
    accommodationName: '제주 바다뷰 펜션',
    isPublished: true,
    themeId: 'emotional',
    themeSettings: {
      preset: 'emotional',
      primaryColor: '#E07A5F',
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    blocks: [
      {
        id: 'block_1',
        type: 'hero',
        order: 0,
        content: {
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
          title: '제주 바다뷰 펜션에 오신 것을 환영합니다',
          subtitle: '푸른 바다가 보이는 편안한 휴식처',
          style: 'full',
        },
        isVisible: true,
      },
      {
        id: 'block_2',
        type: 'quick_info',
        order: 1,
        content: {
          checkIn: '15:00',
          checkOut: '11:00',
          maxGuests: 4,
          parking: '무료 주차 가능 (2대)',
          address: '제주특별자치도 서귀포시 성산읍',
        },
        isVisible: true,
      },
      {
        id: 'block_3',
        type: 'amenities',
        order: 2,
        content: {
          wifi: {
            ssid: 'JejuPension_5G',
            password: 'welcome123',
          },
          items: [
            { icon: 'wifi', label: 'Wi-Fi', description: '전 객실 무료' },
            { icon: 'tv', label: '스마트 TV', description: 'Netflix 가능' },
            { icon: 'coffee', label: '커피머신', description: '캡슐커피 제공' },
          ],
        },
        isVisible: true,
      },
      {
        id: 'block_4',
        type: 'map',
        order: 3,
        content: {
          address: '제주특별자치도 서귀포시 성산읍 해맞이해안로 100',
          latitude: 33.4597,
          longitude: 126.9406,
          naverMapUrl: 'https://map.naver.com/v5/search/제주펜션',
          kakaoMapUrl: 'https://map.kakao.com/?q=제주펜션',
        },
        isVisible: true,
      },
      {
        id: 'block_5',
        type: 'host_pick',
        order: 4,
        content: {
          title: '호스트 추천',
          items: [
            {
              id: 'pick_1',
              name: '성산일출봉 카페',
              category: 'cafe',
              description: '일출봉이 보이는 오션뷰 카페',
              imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
              mapUrl: 'https://map.naver.com/v5/search/성산일출봉카페',
            },
            {
              id: 'pick_2',
              name: '해녀밥상',
              category: 'restaurant',
              description: '싱싱한 해산물 정식',
              imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
              mapUrl: 'https://map.naver.com/v5/search/해녀밥상',
            },
          ],
        },
        isVisible: true,
      },
    ],
  },
  {
    id: 'guide_2',
    userId: 'user_1',
    slug: 'gangwon-cabin',
    title: '강원도 숲속 캐빈',
    accommodationName: '평창 숲속 캐빈',
    isPublished: false,
    themeId: 'natural',
    themeSettings: {
      preset: 'natural',
    },
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
    blocks: [
      {
        id: 'block_6',
        type: 'hero',
        order: 0,
        content: {
          title: '평창 숲속 캐빈',
          subtitle: '자연 속에서의 힐링',
          style: 'card',
        },
        isVisible: true,
      },
    ],
  },
]

export const mockGuideListItems: GuideListItem[] = mockGuides.map((guide) => ({
  id: guide.id,
  slug: guide.slug,
  title: guide.title,
  accommodationName: guide.accommodationName,
  isPublished: guide.isPublished,
  blocksCount: guide.blocks.length,
  viewCount: Math.floor(Math.random() * 500),
  createdAt: guide.createdAt,
  updatedAt: guide.updatedAt,
}))

export function getGuideById(id: string): GuideDetail | undefined {
  return mockGuides.find((g) => g.id === id)
}

export function getGuideBySlug(slug: string): GuideDetail | undefined {
  return mockGuides.find((g) => g.slug === slug && g.isPublished)
}

export function getGuidesByUserId(userId: string): GuideListItem[] {
  return mockGuideListItems.filter(
    (g) => mockGuides.find((mg) => mg.id === g.id)?.userId === userId
  )
}
