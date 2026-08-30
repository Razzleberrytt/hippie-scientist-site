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

/**
 * Compact related-botanical rows.
 *
 * Each match is one editorial row: name, scientific name, the shared signals
 * that produced the match, and its two actions. The previous treatment gave
 * every match a numbered three-column block with a stacked definition list,
 * which cost roughly a phone screen per entry.
 */
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
      className="border-t border-[color:var(--hs-hairline-strong)] pt-4"
      aria-labelledby="related-botanicals-heading"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p id="related-botanicals-heading" className="hs-label">
          Related botanicals
        </p>
        <p className="text-xs leading-5 text-[color:var(--hs-body)]">
          Ranked from shared effects and chemistry — navigation links, not recommendations.
        </p>
      </div>

      <ul className="mt-3 divide-y divide-[color:var(--hs-hairline)] border-t border-[color:var(--hs-hairline)]">
        {matches.map((match, index) => {
          const signals = match.reasons
            .flatMap((reason) => reason.values.slice(0, 2))
            .filter(Boolean)
            .slice(0, 3)

          return (
            <li key={match.slug} className="py-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h3 className="text-sm font-semibold text-[color:var(--hs-ink)]">{match.name}</h3>
                {match.scientificName ? (
                  <span className="text-xs italic text-[color:var(--hs-body)]">{match.scientificName}</span>
                ) : null}
              </div>

              {signals.length > 0 ? (
                <p className="mt-0.5 text-xs leading-5 text-[color:var(--hs-body)]">
                  Shared: {signals.join(' · ')}
                </p>
              ) : null}

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <Link
                  href={`/herbs/${match.slug}/`}
                  prefetch={false}
                  onClick={() => trackRelatedBotanicalClick(sourceSlug, trackingItems[index])}
                  className="inline-flex min-h-11 items-center text-xs font-semibold text-[color:var(--tone-ink)] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
                >
                  Explore profile →
                </Link>
                {match.compareHref ? (
                  <Link
                    href={match.compareHref}
                    prefetch={false}
                    onClick={() => trackRelatedBotanicalCompare(sourceSlug, trackingItems[index], match.compareHref!)}
                    className="inline-flex min-h-11 items-center text-xs font-semibold text-[color:var(--hs-body)] underline-offset-4 transition hover:text-[color:var(--tone-ink)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
                  >
                    Compare ↔
                  </Link>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
