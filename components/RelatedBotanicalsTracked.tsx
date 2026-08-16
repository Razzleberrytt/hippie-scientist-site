'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import {
  trackRelatedBotanicalClick,
  trackRelatedBotanicalCompare,
  trackRelatedBotanicalsShown,
  type RelatedBotanicalTrackingItem,
} from '@/lib/relatedBotanicalTracking'

type DisplayReason = {
  type: string
  label: string
  values: string[]
}

type RelatedBotanicalCard = {
  slug: string
  name: string
  scientificName?: string
  score: number
  compareHref?: string
  reasons: DisplayReason[]
}

type Props = {
  sourceSlug: string
  matches: RelatedBotanicalCard[]
}

export default function RelatedBotanicalsTracked({ sourceSlug, matches }: Props) {
  const trackingItems = useMemo<RelatedBotanicalTrackingItem[]>(() =>
    matches.map((match, index) => ({
      slug: match.slug,
      position: index + 1,
      score: match.score,
      reasonTypes: match.reasons.map((reason) => reason.type),
    })), [matches])

  useEffect(() => {
    trackRelatedBotanicalsShown(sourceSlug, trackingItems)
  }, [sourceSlug, trackingItems])

  if (!matches.length) return null

  return (
    <section
      className="border-y border-[color:var(--hs-hairline-strong)] py-5"
      aria-labelledby="related-botanicals-heading"
    >
      <div className="space-y-1">
        <p id="related-botanicals-heading" className="eyebrow-label">
          Related botanicals
        </p>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--hs-body)]">
          Ranked from shared effects and chemistry. These are research-navigation links, not treatment recommendations.
        </p>
      </div>

      <div className="mt-4 divide-y divide-[color:var(--hs-hairline)] border-t border-[color:var(--hs-hairline)]">
        {matches.map((match, index) => (
          <article
            key={match.slug}
            className="grid gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4"
          >
            <span className="font-display text-sm tabular-nums text-[color:var(--hs-gold)]" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="min-w-0">
              <div>
                <h3 className="font-bold text-[color:var(--hs-ink)]">{match.name}</h3>
                {match.scientificName ? (
                  <p className="mt-0.5 text-xs italic text-[color:var(--hs-body)]">{match.scientificName}</p>
                ) : null}
              </div>

              {match.reasons.length > 0 ? (
                <dl className="mt-3 space-y-1.5 text-xs leading-5 text-[color:var(--hs-body)]">
                  {match.reasons.map((reason) => (
                    <div key={`${match.slug}:${reason.type}`} className="grid gap-0.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3">
                      <dt className="font-semibold text-[color:var(--hs-ink)]">{reason.label}</dt>
                      <dd>{reason.values.slice(0, 3).join(', ')}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
              <Link
                href={`/herbs/${match.slug}/`}
                prefetch={false}
                onClick={() => trackRelatedBotanicalClick(sourceSlug, trackingItems[index])}
                className="inline-flex min-h-10 items-center text-xs font-bold text-[color:var(--tone-ink)] underline decoration-[color:var(--hs-hairline-strong)] underline-offset-4 transition hover:decoration-[color:var(--hs-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
              >
                Explore profile →
              </Link>
              {match.compareHref ? (
                <Link
                  href={match.compareHref}
                  prefetch={false}
                  onClick={() => trackRelatedBotanicalCompare(sourceSlug, trackingItems[index], match.compareHref!)}
                  className="inline-flex min-h-10 items-center text-xs font-bold text-[color:var(--hs-body)] underline-offset-4 transition hover:text-[color:var(--tone-ink)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
                >
                  Compare ↔
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
