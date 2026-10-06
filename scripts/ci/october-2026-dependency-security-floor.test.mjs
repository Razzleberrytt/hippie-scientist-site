import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function atLeast(version, minimum) {
  const left = String(version || '').replace(/^v/, '').split('.').map(Number)
  const right = String(minimum).split('.').map(Number)
  if (left.length < 3 || !left.slice(0, 3).every(Number.isFinite)) return false
  for (let index = 0; index < 3; index += 1) {
    if (left[index] > right[index]) return true
    if (left[index] < right[index]) return false
  }
  return true
}

describe('October 2026 dependency security floor', () => {
  it('keeps sharp on the patched 0.35.5+ line everywhere', () => {
    const root = process.cwd()
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))

    expect(atLeast(pkg.devDependencies?.sharp, '0.35.5')).toBe(true)
    expect(pkg.overrides?.sharp).toBe('$sharp')
    expect(atLeast(lock.packages?.['node_modules/sharp']?.version, '0.35.5')).toBe(true)
  })

  it('keeps shell-quote on the patched 1.11.0+ line', () => {
    const root = process.cwd()
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))

    expect(atLeast(pkg.overrides?.['shell-quote'], '1.11.0')).toBe(true)
    expect(atLeast(lock.packages?.['node_modules/shell-quote']?.version, '1.11.0')).toBe(true)
  })
})
