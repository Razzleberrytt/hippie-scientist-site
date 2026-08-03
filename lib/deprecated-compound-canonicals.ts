// Single source of truth for compound slugs that 301-redirect to a canonical
// profile (see public/_redirects and app/compounds/[slug]/page.tsx). Values are
// either a bare compound slug (same-taxonomy consolidation, e.g. theanine →
// l-theanine) or an absolute path when the canonical lives in another taxonomy
// (e.g. garlic-extract → /herbs/garlic).
//
// Extracted from app/compounds/[slug]/page.tsx so components that render
// generated internal links can resolve a slug to its canonical URL without
// importing a route module.
export const DEPRECATED_COMPOUND_CANONICALS: Record<string, string> = {
  coq10: 'coenzyme-q10',
  'coenzyme-q10-ubiquinol': 'coenzyme-q10',
  theanine: 'l-theanine',
  'l-theanine-sleep': 'l-theanine',
  methyleugenol: 'methyl-eugenol',
  bcaas: 'bcaa',
  nr: 'nicotinamide-riboside',
  'berberine-hcl': 'berberine',
  'probiotic-multistrain': 'probiotics',
  'probiotic-strain-bifidobacterium': 'probiotics',
  'probiotic-strain-lactobacillus': 'probiotics',
  'probiotics-bifidobacterium': 'probiotics',
  'probiotics-lactobacillus': 'probiotics',
  'taurine-blend': 'taurine',
  'taurine-sleep': 'taurine',
  'glycine-sleep': 'glycine',
  'inositol-sleep': 'inositol',
  'ashwagandha-extract-ksm-66': '/herbs/ashwagandha',
  'ashwagandha-root-extract': '/herbs/ashwagandha',
  garlic: '/herbs/garlic',
  'garlic-extract': '/herbs/garlic',
  'garlic-aged-extract': '/herbs/garlic',
  'aged-garlic-extract': '/herbs/garlic',
  ginger: '/herbs/ginger',
  gingerol: '/herbs/ginger',
  gingerols: '/herbs/ginger',
  valerian: '/herbs/valerian',
  'valerian-extract-standardized': '/herbs/valerian',
  'valerian-root-extract': '/herbs/valerian',
  'lions-mane': '/herbs/lions-mane',
  passionflower: '/herbs/passionflower',
  'passionflower-extract': '/herbs/passionflower',
  'passionflower-extract-standardized': '/herbs/passionflower',
  kava: '/herbs/kava',
  kavalactones: '/herbs/kava',
  reishi: '/herbs/reishi',
  maca: '/herbs/maca',
  'maca-root-extract': '/herbs/maca',
  elderberry: '/herbs/elderberry',
  resveratrol: '/herbs/resveratrol',
  'trans-resveratrol': '/herbs/resveratrol',
}

// True when `slug` redirects to another browseable record. Same-taxonomy
// aliases are hidden only when the canonical compound record is present, so an
// alias can remain discoverable if it is the only runtime record available.
// Cross-taxonomy aliases are always hidden because their canonical profile
// belongs in the herb library rather than the compound directory.
export function isRedirectedCompoundDuplicate(
  slug: string | undefined | null,
  presentSlugs: Set<string>,
): boolean {
  if (!slug) return false

  const target = DEPRECATED_COMPOUND_CANONICALS[slug]
  if (!target) return false
  if (target.startsWith('/')) return true

  return presentSlugs.has(target)
}
