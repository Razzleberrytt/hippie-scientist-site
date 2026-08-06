import Link from 'next/link'
import { getCompoundSourceHerbs } from '@/lib/herb-compound-links'
import { getCompoundBySlug } from '@/lib/runtime-data'
import { getAtlasProfileLinks } from '@/lib/atlas-profile-links'
import type { RuntimeRecord } from '@/types/content'

type CompoundSourceHerbsProps = {
  compoundSlug: string
  compoundName?: string
}

/**
 * Renders botanicals that contain a compound plus data-driven pathways into
 * the Botanical Activity Atlas. Compounds without botanical relevance do not
 * receive a generic atlas link merely because this shared module rendered.
 */
export default async function CompoundSourceHerbs({
  compoundSlug,
  compoundName,
}: CompoundSourceHerbsProps) {
  const [sourceHerbs, compound] = await Promise.all([
    getCompoundSourceHerbs(compoundSlug, compoundName),
    getCompoundBySlug(compoundSlug),
  ])

  const candidateAtlasLinks = compound
    ? getAtlasProfileLinks(compound as RuntimeRecord)
    : []
  const hasSpecificAtlasPath = candidateAtlasLinks.some(
    (link) => link.href !== '/tools/botanical-activity-atlas/',
  )
  const atlasLinks = hasSpecificAtlasPath || sourceHerbs.length > 0
    ? candidateAtlasLinks
    : []

  if (sourceHerbs.length === 0 && atlasLinks.length === 0) return null

  return (
    <section className="card-premium space-y-4 p-4 sm:p-5" aria-labelledby="compound-discovery-heading">
      <div className="space-y-1">
        <h2 id="compound-discovery-heading" className="text-lg font-bold text-ink">
          Botanical Context
        </h2>
        <p className="text-sm text-muted">
          Source botanicals and comparison guides related to {compoundName || 'this compound'}.
        </p>
      </div>

      {sourceHerbs.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Found in</h3>
          <ul className="space-y-2">
            {sourceHerbs.map((link) => (
              <li key={link.slug}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center justify-between rounded-xl border border-brand-900/10 bg-white px-3 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-700/30 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
                >
                  <span>{link.anchor}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {atlasLinks.length > 0 ? (
        <div className="space-y-2 border-t border-brand-900/10 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Compare active botanicals</h3>
          <ul className="grid gap-2 sm:grid-cols-3">
            {atlasLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex h-full min-h-11 flex-col justify-center rounded-xl border border-emerald-900/10 bg-emerald-50/60 px-3 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40"
                >
                  <span>{link.label}</span>
                  <span className="mt-0.5 text-xs font-normal text-emerald-900/70">{link.reason}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
