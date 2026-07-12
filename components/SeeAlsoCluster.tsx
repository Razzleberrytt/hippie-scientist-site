/**
 * SeeAlsoCluster — "See also in cluster" module.
 *
 * Renders chip-style links to related herbs/compounds in the same semantic
 * cluster(s) as the current profile. Groups by cluster and links to the
 * relevant goal page for the full cluster context.
 *
 * Server component — no client state, no side effects.
 *
 * Usage (herb page):
 *   <SeeAlsoCluster slug={normalizedSlug} kind="herb" />
 *
 * Usage (compound page):
 *   <SeeAlsoCluster slug={slug} kind="compound" limit={8} />
 */

import Link from 'next/link'
import { getClusterSeeAlso, getEntityClusters } from '@/lib/cluster-linking'
import type { EntityKind } from '@/lib/schema'

type SeeAlsoClusterProps = {
  slug: string
  kind: EntityKind
  /** Max number of "see also" entries to render (default 6). */
  limit?: number
  className?: string
}

export default function SeeAlsoCluster({
  slug,
  kind,
  limit = 6,
  className,
}: SeeAlsoClusterProps) {
  const seeAlso = getClusterSeeAlso(slug, kind, limit)
  const clusters = getEntityClusters(slug, kind)

  if (!seeAlso.length || !clusters.length) return null

  // Group entries by cluster for display
  type GroupedEntry = {
    clusterId: string
    clusterLabel: string
    clusterGoalHref: string
    entries: typeof seeAlso
  }

  const grouped: GroupedEntry[] = clusters.map((cluster) => ({
    clusterId: cluster.id,
    clusterLabel: cluster.label,
    clusterGoalHref: `/goals/${cluster.goalSlug}`,
    entries: seeAlso.filter((e) => e.cluster === cluster.id),
  })).filter((g) => g.entries.length > 0)

  if (!grouped.length) return null

  return (
    <section
      className={`rounded-2xl border border-brand-900/10 bg-white/80 p-4 sm:p-5 space-y-4 ${className ?? ''}`}
      aria-labelledby='see-also-cluster-heading'
    >
      <div className='flex items-center justify-between gap-2 flex-wrap'>
        <p
          id='see-also-cluster-heading'
          className='text-[10px] font-bold uppercase tracking-wider text-brand-700'
        >
          Also in this cluster
        </p>
        {grouped.length === 1 && (
          <Link
            href={grouped[0].clusterGoalHref}
            className='text-[10px] font-semibold text-brand-600 hover:text-brand-800 hover:underline transition'
          >
            {grouped[0].clusterLabel} guide →
          </Link>
        )}
      </div>

      {grouped.map((group) => (
        <div key={group.clusterId} className='space-y-2'>
          {grouped.length > 1 && (
            <div className='flex items-center justify-between gap-2'>
              <p className='text-[10px] font-semibold uppercase tracking-wider text-muted'>
                {group.clusterLabel}
              </p>
              <Link
                href={group.clusterGoalHref}
                className='text-[10px] font-semibold text-brand-600 hover:text-brand-800 hover:underline transition'
              >
                Full guide →
              </Link>
            </div>
          )}
          <div className='flex gap-2 overflow-x-auto pb-1.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]'>
            {group.entries.map((entry) => (
              <Link
                key={`${entry.kind}:${entry.slug}`}
                href={entry.href}
                title={entry.reason}
                className='shrink-0 whitespace-nowrap rounded-full border border-brand-900/10 bg-brand-50/50 px-3 py-1.5 text-xs font-semibold capitalize text-brand-800 hover:bg-brand-50 transition'
              >
                {entry.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
