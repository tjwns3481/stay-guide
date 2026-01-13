/**
 * Mock 가이드북 데이터
 */

export interface MockGuidebook {
  id: string;
  hostId: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockGuidebooks: MockGuidebook[] = [
  {
    id: 'guidebook-1',
    hostId: 'host-1',
    slug: 'minjis-cozy-house',
    title: '민지네 아늑한 숙소',
    description: '서울 중심부에 위치한 깨끗하고 아늑한 숙소입니다.',
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'guidebook-2',
    hostId: 'host-1',
    slug: 'gangnam-studio',
    title: '강남 모던 스튜디오',
    description: '강남역 도보 5분 거리의 현대적인 스튜디오',
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
    isPublished: false,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'guidebook-3',
    hostId: 'host-2',
    slug: 'johns-beach-house',
    title: 'John\'s Beach House',
    description: 'Beautiful beachfront property with stunning ocean views',
    coverImage: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
    isPublished: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
  },
  {
    id: 'guidebook-4',
    hostId: 'host-3',
    slug: 'hongdae-loft',
    title: '홍대 감성 로프트',
    description: '홍대입구역 인근 개성있는 로프트',
    coverImage: null,
    isPublished: false,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];
