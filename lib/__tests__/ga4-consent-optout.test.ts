import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('GA4 default analytics and persistent opt-out', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', 'G-7DFJL2FC6F')
    window.localStorage.removeItem('consent.v1')
    window.gtag = vi.fn()
  })

  afterEach(() => {
    window.localStorage.removeItem('consent.v1')
    window.gtag = undefined
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('enables only GA4 analytics by default, not the other consent gates', async () => {
    const consent = await import('../consent')
    expect(consent.getConsent()).toBeNull()
    // Unknown location must not start GA4 before a trusted server response.
    expect(consent.canLoadGa4()).toBe(false)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ defaultGa4Allowed: true }),
    }))
    await consent.resolveGa4DefaultEligibility()
    expect(consent.canLoadGa4()).toBe(true)
    expect(consent.canTrackAnalytics()).toBe(false)
    consent.initConsentDefault()
    expect(window.gtag).toHaveBeenCalledWith('consent', 'default', expect.objectContaining({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
    }))
    expect(window.localStorage.getItem('consent.v1')).toBeNull()
  })

  it('does not load implicit GA4 for non-US location or unknown country', async () => {
    const consent = await import('../consent')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ defaultGa4Allowed: false }),
    }))
    await consent.resolveGa4DefaultEligibility()
    expect(consent.canLoadGa4()).toBe(false)
    expect(consent.canTrackAnalytics()).toBe(false)
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it('fails closed when the regional eligibility endpoint is inaccessible', async () => {
    const consent = await import('../consent')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')))
    await consent.resolveGa4DefaultEligibility()
    expect(consent.canLoadGa4()).toBe(false)
  })

  it('honors explicit consent regardless of country lookup failure', async () => {
    const consent = await import('../consent')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')))
    await consent.resolveGa4DefaultEligibility()
    expect(consent.canLoadGa4()).toBe(false)
    consent.setConsent('granted')
    expect(consent.canLoadGa4()).toBe(true)
  })

  it('rejects an untrusted/non-boolean geo response', async () => {
    const consent = await import('../consent')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ defaultGa4Allowed: 'true' }),
    }))
    await consent.resolveGa4DefaultEligibility()
    expect(consent.canLoadGa4()).toBe(false)
  })

  it('persists opt-out, denies analytics and deletes GA cookies only', async () => {
    const consent = await import('../consent')
    document.cookie = '_ga=ga-value; Path=/'
    document.cookie = '_ga_7DFJL2FC6F=ga-session; Path=/'
    document.cookie = 'site_preference=keep; Path=/'
    consent.setConsent('denied')
    expect(consent.getConsent()).toBe('denied')
    expect(consent.canLoadGa4()).toBe(false)
    expect(consent.canTrackAnalytics()).toBe(false)
    expect(window.localStorage.getItem('consent.v1')).toContain('"denied"')
    expect(document.cookie).not.toContain('_ga=')
    expect(document.cookie).not.toContain('_ga_7DFJL2FC6F=')
    expect(document.cookie).toContain('site_preference=keep')
    expect((window as unknown as Record<string, unknown>)['ga-disable-G-7DFJL2FC6F']).toBe(true)
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({
      analytics_storage: 'denied',
    }))
    document.cookie = 'site_preference=; Max-Age=0; Path=/'
  })
})
