// Legacy/non-canonical endpoint.
// Canonical production form flow is client-side POST to VITE_FORM_ENDPOINT on Netlify static hosting.
function getHeader(headers, name) {
  if (!headers) return ''
  const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase())
  if (!key) return ''
  const value = headers[key]
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || process.env.SITE_URL || ''
  return raw
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
}

function applyCors(req, res) {
  const origin = getHeader(req.headers, 'origin')
  const allowedOrigins = parseAllowedOrigins()

  // Security hardening: avoid permissive `*` CORS on this legacy handler.
  // If no explicit allowlist is configured, default to same-origin behavior (no ACAO header).
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  applyCors(req, res)

  const hasApiKey = Boolean(process.env.RESEND_API_KEY)

  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      ok: true,
      message: 'Preflight OK',
    })
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      method: 'GET',
      hasApiKey,
      message: 'Subscribe API is reachable',
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET,POST,OPTIONS')
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
      hasApiKey,
      email: '',
    })
  }

  let payload

  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({
      ok: false,
      error: 'body-parse-failed',
      step: 'parse',
    })
  }

  const email =
    payload &&
    typeof payload === 'object' &&
    typeof payload.email === 'string'
      ? payload.email.trim().toLowerCase()
      : ''

  return res.status(200).json({
    ok: true,
    method: 'POST',
    email,
    hasApiKey,
    step: 'post-handler-reached',
  })
}
