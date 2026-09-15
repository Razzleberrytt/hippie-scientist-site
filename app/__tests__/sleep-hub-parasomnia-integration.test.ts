import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const HUB = path.join(process.cwd(), 'app/guides/sleep/page.tsx')
const ARTICLES = {
  nightTerrors: path.join(process.cwd(), 'content/articles/night-terrors-vs-nightmares.md'),
  explodingHead: path.join(process.cwd(), 'content/articles/exploding-head-syndrome.md'),
  sleepEating: path.join(process.cwd(), 'content/articles/sleep-related-eating-disorder.md'),
}

function source(file: string) {
  return fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ')
}

describe('sleep hub parasomnia discovery', () => {
  it('exposes each established review through the canonical hub and ItemList owner', () => {
    const hub = source(HUB)

    expect(hub).toContain('/articles/night-terrors-vs-nightmares/')
    expect(hub).toContain('/articles/exploding-head-syndrome/')
    expect(hub).toContain('/articles/sleep-related-eating-disorder/')
    expect(hub).toMatch(/\.\.\.PARASOMNIAS_AND_HYPERSOMNOLENCE\.map\(\(g\) => \(\{ name: g\.title, url: g\.href \}\)\)/)
  })

  it('preserves the diagnosis and treatment boundaries in the linked source articles', () => {
    const nightTerrors = source(ARTICLES.nightTerrors)
    const explodingHead = source(ARTICLES.explodingHead)
    const sleepEating = source(ARTICLES.sleepEating)

    expect(nightTerrors).toMatch(/NREM disorders? of arousal/i)
    expect(nightTerrors).toMatch(/little or no next-morning (memory|recall)/i)
    expect(nightTerrors).toMatch(/Nightmares are remembered dream experiences/i)

    expect(explodingHead).toMatch(/usually a \*\*painless perceived explosion or loud bang/i)
    expect(explodingHead).toMatch(/syndrome itself is generally benign/i)
    expect(explodingHead).toMatch(/evidence base is still limited, especially for treatment/i)

    expect(sleepEating).toMatch(/impaired awareness and often partial or complete amnesia/i)
    expect(sleepEating).toMatch(/SRED and night eating syndrome are different/i)
    expect(sleepEating).toMatch(/side effects and dropout were important/i)
  })

  it('keeps the existing narcolepsy path and avoids a supplement-first framing', () => {
    const hub = source(HUB)

    expect(hub).toContain('/articles/narcolepsy-excessive-daytime-sleepiness/')
    expect(hub).toMatch(/not a reason to build a supplement stack/i)
    expect(hub).toMatch(/medication triggers and treatment limits matter/i)
  })
})
