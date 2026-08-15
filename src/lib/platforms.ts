export const PLATFORM_REGIONS = ['US', 'UK', 'CA', 'AU'] as const
export type PlatformRegion = (typeof PLATFORM_REGIONS)[number]

export type CommercePlatform = 'amazon' | 'manufacturer' | 'iherb' | 'other'

export type PlatformRegionConfig = {
  region: PlatformRegion
  countryCode: string
  label: string
  amazonHost: string
  currencyCode: string
}

export type RegionalUrlMap = Partial<Record<PlatformRegion, string>>

export type RetailerLink = {
  retailer: string
  label?: string
  url: string
  regionalUrls?: RegionalUrlMap
}

export type ResolveRegionalUrlInput = {
  defaultUrl: string
  regionalUrls?: RegionalUrlMap
  preferredRegion?: string | null
}

export const DEFAULT_PLATFORM_REGION: PlatformRegion = 'US'

export const PLATFORM_REGION_CONFIG: Record<PlatformRegion, PlatformRegionConfig> = {
  US: { region: 'US', countryCode: 'US', label: 'United States', amazonHost: 'www.amazon.com', currencyCode: 'USD' },
  UK: { region: 'UK', countryCode: 'GB', label: 'United Kingdom', amazonHost: 'www.amazon.co.uk', currencyCode: 'GBP' },
  CA: { region: 'CA', countryCode: 'CA', label: 'Canada', amazonHost: 'www.amazon.ca', currencyCode: 'CAD' },
  AU: { region: 'AU', countryCode: 'AU', label: 'Australia', amazonHost: 'www.amazon.com.au', currencyCode: 'AUD' },
}

const REGION_ALIASES: Record<string, PlatformRegion> = {
  US: 'US', USA: 'US', 'UNITED STATES': 'US',
  UK: 'UK', GB: 'UK', 'UNITED KINGDOM': 'UK',
  CA: 'CA', CANADA: 'CA',
  AU: 'AU', AUSTRALIA: 'AU',
}

export function normalizePlatformRegion(region?: string | null): PlatformRegion {
  if (!region) return DEFAULT_PLATFORM_REGION
  const normalized = region.trim().toUpperCase()
  return REGION_ALIASES[normalized] ?? DEFAULT_PLATFORM_REGION
}

export function inferPlatformRegionFromLocale(locale?: string | null): PlatformRegion {
  const value = String(locale || '').toUpperCase()
  const region = value.match(/[-_]([A-Z]{2})\b/)?.[1]
  return normalizePlatformRegion(region)
}

export function getPlatformRegionConfig(region?: string | null): PlatformRegionConfig {
  return PLATFORM_REGION_CONFIG[normalizePlatformRegion(region)]
}

export function getOutboundLinkRel(isSponsored = true) {
  return isSponsored ? 'sponsored nofollow noopener noreferrer' : 'noopener noreferrer'
}

export function resolveRegionalUrl({ defaultUrl, regionalUrls, preferredRegion }: ResolveRegionalUrlInput): string {
  const region = normalizePlatformRegion(preferredRegion)
  return regionalUrls?.[region] ?? regionalUrls?.[DEFAULT_PLATFORM_REGION] ?? defaultUrl
}

export function resolveRetailerLinks(links: RetailerLink[] | undefined, preferredRegion?: string | null) {
  if (!links?.length) return []
  return links
    .map((link) => ({ ...link, resolvedUrl: resolveRegionalUrl({ defaultUrl: link.url, regionalUrls: link.regionalUrls, preferredRegion }) }))
    .filter((link) => /^https?:\/\//i.test(link.resolvedUrl))
}
