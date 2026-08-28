const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const DEFAULT_SOURCE_LEGIBILITY = Object.freeze({
  minimumSourcePxAt1080: 32,
  maximumSourceLines: 4,
  minimumVideoSourceSeconds: 3,
  requireExactCanonicalUrl: true,
  requireSafeAreaContainment: true,
  requireHighContrastTreatment: true,
  requireSourceLabel: true,
  sourceLabel: 'Source trail',
})

function parseCanonicalUrl(value) {
  const raw = clean(value)
  const url = new URL(raw)
  if (url.origin !== 'https://thehippiescientist.net' || url.pathname === '/' || url.search || url.hash) {
    throw new Error('source-card URL must be a canonical Hippie Scientist evidence page')
  }
  return url
}

export function buildSourceLegibilityContract({ sourceUrl, sourceSlide, platformSafeArea }, overrides = {}) {
  const rules = { ...DEFAULT_SOURCE_LEGIBILITY, ...overrides }
  const url = parseCanonicalUrl(sourceUrl)
  const slideBody = clean(sourceSlide?.body)
  const errors = []

  if (!sourceSlide || sourceSlide.role !== 'source') errors.push('source slide is required')
  if (rules.requireExactCanonicalUrl && slideBody !== url.href) {
    errors.push('source slide must render the exact canonical URL without truncation or rewriting')
  }
  if (/[.…]$/.test(slideBody) && slideBody !== url.href) {
    errors.push('source slide may not truncate the canonical URL')
  }
  if (sourceSlide?.citationRequired !== true) errors.push('source slide must remain citation-required')
  if (rules.requireHighContrastTreatment && sourceSlide?.colorTreatment !== 'source') {
    errors.push('source slide must use the approved source color treatment')
  }
  if (rules.requireSafeAreaContainment && !platformSafeArea) {
    errors.push('source slide requires an explicit platform safe area')
  }

  if (errors.length) throw new Error(`Invalid source-card legibility contract: ${errors.join('; ')}`)

  return Object.freeze({
    version: 1,
    canonicalUrl: url.href,
    displayHost: url.hostname,
    label: rules.sourceLabel,
    typography: {
      minimumPxAt1080: rules.minimumSourcePxAt1080,
      maximumLines: rules.maximumSourceLines,
      wrapAllowed: true,
      ellipsisAllowed: false,
      urlRewriteAllowed: false,
    },
    placement: {
      safeAreaRequired: rules.requireSafeAreaContainment,
      platformSafeArea,
    },
    video: {
      minimumVisibleSeconds: rules.minimumVideoSourceSeconds,
      dedicatedSourceSceneRequired: true,
      sourceMayNotShareFinalFrameOnly: true,
    },
    trust: {
      exactCanonicalUrlRequired: rules.requireExactCanonicalUrl,
      citationRequired: true,
      approvedColorTreatment: 'source',
      disclosureMayNotCoverSource: true,
      ctaMayNotReplaceSource: true,
    },
  })
}

export function validateSourceLegibilityContract(contract) {
  const errors = []
  if (!contract || contract.version !== 1) errors.push('source legibility contract v1 is required')
  if (!contract?.canonicalUrl) errors.push('canonicalUrl is required')
  if ((contract?.typography?.minimumPxAt1080 ?? 0) < 32) errors.push('source text must be at least 32px at 1080-wide output')
  if ((contract?.typography?.maximumLines ?? 0) < 1) errors.push('source text must allow at least one line')
  if (contract?.typography?.ellipsisAllowed !== false) errors.push('source URL ellipsis must be forbidden')
  if (contract?.typography?.urlRewriteAllowed !== false) errors.push('source URL rewriting must be forbidden')
  if ((contract?.video?.minimumVisibleSeconds ?? 0) < 3) errors.push('video source scene must remain visible for at least 3 seconds')
  if (contract?.video?.dedicatedSourceSceneRequired !== true) errors.push('video requires a dedicated source scene')
  if (contract?.placement?.safeAreaRequired !== true) errors.push('source card must stay inside platform safe area')
  if (contract?.trust?.citationRequired !== true) errors.push('source card must remain citation-required')
  return errors
}
