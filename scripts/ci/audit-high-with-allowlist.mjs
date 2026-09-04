#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const allowlistPath = path.join(repoRoot, 'security', 'audit-allowlist.json')
const allowlistFragmentsDir = path.join(repoRoot, 'security', 'audit-allowlist.d')
const auditTimeoutMs = Math.max(30_000, Number(process.env.NPM_AUDIT_TIMEOUT_MS || 120_000))
const configuredAttempts = Number.parseInt(process.env.NPM_AUDIT_MAX_ATTEMPTS || '2', 10)
const auditMaxAttempts = Math.min(3, Math.max(1, Number.isFinite(configuredAttempts) ? configuredAttempts : 2))
const auditAttemptTimeoutMs = Math.max(10_000, Math.floor(auditTimeoutMs / auditMaxAttempts))

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

function parseAuditAttempt(auditRun) {
  if (auditRun.error) {
    const timedOut = auditRun.error.code === 'ETIMEDOUT'
    return {
      report: null,
      reason: timedOut
        ? `timed out after ${auditAttemptTimeoutMs}ms`
        : `spawn failed: ${auditRun.error.message}`,
    }
  }

  const raw = String(auditRun.stdout || '').trim()
  const stderr = String(auditRun.stderr || '').trim()
  if (!raw) {
    return {
      report: null,
      reason: stderr ? `no JSON output; stderr: ${stderr.slice(0, 1000)}` : 'no JSON output',
    }
  }

  let report
  try {
    report = JSON.parse(raw)
  } catch (error) {
    return {
      report: null,
      reason: `unparseable JSON: ${error.message}${stderr ? `; stderr: ${stderr.slice(0, 1000)}` : ''}`,
    }
  }

  const structurallyValid = Number.isFinite(report?.auditReportVersion)
    && report.vulnerabilities
    && typeof report.vulnerabilities === 'object'
    && !Array.isArray(report.vulnerabilities)
    && report.metadata
    && typeof report.metadata === 'object'

  if (report?.error || !structurallyValid) {
    return {
      report: null,
      reason: `invalid npm audit report${report?.error ? `: ${JSON.stringify(report.error).slice(0, 1000)}` : ''}`,
    }
  }

  return { report, reason: null }
}

const npmInvocation = getNpmInvocation()
let report = null
const transportFailures = []

for (let attempt = 1; attempt <= auditMaxAttempts; attempt += 1) {
  const auditRun = spawnSync(npmInvocation.command, npmInvocation.args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: auditAttemptTimeoutMs,
    killSignal: 'SIGTERM',
    env: {
      ...process.env,
      NPM_CONFIG_FETCH_TIMEOUT: process.env.NPM_CONFIG_FETCH_TIMEOUT || '60000',
      NPM_CONFIG_FETCH_RETRIES: process.env.NPM_CONFIG_FETCH_RETRIES || '1',
    },
  })

  const parsed = parseAuditAttempt(auditRun)
  if (parsed.report) {
    report = parsed.report
    if (attempt > 1) {
      console.warn(`[audit:high] recovered a valid npm audit report on attempt ${attempt}/${auditMaxAttempts}`)
    }
    break
  }

  transportFailures.push({ attempt, reason: parsed.reason })
  if (attempt < auditMaxAttempts) {
    console.warn(`[audit:high] transient audit transport/report failure on attempt ${attempt}/${auditMaxAttempts}; retrying: ${parsed.reason}`)
  }
}

if (!report) {
  console.error(`[audit:high] FAIL: unable to obtain valid npm audit JSON after ${auditMaxAttempts} attempt(s) within a ${auditTimeoutMs}ms total command-time budget`)
  console.error(JSON.stringify({ transportFailures }, null, 2))
  process.exit(1)
}

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
