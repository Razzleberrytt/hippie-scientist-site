import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('Learn hub destination handoffs', () => {
  it('keeps Learn concept-first while routing decisions and verification elsewhere', () => {
    const page = read('app/learn/page.tsx')

    expect(page).toContain("EditorialFamilyNav active='learn'")
    expect(page).toContain('Practical decisions belong in Guides')
    expect(page).toContain('source-level verification belongs in Research')
    expect(page).toContain("href='/research/'")
    expect(page).toContain("href='/herbs/'")
  })
})
