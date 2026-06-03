import type { ReactNode } from 'react'

export default function Toolbar({ children }: { children: ReactNode }) {
  return <div className='ds-card flex flex-wrap items-center gap-3 border border-[var(--border-default)] bg-[var(--surface-2)] p-3 md:p-4'>{children}</div>
}
