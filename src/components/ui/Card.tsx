import type { ReactNode } from 'react'

export default function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`ds-card blur-panel card-shell shadow-soft ${className}`}>{children}</div>
}
