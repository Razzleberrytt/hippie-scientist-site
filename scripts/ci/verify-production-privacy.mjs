// Post-deploy smoke check: verify live privacy surfaces independently of the build.
// This does not claim to prove real GA4 collection or every regional request path.
import { pathToFileURL } from 'node:url'

const DEFAULT_ORIGIN = 'https://thehippiescientist.net'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function getResponse(fetcher, url, accept) {
  const response = await fetcher(url, {
    method: 'GET',
    headers: {
      Accept: accept,
      'Cache-Control': 'no-cache',
      'User-Agent': 'ths-production-privacy-smoke',
    },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  })
  assert(response.ok, `Privacy smoke: ${new URL(url).pathname} returned HTTP ${response.status}`)
  return response
}

export async function verifyProductionPrivacy({ origin = DEFAULT_ORIGIN, fetcher = fetch } = {}) {
  const base = origin.endsWith('/') ? origin.slice(0, -1) : origin

  const eligibility = await getResponse(fetcher, `${base}/api/analytics-eligibility`, 'application/json')
  const jsonType = eligibility.headers.get('content-type') || ''
  const cache = eligibility.headers.get('cache-control') || ''
  assert(jsonType.toLowerCase().includes('application/json'), 'Privacy smoke: eligibility returned non-JSON content')
  assert(/no-store/i.test(cache), 'Privacy smoke: eligibility response is missing no-store')
  assert((eligibility.headers.get('cf-cache-status') || '').toUpperCase() !== 'HIT', 'Privacy smoke: personalized eligibility was edge-cached')
  const payload = await eligibility.json()
  assert(payload && typeof payload === 'object' && typeof payload.defaultGa4Allowed === 'boolean',
    'Privacy smoke: eligibility missing a strict boolean defaultGa4Allowed')
  assert(Object.keys(payload).length === 1, 'Privacy smoke: eligibility unexpectedly exposes extra fields')

  // Compare the Pages Function's decision with Cloudflare's independent edge
  // geolocation for this same probe. Never print/store trace IP or headers.
  const trace = await getResponse(fetcher, `${base}/cdn-cgi/trace`, 'text/plain')
  const traceText = await trace.text()
  const traceCountry = /^loc=([A-Z]{2})$/m.exec(traceText)?.[1]
  assert(Boolean(traceCountry), 'Privacy smoke: Cloudflare trace did not expose a country')
  assert(payload.defaultGa4Allowed === (traceCountry === 'US'),
    'Privacy smoke: live geo eligibility disagrees with Cloudflare trace country')

  const spanish = await getResponse(fetcher, `${base}/es/`, 'text/html')
  const esType = spanish.headers.get('content-type') || ''
  assert(esType.includes('text/html'), 'Privacy smoke: Spanish route did not return HTML')
  const spanishHtml = await spanish.text()
  assert(spanishHtml.includes('Configuración de privacidad'), 'Privacy smoke: Spanish opt-out control is not server-rendered')
  assert(spanishHtml.includes('Privacy policy (English)'), 'Privacy smoke: translated footer lacks privacy policy link')

  const policy = await getResponse(fetcher, `${base}/info/privacy/`, 'text/html')
  assert((policy.headers.get('content-type') || '').includes('text/html'), 'Privacy smoke: privacy policy did not return HTML')
  const policyHtml = await policy.text()
  assert(policyHtml.includes('Cloudflare confirms the visitor is in the United States'),
    'Privacy smoke: production policy does not disclose the U.S.-scoped default GA4 behavior')

  console.log('Production privacy smoke PASS: JSON eligibility endpoint is uncached, localized opt-out and regional disclosure are published.')
  console.log(`Regional eligibility and independent Cloudflare trace agree: ${payload.defaultGa4Allowed ? 'allowed' : 'requires opt-in'} (probe only)`)
  return { regionAllowedAtProbe: payload.defaultGa4Allowed }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  verifyProductionPrivacy({ origin: process.env.PRODUCTION_ORIGIN || DEFAULT_ORIGIN })
    .catch((error) => {
      console.error(error?.stack || String(error))
      process.exitCode = 1
    })
}
