// Batch 7 (2026-10-11): precautionary holds pending a complete safety and
// product-identity review. These prevent purchase CTAs, not educational pages.
// Remove an individual hold only after its public safety copy, citations,
// product/formulation scope, and recommendation governance are verified.
const SAFETY_REVIEW_HOLD_SLUGS = new Set([
  'andrographis',
  'andrographis-paniculata',
  // Catalog alias accepted by getRevenueProductSet.
  'andrographolide-herb',
  'gotu-kola',
  'centella-asiatica',
  'brahmi-gotu-kola',
  'motherwort',
  'leonurus-cardiaca',
  'aloe',
  'aloe-vera',
  'aloe-barbadensis',
  'cat-s-claw',
  'cats-claw',
  'uncaria-tomentosa',
])

export function isBatch7SafetyHold(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const slug = value.trim().toLowerCase()
    .replace(/[\u2019']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return SAFETY_REVIEW_HOLD_SLUGS.has(slug)
}
