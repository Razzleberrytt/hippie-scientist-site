import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('conversion sticky CTA trust contract', () => {
  it('keeps both sticky affiliate surfaces explicitly disclosed and neutrally framed', () => {
    const source = read('components/conversion-sticky-cta.tsx')

    expect(source.match(/Affiliate link · We may earn a commission\./g)).toHaveLength(2)
    expect(source.match(/Affiliate option/g)).toHaveLength(2)
    expect(source).not.toContain('Popular choice')
    expect(source).not.toContain('Top pick')
    expect(source).not.toContain('View top pick')
  })

  it('preserves sponsored external-link semantics and adds specific accessible names', () => {
    const source = read('components/conversion-sticky-cta.tsx')

    expect(source.match(/target="_blank"/g)).toHaveLength(2)
    expect(source.match(/rel="noopener noreferrer sponsored"/g)).toHaveLength(2)
    expect(source.match(/aria-label=\{affiliateAriaLabel\}/g)).toHaveLength(2)
    expect(source).toContain('(affiliate link, opens in a new tab)')
  })

  it('does not change the existing scroll threshold or product destination ownership', () => {
    const source = read('components/conversion-sticky-cta.tsx')

    expect(source).toContain('setVisible(depth > 22)')
    expect(source.match(/href=\{href\}/g)).toHaveLength(2)
  })
})
