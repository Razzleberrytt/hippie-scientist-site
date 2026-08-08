#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const allowlistPath = path.join(repoRoot, 'security', 'audit-allowlist.json')
const allowlistFragmentsDir = path.join(repoRoot, 'security', 'audit-allowlist.d')

function readRules(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(payload.rules) ? payload.rules : []
}

const fragmentPaths = fs.existsSync(allowlistFragmentsDir)
  ? fs.readdirSync(allowlistFragmentsDir)
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => path.join(allowlistFragmentsDir, name))
  : []
const rules = [
  ...readRules(allowlistPath),
  ...fragmentPaths.flatMap((filePath) => readRules(filePath)),
]

function getNpmInvocation() {
  const npmExecPath = process.env.npm_execpath
  if (npmExecPath && fs.existsSync(npmExecPath)) {
    return {
      command: process.execPath,
      args: [npmExecPath, 'audit', '--json'],
      label: 'npm audit --json',
    }
  }

  const bundledNpmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  if (fs.existsSync(bundledNpmCli)) {
    return {
      command: process.execPath,
      args: [bundledNpmCli, 'audit', '--json'],
      label: 'npm audit --json',
    }
  }

  return {
    command: 'npm',
    args: ['audit', '--json'],
    label: 'npm audit --json',
  }
}

const npmInvocation = getNpmInvocation()
const auditRun = spawnSync(npmInvocation.command, npmInvocation.args, {
  cwd: repoRoot,
  encoding: 'utf8',
})
if (auditRun.error) {
  console.error(`[audit:high] FAIL: unable to run ${npmInvocation.label}`)
  console.error(auditRun.error.message)
  process.exit(1)
}
const raw = String(auditRun.stdout || '').trim()
if (!raw) {
  console.error('[audit:high] FAIL: npm audit returned no JSON output')
  console.error(String(auditRun.stderr || '').trim())
  process.exit(1)
}
const report = JSON.parse(raw)
const vulnerabilities = report.vulnerabilities || {}

function isHighOrCritical(vuln) {
  return Boolean(vuln && (vuln.severity === 'high' || vuln.severity === 'critical'))
}

const highOrCritical = Object.values(vulnerabilities).filter(isHighOrCritical)
const now = new Date().toISOString().slice(0, 10)

function matchesRule(vuln, rule) {
  if (!vuln || !rule) return false
  if (rule.package && vuln.name !== rule.package) return false
  if (rule.severity && vuln.severity !== rule.severity) return false

  const via = Array.isArray(vuln.via) ? vuln.via : []
  const advisoryUrls = via.filter((x) => x && typeof x === 'object' && x.url).map((x) => x.url)
  if (Array.isArray(rule.advisoryUrls) && rule.advisoryUrls.length > 0) {
    return rule.advisoryUrls.every((url) => advisoryUrls.includes(url))
  }
  return true
}

function findRule(vuln) {
  const rule = rules.find((candidate) => matchesRule(vuln, candidate))
  if (!rule) return { rule: null, expired: false }
  return {
    rule,
    expired: Boolean(rule.expiresOn && rule.expiresOn < now),
  }
}

function uniqueRules(input) {
  const byId = new Map()
  for (const rule of input) {
    if (rule?.id) byId.set(rule.id, rule)
  }
  return [...byId.values()]
}

/**
 * npm reports every affected parent as a separate vulnerability. Follow string
 * entries in `via` until reaching advisory-bearing leaf packages. A parent is
 * transitively covered only when every high/critical branch resolves to an
 * explicit, unexpired leaf rule. Moderate/low branches remain outside this gate.
 */
function resolveTransitiveCoverage(vulnerabilityName, seen = new Set()) {
  if (!vulnerabilityName || seen.has(vulnerabilityName)) return null
  const vuln = vulnerabilities[vulnerabilityName]
  if (!isHighOrCritical(vuln)) return null

  const nextSeen = new Set(seen)
  nextSeen.add(vulnerabilityName)

  const direct = findRule(vuln)
  if (direct.expired) return null
  if (direct.rule) {
    return {
      rules: [direct.rule],
      path: [vulnerabilityName],
    }
  }

  const via = Array.isArray(vuln.via) ? vuln.via : []
  const highBranches = []

  for (const entry of via) {
    if (typeof entry === 'string') {
      const dependencyVuln = vulnerabilities[entry]
      if (isHighOrCritical(dependencyVuln)) highBranches.push(entry)
      continue
    }

    if (entry && typeof entry === 'object') {
      const severity = String(entry.severity || '').toLowerCase()
      if (severity === 'high' || severity === 'critical') {
        // This package owns a high advisory and therefore needs its own rule.
        return null
      }
    }
  }

  if (highBranches.length === 0) return null

  const resolved = []
  const paths = [vulnerabilityName]
  for (const dependencyName of highBranches) {
    const coverage = resolveTransitiveCoverage(dependencyName, nextSeen)
    if (!coverage) return null
    resolved.push(...coverage.rules)
    paths.push(...coverage.path)
  }

  return {
    rules: uniqueRules(resolved),
    path: [...new Set(paths)],
  }
}

const unmatched = []
const matched = []

for (const vuln of highOrCritical) {
  const direct = findRule(vuln)
  if (direct.expired) {
    unmatched.push({ package: vuln.name, severity: vuln.severity, reason: `allowlist expired on ${direct.rule.expiresOn}` })
    continue
  }

  if (direct.rule) {
    matched.push({
      package: vuln.name,
      severity: vuln.severity,
      ruleId: direct.rule.id,
      expiresOn: direct.rule.expiresOn || null,
      followUpIssueUrl: direct.rule.followUpIssueUrl || null,
    })
    continue
  }

  const transitive = resolveTransitiveCoverage(vuln.name)
  if (!transitive || transitive.rules.length === 0) {
    unmatched.push({ package: vuln.name, severity: vuln.severity })
    continue
  }

  const expirationDates = transitive.rules.map((rule) => rule.expiresOn).filter(Boolean).sort()
  matched.push({
    package: vuln.name,
    severity: vuln.severity,
    ruleId: `transitive:${transitive.rules.map((rule) => rule.id).sort().join(',')}`,
    expiresOn: expirationDates[0] || null,
    viaPackages: transitive.path.filter((name) => name !== vuln.name),
  })
}

if (unmatched.length > 0) {
  console.error('[audit:high] FAIL: unallowlisted high/critical vulnerabilities found')
  console.error(JSON.stringify({ unmatched, matched }, null, 2))
  process.exit(1)
}

console.log('[audit:high] PASS: all high/critical vulnerabilities are allowlisted or none present')
if (matched.length > 0) {
  console.log(JSON.stringify({ matched }, null, 2))
}
