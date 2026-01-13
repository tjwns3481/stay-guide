import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WifiBlock } from '@/components/guidebook/WifiBlock';
import { vi } from 'vitest';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('WifiBlock', () => {
  const mockWifiData = {
    ssid: 'MinjisHouse_5G',
    password: 'welcome2024!',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('와이파이 이름(SSID)을 표시한다', () => {
    render(<WifiBlock ssid={mockWifiData.ssid} password={mockWifiData.password} />);

    expect(screen.getByText('와이파이')).toBeInTheDocument();
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText(mockWifiData.ssid)).toBeInTheDocument();
  });

  it('비밀번호를 표시한다', () => {
    render(<WifiBlock ssid={mockWifiData.ssid} password={mockWifiData.password} />);

    expect(screen.getByText('비밀번호')).toBeInTheDocument();
    expect(screen.getByText(mockWifiData.password)).toBeInTheDocument();
  });

  it('복사 버튼 클릭 시 클립보드에 복사한다', async () => {
    render(<WifiBlock ssid={mockWifiData.ssid} password={mockWifiData.password} />);

    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockWifiData.password);
    });
  });

  it('복사 성공 시 피드백을 표시한다', async () => {
    render(<WifiBlock ssid={mockWifiData.ssid} password={mockWifiData.password} />);

    const copyButton = screen.getByRole('button');

    // 초기에는 Copy 아이콘이 있어야 함
    expect(copyButton.querySelector('svg')).toBeInTheDocument();

    fireEvent.click(copyButton);

    // 복사 후 Check 아이콘으로 변경되어야 함
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('추가 안내사항을 표시한다', () => {
    const instructions = '와이파이가 안될 경우 공유기를 재부팅해주세요.';
    render(
      <WifiBlock
        ssid={mockWifiData.ssid}
        password={mockWifiData.password}
        instructions={instructions}
      />
    );

    expect(screen.getByText(instructions)).toBeInTheDocument();
  });
});
