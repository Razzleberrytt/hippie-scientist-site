function isAmazonHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase()
  return normalized === 'amazon.com' || normalized === 'www.amazon.com'
}

export function normalizeAmazonAffiliateUrl(url: string | undefined, trackingId: string): string {
  const trimmedUrl = url?.trim()
  const trimmedTrackingId = trackingId.trim()
  if (!trimmedUrl || !trimmedTrackingId) return ''

  try {
    const parsed = new URL(trimmedUrl)
    if (!isAmazonHostname(parsed.hostname)) return ''
    if (!parsed.pathname || parsed.pathname === '/') return ''

    parsed.searchParams.set('tag', trimmedTrackingId)
    return parsed.toString()
  } catch {
    return ''
  }
}

export function isAmazonAffiliateUrl(url: string | undefined, trackingId: string): boolean {
  const normalized = normalizeAmazonAffiliateUrl(url, trackingId)
  if (!normalized) return false

  try {
    const parsed = new URL(normalized)
    return parsed.searchParams.get('tag') === trackingId.trim()
  } catch {
    return false
  }
}
