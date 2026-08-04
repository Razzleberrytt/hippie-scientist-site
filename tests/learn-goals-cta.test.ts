import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('Learn hub hero actions', () => {
  it('sends goal exploration and guide browsing to distinct hubs', () => {
    const page = read('app/learn/page.tsx')

    expect(page).toMatch(/href='\/goals\/'[\s\S]*?Explore Goal Guides/)
    expect(page).toMatch(/href='\/guides\/'[\s\S]*?Browse all guides/)
  })
})
