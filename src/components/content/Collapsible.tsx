import type { ReactNode } from 'react'

type CollapsibleProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export default function Collapsible({ title, children, defaultOpen = false, className = '' }: CollapsibleProps) {
  return (
    <details
      open={defaultOpen}
      className={`group rounded-xl border border-brand-900/10 bg-white/90 shadow-sm ${className}`}
    >
      <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-5 py-4 font-semibold text-ink transition hover:bg-brand-50/40 rounded-xl group-open:rounded-b-none">
        <span>{title}</span>
        <span
          className="flex-shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          v
        </span>
      </summary>
      <div className="px-5 pb-5 pt-3 text-sm leading-7 text-[#46574d] border-t border-brand-900/10">
        {children}
      </div>
    </details>
  )
}
