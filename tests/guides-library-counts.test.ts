import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('guides library counts', () => {
  it('uses generated build counts instead of hardcoded totals', () => {
    const guidesPage = read('app/guides/page.tsx')

    expect(guidesPage).toContain("import buildReport from '@/public/data/build-report.json'")
    expect(guidesPage).toContain('Explore {counts.herbs} herbs and {counts.compounds} active compounds.')
    expect(guidesPage).not.toMatch(/Explore \d+ herbs and \d+ active compounds\./)
  })
})
