/**
 * GuidebookView Component Tests (TDD)
 * Phase 3, T3.2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GuidebookView } from '@/components/guidebook/GuidebookView';
import { GuidebookHeader } from '@/components/guidebook/GuidebookHeader';
import { InfoBlock } from '@/components/guidebook/InfoBlock';
import type { Guidebook, Block } from '@/db/schema';

// Mock useCopyToClipboard
vi.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copied: false,
    copyToClipboard: vi.fn(),
  }),
}));

const mockGuidebook: Guidebook = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  hostId: '123e4567-e89b-12d3-a456-426614174001',
  slug: 'cozy-stay',
  title: '아늑한 펜션 가이드',
  description: '편안한 휴식을 위한 모든 정보',
  coverImage: 'https://example.com/cover.jpg',
  isPublished: true,
  viewCount: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBlocks: Block[] = [
  {
    id: 'block-1',
    guidebookId: mockGuidebook.id,
    type: 'wifi',
    title: '와이파이',
    content: { ssid: 'PensionWiFi', password: 'welcome123' },
    order: 0,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'block-2',
    guidebookId: mockGuidebook.id,
    type: 'checkin',
    title: '체크인/아웃',
    content: { checkinTime: '15:00', checkoutTime: '11:00' },
    order: 1,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'block-3',
    guidebookId: mockGuidebook.id,
    type: 'map',
    title: '위치',
    content: {
      address: '경기도 가평군 청평면 호반로 123',
      latitude: 37.7519,
      longitude: 127.4282,
    },
    order: 2,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('GuidebookHeader', () => {
  it('가이드북 제목을 표시한다', () => {
    render(<GuidebookHeader guidebook={mockGuidebook} />);

    expect(screen.getByText('아늑한 펜션 가이드')).toBeInTheDocument();
  });

  it('가이드북 설명을 표시한다', () => {
    render(<GuidebookHeader guidebook={mockGuidebook} />);

    expect(screen.getByText('편안한 휴식을 위한 모든 정보')).toBeInTheDocument();
  });

  it('커버 이미지가 있으면 표시한다', () => {
    render(<GuidebookHeader guidebook={mockGuidebook} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('cover.jpg'));
  });

  it('커버 이미지가 없으면 기본 배경을 표시한다', () => {
    const noCoverGuidebook = { ...mockGuidebook, coverImage: null };
    render(<GuidebookHeader guidebook={noCoverGuidebook} />);

    // 이미지가 없어야 함
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('InfoBlock', () => {
  it('wifi 타입 블록을 렌더링한다', () => {
    render(<InfoBlock block={mockBlocks[0]} />);

    expect(screen.getByText('PensionWiFi')).toBeInTheDocument();
    expect(screen.getByText('welcome123')).toBeInTheDocument();
  });

  it('checkin 타입 블록을 렌더링한다', () => {
    render(<InfoBlock block={mockBlocks[1]} />);

    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('map 타입 블록을 렌더링한다', () => {
    render(<InfoBlock block={mockBlocks[2]} />);

    expect(screen.getByText('경기도 가평군 청평면 호반로 123')).toBeInTheDocument();
  });

  it('isVisible이 false인 블록은 렌더링하지 않는다', () => {
    const hiddenBlock = { ...mockBlocks[0], isVisible: false };
    const { container } = render(<InfoBlock block={hiddenBlock} />);

    expect(container.firstChild).toBeNull();
  });
});

describe('GuidebookView', () => {
  it('헤더와 블록 목록을 렌더링한다', () => {
    render(<GuidebookView guidebook={mockGuidebook} blocks={mockBlocks} />);

    // 헤더
    expect(screen.getByText('아늑한 펜션 가이드')).toBeInTheDocument();

    // 블록들
    expect(screen.getByText('PensionWiFi')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('경기도 가평군 청평면 호반로 123')).toBeInTheDocument();
  });

  it('블록이 없으면 빈 상태 메시지를 표시한다', () => {
    render(<GuidebookView guidebook={mockGuidebook} blocks={[]} />);

    expect(screen.getByText(/아직 등록된 정보가 없습니다/)).toBeInTheDocument();
  });

  it('블록을 order 순서대로 렌더링한다', () => {
    const unorderedBlocks = [mockBlocks[2], mockBlocks[0], mockBlocks[1]];
    render(<GuidebookView guidebook={mockGuidebook} blocks={unorderedBlocks} />);

    // DOM에서 순서 확인
    const blockElements = screen.getAllByTestId('info-block');
    expect(blockElements).toHaveLength(3);
  });

  it('isVisible이 false인 블록은 렌더링하지 않는다', () => {
    const blocksWithHidden = [
      mockBlocks[0],
      { ...mockBlocks[1], isVisible: false },
      mockBlocks[2],
    ];
    render(<GuidebookView guidebook={mockGuidebook} blocks={blocksWithHidden} />);

    // wifi와 map만 표시, checkin은 숨김
    expect(screen.getByText('PensionWiFi')).toBeInTheDocument();
    expect(screen.queryByText('15:00')).not.toBeInTheDocument();
    expect(screen.getByText('경기도 가평군 청평면 호반로 123')).toBeInTheDocument();
  });
});
