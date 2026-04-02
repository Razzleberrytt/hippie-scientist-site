const SOURCE_SPLIT_PATTERN = /[;|]+/g

const asText = value => String(value ?? '').trim()

function splitSourceText(value) {
  const text = asText(value)
  if (!text) return []
  return text
    .split(SOURCE_SPLIT_PATTERN)
    .map(part => asText(part))
    .filter(Boolean)
}

function normalizeSourceEntriesInner(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap(item => normalizeSourceEntriesInner(item))
  if (typeof value === 'string') return splitSourceText(value)
  if (typeof value === 'object') {
    return [value?.url, value?.title, value?.name, value?.citation, value?.reference]
      .flatMap(candidate => splitSourceText(candidate))
      .filter(Boolean)
  }
  return []
}

export function normalizeSourceEntries(value) {
  return normalizeSourceEntriesInner(value)
}

export function isBootstrapSource(value) {
  const text = asText(value)
  if (!text) return false
  return /^https?:\/\//i.test(text) || text.length > 12
}

export function countBootstrapSources(value) {
  return normalizeSourceEntries(value).filter(isBootstrapSource).length
}

export function sourceCountBuckets(values) {
  const buckets = { zero: 0, one: 0, twoOrMore: 0 }
  for (const value of values) {
    const count = countBootstrapSources(value)
    if (count <= 0) buckets.zero += 1
    else if (count === 1) buckets.one += 1
    else buckets.twoOrMore += 1
  }
  return buckets
}
