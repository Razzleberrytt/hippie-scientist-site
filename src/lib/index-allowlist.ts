export const CORE_INDEXABLE_ROUTES = [
  '/',
  '/info/about',
  '/articles',
  '/compounds',
  '/info/contact',
  '/info/dosing',
  '/evidence/evidence-digest',
  '/info/faq',
  '/goals',
  '/guides',
  '/herbs',
  '/learn',
  '/info/methodology',
  '/info/privacy',
  '/info/disclaimer',
  '/safety-checker',
  '/info/supplement-safety-checklist',
  '/stacks',
  '/tools',
] as const

export const MONEY_ENTRY_ROUTES = [
  '/best-supplements-for-sleep',
  '/best-supplements-for-stress',
  '/best-supplements-for-focus',
  '/best-supplements-for-fat-loss',
  '/best-supplements-for-blood-pressure',
  '/best-supplements-for-gut-health',
  '/best-supplements-for-joint-support',
  '/best-magnesium-supplements-for-adhd',
] as const

// Canonical (current-data) slugs. Curated index-allowlisted herb slugs.
// Must match the actual `slug` field on records in public/data/herbs.json so
// the governance overlay + sitemap treat them as PUBLISH. If the workbook
// renames a canonical slug, update this list in lockstep with the rename.
export const CURATED_INDEXABLE_HERB_SLUGS = [
  'ashwagandha',
  'rhodiola',
  'piper-methysticum',
  'turmeric',
  'ginger',
  'peppermint',
  'black-cohosh',
  'momordica-charantia',
  'black-seed',
  'bacopa',
  'ginkgo-biloba',
  'saffron',
  'melissa-officinalis',
  'valerian',
] as const

// Canonical (current-data) slugs. Curated index-allowlisted compound slugs.
// Must match the actual `slug` field on records in public/data/compounds.json.
// Note: kratom + mitragynine are intentionally EXCLUDED — those are
// restricted slugs (see scripts/data/apply-governance-overlay.mjs) and must
// stay noindex. Phosphatidylserine -> use phosphatidylcholine (closest
// canonical slug in current data).
export const CURATED_INDEXABLE_COMPOUND_SLUGS = [
  'l-theanine',
  'magnesium',
  'omega-3',
  'caffeine',
  'epigallocatechin-gallate-egcg',
  'n-acetylcysteine',
  'coenzyme-q10',
  'curcumin-piperine',
  'berberine',
  'alpha-gpc',
  'cdp-choline',
  'phosphatidylcholine',
  'acetyl-l-carnitine',
  'l-tyrosine',
  'huperzine-a',
] as const
