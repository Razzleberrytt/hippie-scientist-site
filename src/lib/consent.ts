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

export function setConsent(status: ConsentStatus) {
  sessionConsent = status
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ status, ts: Date.now() }))
  } catch {
    // Continue with session consent when browser storage is unavailable.
  }
  applyGaConsent(status, 'update')
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { status } }))
  }
}

export function initConsentDefault() {
  // On first load: respect DNT/GPC; default to denied.
  const existing = getConsent()
  if (existing) {
    applyGaConsent(existing)
    return
  }
  applyGaConsent('denied')
}

export function applyGaConsent(status: ConsentStatus, command: 'default' | 'update' = 'default') {
  const granted = status === 'granted' && !getSystemNoTracking()
  // GA4 Consent Mode v2 (safe no-op if gtag missing)
  try {
    ;(window as any).gtag?.('consent', command, {
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
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
