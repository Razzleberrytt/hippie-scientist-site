export type ConsentStatus = 'granted' | 'denied'

export const CONSENT_STORAGE_KEY = 'consent.v1'
export const CONSENT_CHANGE_EVENT = 'hs:consent-changed'

let sessionConsent: ConsentStatus | null = null

export function getSystemNoTracking(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false

  const dnt =
    (navigator as any).doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack
  const gpc = (navigator as any).globalPrivacyControl
  return dnt == '1' || dnt === 1 || dnt === 'yes' || gpc === true
}

export function getConsent(): ConsentStatus | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return sessionConsent
    const parsed = JSON.parse(raw)
    if (parsed?.status !== 'granted' && parsed?.status !== 'denied') return null
    sessionConsent = parsed.status
    return sessionConsent
  } catch {
    return sessionConsent
  }
}

// Only GA4 may load by default. Other consent-gated features still require an explicit grant.
export function canLoadGa4(): boolean {
  return typeof window !== 'undefined' && getConsent() !== 'denied' && !getSystemNoTracking()
}

export function canTrackAnalytics(): boolean {
  return (
    typeof window !== 'undefined' && getConsent() === 'granted' && !getSystemNoTracking()
  )
}

// Remove GA cookies for the current host and its parent domain; do not touch other cookies.
export function clearGaCookies() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const host = window.location.hostname
  const parts = host.split('.')
  const domains = ['', ...parts.map((_, index) => parts.slice(index).join('.')).filter((domain) => domain.includes('.'))]
  const names = document.cookie.split(';').map((cookie) => cookie.trim().split('=')[0]).filter((name) =>
    /^(_ga($|_)|_gid$|_gat($|_)|_gac_|_dc_gtm_|_gcl_)/.test(name),
  )
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`
    }
  }
}

export function setConsent(status: ConsentStatus) {
  sessionConsent = status
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ status, ts: Date.now() }))
  } catch {
    // Continue with session consent when browser storage is unavailable.
  }
  if (typeof window !== 'undefined') {
    const gaId = process.env.NEXT_PUBLIC_GA4_ID?.trim()
    if (gaId) (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = status === 'denied'
    if (status === 'denied') clearGaCookies()
  }
  applyGaConsent(status, 'update')
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { status } }))
  }
}

export function initConsentDefault() {
  // GA4 analytics alone is default-on; explicitly denied consent and DNT/GPC win.
  // Other consent-gated systems still consult getConsent()/canTrackAnalytics().
  const existing = getConsent()
  applyGaConsent(existing ?? (canLoadGa4() ? 'granted' : 'denied'))
}

export function applyGaConsent(status: ConsentStatus, command: 'default' | 'update' = 'default') {
  if (typeof window === 'undefined') return

  const granted = status === 'granted' && !getSystemNoTracking()
  // Auto-on applies only to analytics_storage; ad purposes still require explicit consent.
  const adGranted = granted && getConsent() === 'granted'
  // GA4 Consent Mode v2 (safe no-op if gtag missing)
  try {
    ;(window as any).gtag?.('consent', command, {
      ad_user_data: adGranted ? 'granted' : 'denied',
      ad_personalization: adGranted ? 'granted' : 'denied',
      ad_storage: adGranted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
      functionality_storage: 'granted', // essential
      security_storage: 'granted',
    })
  } catch {
    // no-op: consent API is optional
  }
}

export function debugConsent() {
  return getConsent()
}
