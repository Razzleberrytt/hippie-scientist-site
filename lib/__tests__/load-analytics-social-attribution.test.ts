import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SOCIAL_ATTRIBUTION_SESSION_KEY } from '../social-attribution'

const consent = vi.hoisted(() => ({
  canTrackAnalytics: vi.fn(() => true),
  canLoadGa4: vi.fn(() => true),
  initConsentDefault: vi.fn(),
  getConsent: vi.fn(() => 'granted' as 'granted' | 'denied' | null),
}))

vi.mock('@/lib/consent', () => ({
  canTrackAnalytics: consent.canTrackAnalytics,
  canLoadGa4: consent.canLoadGa4,
  initConsentDefault: consent.initConsentDefault,
  getConsent: consent.getConsent,
}))

const SOCIAL_QUERY =
  '?utm_source=facebook&utm_medium=social&utm_campaign=ths_social_2026q4&utm_content=exp005_ltheanine_caffeine_fb&private_term=do-not-store'

function setLanding(search = SOCIAL_QUERY) {
  Object.defineProperty(window.location, 'pathname', {
    configurable: true,
    value: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
  })
  Object.defineProperty(window.location, 'search', { configurable: true, value: search })
}

describe('consent-triggered first-party social attribution initialization', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', '')
    vi.stubEnv('NEXT_PUBLIC_AHREFS_ANALYTICS_KEY', '')
    consent.canTrackAnalytics.mockReset()
    consent.canTrackAnalytics.mockReturnValue(true)
    consent.canLoadGa4.mockReset()
    consent.canLoadGa4.mockReturnValue(true)
    consent.initConsentDefault.mockClear()
    consent.getConsent.mockReset()
    consent.getConsent.mockReturnValue('granted')
    window.sessionStorage.clear()
    window.gtag = undefined
    window.dataLayer = []
    document.head.querySelector('#ga4-script')?.remove()
    document.head.querySelector('#ahrefs-analytics')?.remove()
    setLanding()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('stores a bounded session experiment after consent even with no GA4 or Ahrefs', async () => {
    const { onConsentChange } = await import('../loadAnalytics')
    onConsentChange()

    const stored = window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)
    expect(stored).not.toBeNull()
    const attribution = JSON.parse(stored!)
    expect(attribution).toMatchObject({
      source: 'facebook',
      medium: 'social',
      campaign: 'ths_social_2026q4',
      experimentId: 'exp005_ltheanine_caffeine_fb',
      landingPath: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
    })
    expect(stored).not.toContain('private_term')
    expect(stored).not.toContain('do-not-store')
    expect(window.gtag).toBeUndefined()
    vi.runAllTimers()
    expect(document.head.querySelector('#ga4-script, #ahrefs-analytics')).toBeNull()
  })

  it('does not create attribution without granted consent or when tracking is disallowed', async () => {
    consent.getConsent.mockReturnValue('denied')
    consent.canTrackAnalytics.mockReturnValue(false)
    consent.canLoadGa4.mockReturnValue(false)
    const { onConsentChange, loadAnalytics } = await import('../loadAnalytics')
    onConsentChange()
    loadAnalytics()
    expect(window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)).toBeNull()

    // Even granted consent cannot override a DNT/GPC-style canTrackAnalytics=false.
    consent.getConsent.mockReturnValue('granted')
    loadAnalytics()
    expect(window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)).toBeNull()
  })

  it('rejects ungoverned tracking tags even after consent', async () => {
    setLanding('?utm_source=facebook&utm_medium=social&utm_campaign=other&utm_content=free_text')
    const { loadAnalytics } = await import('../loadAnalytics')
    loadAnalytics()
    expect(window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)).toBeNull()
  })

  it('loads only GA4 for a fresh visitor without granting other analytics', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', 'G-7DFJL2FC6F')
    vi.stubEnv('NEXT_PUBLIC_AHREFS_ANALYTICS_KEY', 'test-ahrefs')
    consent.getConsent.mockReturnValue(null)
    consent.canTrackAnalytics.mockReturnValue(false)
    consent.canLoadGa4.mockReturnValue(true)
    const { loadAnalytics } = await import('../loadAnalytics')
    loadAnalytics()

    expect(window.gtag).toBeTypeOf('function')
    expect(window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)).toBeNull()
    expect(consent.initConsentDefault).toHaveBeenCalledTimes(1)
    vi.runAllTimers()
    expect(document.head.querySelector('#ga4-script')?.getAttribute('src')).toContain('G-7DFJL2FC6F')
    expect(document.head.querySelector('#ahrefs-analytics')).toBeNull()
  })

  it('honors opt-out before deferred loading, including pending timers', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', 'G-7DFJL2FC6F')
    consent.canTrackAnalytics.mockReturnValue(false)
    consent.canLoadGa4.mockReturnValue(true)
    const { loadAnalytics } = await import('../loadAnalytics')
    loadAnalytics()
    consent.canLoadGa4.mockReturnValue(false)
    vi.runAllTimers()
    expect(document.head.querySelector('#ga4-script')).toBeNull()
  })

  it('preserves synchronous GA queue bootstrapping for configured transport', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', 'G-TEST123')
    const { loadAnalytics } = await import('../loadAnalytics')
    loadAnalytics()
    expect(window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)).not.toBeNull()
    expect(window.gtag).toBeTypeOf('function')
    expect(window.dataLayer?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect(document.head.querySelector('#ga4-script')).toBeNull()
  })
})
