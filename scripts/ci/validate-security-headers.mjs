import fs from 'node:fs'

const headers = fs.readFileSync('public/_headers', 'utf8')

const requiredSubstrings = [
  'Content-Security-Policy',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'Permissions-Policy: camera=()',
  'Strict-Transport-Security',
  "script-src 'self'",
  'https://www.googletagmanager.com',
  'https://analytics.ahrefs.com',
  'connect-src',
  'https://www.google-analytics.com',
  // Turnstile gates every /api/subscribe signup. It loads a script and renders
  // the challenge in an iframe, so losing either allowance silently breaks the
  // newsletter forms in production.
  'https://challenges.cloudflare.com',
  'frame-src https://challenges.cloudflare.com',
]

const missing = requiredSubstrings.filter(value => !headers.includes(value))

if (missing.length) {
  console.error('Missing security header/CSP requirements:\n' + missing.join('\n'))
  process.exit(1)
}

console.log('validate-security-headers: OK (required headers and analytics CSP origins present)')
