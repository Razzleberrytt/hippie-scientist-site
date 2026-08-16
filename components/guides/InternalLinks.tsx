import Link from 'next/link'
import type { GuideInternalLink, InternalLinkType } from '@/lib/schemas/guide-schemas'

const TYPE_LABELS: Record<InternalLinkType, string> = {
  herb: 'Herb Profile',
  compound: 'Compound',
  guide: 'Guide',
  goal: 'Goal',
  compare: 'Compare',
}

interface Props {
  links: GuideInternalLink[]
  heading?: string
}

export default function InternalLinks({ links, heading = 'Related Resources' }: Props) {
  if (!links.length) return null

  return (
    <section className="border-y border-[color:var(--hs-hairline-strong)] py-6">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow-label">Explore further</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[color:var(--hs-ink)]">{heading}</h2>
        </div>
        <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--hs-body)] sm:inline">
          {links.length} selected
        </span>
      </div>

      <div className="divide-y divide-[color:var(--hs-hairline)]">
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className="group grid gap-3 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4"
          >
            <span className="font-display text-sm tabular-nums text-[color:var(--hs-gold)]">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--tone-ink)]">
                {TYPE_LABELS[link.type]}
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--hs-ink)] transition group-hover:text-[color:var(--tone-ink)]">
                {link.label}
              </p>
              {link.description ? (
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[color:var(--hs-body)]">
                  {link.description}
                </p>
              ) : null}
            </div>

            <span
              aria-hidden="true"
              className="hidden pt-4 text-lg text-[color:var(--hs-body)] transition group-hover:translate-x-1 group-hover:text-[color:var(--hs-gold)] sm:block"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
