import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\s+/g, ' ')
}

describe('tinnitus sleep research integration', () => {
  it('keeps the tinnitus evidence review discoverable from the canonical sleep hub', () => {
    const hub = read('app/guides/sleep/page.tsx')
    expect(hub).toContain('/articles/tinnitus-and-sleep/')
    expect(hub).toContain('Tinnitus and Sleep')
  })

  it('preserves tinnitus, insomnia and intervention-specificity guardrails', () => {
    const tinnitus = read('content/articles/tinnitus-and-sleep.md')

    expect(tinnitus).toMatch(/more than 80%|>80%/i)
    expect(tinnitus).toMatch(/3\.28/i)
    expect(tinnitus).toMatch(/loudness.*not.*insomnia|loudness is not the same thing as insomnia/i)
    expect(tinnitus).toMatch(/not interchangeable/i)
    expect(tinnitus).toMatch(/white noise|sound enrichment/i)
    expect(tinnitus).toMatch(/sleep apnea/i)
  })
})
