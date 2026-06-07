import type { ReactNode } from 'react'

type ResponsiveTableProps = {
  children: ReactNode
  label: string
  className?: string
}

export default function ResponsiveTable({
  children,
  label,
  className = '',
}: ResponsiveTableProps) {
  return (
    <div
      role="region"
      aria-label={label}
      className={`overflow-x-auto rounded-xl border border-brand-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/30 ${className}`}
    >
      {children}
    </div>
  )
}
