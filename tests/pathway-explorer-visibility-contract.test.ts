import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('pathway explorer visibility contract', () => {
  it('uses one fail-closed eligibility predicate for herbs and compounds', () => {
    const page = read('app/learn/explorer/page.tsx')

    expect(page).toContain('function isRenderableExplorerRecord(record: ExplorerSourceRecord)')
    expect(page).toContain('return getRuntimeVisibility(record).canRender')
    expect(page).toContain('rawHerbs.filter(isRenderableExplorerRecord)')
    expect(page).toContain('rawCompounds.filter(isRenderableExplorerRecord)')
  })

  it('does not locally override runtime visibility errors with a fail-open fallback', () => {
    const page = read('app/learn/explorer/page.tsx')

    expect(page).not.toMatch(/getRuntimeVisibility\([^)]*\)[\s\S]{0,120}catch[\s\S]{0,80}return true/)
  })
})
