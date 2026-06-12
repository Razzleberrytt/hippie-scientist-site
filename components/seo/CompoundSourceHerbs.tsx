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
            <Link href={link.href} className="text-sm font-semibold text-brand-800 hover:underline">
              {link.anchor}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
