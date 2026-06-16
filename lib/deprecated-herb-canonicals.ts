// Single source of truth for herb slugs that 301-redirect to a canonical
// profile (see public/_redirects and app/sitemap.ts). Source slugs are
// excluded from generateStaticParams and from the /herbs browse/index
// artifacts so the site never links to a redirected URL.
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
}

// True when `slug` redirects to a canonical that exists as its own record in
// `presentSlugs` — i.e. the redirect source is a duplicate that should be
// hidden from browse/index listings. Alias-served pairs whose target is not a
// separate record (e.g. passionflower, kava) are kept so their profile stays
// visible in the browse grid.
export function isRedirectedDuplicate(slug: string | undefined | null, presentSlugs: Set<string>): boolean {
  if (!slug) return false
  const target = DEPRECATED_HERB_CANONICALS[slug]
  return !!target && presentSlugs.has(target)
}
