import crypto from 'node:crypto'

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value))
}

export function buildCreativeVisualRegressionContract({ carousel, verticalVideo, thumbnails, delivery }) {
  const fingerprintInput = {
    carousel: {
      slideRoles: (carousel?.slides ?? []).map((slide) => slide.role),
      platformSafeArea: carousel?.accessibility?.platformSafeArea ?? null,
      sourceMinimumPxAt1080: carousel?.sourceLegibility?.typography?.minimumPxAt1080 ?? null,
      sourceExactUrlRequired: carousel?.sourceLegibility?.typography?.exactUrlRequired ?? true,
      accessibilityDescription: {
        losslessRequired: carousel?.accessibility?.accessibilityDescription?.integrity?.exactNormalizedMatch ?? null,
        truncationAllowed: carousel?.accessibility?.accessibilityDescription?.segmentBudget?.truncationAllowed ?? null,
        paraphraseAllowed: carousel?.accessibility?.accessibilityDescription?.segmentBudget?.paraphraseAllowed ?? null,
        maxSegmentChars: carousel?.accessibility?.accessibilityDescription?.segmentBudget?.maxChars ?? null,
      },
    },
    verticalVideo: {
      platformSafeAreas: verticalVideo?.platformSafeAreas ?? null,
      hook: {
        timing: verticalVideo?.hook?.timing ?? null,
        minimumPxAt1080: verticalVideo?.hook?.typography?.minimumPxAt1080 ?? null,
      },
      captions: {
        minimumPxAt1080: verticalVideo?.captions?.minimumPxAt1080 ?? null,
        maxCharsPerLine: verticalVideo?.captions?.maxCharsPerLine ?? null,
        maxLines: verticalVideo?.captions?.maxLines ?? null,
      },
      cta: {
        timing: verticalVideo?.cta?.timing ?? null,
        minimumPxAt1080: verticalVideo?.cta?.typography?.minimumPxAt1080 ?? null,
      },
      sourceMinimumVisibleSeconds: verticalVideo?.sourceLegibility?.video?.minimumVisibleSeconds ?? null,
    },
    thumbnails: {
      master: thumbnails?.master ?? null,
      requiredCrops: thumbnails?.cropResilience?.requiredCrops ?? [],
      headlineMinimumPxAt1080: thumbnails?.typography?.minimumHeadlinePxAt1080 ?? null,
      logoRequired: thumbnails?.branding?.logoRequired ?? null,
      disclosureRequired: thumbnails?.branding?.disclosureRequired ?? null,
      variants: (thumbnails?.variants ?? []).map(({ id, composition, colorTreatment }) => ({ id, composition, colorTreatment })),
    },
    delivery: {
      platformSafeAreas: delivery?.platformSafeAreas ?? null,
      ctaText: delivery?.ctaContract?.text ?? delivery?.cta ?? null,
      ctaDestinationExactMatchRequired: delivery?.ctaContract?.destination?.exactMatchRequired ?? null,
      accessibilityDescriptionFailClosed: delivery?.accessibilityDescriptionContract?.platformPolicy?.publishOnlyIfFullDescriptionCanBeRepresentedLosslessly ?? null,
    },
  }

  const canonical = canonicalJson(fingerprintInput)
  return {
    version: 1,
    algorithm: 'sha256',
    scope: 'deterministic-presentation-contract-only',
    excludesGenerativeImageryAsAuthority: true,
    canonical,
    fingerprint: crypto.createHash('sha256').update(canonical).digest('hex'),
    fingerprintInput,
    guardrails: {
      identicalGovernedPresentationMustFingerprintIdentically: true,
      fingerprintDriftRequiresExplicitReview: true,
      generativeBackgroundOrBrollMayNotChangeFactualAuthority: true,
    },
  }
}

export function validateCreativeVisualRegressionContract(contract) {
  const errors = []
  if (contract?.version !== 1) errors.push('visual regression contract version must be 1')
  if (contract?.algorithm !== 'sha256') errors.push('visual regression contract must use sha256')
  if (!/^[a-f0-9]{64}$/.test(String(contract?.fingerprint ?? ''))) errors.push('visual regression fingerprint must be a sha256 hex digest')
  if (contract?.scope !== 'deterministic-presentation-contract-only') errors.push('visual regression scope must be deterministic presentation only')
  if (contract?.excludesGenerativeImageryAsAuthority !== true) errors.push('generative imagery must remain outside factual visual-regression authority')

  const input = contract?.fingerprintInput
  if (!Array.isArray(input?.carousel?.slideRoles) || !input.carousel.slideRoles.includes('source')) errors.push('visual regression contract must cover the carousel source card')
  if (input?.carousel?.sourceMinimumPxAt1080 < 32) errors.push('visual regression contract must preserve source-card minimum typography')
  if (input?.carousel?.accessibilityDescription?.losslessRequired !== true) errors.push('visual regression contract must preserve lossless accessibility descriptions')
  if (input?.carousel?.accessibilityDescription?.truncationAllowed !== false) errors.push('visual regression contract must preserve accessibility-description truncation prohibition')
  if (input?.carousel?.accessibilityDescription?.paraphraseAllowed !== false) errors.push('visual regression contract must preserve accessibility-description paraphrase prohibition')
  if (input?.carousel?.accessibilityDescription?.maxSegmentChars < 80) errors.push('visual regression contract must preserve an accessibility-description segment budget')
  if (input?.verticalVideo?.hook?.minimumPxAt1080 < 56) errors.push('visual regression contract must preserve hook minimum typography')
  if (input?.verticalVideo?.captions?.minimumPxAt1080 < 44) errors.push('visual regression contract must preserve caption minimum typography')
  if (input?.verticalVideo?.cta?.minimumPxAt1080 < 44) errors.push('visual regression contract must preserve CTA minimum typography')
  if (input?.verticalVideo?.sourceMinimumVisibleSeconds < 3) errors.push('visual regression contract must preserve source-scene visibility duration')
  if (input?.thumbnails?.headlineMinimumPxAt1080 < 64) errors.push('visual regression contract must preserve thumbnail headline minimum typography')
  if (input?.thumbnails?.logoRequired !== true || input?.thumbnails?.disclosureRequired !== true) errors.push('visual regression contract must preserve thumbnail logo and disclosure requirements')
  if (!['4:5', '1:1'].every((crop) => input?.thumbnails?.requiredCrops?.includes(crop))) errors.push('visual regression contract must preserve portrait and square crop coverage')
  if (!Array.isArray(input?.thumbnails?.variants) || input.thumbnails.variants.length < 3) errors.push('visual regression contract must preserve deterministic thumbnail variants')
  if (input?.delivery?.accessibilityDescriptionFailClosed !== true) errors.push('visual regression contract must preserve fail-closed accessibility-description delivery')

  if (!errors.length) {
    const expectedCanonical = canonicalJson(input)
    const expectedFingerprint = crypto.createHash('sha256').update(expectedCanonical).digest('hex')
    if (contract.canonical !== expectedCanonical) errors.push('visual regression canonical serialization drifted from fingerprint input')
    if (contract.fingerprint !== expectedFingerprint) errors.push('visual regression fingerprint does not match canonical presentation input')
  }
  return errors
}
