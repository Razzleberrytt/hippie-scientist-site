import type { ReactNode } from 'react'

/**
 * HubSectionHeading — the standard section header for guide hub pages.
 *
 * An eyebrow label + title (+ optional sub) used to separate the decision
 * sections of a hub ("Start here", "Comparisons", "Full library", …). Keeps
 * every goal hub (sleep, anxiety, stress, focus) visually consistent.
 *
 * Reuse: import and place above each hub section grid. Do not hand-roll
 * section headers on hub pages — use this so spacing and type scale stay uniform.
 */
export function HubSectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string
  title: string
  sub?: ReactNode
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">{title}</h2>
      {sub ? <p className="mt-1.5 text-sm leading-6 text-muted">{sub}</p> : null}
    </div>
  )
}

export default HubSectionHeading
