import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const retiredPage = path.join(root, 'app/guides/sleep/sleep-herbs-vs-melatonin/page.tsx')
const canonicalPage = path.join(root, 'app/guides/compare/sleep-herbs-vs-melatonin/page.tsx')
const overrideFile = path.join(root, 'public/redirect-overrides/010-sleep-herbs-vs-melatonin-canonical.txt')
const winner = '/guides/compare/sleep-herbs-vs-melatonin/'

describe('sleep herbs vs melatonin canonical ownership', () => {
  it('keeps one indexable page owner and redirects every retired alias to it', () => {
    expect(fs.existsSync(retiredPage)).toBe(false)
    expect(fs.existsSync(canonicalPage)).toBe(true)

    const redirects = fs.readFileSync(overrideFile, 'utf8')
    expect(redirects).toContain(`/guides/sleep/sleep-herbs-vs-melatonin/ ${winner} 301`)
    expect(redirects).toContain(`/guides/sleep-herbs-vs-melatonin/ ${winner} 301`)
    expect(redirects).toContain(`/sleep-herbs-vs-melatonin/ ${winner} 301`)
  })
})
