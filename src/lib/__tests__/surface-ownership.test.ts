import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const OWNER = path.join(ROOT, 'styles', 'premium-surfaces.css')
const CANONICAL_SURFACE_ALIASES = [
  'card-premium',
  'scientific-card',
  'library-card-premium',
  'library-content-card',
  'surface-depth',
  'surface-subtle',
  'section-frame',
  'glass-card',
  'mobile-reading-card',
]

function walkCss(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkCss(full)
    return entry.isFile() && entry.name.endsWith('.css') ? [full] : []
  })
}

function stripComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '')
}

function selectorBlocks(source: string, className: string) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`([^{}]*\\.${escaped}(?![A-Za-z0-9_-])[^{}]*)\\{`, 'g')
  return [...stripComments(source).matchAll(pattern)].map((match) => match[1].replace(/\s+/g, ' ').trim())
}

describe('canonical card/surface ownership', () => {
  it('keeps every legacy surface alias on the same canonical base rule', () => {
    const owner = stripComments(fs.readFileSync(OWNER, 'utf8'))
    const firstRulePrelude = owner.slice(0, owner.indexOf('{'))

    for (const alias of CANONICAL_SURFACE_ALIASES) {
      expect(firstRulePrelude, `${alias} should be owned by the shared base rule`).toContain(`.${alias}`)
    }
  })

  it('does not redefine canonical surface aliases outside premium-surfaces.css', () => {
    const cssFiles = [
      ...walkCss(path.join(ROOT, 'app')),
      ...walkCss(path.join(ROOT, 'styles')),
    ].filter((file) => path.resolve(file) !== path.resolve(OWNER))

    const violations: Array<{ file: string; alias: string; selector: string }> = []
    for (const file of cssFiles) {
      const source = fs.readFileSync(file, 'utf8')
      for (const alias of CANONICAL_SURFACE_ALIASES) {
        for (const selector of selectorBlocks(source, alias)) {
          violations.push({
            file: path.relative(ROOT, file).replaceAll(path.sep, '/'),
            alias,
            selector,
          })
        }
      }
    }

    expect(violations).toEqual([])
  })
})
