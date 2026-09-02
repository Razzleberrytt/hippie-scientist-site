function clean(value) {
  return String(value ?? '').trim()
}

function required(value, name) {
  if (value === null || value === undefined || value === '') {
    throw new Error(`Metricool provider snapshot requires explicit ${name}; missing observations are not zero performance`)
  }
  return value
}

export function normalizeMetricoolProviderMeasurementSnapshot({ publicationEvidence, snapshot } = {}) {
  if (!publicationEvidence || publicationEvidence.schemaVersion !== 'metricool-connector-publication-ingestion-v1' || publicationEvidence.status !== 'accepted') {
    throw new Error('Metricool provider snapshot requires accepted publication evidence')
  }
  if (!snapshot || clean(snapshot.provider).toLowerCase() !== 'metricool') {
    throw new Error('Metricool provider snapshot requires provider=metricool')
  }

  const externalId = clean(required(snapshot.publicationExternalId, 'publicationExternalId'))
  if (externalId !== clean(publicationEvidence.externalId)) {
    throw new Error('Metricool provider snapshot publicationExternalId does not match publication evidence')
  }

  const platform = clean(required(snapshot.platform, 'platform')).toLowerCase()
  const publishedPlatform = clean(publicationEvidence.lifecycle?.identity?.platform).toLowerCase()
  if (!publishedPlatform || platform !== publishedPlatform) {
    throw new Error('Metricool provider snapshot platform does not match published lifecycle')
  }

  return {
    observedFrom: required(snapshot.observedFrom, 'observedFrom'),
    observedTo: required(snapshot.observedTo, 'observedTo'),
    capturedAt: required(snapshot.capturedAt, 'capturedAt'),
    assetViews: required(snapshot.assetViews, 'assetViews'),
    qualifiedVisits: required(snapshot.qualifiedVisits, 'qualifiedVisits'),
    completionRate: required(snapshot.completionRate, 'completionRate'),
    saveRate: required(snapshot.saveRate, 'saveRate'),
    attributionRisk: snapshot.attributionRisk,
  }
}
