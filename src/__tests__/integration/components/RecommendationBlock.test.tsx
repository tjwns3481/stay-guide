import { render, screen } from '@testing-library/react';
import { RecommendationBlock } from '@/components/guidebook/RecommendationBlock';

describe('RecommendationBlock', () => {
  const mockItems = [
    {
      name: '할매국밥',
      description: '24시간 운영하는 국밥 전문점',
      distance: '도보 5분',
    },
    {
      name: '스시야',
      description: '신선한 회를 맛볼 수 있는 곳',
      distance: '도보 10분',
    },
  ];

  it('추천 장소 제목을 표시한다', () => {
    render(
      <RecommendationBlock
        title="근처 맛집"
        category="restaurant"
        items={mockItems}
      />
    );

    expect(screen.getByText('근처 맛집')).toBeInTheDocument();
  });

  it('카테고리별 추천 목록을 표시한다', () => {
    render(
      <RecommendationBlock
        category="restaurant"
        items={mockItems}
      />
    );

    expect(screen.getByText('주변 맛집')).toBeInTheDocument();
  });

  it('각 추천 항목의 이름과 설명을 표시한다', () => {
    render(
      <RecommendationBlock
        category="restaurant"
        items={mockItems}
      />
    );

    expect(screen.getByText('할매국밥')).toBeInTheDocument();
    expect(screen.getByText('24시간 운영하는 국밥 전문점')).toBeInTheDocument();
    expect(screen.getByText('도보 5분')).toBeInTheDocument();

    expect(screen.getByText('스시야')).toBeInTheDocument();
    expect(screen.getByText('신선한 회를 맛볼 수 있는 곳')).toBeInTheDocument();
    expect(screen.getByText('도보 10분')).toBeInTheDocument();
  });
});
