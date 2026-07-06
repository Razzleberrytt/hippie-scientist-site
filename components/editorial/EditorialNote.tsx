import type { ReactNode } from 'react'

type Variant = 'default' | 'caution' | 'positive' | 'neutral'

const VARIANT: Record<Variant, string> = {
  default: 'border-l-brand-700/50 bg-brand-50/60 text-ink dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]',
  positive:
    'border-l-emerald-500/60 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-900/20 dark:text-emerald-100',
  caution:
    'border-l-amber-500/60 bg-amber-50/70 text-amber-950 dark:bg-amber-900/20 dark:text-amber-100',
  neutral: 'border-l-slate-400/50 bg-slate-50 text-ink dark:bg-white/5 dark:text-[var(--text-secondary)]',
}

/**
 * EditorialNote — a short, trust-building callout in the publication's voice.
 * Use sparingly: a single honest aside, not a decorative box.
 *
 * MDX usage:
 *   <EditorialNote variant="caution">
 *   Supplements are most useful matched to the actual problem — and none of
 *   them replaces care for a diagnosed condition.
 *   </EditorialNote>
 */
export function EditorialNote({
  children,
  variant = 'default',
}: {
  children: ReactNode
  variant?: Variant
}) {
  return (
    <aside
      className={`not-prose my-6 rounded-xl border-l-4 p-4 text-sm leading-7 ${VARIANT[variant]}`}
    >
      <span className="mr-1.5 font-bold">Editor's note:</span>
      {children}
    </aside>
  )
}

export default EditorialNote
