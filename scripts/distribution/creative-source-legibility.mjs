const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const DEFAULT_SOURCE_LEGIBILITY = Object.freeze({
  minimumSourcePxAt1080: 32,
  maximumSourceLines: 4,
  minimumVideoSourceSeconds: 3,
  horizontalPadding: 24,
  verticalPadding: 24,
  lineHeightRatio: 1.3,
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

function normalizeSafeArea(area) {
  const normalized = {
    x: Number(area?.x),
    y: Number(area?.y),
    width: Number(area?.width),
    height: Number(area?.height),
  }
  if (![normalized.x, normalized.y, normalized.width, normalized.height].every(Number.isFinite)) {
    throw new Error('source-card safe area must use finite geometry')
  }
  if (normalized.width <= 0 || normalized.height <= 0) {
    throw new Error('source-card safe area must have positive dimensions')
  }
  return normalized
}

function buildSourceRegion(platformSafeArea, rules) {
  const area = normalizeSafeArea(platformSafeArea)
  const minimumPxAt1080 = Number(rules.minimumSourcePxAt1080)
  const maximumLines = Number(rules.maximumSourceLines)
  const horizontalPadding = Number(rules.horizontalPadding)
  const verticalPadding = Number(rules.verticalPadding)
  const lineHeightPx = Math.ceil(minimumPxAt1080 * Number(rules.lineHeightRatio))
  const requiredTextHeight = lineHeightPx * maximumLines
  const height = requiredTextHeight + (2 * verticalPadding)
  const width = area.width - (2 * horizontalPadding)

  if (!(minimumPxAt1080 >= 32)) throw new Error('source text must be at least 32px at 1080-wide output')
  if (!(maximumLines >= 1)) throw new Error('source text must allow at least one line')
  if (!(width > 0) || height > area.height) {
    throw new Error('platform safe area cannot fit the configured source-card typography')
  }

  return Object.freeze({
    x: area.x + horizontalPadding,
    y: area.y + area.height - height,
    width,
    height,
    horizontalPadding,
    verticalPadding,
    lineHeightPx,
    maximumLines,
    minimumPxAt1080,
    anchor: 'bottom-safe-area',
  })
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
  const sourceRegion = buildSourceRegion(platformSafeArea, rules)

  return Object.freeze({
    version: 2,
    canonicalUrl: url.href,
    displayHost: url.hostname,
    label: rules.sourceLabel,
    typography: {
      minimumPxAt1080: rules.minimumSourcePxAt1080,
      maximumLines: rules.maximumSourceLines,
      lineHeightPx: sourceRegion.lineHeightPx,
      wrapAllowed: true,
      ellipsisAllowed: false,
      urlRewriteAllowed: false,
    },
    placement: {
      safeAreaRequired: rules.requireSafeAreaContainment,
      platformSafeArea: normalizeSafeArea(platformSafeArea),
      sourceRegion,
      deterministicRegionRequired: true,
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
  if (!contract || contract.version !== 2) errors.push('source legibility contract v2 is required')
  if (!contract?.canonicalUrl) errors.push('canonicalUrl is required')
  if ((contract?.typography?.minimumPxAt1080 ?? 0) < 32) errors.push('source text must be at least 32px at 1080-wide output')
  if ((contract?.typography?.maximumLines ?? 0) < 1) errors.push('source text must allow at least one line')
  if (contract?.typography?.ellipsisAllowed !== false) errors.push('source URL ellipsis must be forbidden')
  if (contract?.typography?.urlRewriteAllowed !== false) errors.push('source URL rewriting must be forbidden')
  if ((contract?.video?.minimumVisibleSeconds ?? 0) < 3) errors.push('video source scene must remain visible for at least 3 seconds')
  if (contract?.video?.dedicatedSourceSceneRequired !== true) errors.push('video requires a dedicated source scene')
  if (contract?.placement?.safeAreaRequired !== true) errors.push('source card must stay inside platform safe area')
  if (contract?.placement?.deterministicRegionRequired !== true) errors.push('source card requires deterministic safe-area geometry')
  if (contract?.trust?.citationRequired !== true) errors.push('source card must remain citation-required')

  const area = contract?.placement?.platformSafeArea
  const region = contract?.placement?.sourceRegion
  try {
    const safeArea = normalizeSafeArea(area)
    if (!region || region.anchor !== 'bottom-safe-area') {
      errors.push('source card requires a deterministic bottom-safe-area region')
    } else {
      const values = [region.x, region.y, region.width, region.height, region.verticalPadding, region.lineHeightPx]
      if (!values.every((value) => Number.isFinite(Number(value)))) errors.push('source-card region must use finite geometry')
      if (!(Number(region.width) > 0 && Number(region.height) > 0)) errors.push('source-card region must have positive dimensions')
      if (Number(region.minimumPxAt1080) !== Number(contract?.typography?.minimumPxAt1080)) errors.push('source-card region typography must match the contract')
      if (Number(region.maximumLines) !== Number(contract?.typography?.maximumLines)) errors.push('source-card region line budget must match the contract')

      const requiredTextHeight = Number(region.lineHeightPx) * Number(region.maximumLines)
      const innerHeight = Number(region.height) - (2 * Number(region.verticalPadding ?? 0))
      if (innerHeight + 1e-9 < requiredTextHeight) errors.push('source-card region is too short for the configured typography')

      const right = Number(region.x) + Number(region.width)
      const bottom = Number(region.y) + Number(region.height)
      if (
        Number(region.x) < safeArea.x - 1e-9 ||
        Number(region.y) < safeArea.y - 1e-9 ||
        right > safeArea.x + safeArea.width + 1e-9 ||
        bottom > safeArea.y + safeArea.height + 1e-9
      ) {
        errors.push('source-card region leaves the platform safe area')
      }
    }
  } catch (error) {
    errors.push(error.message)
  }

  return [...new Set(errors)]
}
