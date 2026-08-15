import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('herbs metadata inventory semantics', () => {
  it('does not present raw build inventory as the published herb total', () => {
    const page = read('app/herbs/page.tsx')

    expect(page).not.toContain("import buildReport from '@/public/data/build-report.json'")
    expect(page).toContain('Browse published herb profiles')
    expect(page).toContain('for {herbs.length} herbs')
    expect(page).not.toContain('buildReport.counts.herbs')
  })

  it('lists only published/indexable herbs on every library page', () => {
    const firstPage = read('app/herbs/page.tsx')
    const paginatedPage = read('app/herbs/page/[page]/page.tsx')

    expect(firstPage).toContain('getRuntimeVisibility(herb).canIndex')
    expect(firstPage).not.toContain('getRuntimeVisibility(herb).canRender')
    expect(paginatedPage).toContain('getRuntimeVisibility(h).canIndex')
    expect(paginatedPage).not.toContain('getRuntimeVisibility(h).canRender')
  })
})
