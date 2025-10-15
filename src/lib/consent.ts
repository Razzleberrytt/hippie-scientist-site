import { recordDevMessage } from '../utils/devMessages'

export type ConsentStatus = 'granted' | 'denied'

const KEY = 'consent.v1'

export function getSystemNoTracking(): boolean {
  const dnt =
    (navigator as any).doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack
  const gpc = (navigator as any).globalPrivacyControl
  return dnt == '1' || dnt === 1 || gpc === true
}

export function getConsent(): ConsentStatus | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.status === 'granted' ? 'granted' : 'denied'
  } catch {
    return null
  }
}

export function setConsent(status: ConsentStatus) {
  localStorage.setItem(KEY, JSON.stringify({ status, ts: Date.now() }))
  applyGaConsent(status)
}

export function initConsentDefault() {
  // On first load: respect DNT/GPC; default to denied.
  const existing = getConsent()
  if (existing) {
    applyGaConsent(existing)
    return
  }
  const status: ConsentStatus = getSystemNoTracking() ? 'denied' : 'denied'
  applyGaConsent(status)
}

export function applyGaConsent(status: ConsentStatus) {
  const granted = status === 'granted'
  // GA4 Consent Mode v2 (safe no-op if gtag missing)
  try {
    ;(window as any).gtag?.('consent', 'default', {
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
      functionality_storage: 'granted', // essential
      security_storage: 'granted',
    })
  } catch {}
}

export function debugConsent() {
  if (import.meta.env.MODE !== 'production') {
    recordDevMessage('warning', '[consent] status snapshot', getConsent())
  }
}
