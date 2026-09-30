import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('guides library inventory semantics', () => {
  it('keeps ingredient inventory separate from the guide hub', () => {
    const guidesPage = read('app/guides/page.tsx')

    expect(guidesPage).not.toContain("import buildReport from '@/public/data/build-report.json'")
    expect(guidesPage).not.toContain('{counts.herbs}')
    expect(guidesPage).not.toContain('{counts.compounds}')
    expect(guidesPage).toContain('Look up an ingredient')
    expect(guidesPage).toContain('Use the herb or compound databases.')
    expect(guidesPage).toContain("href: '/herbs/'")
  })
})
