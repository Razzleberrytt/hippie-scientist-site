import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('editorial Botanical Activity Atlas links', () => {
  it('keeps the ADHD stimulant comparison linked to a prefiltered atlas view', () => {
    const article = readFileSync(
      join(process.cwd(), 'content/articles/lions-mane-vs-stimulants-adhd.md'),
      'utf8',
    )

    expect(article).toContain('/tools/botanical-activity-atlas/natural-stimulants/')
    expect(article).toContain('effect=Stimulating+%2F+energy')
    expect(article).toContain('sort=evidence')
  })
})
