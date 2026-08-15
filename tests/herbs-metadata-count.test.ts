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

  it('uses one published/indexable herb selector across every library page', () => {
    const libraryData = read('app/herbs/library-data.ts')
    const firstPage = read('app/herbs/page.tsx')
    const paginatedPage = read('app/herbs/page/[page]/page.tsx')

    expect(libraryData).toContain('getRuntimeVisibility(herb).canIndex')
    expect(libraryData).not.toContain('getRuntimeVisibility(herb).canRender')
    expect(firstPage).toContain('loadPublishedHerbs')
    expect(paginatedPage).toContain('loadPublishedHerbs')
  })
})
