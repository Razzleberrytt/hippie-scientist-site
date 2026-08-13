import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = path.join(process.cwd(), 'app/guides/other/alkaloids-on-amazon/page.tsx')

describe('alkaloid marketplace guide authorship', () => {
  it('names the reviewer instead of implying an unnamed editorial team', () => {
    const page = fs.readFileSync(SOURCE, 'utf8')

    expect(page).toContain('Willie B. Randolph III')
    expect(page).toContain('href="/info/about/"')
    expect(page).not.toContain('The Hippie Scientist editorial team')
  })
})
