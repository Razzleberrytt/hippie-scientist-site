import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function atLeast318(version) {
  const [major, minor, patch] = String(version).replace(/^v/, '').split('.').map(Number)
  if (![major, minor, patch].every(Number.isFinite)) return false
  if (major > 3) return true
  if (major < 3) return false
  if (minor > 1) return true
  if (minor < 1) return false
  return patch >= 8
}

describe('fast-uri security floor', () => {
  it('keeps the override and lockfile on a patched 3.1.8-or-newer release', () => {
    const root = process.cwd()
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))

    expect(atLeast318(pkg.overrides?.['fast-uri'])).toBe(true)
    expect(atLeast318(lock.packages?.['node_modules/fast-uri']?.version)).toBe(true)
  })
})
