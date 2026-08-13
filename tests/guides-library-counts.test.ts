import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('guides library inventory semantics', () => {
  it('does not present raw source inventory as public library totals', () => {
    const guidesPage = read('app/guides/page.tsx')

    expect(guidesPage).not.toContain("import buildReport from '@/public/data/build-report.json'")
    expect(guidesPage).not.toContain('{counts.herbs}')
    expect(guidesPage).not.toContain('{counts.compounds}')
    expect(guidesPage).toContain('Browse the published herb and compound libraries')
    expect(guidesPage).toContain('keep source inventory separate from what readers can actually browse')
  })
})
