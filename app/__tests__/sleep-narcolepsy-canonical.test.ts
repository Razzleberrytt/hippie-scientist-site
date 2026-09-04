import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function exists(relativePath: string) {
  return fs.existsSync(path.join(ROOT, relativePath))
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
}

describe('narcolepsy sleep-cluster canonicalization', () => {
  it('keeps one canonical narcolepsy evidence article linked from the sleep hub', () => {
    const canonical = 'content/articles/narcolepsy-excessive-daytime-sleepiness.md'
    const duplicate = 'content/articles/narcolepsy-and-daytime-sleepiness.md'
    const hub = read('app/guides/sleep/page.tsx')

    expect(exists(canonical)).toBe(true)
    expect(exists(duplicate)).toBe(false)
    expect(hub).toContain('/articles/narcolepsy-excessive-daytime-sleepiness/')
    expect(hub).not.toContain('/articles/narcolepsy-and-daytime-sleepiness/')
  })

  it('keeps the canonical article diagnostic rather than symptom-checklist driven', () => {
    const article = read('content/articles/narcolepsy-excessive-daytime-sleepiness.md').replace(/\s+/g, ' ')

    expect(article).toMatch(/sleep paralysis.*not diagnostic|sleep paralysis.*clue/i)
    expect(article).toMatch(/cataplexy/i)
    expect(article).toMatch(/MSLT/i)
    expect(article).toMatch(/insufficient sleep|sleep deprivation/i)
    expect(article).toMatch(/shift work|circadian/i)
  })
})
