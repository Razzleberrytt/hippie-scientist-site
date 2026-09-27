import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

const guideHubs = [
  'app/guides/focus/page.tsx',
  'app/guides/anxiety/page.tsx',
  'app/guides/sleep/page.tsx',
  'app/guides/herbs/page.tsx',
  'app/guides/adhd/page.tsx',
]

describe('guide hub breadcrumb accessibility', () => {
  it.each(guideHubs)('%s names its breadcrumb navigation landmark', (relativePath) => {
    const source = readFileSync(path.join(root, relativePath), 'utf8')

    expect(source).toMatch(/<nav[^>]+aria-label=["']Breadcrumb["'][^>]*>/)
  })
})
