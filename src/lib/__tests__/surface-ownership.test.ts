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

// These declarations define the material/geometry of the reusable surface
// itself. Descendant typography, focus targeting, and child-layout rules may
// reference a canonical class without becoming a competing surface owner.
const SURFACE_OWNERSHIP_PROPERTIES = [
  'background',
  'background-color',
  'border',
  'border-color',
  'border-radius',
  'box-shadow',
  'backdrop-filter',
  'transform',
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

function cssBlocks(source: string) {
  const blocks: Array<{ selector: string; body: string }> = []
  const pattern = /([^{}]+)\{([^{}]*)\}/g
  for (const match of stripComments(source).matchAll(pattern)) {
    blocks.push({
      selector: match[1].replace(/\s+/g, ' ').trim(),
      body: match[2],
    })
  }
  return blocks
}

function aliasIsSelectorSubject(selector: string, className: string) {
  const token = `.${className}`
  let offset = 0

  while (offset < selector.length) {
    const index = selector.indexOf(token, offset)
    if (index === -1) return false
    const boundary = selector[index + token.length]
    if (boundary && /[A-Za-z0-9_-]/.test(boundary)) {
      offset = index + token.length
      continue
    }

    let parenDepth = 0
    let bracketDepth = 0
    for (let i = 0; i < index; i += 1) {
      if (selector[i] === '(') parenDepth += 1
      else if (selector[i] === ')') parenDepth = Math.max(0, parenDepth - 1)
      else if (selector[i] === '[') bracketDepth += 1
      else if (selector[i] === ']') bracketDepth = Math.max(0, bracketDepth - 1)
    }

    const startingParenDepth = parenDepth
    const startingBracketDepth = bracketDepth
    let descendantAfterAlias = false

    for (let i = index + token.length; i < selector.length; i += 1) {
      const char = selector[i]
      if (char === '(') parenDepth += 1
      else if (char === ')') parenDepth = Math.max(0, parenDepth - 1)
      else if (char === '[') bracketDepth += 1
      else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1)

      const outsideAliasContainer = parenDepth < startingParenDepth || bracketDepth < startingBracketDepth
      const atOuterLevel = parenDepth === 0 && bracketDepth === 0
      if ((outsideAliasContainer || atOuterLevel) && /[>+~]/.test(char)) {
        descendantAfterAlias = true
        break
      }
      if ((outsideAliasContainer || atOuterLevel) && /\s/.test(char)) {
        const remainder = selector.slice(i).trimStart()
        if (remainder && !remainder.startsWith(',') && !remainder.startsWith(':') && !remainder.startsWith('[')) {
          descendantAfterAlias = true
          break
        }
      }
    }

    if (!descendantAfterAlias) return true
    offset = index + token.length
  }

  return false
}

function ownsSurfaceMaterial(body: string) {
  return SURFACE_OWNERSHIP_PROPERTIES.some((property) => {
    const escaped = property.replace('-', '\\-')
    return new RegExp(`(^|[;\\s])${escaped}\\s*:`, 'm').test(body)
  })
}

describe('canonical card/surface ownership', () => {
  it('keeps every legacy surface alias on the same canonical base rule', () => {
    const owner = stripComments(fs.readFileSync(OWNER, 'utf8'))
    const firstRulePrelude = owner.slice(0, owner.indexOf('{'))

    for (const alias of CANONICAL_SURFACE_ALIASES) {
      expect(firstRulePrelude, `${alias} should be owned by the shared base rule`).toContain(`.${alias}`)
    }
  })

  it('does not redefine canonical surface material outside premium-surfaces.css', () => {
    const cssFiles = [
      ...walkCss(path.join(ROOT, 'app')),
      ...walkCss(path.join(ROOT, 'styles')),
    ].filter((file) => path.resolve(file) !== path.resolve(OWNER))

    const violations: Array<{ file: string; alias: string; selector: string }> = []
    for (const file of cssFiles) {
      const source = fs.readFileSync(file, 'utf8')
      for (const block of cssBlocks(source)) {
        if (!ownsSurfaceMaterial(block.body)) continue
        for (const alias of CANONICAL_SURFACE_ALIASES) {
          if (!aliasIsSelectorSubject(block.selector, alias)) continue
          violations.push({
            file: path.relative(ROOT, file).replaceAll(path.sep, '/'),
            alias,
            selector: block.selector,
          })
        }
      }
    }

    expect(violations).toEqual([])
  })
})
