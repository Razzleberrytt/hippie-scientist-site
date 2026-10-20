import { describe, expect, it } from 'vitest'
import { onRequest } from '../../functions/api/analytics-eligibility'

function edgeRequest(country?: string): Request {
  // Cloudflare attaches country to Request.cf, not the client-supplied headers.
  return { cf: country ? { country } : undefined } as unknown as Request
}

describe('regional GA4 release gate (Cloudflare Pages)', () => {
  it('defaults on only for server-verified US traffic', async () => {
    const response = await onRequest({ request: edgeRequest('US') })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ defaultGa4Allowed: true })
    expect(response.headers.get('Cache-Control')).toContain('no-store')
    expect(response.headers.get('Set-Cookie')).toBeNull()
  })

  it.each(['DE', 'FR', 'ES', 'GB', 'CA', 'EU', 'T1', 'XX'])('requires prior consent for %s', async (country) => {
    const response = await onRequest({ request: edgeRequest(country) })
    expect(await response.json()).toEqual({ defaultGa4Allowed: false })
  })

  it('fails closed without geolocation', async () => {
    const response = await onRequest({ request: edgeRequest() })
    expect(await response.json()).toEqual({ defaultGa4Allowed: false })
  })

  it('does not honor spoofed region request headers', async () => {
    const request = Object.assign(new Request('https://thehippiescientist.net/api/analytics-eligibility', {
      headers: { 'CF-IPCountry': 'US', 'X-Country': 'US' },
    }), { cf: { country: 'DE' } })
    const response = await onRequest({ request })
    expect(await response.json()).toEqual({ defaultGa4Allowed: false })
  })
})
