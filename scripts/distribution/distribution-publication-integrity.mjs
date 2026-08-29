const ALLOWED_PUBLICATION_STATUSES = new Set([
  'published',
  'expression-of-concern',
  'retracted',
  'withdrawn',
])

function clean(value) {
  return String(value ?? '').trim()
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function validHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function validateDistributionPublicationIntegrity(pack, researchObject) {
  const errors = []
  if (!pack?.source || !researchObject || typeof researchObject !== 'object') {
    return ['publication integrity validation requires a distribution pack and canonical research object']
  }

  const canonicalStatus = clean(researchObject.publicationStatus)
  const canonicalCheckedAt = clean(researchObject.publicationStatusCheckedAt)
  const canonicalAuthorityUrl = clean(researchObject.publicationStatusAuthorityUrl)

  if (!ALLOWED_PUBLICATION_STATUSES.has(canonicalStatus)) {
    errors.push('canonical research object must include a supported publicationStatus')
  }
  if (!validDate(canonicalCheckedAt)) {
    errors.push('canonical research object must include publicationStatusCheckedAt as YYYY-MM-DD')
  }
  if (!validHttpsUrl(canonicalAuthorityUrl)) {
    errors.push('canonical research object must include an HTTPS publicationStatusAuthorityUrl')
  }

  if (clean(pack.source.publicationStatus) !== canonicalStatus) {
    errors.push('distribution pack publicationStatus must equal canonical research-object publicationStatus')
  }
  if (clean(pack.source.publicationStatusCheckedAt) !== canonicalCheckedAt) {
    errors.push('distribution pack publicationStatusCheckedAt must equal canonical research-object publicationStatusCheckedAt')
  }
  if (clean(pack.source.publicationStatusAuthorityUrl) !== canonicalAuthorityUrl) {
    errors.push('distribution pack publicationStatusAuthorityUrl must equal canonical research-object authority URL')
  }

  return [...new Set(errors)]
}

export function assertDistributionPublicationIntegrity(pack, researchObject) {
  const errors = validateDistributionPublicationIntegrity(pack, researchObject)
  if (errors.length) throw new Error(`Invalid distribution publication integrity:\n- ${errors.join('\n- ')}`)
  return pack
}
