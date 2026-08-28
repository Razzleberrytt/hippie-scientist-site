const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const VARIANTS = Object.freeze([
  { id: 'cover-a-centered', composition: 'centered-stack', colorTreatment: 'primaryDark' },
  { id: 'cover-b-evidence-band', composition: 'headline-with-evidence-band', colorTreatment: 'evidence' },
  { id: 'cover-c-split-field', composition: 'split-field', colorTreatment: 'primaryLight' },
])

export function buildThumbnailContract({ hookText, platformSafeAreas }) {
  const text = clean(hookText)
  if (!text) throw new Error('thumbnail hook text is required')
  if (!platformSafeAreas?.instagramReels || !platformSafeAreas?.instagramFeed || !platformSafeAreas?.squareSocial) {
    throw new Error('thumbnail contract requires vertical, portrait, and square platform safe areas')
  }

  return {
    version: 1,
    sourceText: text,
    master: { width: 1080, height: 1920, format: '9:16' },
    cropResilience: {
      required: true,
      requiredCrops: ['4:5', '1:1'],
      safeAreas: {
        vertical: platformSafeAreas.instagramReels,
        portrait: platformSafeAreas.instagramFeed,
        square: platformSafeAreas.squareSocial,
      },
      headlineMustRemainFullyVisible: true,
      logoMustRemainVisible: true,
      disclosureMustRemainVisible: true,
    },
    typography: {
      minimumHeadlinePxAt1080: 64,
      exactHookTextRequired: true,
      rewriteAllowed: false,
      truncationAllowed: false,
      ellipsisAllowed: false,
    },
    trust: {
      factualAuthority: 'governed-hook-text',
      ctaAllowed: false,
      urgencyAllowed: false,
      rankingOrCertaintyAmplificationAllowed: false,
    },
    branding: {
      logoRequired: true,
      disclosureRequired: true,
      logoPosition: 'top-left-safe-area',
      disclosurePosition: 'bottom-safe-area',
    },
    attribution: {
      stableVariantIdsRequired: true,
      experimentUnit: 'same-hook-text-different-composition',
      factualTextMayVaryAcrossVariants: false,
    },
    variants: VARIANTS.map((variant) => ({
      ...variant,
      headline: text,
      rewriteAllowed: false,
      ctaAllowed: false,
    })),
  }
}

export function validateThumbnailContract(contract, expectedHookText) {
  const errors = []
  const expected = clean(expectedHookText)
  if (contract?.sourceText !== expected) errors.push('thumbnail source text must exactly match the governed hook text')
  if (contract?.typography?.minimumHeadlinePxAt1080 < 64) errors.push('thumbnail headline typography must be at least 64px at 1080-wide output')
  if (contract?.typography?.rewriteAllowed !== false || contract?.typography?.truncationAllowed !== false) errors.push('thumbnail hook text may not be rewritten or truncated')
  if (contract?.trust?.ctaAllowed !== false) errors.push('CTA is forbidden on thumbnails')
  if (contract?.cropResilience?.headlineMustRemainFullyVisible !== true) errors.push('thumbnail headline must remain fully visible across required crops')
  if (!Array.isArray(contract?.cropResilience?.requiredCrops) || !['4:5', '1:1'].every((crop) => contract.cropResilience.requiredCrops.includes(crop))) errors.push('thumbnail contract must cover 4:5 and 1:1 crops')
  if (!Array.isArray(contract?.variants) || contract.variants.length < 3) errors.push('thumbnail contract requires at least three deterministic variants')
  const ids = new Set()
  for (const variant of contract?.variants ?? []) {
    if (!clean(variant?.id) || ids.has(variant.id)) errors.push('thumbnail variant IDs must be stable and unique')
    ids.add(variant?.id)
    if (clean(variant?.headline) !== expected) errors.push('every thumbnail variant must preserve the governed hook text exactly')
    if (variant?.rewriteAllowed !== false) errors.push('thumbnail variants may not rewrite governed hook text')
    if (variant?.ctaAllowed !== false) errors.push('thumbnail variants may not contain a CTA')
  }
  return errors
}
