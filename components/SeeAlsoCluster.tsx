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
  'american-ginseng': 'panax-quinquefolius',
  'asian-ginseng': 'panax-ginseng',
  coffee: 'coffea-arabica',
  'green-tea': 'camellia-sinensis',
  'st-johns-wort': 'hypericum-perforatum',
}

function formatReason(match: RelatedBotanicalMatch) {
  return match.reasons
    .filter((reason) => reason.type !== 'safety')
    .slice(0, 2)
    .map((reason) => reason.label)
    .join(' · ')
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
      clusterGoalHref: cluster.goalHref,
      entries: seeAlso.filter((entry) => entry.clusterId === cluster.id),
    }))
    .filter((group) => group.entries.length > 0)

  if (grouped.length === 0 && relatedMatches.length === 0) return null

  return (
    <section className={className} aria-label='Related research'>
      {relatedMatches.length > 0 ? (
        <div className='mb-6'>
          <div className='mb-3'>
            <p className='text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-200'>Related Botanicals</p>
            <p className='mt-1 text-sm leading-6 text-muted'>Deterministic research-navigation links based on shared effects and chemistry. These are not treatment recommendations.</p>
          </div>
          <RelatedBotanicalsTracked sourceSlug={relatedSourceSlug} matches={relatedMatches.map((match) => ({
            slug: match.botanical.slug,
            name: match.botanical.name,
            scientificName: match.botanical.scientificName,
            score: match.score,
            reasonTypes: match.reasons.map((reason) => reason.type),
            reasonLabel: formatReason(match),
            compareSlug: getValidComparisonSlug(relatedSourceSlug, match.botanical.slug),
          }))} />
        </div>
      ) : null}

      {grouped.length > 0 ? (
        <div className='space-y-5'>
          {grouped.map((group) => (
            <div key={group.clusterId}>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <p className='text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-200'>{group.clusterLabel}</p>
                <Link href={group.clusterGoalHref} className='text-xs font-semibold text-brand-700 hover:underline dark:text-brand-100'>Explore goal →</Link>
              </div>
              <ul className='mt-2 grid gap-2 sm:grid-cols-2'>
                {group.entries.map((entry) => (
                  <li key={`${group.clusterId}:${entry.kind}:${entry.slug}`}>
                    <Link href={entry.href} className='block rounded-xl border border-brand-900/10 bg-white/80 px-3 py-2 text-sm font-semibold text-ink transition hover:border-brand-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'>
                      {entry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
