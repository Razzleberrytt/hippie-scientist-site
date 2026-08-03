import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { DEPRECATED_COMPOUND_CANONICALS } from '../../lib/deprecated-compound-canonicals'

const root = process.cwd()
const overridesDir = path.join(root, 'public', 'redirect-overrides')

function normalizePath(value: string) {
  const clean = value.split(/[?#]/)[0].trim()
  if (!clean.startsWith('/')) return clean
  if (clean === '/') return '/'
  return `${clean.replace(/\/+$/, '')}/`
}

function canonicalTarget(value: string) {
  return normalizePath(value.startsWith('/') ? value : `/compounds/${value}`)
}

describe('deprecated compound redirect overrides', () => {
  it('cannot override the canonical profile map with a different destination', () => {
    const mismatches: string[] = []
    const overrideFiles = fs
      .readdirSync(overridesDir)
      .filter((fileName) => /\.(txt|redirects)$/i.test(fileName))
      .sort()

    for (const fileName of overrideFiles) {
      const contents = fs.readFileSync(path.join(overridesDir, fileName), 'utf8')

      for (const rawLine of contents.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue

        const [source, target] = line.split(/\s+/)
        const sourceMatch = source?.match(/^\/compounds\/([^/*:]+)\/?$/)
        if (!sourceMatch || !target) continue

        const slug = sourceMatch[1]
        const canonical = DEPRECATED_COMPOUND_CANONICALS[slug]
        if (!canonical) continue

        const actualTarget = normalizePath(target)
        const expectedTarget = canonicalTarget(canonical)

        if (actualTarget !== expectedTarget) {
          mismatches.push(
            `${fileName}: ${source} redirects to ${actualTarget}; expected ${expectedTarget}`,
          )
        }
      }
    }

    expect(mismatches).toEqual([])
  })
})
