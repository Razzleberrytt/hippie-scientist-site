import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('homepage goal routes', () => {
  it('sends stress and anxiety visitors to their distinct decision hubs', () => {
    const homepage = read('components/homepage-v2.tsx')

    expect(homepage).toMatch(/slug: 'stress',[\s\S]*?href: '\/guides\/stress\/'/)
    expect(homepage).toMatch(/slug: 'anxiety',[\s\S]*?href: '\/guides\/anxiety\/'/)
  })
})
