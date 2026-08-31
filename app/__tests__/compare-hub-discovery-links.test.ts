import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = process.cwd()
const hubPath = path.join(rootDir, 'app', 'guides', 'compare', 'page.tsx')
const comparisonSlug = 'caffeine-vs-caffeine-plus-l-theanine'
const comparisonPagePath = path.join(rootDir, 'app', 'guides', 'compare', comparisonSlug, 'page.tsx')

describe('comparison hub discovery links', () => {
  it('links the built caffeine stack comparison from the Energy & focus inventory', () => {
    const hubSource = fs.readFileSync(hubPath, 'utf8')

    expect(fs.existsSync(comparisonPagePath)).toBe(true)
    expect(hubSource).toContain(
      "{ slug: 'caffeine-vs-caffeine-plus-l-theanine', label: 'Caffeine vs Caffeine + L-Theanine', note: 'Caffeine alone vs the combined focus stack' },",
    )
    expect(hubSource).toContain('href={`/guides/compare/${pair.slug}/`}')
  })
})
