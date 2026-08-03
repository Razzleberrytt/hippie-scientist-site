import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('Guides hub anxiety and stress routes', () => {
  it('keeps anxiety and stress as distinct visitor paths', () => {
    const guides = read('app/guides/page.tsx')

    expect(guides).toContain("title: 'Anxiety'")
    expect(guides).toContain("href: '/guides/anxiety/'")
    expect(guides).toContain("title: 'Stress Decision Hub'")
    expect(guides).toContain("href: '/guides/stress/'")
    expect(guides).not.toContain("title: 'Anxiety & Stress'")
  })
})
