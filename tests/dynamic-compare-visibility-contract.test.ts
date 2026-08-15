import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('dynamic comparison visibility contract', () => {
  it('delegates fail-closed behavior to the canonical runtime visibility helper', () => {
    const page = read('app/guides/compare/dynamic/page.tsx')

    expect(page).toContain('.filter((record) => getRuntimeVisibility(record).canRender)')
    expect(page).not.toMatch(/getRuntimeVisibility\(record\)[\s\S]{0,120}catch[\s\S]{0,80}return true/)
  })

  it('keeps the interactive comparison page intentionally noindex', () => {
    const page = read('app/guides/compare/dynamic/page.tsx')

    expect(page).toContain('robots: { index: false, follow: true }')
    expect(page).toContain('.canRender')
    expect(page).not.toContain('.canIndex')
  })
})
