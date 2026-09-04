import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\s+/g, ' ')
}

describe('depression sleep research integration', () => {
  it('keeps the depression evidence review discoverable from the canonical sleep hub', () => {
    const hub = read('app/guides/sleep/page.tsx')
    expect(hub).toContain('/articles/depression-and-sleep/')
    expect(hub).toContain('Depression and Sleep')
  })

  it('preserves phenotype, treatment and prevention guardrails', () => {
    const depression = read('content/articles/depression-and-sleep.md')

    expect(depression).toMatch(/OR 2\.28/i)
    expect(depression).toMatch(/OR 3\.57/i)
    expect(depression).toMatch(/hypersomnia/i)
    expect(depression).toMatch(/age 60 or older|60 years or older|adults age 60/i)
    expect(depression).toMatch(/does not establish.*sufficient treatment|does not.*replace|adjunct/i)
    expect(depression).toMatch(/sleep apnea/i)
  })
})
