import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type BadgeVariant = 'default' | 'teal' | 'amber' | 'violet'

type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/8 text-white/55 border-white/16',
  teal: 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]/70 border-[var(--accent-teal)]/20',
  amber: 'bg-amber-400/10 text-amber-300/70 border-amber-400/20',
  violet: 'bg-violet-400/10 text-violet-300/70 border-violet-400/20',
}

const sizeClasses = 'rounded-full border px-2 py-0.5 text-[0.7rem] font-medium'

export default function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span className={`${sizeClasses} ${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
