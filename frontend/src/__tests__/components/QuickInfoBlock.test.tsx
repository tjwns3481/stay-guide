import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuickInfoBlock } from '@/components/guest/blocks/QuickInfoBlock'

describe('QuickInfoBlock 컴포넌트', () => {
  describe('체크인/아웃 정보', () => {
    it('체크인 시간을 렌더링한다', () => {
      render(<QuickInfoBlock content={{ checkIn: '15:00' }} />)
      expect(screen.getByText('체크인')).toBeInTheDocument()
      expect(screen.getByText('15:00')).toBeInTheDocument()
    })

    it('체크아웃 시간을 렌더링한다', () => {
      render(<QuickInfoBlock content={{ checkOut: '11:00' }} />)
      expect(screen.getByText('체크아웃')).toBeInTheDocument()
      expect(screen.getByText('11:00')).toBeInTheDocument()
    })

    it('체크인/아웃 정보가 없으면 렌더링하지 않는다', () => {
      render(<QuickInfoBlock content={{}} />)
      expect(screen.queryByText('체크인')).not.toBeInTheDocument()
      expect(screen.queryByText('체크아웃')).not.toBeInTheDocument()
    })
  })

  describe('최대 인원', () => {
    it('최대 인원을 렌더링한다', () => {
      render(<QuickInfoBlock content={{ maxGuests: 4 }} />)
      expect(screen.getByText('최대인원')).toBeInTheDocument()
      expect(screen.getByText('4명')).toBeInTheDocument()
    })

    it('최대 인원이 없으면 렌더링하지 않는다', () => {
      render(<QuickInfoBlock content={{}} />)
      expect(screen.queryByText('최대인원')).not.toBeInTheDocument()
    })

    it('숫자가 아닌 값은 렌더링하지 않는다', () => {
      render(<QuickInfoBlock content={{ maxGuests: '4명' }} />)
      expect(screen.queryByText('최대인원')).not.toBeInTheDocument()
    })
  })

  describe('주차 정보', () => {
    it('주차 정보를 렌더링한다', () => {
      render(<QuickInfoBlock content={{ parking: '무료 주차 가능' }} />)
      expect(screen.getByText('주차: 무료 주차 가능')).toBeInTheDocument()
    })

    it('주차 정보가 없으면 렌더링하지 않는다', () => {
      render(<QuickInfoBlock content={{}} />)
      expect(screen.queryByText(/주차:/)).not.toBeInTheDocument()
    })
  })

  describe('주소', () => {
    it('주소를 렌더링한다', () => {
      render(<QuickInfoBlock content={{ address: '서울시 강남구' }} />)
      // 주소 라벨 대신 주소값이 직접 표시됨
      expect(screen.getByText('서울시 강남구')).toBeInTheDocument()
    })

    it('주소가 없으면 렌더링하지 않는다', () => {
      render(<QuickInfoBlock content={{}} />)
      expect(screen.queryByText('서울시 강남구')).not.toBeInTheDocument()
    })
  })

  describe('전체 정보', () => {
    it('모든 정보를 렌더링한다', () => {
      const content = {
        checkIn: '15:00',
        checkOut: '11:00',
        maxGuests: 2,
        parking: '주차 가능',
        address: '제주시 애월읍',
      }

      render(<QuickInfoBlock content={content} />)

      expect(screen.getByText('15:00')).toBeInTheDocument()
      expect(screen.getByText('11:00')).toBeInTheDocument()
      expect(screen.getByText('2명')).toBeInTheDocument()
      expect(screen.getByText('주차: 주차 가능')).toBeInTheDocument()
      expect(screen.getByText('제주시 애월읍')).toBeInTheDocument()
    })

    it('빈 객체를 전달하면 빈 그리드가 렌더링된다', () => {
      const { container } = render(<QuickInfoBlock content={{}} />)
      // 빈 그리드만 렌더링됨 (제목 없이)
      expect(container.querySelector('.grid')).toBeInTheDocument()
    })
  })

  describe('타입 안전성', () => {
    it('잘못된 타입의 값은 무시된다', () => {
      const content = {
        checkIn: 1500, // 숫자 (문자열이어야 함)
        maxGuests: '2', // 문자열 (숫자여야 함)
        parking: { info: '주차' }, // 객체 (문자열이어야 함)
      }

      render(<QuickInfoBlock content={content} />)

      // 잘못된 타입은 렌더링되지 않음
      expect(screen.queryByText('1500')).not.toBeInTheDocument()
      expect(screen.queryByText('2명')).not.toBeInTheDocument()
    })
  })
})
