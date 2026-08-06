import Link from 'next/link'
import { getHerbCompoundLinks } from '@/lib/herb-compound-links'
import { getHerbBySlug } from '@/lib/runtime-data'
import { getAtlasProfileLinks } from '@/lib/atlas-profile-links'
import type { RuntimeRecord } from '@/types/content'

type HerbCompoundLinksProps = {
  herbSlug: string
  herbName?: string
}

/**
 * Renders active-compound links plus data-driven Botanical Activity Atlas paths.
 * The atlas links are derived from the herb's normalized chemistry, effect, and
 * safety labels, so profiles stay connected without hand-maintained mappings.
 */
export default async function HerbCompoundLinks({ herbSlug, herbName }: HerbCompoundLinksProps) {
  const [links, herb] = await Promise.all([
    getHerbCompoundLinks(herbSlug, herbName),
    getHerbBySlug(herbSlug),
  ])
  const atlasLinks = herb ? getAtlasProfileLinks(herb as RuntimeRecord) : []

  if (links.length === 0 && atlasLinks.length === 0) return null

  return (
    <section className="card-premium space-y-4 p-4 sm:p-5" aria-labelledby="active-compounds-heading">
      {links.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 id="active-compounds-heading" className="text-lg font-bold text-ink">
              Active Compounds
            </h2>
            <p className="text-sm text-muted">
              Key constituents studied in {herbName || 'this herb'}, with full pharmacology and safety profiles.
            </p>
          </div>
          <ul className="flex gap-2 overflow-x-auto pb-1.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
            {links.map((link) => (
              <li key={link.slug} className="shrink-0">
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-900/10 bg-brand-50/50 px-4 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-700/30 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
                >
                  {link.anchor}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {atlasLinks.length > 0 ? (
        <div className={links.length > 0 ? 'border-t border-brand-900/10 pt-4' : ''}>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-ink">Compare related active botanicals</h2>
            <p className="text-sm text-muted">
              Explore botanicals with similar chemistry, effects, or safety considerations in the Botanical Activity Atlas.
            </p>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {atlasLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group block h-full rounded-xl border border-emerald-900/10 bg-emerald-50/45 px-3.5 py-3 transition hover:border-emerald-700/30 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                  <span className="block text-sm font-bold text-emerald-950 group-hover:underline">{link.label} →</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{link.reason}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
