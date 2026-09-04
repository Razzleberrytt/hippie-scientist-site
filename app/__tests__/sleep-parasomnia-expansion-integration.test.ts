import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\s+/g, ' ')
}

const REQUIRED_SLUGS = [
  'night-terrors-vs-nightmares',
  'exploding-head-syndrome',
  'sleep-related-eating-disorder',
]

describe('expanded parasomnia sleep-hub integration', () => {
  it('keeps the three newer parasomnia routes visible from the canonical sleep hub', () => {
    const hub = read('app/guides/sleep/page.tsx')

    for (const slug of REQUIRED_SLUGS) {
      expect(hub).toContain(`/articles/${slug}/`)
    }
  })

  it('preserves the diagnostic and treatment boundaries behind those routes', () => {
    const terrors = read('content/articles/night-terrors-vs-nightmares.md')
    const ehs = read('content/articles/exploding-head-syndrome.md')
    const sred = read('content/articles/sleep-related-eating-disorder.md')

    expect(terrors).toMatch(/NREM/i)
    expect(terrors).toMatch(/recall|remember/i)
    expect(terrors).toMatch(/nightmare/i)

    expect(ehs).toMatch(/painless/i)
    expect(ehs).toMatch(/benign/i)
    expect(ehs).toMatch(/no empirically supported interventions|no established treatment|treatment evidence.*weak/i)

    expect(sred).toMatch(/night eating syndrome|NES/i)
    expect(sred).toMatch(/zolpidem|medication/i)
    expect(sred).toMatch(/topiramate/i)
    expect(sred).toMatch(/small|dropout/i)
  })
})
