import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type BadgeVariant = 'default' | 'teal' | 'amber' | 'violet'

type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)]',
  teal: 'bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] border-[var(--accent-primary)]/28',
  amber: 'bg-[var(--accent-warning)]/12 text-[var(--accent-warning)] border-[var(--accent-warning)]/28',
  violet: 'bg-[var(--accent-secondary)]/12 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/28',
}

const sizeClasses = 'rounded-full border px-2 py-0.5 text-[0.72rem] font-medium'

export default function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span className={`${sizeClasses} ${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
