import { describe, expect, it, vi } from 'vitest'
import { verifyProductionPrivacy } from '../scripts/ci/verify-production-privacy.mjs'

const spanishFooter = '<html>Configuración de privacidad <a>Privacy policy (English)</a></html>'
const policy = '<html>GA4 may load where Cloudflare confirms the visitor is in the United States</html>'

function mockFetch({
  payload = { defaultGa4Allowed: true },
  contentType = 'application/json; charset=utf-8',
  cacheControl = 'private, no-store',
  cacheStatus = 'DYNAMIC',
  spanish = spanishFooter,
  privacy = policy,
} = {}) {
  return vi.fn(async (url: string) => {
    if (url.endsWith('/api/analytics-eligibility')) {
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'content-type': contentType, 'cache-control': cacheControl, 'cf-cache-status': cacheStatus },
      })
    }
    if (url.endsWith('/es/')) {
      return new Response(spanish, { headers: { 'content-type': 'text/html; charset=utf-8' } })
    }
    if (url.endsWith('/info/privacy/')) {
      return new Response(privacy, { headers: { 'content-type': 'text/html' } })
    }
    return new Response('not found', { status: 404 })
  })
}

describe('post-deploy regional privacy smoke', () => {
  it('validates a successful live eligibility, translated footer and policy receipt', async () => {
    const fetcher = mockFetch()
    await expect(verifyProductionPrivacy({ origin: 'https://thehippiescientist.net/', fetcher })).resolves.toEqual({
      regionAllowedAtProbe: true,
    })
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  it('accepts a valid false region result without interpreting it as a production failure', async () => {
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ payload: { defaultGa4Allowed: false } }) }))
      .resolves.toEqual({ regionAllowedAtProbe: false })
  })

  it('rejects HTML fallback masquerading as the geo API', async () => {
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ contentType: 'text/html' }) }))
      .rejects.toThrow(/non-JSON/)
  })

  it('rejects cached or unprotected personalized country responses', async () => {
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ cacheControl: 'public, max-age=3600' }) }))
      .rejects.toThrow(/no-store/)
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ cacheStatus: 'HIT' }) }))
      .rejects.toThrow(/edge-cached/)
  })

  it('rejects malformed eligibility payloads or unexpected extra regional data', async () => {
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ payload: { defaultGa4Allowed: 'true' } }) }))
      .rejects.toThrow(/strict boolean/)
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ payload: { defaultGa4Allowed: true, country: 'US' } }) }))
      .rejects.toThrow(/extra fields/)
  })

  it('fails when the localized privacy controls or truthful policy are missing', async () => {
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ spanish: '<html>no privacy control</html>' }) }))
      .rejects.toThrow(/opt-out control/)
    await expect(verifyProductionPrivacy({ fetcher: mockFetch({ privacy: '<html>obsolete policy</html>' }) }))
      .rejects.toThrow(/production policy/)
  })
})
