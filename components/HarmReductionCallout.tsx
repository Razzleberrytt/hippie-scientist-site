import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

type HarmReductionCalloutProps = {
  children: ReactNode
  className?: string
}

export function HarmReductionCallout({
  children,
  className = '',
}: HarmReductionCalloutProps) {
  return (
    <aside
      className={`rounded-[0.85rem] border border-amber-700/25 bg-amber-50/80 px-4 py-3 text-amber-950 dark:border-amber-300/25 dark:bg-amber-950/35 dark:text-amber-50 ${className}`}
      role="note"
      aria-label="Harm reduction callout"
    >
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-100">
        <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        Harm Reduction
      </p>
      <div className="mt-2 text-sm leading-6 text-amber-950 dark:text-amber-50 [&>p]:text-amber-950 dark:[&>p]:text-amber-50">
        {children}
      </div>
    </aside>
  )
}
