import Link from 'next/link'
import { getHerbCompoundLinks } from '@/lib/herb-compound-links'

type HerbCompoundLinksProps = {
  herbSlug: string
  herbName?: string
}

/**
 * Renders the active compounds found in a herb as keyword-rich internal links,
 * sourced from the curated herb-compound relationship map. Renders nothing when
 * the herb has no mapped (renderable) compounds.
 */
export default async function HerbCompoundLinks({ herbSlug, herbName }: HerbCompoundLinksProps) {
  const links = await getHerbCompoundLinks(herbSlug, herbName)
  if (links.length === 0) return null

  return (
    <section className="card-premium space-y-3 p-4 sm:p-5" aria-labelledby="active-compounds-heading">
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
    </section>
  )
}
