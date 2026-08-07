/**
 * SeeAlsoCluster — profile discovery module.
 *
 * Herb profiles get an evidence-aware Related Botanicals block powered by the
 * deterministic relationship engine, followed by the existing semantic-cluster
 * navigation. Compound profiles keep the cluster navigation only.
 *
 * Server component — no client state, no side effects.
 */

import Link from 'next/link'
import { getClusterSeeAlso, getEntityClusters } from '@/lib/cluster-linking'
import { getBotanicalAtlasRecords } from '@/lib/botanical-atlas-data'
import { getRelatedBotanicals, type RelatedBotanicalMatch } from '@/lib/related-botanicals'
import type { EntityKind } from '@/lib/schema'

type SeeAlsoClusterProps = {
  slug: string
  kind: EntityKind
  /** Max number of semantic-cluster entries to render (default 6). */
  limit?: number
  className?: string
}

const HERB_SOURCE_ALIASES: Record<string, string> = {
  'lions-mane': 'hericium-erinaceus',
  passionflower: 'passiflora-incarnata',
  kava: 'piper-methysticum',
  'ashwagandha-withania-somnifera': 'ashwagandha',
}

function meaningfulReasons(match: RelatedBotanicalMatch) {
  const preferred = match.reasons.filter((reason) =>
    reason.type === 'compound' || reason.type === 'compound-class' || reason.type === 'explicit-effect',
  )
  const fallback = match.reasons.filter((reason) => reason.type !== 'safety')
  return (preferred.length ? preferred : fallback).slice(0, 2)
}

function RelatedBotanicals({ matches }: { matches: RelatedBotanicalMatch[] }) {
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
        {matches.map((match) => {
          const reasons = meaningfulReasons(match)
          return (
            <Link
              key={match.record.slug}
              href={`/herbs/${match.record.slug}/`}
              className="group rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-4 transition hover:border-brand-600/30 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-ink group-hover:text-brand-800">{match.record.name}</h3>
                {match.record.scientificName ? (
                  <p className="text-xs italic text-muted">{match.record.scientificName}</p>
                ) : null}
              </div>

              {reasons.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Why related</p>
                  {reasons.map((reason) => (
                    <div key={`${match.record.slug}:${reason.type}`} className="text-xs leading-5 text-muted">
                      <span className="font-semibold text-ink">{reason.label}:</span>{' '}
                      {reason.values.slice(0, 3).join(', ')}
                    </div>
                  ))}
                </div>
              ) : null}

              <p className="mt-3 text-xs font-bold text-brand-800">Explore profile →</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default async function SeeAlsoCluster({
  slug,
  kind,
  limit = 6,
  className,
}: SeeAlsoClusterProps) {
  const seeAlso = getClusterSeeAlso(slug, kind, limit)
  const clusters = getEntityClusters(slug, kind)

  let relatedMatches: RelatedBotanicalMatch[] = []
  if (kind === 'herb') {
    const atlasRecords = await getBotanicalAtlasRecords()
    const sourceSlug = HERB_SOURCE_ALIASES[slug] ?? slug
    const source = atlasRecords.find((record) => record.slug === sourceSlug)
    if (source) relatedMatches = getRelatedBotanicals(source, atlasRecords, 3)
  }

  type GroupedEntry = {
    clusterId: string
    clusterLabel: string
    clusterGoalHref: string
    entries: typeof seeAlso
  }

  const grouped: GroupedEntry[] = clusters
    .map((cluster) => ({
      clusterId: cluster.id,
      clusterLabel: cluster.label,
      clusterGoalHref: `/goals/${cluster.goalSlug}`,
      entries: seeAlso.filter((entry) => entry.cluster === cluster.id),
    }))
    .filter((group) => group.entries.length > 0)

  if (!relatedMatches.length && !grouped.length) return null

  const guideLinkClass =
    'inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2'

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <RelatedBotanicals matches={relatedMatches} />

      {grouped.length > 0 ? (
        <section
          className="space-y-4 rounded-2xl border border-brand-900/10 bg-white/80 p-4 sm:p-5"
          aria-labelledby="see-also-cluster-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              id="see-also-cluster-heading"
              className="text-xs font-bold uppercase tracking-wider text-brand-700"
            >
              Also in this cluster
            </p>
            {grouped.length === 1 ? (
              <Link href={grouped[0].clusterGoalHref} className={guideLinkClass}>
                {grouped[0].clusterLabel} guide →
              </Link>
            ) : null}
          </div>

          {grouped.map((group) => (
            <div key={group.clusterId} className="space-y-2">
              {grouped.length > 1 ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {group.clusterLabel}
                  </p>
                  <Link href={group.clusterGoalHref} className={guideLinkClass}>
                    Full guide →
                  </Link>
                </div>
              ) : null}
              <div className="flex gap-2 overflow-x-auto pb-1.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
                {group.entries.map((entry) => (
                  <Link
                    key={`${entry.kind}:${entry.slug}`}
                    href={entry.href}
                    title={entry.reason}
                    className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border border-brand-900/10 bg-brand-50/50 px-3.5 text-sm font-semibold capitalize text-brand-800 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    {entry.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}
