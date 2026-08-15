import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('dosing tool visibility contract', () => {
  it('uses one fail-closed eligibility predicate for herbs and compounds', () => {
    const page = read('app/info/dosing/page.tsx')

    expect(page).toContain('function isRenderableDosingRecord(record: RuntimeRecord)')
    expect(page).toContain('!isRestrictedRecord(record) && getRuntimeVisibility(record).canRender')
    expect(page).toContain('rawHerbs.filter(isRenderableDosingRecord)')
    expect(page).toContain('rawCompounds.filter(isRenderableDosingRecord)')
  })

  it('does not locally override runtime visibility errors with a fail-open fallback', () => {
    const page = read('app/info/dosing/page.tsx')

    expect(page).not.toMatch(/getRuntimeVisibility\([^)]*\)[\s\S]{0,120}catch[\s\S]{0,80}return true/)
  })
})
