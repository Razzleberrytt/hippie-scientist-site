import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'info', 'infographics', 'page.tsx'), 'utf8')

describe('infographics editorial parity', () => {
  it('uses canonical publication surfaces around the visual assets', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
    expect(source).toContain('section-frame')
    expect(source).toContain('chip-readable')
  })

  it('does not return to the old branded gradient/white-panel shell', () => {
    expect(source).not.toContain('bg-gradient-to-br from-brand-100/80')
    expect(source).not.toContain('bg-gradient-to-b from-brand-50/90')
    expect(source).not.toContain('border-brand-900/10 bg-brand-50/60')
    expect(source).not.toContain('bg-white/85')
    expect(source).not.toContain('chip-readable bg-white')
  })

  it('preserves the two current infographic assets and their source-guide paths', () => {
    expect(source).toContain('/images/guides/sleep-supplements-guide.jpg')
    expect(source).toContain('/images/guides/adhd-supplements-hub.jpg')
    expect(source).toContain("sourceHref: '/guides/sleep/'")
    expect(source).toContain("sourceHref: '/guides/adhd/'")
  })

  it('keeps attribution, embedding, and responsible-sharing context explicit', () => {
    expect(source).toContain('infographicEmbedCode')
    expect(source).toContain('Attribution and the source-guide link are included.')
    expect(source).toContain('Share the visual. Preserve the nuance.')
    expect(source).toContain('Keep the cautions intact')
  })

  it('keeps the medical-advice boundary intact', () => {
    expect(source).toContain('They do not replace individualized medical guidance.')
  })

  it('keeps interactive visual and embed controls keyboard-visible', () => {
    expect(source).toContain('focus-visible:ring-2')
  })
})
