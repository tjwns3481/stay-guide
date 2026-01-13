import { render, screen } from '@testing-library/react';
import { CheckinBlock } from '@/components/guidebook/CheckinBlock';

describe('CheckinBlock', () => {
  it('체크인 시간을 표시한다', () => {
    render(
      <CheckinBlock
        checkinTime="15:00"
        checkoutTime="11:00"
      />
    );

    expect(screen.getByText('체크인')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('체크아웃 시간을 표시한다', () => {
    render(
      <CheckinBlock
        checkinTime="15:00"
        checkoutTime="11:00"
      />
    );

    expect(screen.getByText('체크아웃')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('추가 안내사항을 표시한다', () => {
    const instructions = '체크인 시 호스트에게 연락 부탁드립니다.';
    render(
      <CheckinBlock
        checkinTime="15:00"
        checkoutTime="11:00"
        instructions={instructions}
      />
    );

    expect(screen.getByText(instructions)).toBeInTheDocument();
  });
});
