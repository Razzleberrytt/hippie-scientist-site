import type { ReactNode } from 'react'

export default function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`ds-card border border-[var(--border-default)] bg-[var(--surface-2)] ${className}`}>{children}</div>
}
