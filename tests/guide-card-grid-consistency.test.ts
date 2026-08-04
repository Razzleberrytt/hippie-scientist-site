import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('shared guide card grid', () => {
  it('uses the normalized discovery-card shell and explicit guide action', () => {
    const grid = read('components/guides/GuideCardGrid.tsx')

    expect(grid).toContain('flex h-full flex-col rounded-2xl border border-brand-900/10')
    expect(grid).toContain('mt-auto pt-4')
    expect(grid).toContain('Open guide')
    expect(grid).not.toContain('rounded-xl border-2')
  })
})
