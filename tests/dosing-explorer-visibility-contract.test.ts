import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('interactive tool visibility contracts', () => {
  it('keeps dosing visibility fail-closed while preserving the restricted-record gate', () => {
    const page = read('app/info/dosing/page.tsx')

    expect(page).toContain('!isRestrictedRecord(h) && getRuntimeVisibility(h).canRender')
    expect(page).toContain('!isRestrictedRecord(c) && getRuntimeVisibility(c).canRender')
    expect(page).not.toMatch(/getRuntimeVisibility\([hc]\)[\s\S]{0,120}catch[\s\S]{0,80}return true/)
  })

  it('keeps pathway explorer visibility fail-closed', () => {
    const page = read('app/learn/explorer/page.tsx')

    expect(page).toContain('getRuntimeVisibility(h).canRender')
    expect(page).toContain('getRuntimeVisibility(c).canRender')
    expect(page).not.toMatch(/getRuntimeVisibility\([hc]\)[\s\S]{0,120}catch[\s\S]{0,80}return true/)
  })
})
