'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import {
  trackRelatedBotanicalClick,
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
      className="space-y-4 rounded-2xl border border-brand-900/10 bg-white/80 p-4 sm:p-5"
      aria-labelledby="related-botanicals-heading"
    >
      <div className="space-y-1">
        <p id="related-botanicals-heading" className="text-xs font-bold uppercase tracking-wider text-brand-700">
          Related botanicals
        </p>
        <p className="text-sm leading-6 text-muted">
          Ranked from shared effects and chemistry. These are research-navigation links, not treatment recommendations.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {matches.map((match, index) => (
          <Link
            key={match.slug}
            href={`/herbs/${match.slug}/`}
            onClick={() => trackRelatedBotanicalClick(sourceSlug, trackingItems[index])}
            className="group rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-4 transition hover:border-brand-600/30 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-ink group-hover:text-brand-800">{match.name}</h3>
              {match.scientificName ? <p className="text-xs italic text-muted">{match.scientificName}</p> : null}
            </div>

            {match.reasons.length > 0 ? (
              <div className="mt-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Why related</p>
                {match.reasons.map((reason) => (
                  <div key={`${match.slug}:${reason.type}`} className="text-xs leading-5 text-muted">
                    <span className="font-semibold text-ink">{reason.label}:</span>{' '}
                    {reason.values.slice(0, 3).join(', ')}
                  </div>
                ))}
              </div>
            ) : null}

            <p className="mt-3 text-xs font-bold text-brand-800">Explore profile →</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
