import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const headersPath = fileURLToPath(new URL('../../../public/_headers', import.meta.url))
const headers = readFileSync(headersPath, 'utf8')

function ruleBody(pattern) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = headers.match(new RegExp(`^${escaped}\\n((?:[ \\t].*(?:\\n|$))+)`, 'm'))
  if (!match) throw new Error(`Missing _headers rule for ${pattern}`)
  return match[1]
}

describe('governed provider-media response headers', () => {
  it('keeps the site-wide same-origin resource-policy default', () => {
    const globalRule = ruleBody('/*')
    expect(globalRule).toContain('Cross-Origin-Resource-Policy: same-origin')
    expect(globalRule).toContain('X-Content-Type-Options: nosniff')
  })

  it('allows cross-origin ingestion only for the dedicated distribution-media path', () => {
    const providerMediaRule = ruleBody('/media/distribution/*')

    expect(providerMediaRule).toContain('! Cross-Origin-Resource-Policy')
    expect(providerMediaRule).toContain('Cross-Origin-Resource-Policy: cross-origin')
    expect(providerMediaRule).toContain('Access-Control-Allow-Origin: *')
    expect(headers.match(/Access-Control-Allow-Origin: \*/g)).toHaveLength(1)
  })
})
