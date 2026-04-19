import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from '@/lib/motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost:
    'border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
  danger:
    'border border-[var(--accent-danger)]/50 bg-[var(--accent-danger)]/12 text-[var(--text-primary)] hover:bg-[var(--accent-danger)]/18',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

const MotionButton = motion.button

function Spinner() {
  return (
    <span
      aria-hidden='true'
      className='inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent'
    />
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <MotionButton
      whileTap={{ scale: 0.99 }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'cursor-not-allowed opacity-60' : ''} ${className}`.trim()}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </MotionButton>
  )
}
