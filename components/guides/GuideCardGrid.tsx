import Link from 'next/link'

export type GuideCard = {
  /** Destination href (absolute, real route). */
  href: string
  title: string
  /** Optional one-line "why read this" description. */
  desc?: string
}

/**
 * GuideCardGrid — the standard two-up card grid for hub pages.
 *
 * Used for the "best first reads" and "comparisons" sections of a hub. A card
 * is a title + a short editorial reason to read it (not a generic blurb).
 *
 * Reuse: pass an array of {href, title, desc}. Shared by every goal hub so the
 * card styling stays identical site-wide. For the top-of-hub decision routing,
 * use DecisionRouter instead.
 */
export function GuideCardGrid({ cards }: { cards: GuideCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="rounded-xl border-2 border-brand-900/12 bg-white p-5 shadow-[0_1px_2px_rgba(13,23,18,0.06)] transition hover:border-brand-700/30 hover:shadow-md dark:border-white/10 dark:bg-[var(--surface-card)]"
        >
          <h3 className="font-bold text-ink">{card.title}</h3>
          {card.desc ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.desc}</p> : null}
        </Link>
      ))}
    </div>
  )
}

export default GuideCardGrid
