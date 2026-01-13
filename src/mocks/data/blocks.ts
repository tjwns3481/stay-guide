/**
 * Mock 블록 데이터
 */

import type {
  WifiContent,
  MapContent,
  CheckinContent,
  RecommendationContent,
  CustomContent,
} from '@/lib/validations/info-block';

export interface MockBlock {
  id: string;
  guidebookId: string;
  type: 'wifi' | 'map' | 'checkin' | 'recommendation' | 'custom';
  title: string;
  content:
    | WifiContent
    | MapContent
    | CheckinContent
    | RecommendationContent
    | CustomContent;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockBlocks: MockBlock[] = [
  // guidebook-1 blocks
  {
    id: 'block-1',
    guidebookId: 'guidebook-1',
    type: 'wifi',
    title: '와이파이 정보',
    content: {
      ssid: 'MinjiHome_5G',
      password: 'welcome123',
      instructions: '거실과 침실 모두 연결 가능합니다.',
    },
    order: 0,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'block-2',
    guidebookId: 'guidebook-1',
    type: 'checkin',
    title: '체크인/아웃 안내',
    content: {
      checkinTime: '15:00',
      checkoutTime: '11:00',
      instructions:
        '입구 비밀번호는 체크인 당일 카카오톡으로 전달드립니다. 조기 체크인이 필요하신 경우 미리 연락 주세요.',
    },
    order: 1,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'block-3',
    guidebookId: 'guidebook-1',
    type: 'map',
    title: '숙소 위치',
    content: {
      address: '서울특별시 중구 명동길 74',
      latitude: 37.5635,
      longitude: 126.9825,
      placeId: 'ChIJa2lxZ5KifDURh_FL7IQy0H4',
      instructions: '명동역 6번 출구에서 도보 3분 거리입니다.',
    },
    order: 2,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'block-4',
    guidebookId: 'guidebook-1',
    type: 'recommendation',
    title: '주변 맛집 추천',
    content: {
      category: '음식점',
      items: [
        {
          name: '명동교자',
          description: '유명한 칼국수와 만두 전문점',
          address: '서울특별시 중구 명동10길 29',
          url: 'https://example.com/myeongdong-gyoja',
          imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
        },
        {
          name: '하동관',
          description: '70년 전통의 곰탕 전문점',
          address: '서울특별시 중구 명동9길 12',
          url: 'https://example.com/hadongkwan',
        },
      ],
    },
    order: 3,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // guidebook-3 blocks
  {
    id: 'block-5',
    guidebookId: 'guidebook-3',
    type: 'wifi',
    title: 'WiFi Information',
    content: {
      ssid: 'BeachHouse_Guest',
      password: 'oceanview2024',
      instructions: 'WiFi coverage includes the entire house and outdoor deck.',
    },
    order: 0,
    isVisible: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'block-6',
    guidebookId: 'guidebook-3',
    type: 'custom',
    title: 'House Rules',
    content: {
      text: 'Please respect quiet hours from 10 PM to 8 AM. No parties or events. Maximum occupancy: 4 guests.',
      markdown:
        '## House Rules\n\n- Quiet hours: 10 PM - 8 AM\n- No parties or events\n- Max occupancy: 4 guests\n- No smoking inside',
      metadata: {
        category: 'rules',
        importance: 'high',
      },
    },
    order: 1,
    isVisible: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];
