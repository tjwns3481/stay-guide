'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'lg' | 'md' | 'sm'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary:
        'border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-primary-500',
      ghost:
        'text-primary-500 bg-transparent hover:underline focus:ring-primary-500',
    }

    // 모바일 터치 영역 최소 44px 보장
    const sizes = {
      lg: 'h-12 px-6 text-base rounded-xl',
      md: 'h-11 px-4 text-sm rounded-lg', // 44px
      sm: 'h-11 px-3 text-xs rounded-md', // 44px (모바일 터치 친화적)
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
