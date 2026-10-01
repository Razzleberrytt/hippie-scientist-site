import { ingestDistributionObservations } from './distribution-observation-ingestion.mjs'
import { transitionDistributionLifecycle } from './distribution-lifecycle.mjs'

function clean(value) {
  return String(value ?? '').trim()
}

function optionalNonNegativeMetric(value, name) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Metricool measurement requires ${name} to be a non-negative finite number when supplied`)
  }
  return number
}

function optionalRateMetric(value, name) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 1) {
    throw new Error(`Metricool measurement requires ${name} to be between 0 and 1 when supplied`)
  }
  return number
}

export function recordMetricoolConnectorMeasuredObservation({
  publicationEvidence,
  currentIdentity,
  candidate,
  observation,
  now = new Date().toISOString(),
} = {}) {
  if (!publicationEvidence || publicationEvidence.schemaVersion !== 'metricool-connector-publication-ingestion-v1') {
    throw new Error('Metricool measurement requires valid connector publication evidence')
  }
  if (publicationEvidence.status !== 'accepted' || publicationEvidence.provider !== 'metricool') {
    throw new Error('Metricool measurement requires accepted Metricool publication evidence')
  }

  const lifecycle = publicationEvidence.lifecycle
  if (!lifecycle || lifecycle.schemaVersion !== 'distribution-lifecycle-v1' || lifecycle.state !== 'published') {
    throw new Error('Metricool measurement requires a published distribution lifecycle')
  }
  if (lifecycle.dryRun !== false) throw new Error('Metricool measurement requires a live published lifecycle')
  if (clean(lifecycle.lifecycleId) !== clean(publicationEvidence.lifecycleId)) throw new Error('publication lifecycleId mismatch')
  if (clean(lifecycle.identity?.fingerprint) !== clean(publicationEvidence.identityFingerprint)) throw new Error('publication identity fingerprint mismatch')
  if (clean(lifecycle.identity?.idempotencyKey) !== clean(publicationEvidence.idempotencyKey)) throw new Error('publication idempotency key mismatch')

  const identity = lifecycle.identity
  if (!currentIdentity || clean(currentIdentity.fingerprint) !== clean(identity.fingerprint)) {
    throw new Error('current governed identity does not match published lifecycle')
  }
  if (!candidate || clean(candidate.id) !== clean(identity.researchObjectId) || clean(candidate.platform) !== clean(identity.platform)) {
    throw new Error('measurement candidate does not match published lifecycle')
  }
  if (!clean(candidate.angleKey)) throw new Error('measurement candidate requires angleKey')

  const publishedReceipt = [...(lifecycle.receipts || [])].reverse().find((receipt) =>
    receipt?.state === 'published' && receipt?.dryRun === false && clean(receipt.externalId),
  )
  if (!publishedReceipt) throw new Error('Metricool measurement requires confirmed live publication receipt')
  if (clean(publishedReceipt.provider) !== 'metricool') throw new Error('published receipt provider mismatch')
  if (clean(publishedReceipt.externalId) !== clean(publicationEvidence.externalId)) throw new Error('published receipt externalId mismatch')

  const platformObservation = {
    observedFrom: observation?.observedFrom,
    observedTo: observation?.observedTo,
    capturedAt: observation?.capturedAt,
    assetViews: optionalNonNegativeMetric(observation?.assetViews, 'assetViews'),
    platformLinkClicks: optionalNonNegativeMetric(observation?.platformLinkClicks, 'platformLinkClicks'),
    completionRate: optionalRateMetric(observation?.completionRate, 'completionRate'),
    saveRate: optionalRateMetric(observation?.saveRate, 'saveRate'),
    attributionRisk: observation?.attributionRisk,
  }
  const qualifiedVisits = optionalNonNegativeMetric(observation?.qualifiedVisits, 'qualifiedVisits')
  const missingForCanonicalMeasurement = [
    ['assetViews', platformObservation.assetViews],
    ['qualifiedVisits', qualifiedVisits],
    ['completionRate', platformObservation.completionRate],
    ['saveRate', platformObservation.saveRate],
  ].filter(([, value]) => value === null).map(([name]) => name)

  if (missingForCanonicalMeasurement.length) {
    return {
      schemaVersion: 'metricool-connector-measurement-ingestion-v1',
      status: 'waiting-for-qualified-visits',
      provider: 'metricool',
      lifecycleId: lifecycle.lifecycleId,
      identityFingerprint: identity.fingerprint,
      idempotencyKey: identity.idempotencyKey,
      externalId: publicationEvidence.externalId,
      missingForCanonicalMeasurement,
      platformObservation,
      qualifiedVisits,
      lifecycle: structuredClone(lifecycle),
    }
  }

  const rawObservation = {
    lifecycleId: lifecycle.lifecycleId,
    identityFingerprint: identity.fingerprint,
    provider: 'metricool',
    publicationExternalId: publicationEvidence.externalId,
    candidateId: identity.researchObjectId,
    platform: identity.platform,
    format: identity.format,
    sourceUrl: identity.sourceUrl,
    contentHash: identity.researchObjectHash,
    taggedDestination: identity.taggedDestination,
    angleKey: candidate.angleKey,
    ...platformObservation,
    qualifiedVisits,
  }

  const history = ingestDistributionObservations([lifecycle], [rawObservation], [candidate], { now: new Date(now) })
  if (history.counts.accepted !== 1 || history.counts.rejected !== 0) {
    const reasons = history.rejected.flatMap((entry) => entry.reasons).join('; ') || 'observation was not accepted'
    throw new Error(`Metricool measurement rejected: ${reasons}`)
  }

  const accepted = history.accepted[0]
  const measurement = {
    observationId: accepted.observationId,
    candidateId: accepted.candidateId,
    platform: accepted.platform,
    format: accepted.format,
    angleKey: accepted.angleKey,
    sourceUrl: accepted.sourceUrl,
    contentHash: accepted.contentHash,
    taggedDestination: accepted.taggedDestination,
    publicationExternalId: accepted.publicationExternalId,
    publishedAt: accepted.publishedAt,
    observedFrom: accepted.observedFrom,
    observedTo: accepted.observedTo,
    capturedAt: accepted.capturedAt,
    assetViews: accepted.assetViews,
    platformLinkClicks: accepted.platformLinkClicks,
    qualifiedVisits: accepted.qualifiedVisits,
    completionRate: accepted.completionRate,
    saveRate: accepted.saveRate,
    attributionRisk: accepted.attributionRisk,
  }

  const measuredLifecycle = transitionDistributionLifecycle(lifecycle, 'measured', {
    currentIdentity,
    measurement,
    dryRun: false,
    now,
  })

  return {
    schemaVersion: 'metricool-connector-measurement-ingestion-v1',
    status: 'accepted',
    provider: 'metricool',
    lifecycleId: measuredLifecycle.lifecycleId,
    identityFingerprint: measuredLifecycle.identity.fingerprint,
    idempotencyKey: measuredLifecycle.identity.idempotencyKey,
    externalId: publicationEvidence.externalId,
    observationId: accepted.observationId,
    observation: accepted,
    history,
    lifecycle: measuredLifecycle,
  }
}
