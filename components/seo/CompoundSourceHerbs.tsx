import Link from 'next/link'
import { getCompoundSourceHerbs } from '@/lib/herb-compound-links'

type CompoundSourceHerbsProps = {
  compoundSlug: string
  compoundName?: string
}

/**
 * Renders the source herbs that contain a compound as keyword-rich internal
 * links (reverse lookup of the curated relationship map). Renders nothing when
 * the compound has no mapped (renderable) source herbs.
 */
export default async function CompoundSourceHerbs({
  compoundSlug,
  compoundName,
}: CompoundSourceHerbsProps) {
  const links = await getCompoundSourceHerbs(compoundSlug, compoundName)
  if (links.length === 0) return null

  return (
    <section className="card-premium p-4 sm:p-5 space-y-3" aria-labelledby="source-herbs-heading">
      <div className="space-y-1">
        <h2 id="source-herbs-heading" className="text-lg font-bold text-ink">
          Found In
        </h2>
        <p className="text-sm text-muted">
          Botanicals that contain {compoundName || 'this compound'}, with full herb profiles.
        </p>
      </div>
      <ul className="space-y-2">
        {links.map((link) => (
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
    </section>
  )
}
