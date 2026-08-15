import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { selectPublishedHerbs } from '../app/herbs/library-data'

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

  it('selects only canonical published herbs and sorts them for the library', () => {
    const herbs = selectPublishedHerbs([
      { slug: 'z-published', displayName: 'Zed', indexability_status: 'PUBLISH' },
      { slug: 'noindex', displayName: 'Noindex', indexability_status: 'NOINDEX' },
      { slug: 'hidden', displayName: 'Hidden', indexability_status: 'PUBLISH', runtime_export_decision: 'hide' },
      { slug: 'garlic', displayName: 'Garlic', indexability_status: 'PUBLISH' },
      { slug: 'allium-sativum', displayName: 'Allium sativum', indexability_status: 'PUBLISH' },
      { slug: 'a-published', displayName: 'Alpha', indexability_status: 'PUBLISH' },
      { displayName: 'Missing slug', indexability_status: 'PUBLISH' },
    ])

    expect(herbs.map((herb) => herb.slug)).toEqual(['a-published', 'garlic', 'z-published'])
  })

  it('uses the canonical published-herb loader on every library page', () => {
    const firstPage = read('app/herbs/page.tsx')
    const paginatedPage = read('app/herbs/page/[page]/page.tsx')

    expect(firstPage).toContain('loadPublishedHerbs')
    expect(paginatedPage).toContain('loadPublishedHerbs')
  })
})
