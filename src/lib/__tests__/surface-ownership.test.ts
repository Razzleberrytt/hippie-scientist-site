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

const CONDITIONAL_AT_RULE = /^@(media|supports|container|document|starting-style)\b/i

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

/**
 * Return only unconditional base-rule redefinitions of a canonical alias.
 * Descendant/state selectors and responsive/support/container refinements are
 * legitimate consumers of the canonical surface and are not ownership claims.
 * Rules nested in non-conditional grouping at-rules (for example @layer) still
 * count as base ownership and remain guarded.
 */
function baseSelectorBlocks(source: string, className: string) {
  const clean = stripComments(source)
  const contexts: string[] = []
  const matches: string[] = []
  let tokenStart = 0

  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index]

    if (char === ';') {
      tokenStart = index + 1
      continue
    }

    if (char === '{') {
      const header = clean.slice(tokenStart, index).replace(/\s+/g, ' ').trim()
      const insideConditionalRule = contexts.some((context) => CONDITIONAL_AT_RULE.test(context))

      if (header && !header.startsWith('@') && !insideConditionalRule) {
        const ownsAlias = header.split(',').some((selector) => {
          const normalized = selector.trim()
          return normalized === `.${className}` || normalized === `html .${className}`
        })
        if (ownsAlias) matches.push(header)
      }

      contexts.push(header)
      tokenStart = index + 1
      continue
    }

    if (char === '}') {
      contexts.pop()
      tokenStart = index + 1
    }
  }

  return matches
}

describe('canonical card/surface ownership', () => {
  it('keeps every legacy surface alias on the same canonical base rule', () => {
    const owner = stripComments(fs.readFileSync(OWNER, 'utf8'))
    const firstRulePrelude = owner.slice(0, owner.indexOf('{'))

    for (const alias of CANONICAL_SURFACE_ALIASES) {
      expect(firstRulePrelude, `${alias} should be owned by the shared base rule`).toContain(`.${alias}`)
    }
  })

  it('distinguishes duplicate base ownership from legitimate contextual refinements', () => {
    expect(baseSelectorBlocks('.card-premium { border: 0; }', 'card-premium')).toEqual(['.card-premium'])
    expect(baseSelectorBlocks('@layer components { .card-premium { border: 0; } }', 'card-premium')).toEqual(['.card-premium'])
    expect(baseSelectorBlocks('@media (max-width: 640px) { .card-premium { padding: 1rem; } }', 'card-premium')).toEqual([])
    expect(baseSelectorBlocks('.card-premium:hover { transform: none; }', 'card-premium')).toEqual([])
    expect(baseSelectorBlocks('.card-premium h2 { margin: 0; }', 'card-premium')).toEqual([])
    expect(baseSelectorBlocks('html.dark .card-premium { box-shadow: none; }', 'card-premium')).toEqual([])
  })

  it('does not redefine canonical surface base aliases outside premium-surfaces.css', () => {
    const cssFiles = [
      ...walkCss(path.join(ROOT, 'app')),
      ...walkCss(path.join(ROOT, 'styles')),
    ].filter((file) => path.resolve(file) !== path.resolve(OWNER))

    const violations: Array<{ file: string; alias: string; selector: string }> = []
    for (const file of cssFiles) {
      const source = fs.readFileSync(file, 'utf8')
      for (const alias of CANONICAL_SURFACE_ALIASES) {
        for (const selector of baseSelectorBlocks(source, alias)) {
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
