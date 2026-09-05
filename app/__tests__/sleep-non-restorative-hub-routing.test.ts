import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const HUB = path.join(ROOT, 'app/guides/sleep/page.tsx')
const ARTICLE = path.join(ROOT, 'content/articles/non-restorative-sleep.md')

describe('non-restorative sleep hub routing', () => {
  it('routes enough-sleep-but-unrefreshed intent to the canonical article', () => {
    const hub = fs.readFileSync(HUB, 'utf8')

    expect(hub).toContain("problem: 'You sleep enough but still wake up unrefreshed'")
    expect(hub).toContain("href: '/articles/non-restorative-sleep/'")
    expect(fs.existsSync(ARTICLE)).toBe(true)
  })

  it('keeps non-restorative sleep in core sleep science so the hub schema includes it', () => {
    const hub = fs.readFileSync(HUB, 'utf8')
    const coreScience = hub.slice(
      hub.indexOf('const CORE_SLEEP_SCIENCE'),
      hub.indexOf('const CIRCADIAN_AND_SCHEDULE'),
    )

    expect(coreScience).toContain("href: '/articles/non-restorative-sleep/'")
    expect(hub).toContain('...CORE_SLEEP_SCIENCE.map((g) => ({ name: g.title, url: g.href }))')
  })
})
