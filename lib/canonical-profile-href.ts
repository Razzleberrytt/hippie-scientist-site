import { DEPRECATED_COMPOUND_CANONICALS } from './deprecated-compound-canonicals'
import { CROSS_TAXONOMY_REDIRECT_SLUGS, DEPRECATED_HERB_CANONICALS } from './deprecated-herb-canonicals'

/**
 * Resolve a profile slug to the URL that actually serves it.
 *
 * Generated artifacts (`public/data/runtime-maps`, `interaction_edges.json`,
 * the search index) are built from the full workbook slug set, which still
 * contains slugs that only exist to be 301'd — `saw-palmetto` → `serenoa-repens`,
 * `garlic-extract` → `/herbs/garlic`, `theanine` → `l-theanine`. Rendering those
 * slugs as links makes the site point at its own redirects: every click and every
 * crawl takes an extra hop, the link equity is diluted through the redirect, and
 * for a source whose record is noindexed the crawler is sent to a URL that can
 * never be indexed.
 *
 * Call this wherever a generated slug becomes an `href`.
 */
export function canonicalProfileHref(segment: 'herbs' | 'compounds', slug: string): string {
  const normalized = String(slug || '').trim().toLowerCase()
  if (!normalized) return `/${segment}/`

  if (segment === 'herbs') {
    const canonical = DEPRECATED_HERB_CANONICALS[normalized]
    if (!canonical) return `/herbs/${normalized}/`
    // tyrosine is an amino-acid compound, not a botanical profile.
    return CROSS_TAXONOMY_REDIRECT_SLUGS.has(normalized)
      ? `/compounds/${canonical}/`
      : `/herbs/${canonical}/`
  }

  const canonical = DEPRECATED_COMPOUND_CANONICALS[normalized]
  if (!canonical) return `/compounds/${normalized}/`
  // Compound canonicals are either a bare slug or an absolute cross-taxonomy path.
  return canonical.startsWith('/') ? `${canonical}/` : `/compounds/${canonical}/`
}

/** As above, but rewriting an existing `/herbs/...` or `/compounds/...` href. */
export function canonicalizeProfileHref(href: string): string {
  const match = /^\/(herbs|compounds)\/([^/?#]+)\/?$/.exec(String(href || ''))
  if (!match) return href
  return canonicalProfileHref(match[1] as 'herbs' | 'compounds', match[2])
}
