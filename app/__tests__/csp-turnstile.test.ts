import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com'

function readCsp(): string {
  const headers = readSource('public/_headers')
  const line = headers
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('Content-Security-Policy:'))

  if (!line) throw new Error('public/_headers has no Content-Security-Policy line')
  return line.slice('Content-Security-Policy:'.length).trim()
}

function readDirective(csp: string, name: string): string {
  const directive = csp
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry === name || entry.startsWith(`${name} `))

  if (!directive) throw new Error(`CSP has no ${name} directive`)
  return directive
}

describe('CSP allows the Turnstile widget the signup forms depend on', () => {
  const csp = readCsp()

  it('loads Turnstile from the origin the widgets actually request', () => {
    // Both signup surfaces inject the script from this origin, so the CSP has to
    // name it or the widget never defines window.turnstile and no token is ever
    // produced for functions/api/subscribe.ts to verify.
    expect(readSource('components/security/TurnstileWidget.tsx')).toContain(TURNSTILE_ORIGIN)
    expect(readSource('components/NewsletterSignup.tsx')).toContain(TURNSTILE_ORIGIN)

    expect(readDirective(csp, 'script-src')).toContain(TURNSTILE_ORIGIN)
  })

  it('permits the Turnstile challenge iframe', () => {
    expect(readDirective(csp, 'frame-src')).toContain(TURNSTILE_ORIGIN)
  })

  it('permits the Turnstile client to talk to its own origin', () => {
    expect(readDirective(csp, 'connect-src')).toContain(TURNSTILE_ORIGIN)
  })

  it('still refuses to let other sites frame this one', () => {
    expect(readDirective(csp, 'frame-ancestors')).toBe("frame-ancestors 'none'")
  })
})
