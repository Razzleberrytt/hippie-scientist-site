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
 *
 * Both groups use the shared editorial primitives: compound names are chips
 * that wrap (long systematic names used to be clipped by a nowrap rail) and the
 * atlas paths are a link list rather than tinted cards, which never met AA
 * contrast in dark mode.
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
        <div className="space-y-2">
          <div className="space-y-1">
            <h2 id="active-compounds-heading" className="font-semibold text-ink">
              Active Compounds
            </h2>
            <p className="hs-sec__intro">
              Key constituents studied in {herbName || 'this herb'}, with full pharmacology and safety profiles.
            </p>
          </div>
          <ul className="hs-chips pt-1">
            {links.map((link) => (
              <li key={link.slug}>
                <Link href={link.href} prefetch={false} className="hs-chip">
                  {link.anchor}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {atlasLinks.length > 0 ? (
        <div className={links.length > 0 ? 'border-t border-[color:var(--hs-hairline)] pt-4' : ''}>
          <div className="space-y-1">
            <h3 className="font-semibold text-ink">Compare related active botanicals</h3>
            <p className="hs-sec__intro">
              Explore botanicals with similar chemistry, effects, or safety considerations in the Botanical Activity Atlas.
            </p>
          </div>
          <ul className="hs-linklist hs-linklist--split mt-2">
            {atlasLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} prefetch={false}>
                  <span>
                    {link.label}
                    <span className="hs-linklist__note">{link.reason}</span>
                  </span>
                  <span aria-hidden="true" className="hs-linklist__arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
