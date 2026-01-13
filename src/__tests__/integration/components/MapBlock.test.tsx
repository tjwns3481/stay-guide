import { render, screen } from '@testing-library/react';
import { MapBlock } from '@/components/guidebook/MapBlock';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('MapBlock', () => {
  const mockMapData = {
    address: '서울시 성동구 서울숲길 123',
    latitude: 37.5445,
    longitude: 127.0374,
    placeName: '민지네 숙소',
  };

  beforeEach(() => {
    // window.open mock
    global.open = vi.fn();
  });

  it('주소를 표시한다', () => {
    render(<MapBlock {...mockMapData} />);
    expect(screen.getByText(mockMapData.address)).toBeInTheDocument();
  });

  it('카카오맵 열기 버튼이 있다', () => {
    render(<MapBlock {...mockMapData} />);
    const kakaoButton = screen.getByRole('button', { name: /카카오맵/i });
    expect(kakaoButton).toBeInTheDocument();
  });

  it('네이버맵 열기 버튼이 있다', () => {
    render(<MapBlock {...mockMapData} />);
    const naverButton = screen.getByRole('button', { name: /네이버지도/i });
    expect(naverButton).toBeInTheDocument();
  });

  it('지도 미리보기 이미지를 표시한다', () => {
    render(<MapBlock {...mockMapData} />);
    const mapImage = screen.getByAltText('지도');
    expect(mapImage).toBeInTheDocument();
  });

  it('카카오맵 버튼 클릭 시 올바른 URL로 연다', async () => {
    const user = userEvent.setup();
    render(<MapBlock {...mockMapData} />);

    const kakaoButton = screen.getByRole('button', { name: /카카오맵/i });
    await user.click(kakaoButton);

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('map.kakao.com'),
      '_blank'
    );
  });

  it('네이버지도 버튼 클릭 시 올바른 URL로 연다', async () => {
    const user = userEvent.setup();
    render(<MapBlock {...mockMapData} />);

    const naverButton = screen.getByRole('button', { name: /네이버지도/i });
    await user.click(naverButton);

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('map.naver.com'),
      '_blank'
    );
  });
});
