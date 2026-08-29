/**
 * SeeAlsoCluster — profile discovery module.
 *
 * Herb profiles get an evidence-aware Related Botanicals block powered by the
 * deterministic relationship engine, followed by the existing semantic-cluster
 * navigation. Compound profiles keep the cluster navigation only.
 */

import Link from 'next/link'
import { getClusterSeeAlso, getEntityClusters } from '@/lib/cluster-linking'
import { getBotanicalAtlasRecords } from '@/lib/botanical-atlas-data'
import { getRelatedBotanicals, type RelatedBotanicalMatch } from '@/lib/related-botanicals'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import RelatedBotanicalsTracked from '@/components/RelatedBotanicalsTracked'
import type { BotanicalAtlasRecord } from '@/components/atlas/BotanicalActivityAtlasClient'
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

function toTrackedMatches(sourceSlug: string, matches: RelatedBotanicalMatch[]) {
  return matches.map((match) => {
    const comparisonSlug = getValidComparisonSlug(sourceSlug, match.record.slug)
    return {
      slug: match.record.slug,
      name: match.record.name,
      scientificName: match.record.scientificName,
      score: match.score,
      compareHref: comparisonSlug ? `/guides/compare/${comparisonSlug}/` : undefined,
      reasons: meaningfulReasons(match).map((reason) => ({
        type: reason.type,
        label: reason.label,
        values: reason.values,
      })),
    }
  })
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
  let relatedSourceSlug = slug
  if (kind === 'herb') {
    const atlasRecords: BotanicalAtlasRecord[] = await getBotanicalAtlasRecords()
    relatedSourceSlug = HERB_SOURCE_ALIASES[slug] ?? slug
    const source = atlasRecords.find((record: BotanicalAtlasRecord) => record.slug === relatedSourceSlug)
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
    'inline-flex min-h-11 items-center text-xs font-semibold text-[color:var(--tone-ink)] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {relatedMatches.length > 0 ? (
        <RelatedBotanicalsTracked sourceSlug={relatedSourceSlug} matches={toTrackedMatches(relatedSourceSlug, relatedMatches)} />
      ) : null}

      {grouped.length > 0 ? (
        <section
          className="border-t border-[color:var(--hs-hairline-strong)] pt-4"
          aria-labelledby="see-also-cluster-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p id="see-also-cluster-heading" className="hs-label">
              Also in this cluster
            </p>
            {grouped.length === 1 ? (
              <Link href={grouped[0].clusterGoalHref} prefetch={false} className={guideLinkClass}>
                {grouped[0].clusterLabel} guide →
              </Link>
            ) : null}
          </div>

          <div className="mt-2 space-y-3">
            {grouped.map((group) => (
              <div key={group.clusterId}>
                {grouped.length > 1 ? (
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--hs-body)]">
                      {group.clusterLabel}
                    </p>
                    <Link href={group.clusterGoalHref} prefetch={false} className={guideLinkClass}>
                      Full guide →
                    </Link>
                  </div>
                ) : null}

                {/* Chips wrap rather than scroll: on a 320px viewport the rail
                    pushed later entries permanently offscreen. */}
                <ul className={`hs-chips ${grouped.length > 1 ? 'mt-1.5' : 'mt-2'}`}>
                  {group.entries.map((entry) => (
                    <li key={`${entry.kind}:${entry.slug}`}>
                      <Link
                        href={entry.href}
                        prefetch={false}
                        title={entry.reason}
                        className="hs-chip capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
                      >
                        {entry.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
