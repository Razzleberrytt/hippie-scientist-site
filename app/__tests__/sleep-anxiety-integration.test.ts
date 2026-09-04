import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\s+/g, ' ')
}

describe('anxiety sleep research integration', () => {
  it('keeps the anxiety evidence review discoverable from the canonical sleep hub', () => {
    const hub = read('app/guides/sleep/page.tsx')
    expect(hub).toContain('/articles/anxiety-and-sleep/')
    expect(hub).toContain('Anxiety and Sleep')
  })

  it('preserves treatment-specificity and differential-diagnosis guardrails', () => {
    const anxiety = read('content/articles/anxiety-and-sleep.md')

    expect(anxiety).toMatch(/bidirectional/i)
    expect(anxiety).toMatch(/d = -1\.04/i)
    expect(anxiety).toMatch(/d = -0\.28/i)
    expect(anxiety).toMatch(/not automatically anxiety treatment|not automatically anxiety|not.*substitute.*anxiety/i)
    expect(anxiety).toMatch(/sleep apnea/i)
    expect(anxiety).toMatch(/sleep hygiene.*not.*CBT-I|not.*equivalent.*CBT-I/i)
  })
})
