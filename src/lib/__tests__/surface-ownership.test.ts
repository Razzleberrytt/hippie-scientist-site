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

type CssRule = { selectors: string[]; declarations: string }

function splitSelectorList(prelude: string): string[] {
  const selectors: string[] = []
  let start = 0
  let parenDepth = 0
  let bracketDepth = 0

  for (let i = 0; i < prelude.length; i += 1) {
    const char = prelude[i]
    if (char === '(') parenDepth += 1
    else if (char === ')') parenDepth = Math.max(0, parenDepth - 1)
    else if (char === '[') bracketDepth += 1
    else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1)
    else if (char === ',' && parenDepth === 0 && bracketDepth === 0) {
      selectors.push(prelude.slice(start, i).replace(/\s+/g, ' ').trim())
      start = i + 1
    }
  }

  selectors.push(prelude.slice(start).replace(/\s+/g, ' ').trim())
  return selectors.filter(Boolean)
}

function cssRules(source: string): CssRule[] {
  const rules: CssRule[] = []
  const pattern = /([^{}]+)\{([^{}]*)\}/g

  for (const match of stripComments(source).matchAll(pattern)) {
    const prelude = match[1].trim()
    if (!prelude || prelude.startsWith('@')) continue
    rules.push({ selectors: splitSelectorList(prelude), declarations: match[2] })
  }

  return rules
}

function directlyTargetsAlias(selector: string, className: string): boolean {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`\\.${escaped}(?![A-Za-z0-9_-])`, 'g')
  const matches = [...selector.matchAll(pattern)]
  const match = matches.at(-1)
  if (!match || match.index === undefined) return false

  // Ignore aliases mentioned inside functional pseudo-classes such as :not()/ :is().
  // They are not reliably the selector's target element without a full CSS parser.
  let parenDepthAtAlias = 0
  let bracketDepthAtAlias = 0
  for (let i = 0; i < match.index; i += 1) {
    const char = selector[i]
    if (char === '(') parenDepthAtAlias += 1
    else if (char === ')') parenDepthAtAlias = Math.max(0, parenDepthAtAlias - 1)
    else if (char === '[') bracketDepthAtAlias += 1
    else if (char === ']') bracketDepthAtAlias = Math.max(0, bracketDepthAtAlias - 1)
  }
  if (parenDepthAtAlias > 0 || bracketDepthAtAlias > 0) return false

  const after = selector.slice(match.index + match[0].length)
  let parenDepth = 0
  let bracketDepth = 0
  for (const char of after) {
    if (char === '(') parenDepth += 1
    else if (char === ')') parenDepth = Math.max(0, parenDepth - 1)
    else if (char === '[') bracketDepth += 1
    else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1)
    else if (parenDepth === 0 && bracketDepth === 0 && (/\s/.test(char) || char === '>' || char === '+' || char === '~')) {
      return false
    }
  }

  return true
}

function declarationProperties(declarations: string): string[] {
  return declarations
    .split(';')
    .map((declaration) => declaration.slice(0, declaration.indexOf(':')).trim().toLowerCase())
    .filter(Boolean)
}

function ownedSurfaceProperties(ownerSource: string): Set<string> {
  const properties = new Set<string>()
  for (const rule of cssRules(ownerSource)) {
    if (!rule.selectors.some((selector) => CANONICAL_SURFACE_ALIASES.some((alias) => directlyTargetsAlias(selector, alias)))) continue
    for (const property of declarationProperties(rule.declarations)) properties.add(property)
  }
  return properties
}

describe('canonical card/surface ownership', () => {
  it('keeps every legacy surface alias on the same canonical base rule', () => {
    const owner = stripComments(fs.readFileSync(OWNER, 'utf8'))
    const firstRulePrelude = owner.slice(0, owner.indexOf('{'))

    for (const alias of CANONICAL_SURFACE_ALIASES) {
      expect(firstRulePrelude, `${alias} should be owned by the shared base rule`).toContain(`.${alias}`)
    }
  })

  it('does not redefine canonical surface-owned declarations outside premium-surfaces.css', () => {
    const ownerSource = fs.readFileSync(OWNER, 'utf8')
    const ownedProperties = ownedSurfaceProperties(ownerSource)
    const cssFiles = [
      ...walkCss(path.join(ROOT, 'app')),
      ...walkCss(path.join(ROOT, 'styles')),
    ].filter((file) => path.resolve(file) !== path.resolve(OWNER))

    const violations: Array<{ file: string; alias: string; selector: string; properties: string[] }> = []
    for (const file of cssFiles) {
      const source = fs.readFileSync(file, 'utf8')
      for (const rule of cssRules(source)) {
        const conflictingProperties = declarationProperties(rule.declarations)
          .filter((property) => ownedProperties.has(property))
        if (conflictingProperties.length === 0) continue

        for (const alias of CANONICAL_SURFACE_ALIASES) {
          for (const selector of rule.selectors.filter((candidate) => directlyTargetsAlias(candidate, alias))) {
            violations.push({
              file: path.relative(ROOT, file).replaceAll(path.sep, '/'),
              alias,
              selector,
              properties: [...new Set(conflictingProperties)].sort(),
            })
          }
        }
      }
    }

    expect(violations).toEqual([])
  })
})