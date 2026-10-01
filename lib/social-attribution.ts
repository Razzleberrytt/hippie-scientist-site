import { canTrackAnalytics } from '@/lib/consent'

export const SOCIAL_ATTRIBUTION_SESSION_KEY = 'ths_social_attribution_v1'

const SOCIAL_SOURCES = new Set([
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'linkedin',
  'threads',
  'pinterest',
])

export type SocialAttribution = {
  source: string
  medium: 'social'
  campaign: string
  experimentId: string
  landingPath: string
  capturedAt: string
}

function normalizePath(pathname: string): string {
  const pathOnly = String(pathname || '/').split(/[?#]/, 1)[0] || '/'
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withLeadingSlash === '/' || withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`
}

function safeSearch(search: string) {
  try {
    return new URLSearchParams(String(search || '').replace(/^\?/, ''))
  } catch {
    return new URLSearchParams()
  }
}

export function parseSocialAttribution(
  search: string,
  pathname: string,
  capturedAt = new Date().toISOString(),
): SocialAttribution | null {
  const params = safeSearch(search)
  const source = (params.get('utm_source') || '').trim().toLowerCase()
  const medium = (params.get('utm_medium') || '').trim().toLowerCase()
  const campaign = (params.get('utm_campaign') || '').trim().toLowerCase()
  const experimentId = (params.get('utm_content') || '').trim().toLowerCase()

  if (!SOCIAL_SOURCES.has(source)) return null
  if (medium !== 'social') return null
  if (!/^ths_social_\d{4}q[1-4]$/.test(campaign)) return null
  if (!/^exp\d{3,}_[a-z0-9][a-z0-9_-]*$/.test(experimentId)) return null

  return {
    source,
    medium: 'social',
    campaign,
    experimentId,
    landingPath: normalizePath(pathname),
    capturedAt,
  }
}

function validStoredAttribution(value: unknown): value is SocialAttribution {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SocialAttribution>
  return (
    typeof candidate.source === 'string' &&
    SOCIAL_SOURCES.has(candidate.source) &&
    candidate.medium === 'social' &&
    typeof candidate.campaign === 'string' &&
    /^ths_social_\d{4}q[1-4]$/.test(candidate.campaign) &&
    typeof candidate.experimentId === 'string' &&
    /^exp\d{3,}_[a-z0-9][a-z0-9_-]*$/.test(candidate.experimentId) &&
    typeof candidate.landingPath === 'string' &&
    candidate.landingPath.startsWith('/') &&
    typeof candidate.capturedAt === 'string' &&
    Number.isFinite(Date.parse(candidate.capturedAt))
  )
}

export function getSocialAttribution(): SocialAttribution | null {
  if (typeof window === 'undefined' || !canTrackAnalytics()) return null

  try {
    const stored = window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (validStoredAttribution(parsed)) return parsed
      window.sessionStorage.removeItem(SOCIAL_ATTRIBUTION_SESSION_KEY)
    }

    const current = parseSocialAttribution(window.location.search, window.location.pathname)
    if (!current) return null
    window.sessionStorage.setItem(SOCIAL_ATTRIBUTION_SESSION_KEY, JSON.stringify(current))
    return current
  } catch {
    return null
  }
}

export function getSocialAttributionEventParams(
  attribution: SocialAttribution | null = getSocialAttribution(),
): Record<string, string> {
  if (!attribution) return {}
  return {
    social_source: attribution.source,
    social_medium: attribution.medium,
    social_campaign: attribution.campaign,
    social_experiment_id: attribution.experimentId,
    social_landing_path: attribution.landingPath,
  }
}

export function getSocialAttributionLocalFields(
  attribution: SocialAttribution | null = getSocialAttribution(),
): Record<string, string> {
  if (!attribution) return {}
  return {
    socialSource: attribution.source,
    socialMedium: attribution.medium,
    socialCampaign: attribution.campaign,
    socialExperimentId: attribution.experimentId,
    socialLandingPath: attribution.landingPath,
  }
}
