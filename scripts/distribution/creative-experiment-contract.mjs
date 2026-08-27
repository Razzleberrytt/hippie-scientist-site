import crypto from 'node:crypto'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]))
  }
  return value
}

function stableJson(value) {
  return JSON.stringify(stable(value))
}

const IMMUTABLE_KEYS = new Set([
  'factual-text',
  'evidence-grade',
  'limitation',
  'source-url',
  'disclosure',
  'cta-destination',
  'caption-meaning',
  'minimum-contrast-threshold',
  'platform-safe-area',
])

export function buildCreativeExperimentContract({ mediaPack, creativeSpec, platform, format, variants }) {
  if (!mediaPack?.source?.contentHash || !clean(mediaPack?.source?.url)) {
    throw new Error('validated media-pack source URL and content hash are required')
  }
  if (!creativeSpec?.sourceIdentity?.id || !clean(creativeSpec?.sourceIdentity?.sourceUrl)) {
    throw new Error('creative spec source identity is required')
  }
  if (creativeSpec.claimSafetyStatus !== 'validated-lossless') {
    throw new Error('creative experiments require a validated-lossless creative spec')
  }
  if (clean(creativeSpec.sourceIdentity.sourceUrl) !== clean(mediaPack.source.url)) {
    throw new Error('creative spec source URL must match the validated media pack')
  }
  if (clean(creativeSpec.delivery?.landingUrl) !== clean(mediaPack.source.url)) {
    throw new Error('creative CTA destination must match the validated media pack source URL')
  }

  const allowedMutable = new Set(creativeSpec.experimentContract?.mutableFields ?? [])
  const declaredImmutable = new Set(creativeSpec.experimentContract?.immutableFields ?? [])
  for (const key of IMMUTABLE_KEYS) {
    if (!declaredImmutable.has(key)) throw new Error(`creative spec must declare ${key} immutable before experimentation`)
  }

  const normalizedPlatform = clean(platform)
  const normalizedFormat = clean(format)
  if (!normalizedPlatform || !normalizedFormat) throw new Error('platform and format are required')
  if (!Array.isArray(variants) || variants.length < 2) throw new Error('at least two creative variants are required')

  const factualFingerprint = sha256(stableJson({
    sourceContentHash: mediaPack.source.contentHash,
    sourceUrl: mediaPack.source.url,
    sourceIdentity: creativeSpec.sourceIdentity,
    delivery: {
      disclosure: creativeSpec.delivery?.disclosure,
      landingUrl: creativeSpec.delivery?.landingUrl,
      factualTextPolicy: creativeSpec.delivery?.factualTextPolicy,
      safeAreaPolicy: creativeSpec.delivery?.safeAreaPolicy,
      colorPolicy: creativeSpec.delivery?.colorPolicy,
    },
    carousel: creativeSpec.carousel,
    verticalVideo: creativeSpec.verticalVideo,
    immutableFields: [...declaredImmutable].sort(),
  }))

  const seen = new Set()
  const normalizedVariants = variants.map((variant, index) => {
    const changes = variant?.changes ?? {}
    const keys = Object.keys(changes)
    if (!keys.length) throw new Error(`variant ${index + 1} must declare at least one creative change`)
    for (const key of keys) {
      if (IMMUTABLE_KEYS.has(key) || declaredImmutable.has(key)) {
        throw new Error(`variant ${index + 1} attempts to mutate immutable field: ${key}`)
      }
      if (!allowedMutable.has(key)) throw new Error(`variant ${index + 1} uses undeclared mutable field: ${key}`)
    }
    const payload = {
      platform: normalizedPlatform,
      format: normalizedFormat,
      sourceContentHash: mediaPack.source.contentHash,
      factualFingerprint,
      changes: stable(changes),
    }
    const variantId = `creative-${sha256(stableJson(payload)).slice(0, 16)}`
    if (seen.has(variantId)) throw new Error('creative variants must be distinct')
    seen.add(variantId)
    return {
      id: variantId,
      label: clean(variant?.label) || `Variant ${index + 1}`,
      changes: stable(changes),
      factualFingerprint,
    }
  })

  const primaryMetric = clean(creativeSpec.experimentContract?.primaryMetric)
  const guardrailMetrics = [...(creativeSpec.experimentContract?.guardrailMetrics ?? [])]
  if (!primaryMetric || !guardrailMetrics.length) throw new Error('creative experiment measurement contract is incomplete')

  const experimentSeed = {
    platform: normalizedPlatform,
    format: normalizedFormat,
    sourceContentHash: mediaPack.source.contentHash,
    factualFingerprint,
    variantIds: normalizedVariants.map((variant) => variant.id),
    primaryMetric,
    guardrailMetrics,
  }

  return {
    version: 1,
    experimentId: `experiment-${sha256(stableJson(experimentSeed)).slice(0, 16)}`,
    platform: normalizedPlatform,
    format: normalizedFormat,
    source: {
      url: mediaPack.source.url,
      contentHash: mediaPack.source.contentHash,
      researchObjectId: creativeSpec.sourceIdentity.id,
    },
    factualFingerprint,
    variants: normalizedVariants,
    measurement: {
      primaryMetric,
      guardrailMetrics,
      attributionPolicy: 'Compare variants only within the same platform, format, source-content hash, and materially similar publication window/audience conditions.',
      publishingSideEffects: false,
    },
    trustBoundary: {
      mutableFields: [...allowedMutable].sort(),
      immutableFields: [...declaredImmutable].sort(),
      factualFingerprintMustMatchAcrossVariants: true,
      sourceContentHashMustMatchAcrossVariants: true,
      creativeCannotBecomeFactualAuthority: true,
    },
  }
}
