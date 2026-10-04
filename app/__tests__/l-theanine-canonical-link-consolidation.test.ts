import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const liveOwners = [
  'content/articles/passionflower.md',
  'content/articles/rhodiola-rosea.md',
  'content/articles/bacopa-monnieri.md',
  'content/guides/kava.mdx',
  'content/articles/magnesium-l-theanine-sleep-stack.md',
  'content/guides/passionflower.mdx',
  'content/articles/lions-mane-mushroom-benefits-mechanisms-dosage-evidence-guide.md',
]

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('L-theanine canonical internal-link consolidation', () => {
  it('keeps current live content off the redirected legacy article URL', () => {
    for (const owner of liveOwners) {
      const source = read(owner)
      expect(source, owner).not.toContain('/articles/l-theanine/')
      expect(source, owner).toContain('/guides/herbs/l-theanine/')
    }
  })

  it('preserves the direct legacy redirect to the canonical umbrella guide', () => {
    const redirects = read('public/_redirects')
    expect(redirects).toContain('/articles/l-theanine /guides/herbs/l-theanine/ 301')
    expect(redirects).toContain('/articles/l-theanine/ /guides/herbs/l-theanine/ 301')
    expect(redirects).toContain('https://www.thehippiescientist.net/articles/l-theanine https://thehippiescientist.net/guides/herbs/l-theanine/ 301')
    expect(redirects).toContain('https://www.thehippiescientist.net/articles/l-theanine/ https://thehippiescientist.net/guides/herbs/l-theanine/ 301')
    expect(redirects.indexOf('https://www.thehippiescientist.net/articles/l-theanine/')).toBeLessThan(
      redirects.indexOf('https://www.thehippiescientist.net/* https://thehippiescientist.net/:splat 301'),
    )
  })

  it('keeps intent-specific spokes distinct from the umbrella page', () => {
    const umbrella = read('app/guides/herbs/l-theanine/page.tsx')
    expect(umbrella).toContain('/guides/anxiety/l-theanine-for-anxiety/')
    expect(umbrella).toContain('/guides/sleep/l-theanine-for-sleep/')
    expect(umbrella).toContain('/guides/focus/l-theanine-vs-caffeine-for-focus/')
    expect(umbrella).toContain('/guides/focus/l-theanine-without-caffeine/')
  })
})
