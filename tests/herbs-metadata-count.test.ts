import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('herbs metadata inventory count', () => {
  it('uses the canonical build report instead of a hardcoded public total', () => {
    const page = read('app/herbs/page.tsx')

    expect(page).toContain("import buildReport from '@/public/data/build-report.json'")
    expect(page).toContain('buildReport.counts.herbs')
    expect(page).not.toContain('100+ herbs')
  })
})
