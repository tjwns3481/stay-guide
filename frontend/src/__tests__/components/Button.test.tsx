import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('children을 렌더링한다', () => {
      render(<Button>클릭</Button>)
      expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument()
    })

    it('기본 variant는 primary이다', () => {
      render(<Button>버튼</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-500')
    })

    it('기본 size는 md이다', () => {
      render(<Button>버튼</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11') // 44px 모바일 터치 영역 보장
    })
  })

  describe('variant 스타일', () => {
    it('primary variant 스타일이 적용된다', () => {
      render(<Button variant="primary">Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-500', 'text-white')
    })

    it('secondary variant 스타일이 적용된다', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-primary-500', 'text-primary-500')
    })

    it('ghost variant 스타일이 적용된다', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary-500', 'bg-transparent')
    })
  })

  describe('size 스타일', () => {
    it('lg size 스타일이 적용된다', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12', 'px-6', 'text-base')
    })

    it('md size 스타일이 적용된다', () => {
      render(<Button size="md">Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'px-4', 'text-sm') // 44px 모바일 터치 영역 보장
    })

    it('sm size 스타일이 적용된다', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'px-3', 'text-xs') // 44px 모바일 터치 영역 보장
    })
  })

  describe('disabled 상태', () => {
    it('disabled prop이 적용된다', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('disabled 상태에서 클릭 이벤트가 발생하지 않는다', () => {
      const onClick = vi.fn()
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('isLoading 상태', () => {
    it('isLoading이 true면 로딩 스피너가 표시된다', () => {
      render(<Button isLoading>Loading</Button>)
      // Loader2 아이콘은 animate-spin 클래스를 가짐
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('isLoading이 true면 버튼이 disabled 된다', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('isLoading이 false면 로딩 스피너가 표시되지 않는다', () => {
      render(<Button isLoading={false}>Not Loading</Button>)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })
  })

  describe('이벤트 핸들링', () => {
    it('onClick 이벤트가 호출된다', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Click Me</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('여러 번 클릭하면 여러 번 호출된다', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Click Me</Button>)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(onClick).toHaveBeenCalledTimes(3)
    })
  })

  describe('커스텀 className', () => {
    it('추가 className이 적용된다', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('기존 스타일과 커스텀 className이 병합된다', () => {
      render(
        <Button variant="primary" className="extra-style">
          Merged
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-500', 'extra-style')
    })
  })

  describe('ref 전달', () => {
    it('ref가 올바르게 전달된다', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>With Ref</Button>)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('기타 HTML 속성', () => {
    it('type 속성이 전달된다', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('data-testid 속성이 전달된다', () => {
      render(<Button data-testid="custom-button">Test</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })

    it('aria-label 속성이 전달된다', () => {
      render(<Button aria-label="접근성 라벨">Accessible</Button>)
      const button = screen.getByLabelText('접근성 라벨')
      expect(button).toBeInTheDocument()
    })
  })
})
