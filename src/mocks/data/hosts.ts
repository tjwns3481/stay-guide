/**
 * Mock 호스트 데이터
 */

export interface MockHost {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const mockHosts: MockHost[] = [
  {
    id: 'host-1',
    email: 'minji@example.com',
    name: '김민지',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'host-2',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'host-3',
    email: 'sarah@example.com',
    name: 'Sarah Kim',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: '테스트 사용자',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600 * 1000, // 1 hour from now
  user: mockUser,
};
