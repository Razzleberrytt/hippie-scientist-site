#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const repoRoot = process.env.TOML_SECURITY_REPO_ROOT
  ? path.resolve(process.env.TOML_SECURITY_REPO_ROOT)
  : defaultRepoRoot

function readRules(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(payload.rules) ? payload.rules : []
}

const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
const packageLock = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package-lock.json'), 'utf8'))
const allowlistPath = path.join(repoRoot, 'security', 'audit-allowlist.json')
const allowlistFragmentsDir = path.join(repoRoot, 'security', 'audit-allowlist.d')
const fragmentPaths = fs.existsSync(allowlistFragmentsDir)
  ? fs.readdirSync(allowlistFragmentsDir)
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => path.join(allowlistFragmentsDir, name))
  : []
const allowlistRules = [
  ...readRules(allowlistPath),
  ...fragmentPaths.flatMap((filePath) => readRules(filePath)),
]

function parseVersion(value) {
  const match = String(value || '').match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return null
  return match.slice(1).map(Number)
}

function atLeast(actual, minimum) {
  const a = parseVersion(actual)
  const b = parseVersion(minimum)
  if (!a || !b) return false
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true
    if (a[i] < b[i]) return false
  }
  return true
}

const failures = []
const minimumPatchedVersion = '4.2.0'
const overrideVersion = packageJson?.overrides?.toml
const lockedToml = packageLock?.packages?.['node_modules/toml']

if (!overrideVersion || !atLeast(overrideVersion, minimumPatchedVersion)) {
  failures.push(`package.json must force toml >= ${minimumPatchedVersion}; found ${overrideVersion || 'missing'}`)
}

if (!lockedToml?.version || !atLeast(lockedToml.version, minimumPatchedVersion)) {
  failures.push(`package-lock.json must resolve toml >= ${minimumPatchedVersion}; found ${lockedToml?.version || 'missing'}`)
}

const stalePackages = new Set(['toml', 'remark-mdx-frontmatter', 'mdx-bundler', '@content-collections/mdx'])
const staleRules = allowlistRules.filter((rule) => {
  if (!rule) return false
  const follows5456 = String(rule.followUpIssueUrl || '').endsWith('/issues/5456')
  return follows5456 && stalePackages.has(rule.package)
})
if (staleRules.length > 0) {
  failures.push(`remove obsolete #5456 audit allowlist rules: ${staleRules.map((rule) => rule.id).join(', ')}`)
}

if (failures.length > 0) {
  console.error('[validate-toml-security-floor] FAIL')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`[validate-toml-security-floor] PASS: toml ${lockedToml.version} >= ${minimumPatchedVersion}; no stale #5456 waivers remain`)
