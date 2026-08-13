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
})
