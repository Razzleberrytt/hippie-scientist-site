#!/usr/bin/env node
import fs from 'node:fs'
import process from 'node:process'

const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
const expected = packageJson?.engines?.node
const args = process.argv.slice(2)

function normalize(v) {
  return String(v).replace(/^v/, '').split('.').map((n) => Number.parseInt(n, 10) || 0).slice(0, 3).concat([0,0,0]).slice(0,3)
}
function cmp(a, b) {
  const va = normalize(a)
  const vb = normalize(b)
  for (let i = 0; i < 3; i += 1) {
    if (va[i] !== vb[i]) return va[i] - vb[i]
  }
  return 0
}

function satisfiesConstraint(constraint, version) {
  if (!constraint) return true
  const checks = constraint.split(/\s+/).filter(Boolean)
  return checks.every((token) => {
    const m = token.match(/^(>=|<=|>|<|=)?v?(\d+(?:\.\d+){0,2})$/)
    if (!m) throw new Error(`Unsupported engines.node token: "${token}"`)
    const op = m[1] || '='
    const target = m[2]
    const c = cmp(version, target)
    if (op === '>') return c > 0
    if (op === '>=') return c >= 0
    if (op === '<') return c < 0
    if (op === '<=') return c <= 0
    return c === 0
  })
}

if (args.includes('--self-test')) {
  const scenarios = [
    ['20.20.2', true],
    ['24.0.0', false],
  ]
  for (const [v, want] of scenarios) {
    const got = satisfiesConstraint(expected, v)
    if (got !== want) {
      console.error(`[check:node:self-test] FAIL for ${v}: expected ${want}, got ${got}`)
      process.exit(1)
    }
  }
  console.log('[check:node:self-test] PASS')
  process.exit(0)
}

if (!expected) {
  console.log('No package.json engines.node constraint found; skipping Node version check.')
  process.exit(0)
}

const arg = args.find((a) => a.startsWith('--node-version='))
const current = (arg ? arg.split('=')[1] : process.version).replace(/^v/, '')

if (!satisfiesConstraint(expected, current)) {
  console.error(`Node ${current} does not satisfy package.json engines.node constraint: ${expected}`)
  process.exit(1)
}

console.log(`Node ${current} satisfies package.json engines.node constraint: ${expected}`)
