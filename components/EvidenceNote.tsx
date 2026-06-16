import type { ReactNode } from 'react'

type EvidenceNoteProps = {
  children: ReactNode
  className?: string
}

export function EvidenceNote({ children, className = '' }: EvidenceNoteProps) {
  return (
    <aside
      className={`rounded-xl border border-blue-700/20 bg-blue-50/80 px-4 py-3 text-blue-950 dark:border-blue-300/25 dark:bg-blue-950/35 dark:text-blue-50 ${className}`}
      role="note"
      aria-label="Evidence note"
    >
      <p className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-100">
        Evidence Note
      </p>
      <div className="mt-2 text-sm leading-6 text-blue-950 dark:text-blue-50 [&>p]:text-blue-950 dark:[&>p]:text-blue-50">
        {children}
      </div>
    </aside>
  )
}
