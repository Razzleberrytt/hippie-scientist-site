import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\s+/g, ' ')
}

const REQUIRED_SLUGS = [
  'ptsd-nightmares-and-sleep',
  'sleep-paralysis',
  'sleepwalking-nrem-parasomnias',
  'rem-sleep-behavior-disorder',
  'narcolepsy-excessive-daytime-sleepiness',
  'idiopathic-hypersomnia-vs-narcolepsy',
]

describe('parasomnia and hypersomnolence sleep integration', () => {
  it('keeps the diagnostic cluster visible from the canonical sleep hub', () => {
    const hub = read('app/guides/sleep/page.tsx')

    expect(hub).toContain('Parasomnias & hypersomnolence')
    for (const slug of REQUIRED_SLUGS) {
      expect(hub).toContain(`/articles/${slug}/`)
    }
  })

  it('preserves the major diagnostic boundaries', () => {
    const ptsd = read('content/articles/ptsd-nightmares-and-sleep.md')
    const paralysis = read('content/articles/sleep-paralysis.md')
    const walking = read('content/articles/sleepwalking-nrem-parasomnias.md')
    const rbd = read('content/articles/rem-sleep-behavior-disorder.md')
    const narcolepsy = read('content/articles/narcolepsy-excessive-daytime-sleepiness.md')
    const ih = read('content/articles/idiopathic-hypersomnia-vs-narcolepsy.md')

    expect(ptsd).toMatch(/CBT-I/i)
    expect(ptsd).toMatch(/imagery rehearsal/i)
    expect(paralysis).toMatch(/REM[- ]wake|REM.*atonia/i)
    expect(paralysis).toMatch(/narcolepsy/i)
    expect(walking).toMatch(/NREM/i)
    expect(walking).toMatch(/48%.*63%|48% to 63%/i)
    expect(rbd).toMatch(/polysomnography|PSG/i)
    expect(rbd).toMatch(/immediate-release melatonin/i)
    expect(narcolepsy).toMatch(/cataplexy/i)
    expect(narcolepsy).toMatch(/MSLT/i)
    expect(ih).toMatch(/poor test-retest reliability/i)
    expect(ih).toMatch(/narcolepsy type 2|NT2/i)
  })
})
