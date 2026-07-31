// Single source of truth for herb slugs that 301-redirect to a canonical
// profile (see public/_redirects and app/sitemap.ts). Source slugs are
// excluded from generateStaticParams and from the /herbs browse/index
// artifacts so the site never links to a redirected URL.
//
// Most targets are canonical herb slugs. Cross-taxonomy entries (currently
// tyrosine) are paired with an explicit public/_redirects rule to the correct
// compound URL and are always hidden from herb browse/index artifacts.
export const DEPRECATED_HERB_CANONICALS: Record<string, string> = {
  'allium-sativum': 'garlic',
  'valeriana-officinalis': 'valerian',
  'hericium-erinaceus': 'lions-mane',
  'passiflora-incarnata': 'passionflower',
  'piper-methysticum': 'kava',
  'ganoderma-lucidum': 'reishi',
  // Duplicate / thin near-identical profiles consolidated to a single canonical.
  'berberis-vulgaris': 'berberis',
  'berberis-aristata': 'berberis',
  'coptis-chinensis': 'coptis',
  'boswellia-carterii': 'boswellia-serrata',
  'morus-alba': 'mulberry-leaf',
  phellodendron: 'phellodendron-amurense',
  'astragalus-membranaceus': 'astragalus',
  'atractylodes-macrocephala': 'atractylodes',
  'angelica-sinensis': 'dong-quai',
  'angelica-root': 'angelica-archangelica',
  // Same plant split across two herb records. `saw-palmetto` is now the canonical
  // one: it was promoted through scripts/data/promote-profile.mjs (workbook
  // runtime_export_decision -> full_public_runtime, grounded on the CAMUS trial),
  // which puts the profile on the common-name URL that actually receives the
  // search demand and matches this map's existing convention of binomial ->
  // common name (valeriana-officinalis -> valerian, and so on).
  'serenoa-repens': 'saw-palmetto',
  // L-tyrosine is an amino-acid compound, not a botanical profile.
  tyrosine: 'l-tyrosine',
}

// Sources whose canonical target lives in a different taxonomy, so their
// redirect (and any rewritten internal link) must point at /compounds/, not
// /herbs/. Paired with an explicit public/_redirects rule.
export const CROSS_TAXONOMY_REDIRECT_SLUGS = new Set(['tyrosine'])

// True when `slug` redirects to a canonical that exists as its own record in
// `presentSlugs` — i.e. the redirect source is a duplicate that should be
// hidden from browse/index listings. Alias-served pairs whose target is not a
// separate record (e.g. passionflower, kava) are kept so their profile stays
// visible in the browse grid. Cross-taxonomy sources are always hidden.
export function isRedirectedDuplicate(slug: string | undefined | null, presentSlugs: Set<string>): boolean {
  if (!slug) return false
  if (CROSS_TAXONOMY_REDIRECT_SLUGS.has(slug)) return true
  const target = DEPRECATED_HERB_CANONICALS[slug]
  return !!target && presentSlugs.has(target)
}
