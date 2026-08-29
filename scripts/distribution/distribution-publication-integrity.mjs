const ALLOWED_PUBLICATION_STATUSES = new Set([
  'published',
  'expression-of-concern',
  'retracted',
  'withdrawn',
])
const DISTRIBUTION_ELIGIBLE_PUBLICATION_STATUSES = new Set(['published'])
export const MAX_PUBLICATION_STATUS_AGE_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000

function clean(value) {
  return String(value ?? '').trim()
}

function parseUtcCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  const parsed = new Date(timestamp)
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) return null
  return timestamp
}

function publicationStatusAgeDays(value, now = new Date()) {
  const checkedAt = parseUtcCalendarDate(value)
  if (checkedAt === null) return null
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.floor((today - checkedAt) / DAY_MS)
}

function validHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function validateDistributionPublicationIntegrity(pack, researchObject, options = {}) {
  const errors = []
  if (!pack?.source || !researchObject || typeof researchObject !== 'object') {
    return ['publication integrity validation requires a distribution pack and canonical research object']
  }

  const canonicalStatus = clean(researchObject.publicationStatus)
  const canonicalCheckedAt = clean(researchObject.publicationStatusCheckedAt)
  const canonicalAuthorityUrl = clean(researchObject.publicationStatusAuthorityUrl)
  const checkedAgeDays = publicationStatusAgeDays(canonicalCheckedAt, options.now ?? new Date())

  if (!ALLOWED_PUBLICATION_STATUSES.has(canonicalStatus)) {
    errors.push('canonical research object must include a supported publicationStatus')
  } else if (!DISTRIBUTION_ELIGIBLE_PUBLICATION_STATUSES.has(canonicalStatus)) {
    errors.push(`canonical publicationStatus is not eligible for distribution: ${canonicalStatus}`)
  }
  if (checkedAgeDays === null) {
    errors.push('canonical research object must include publicationStatusCheckedAt as a real YYYY-MM-DD calendar date')
  } else if (checkedAgeDays < 0) {
    errors.push('canonical publicationStatusCheckedAt cannot be future-dated')
  } else if (checkedAgeDays > MAX_PUBLICATION_STATUS_AGE_DAYS) {
    errors.push(`canonical publication-status verification is stale (${checkedAgeDays} days; maximum ${MAX_PUBLICATION_STATUS_AGE_DAYS})`)
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

export function assertDistributionPublicationIntegrity(pack, researchObject, options = {}) {
  const errors = validateDistributionPublicationIntegrity(pack, researchObject, options)
  if (errors.length) throw new Error(`Invalid distribution publication integrity:\n- ${errors.join('\n- ')}`)
  return pack
}
