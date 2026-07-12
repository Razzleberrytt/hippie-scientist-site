#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const allowlistPath = path.join(repoRoot, 'security', 'audit-allowlist.json')

const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'))
const rules = Array.isArray(allowlist.rules) ? allowlist.rules : []

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

const highOrCritical = Object.values(vulnerabilities).filter((v) =>
  v && (v.severity === 'high' || v.severity === 'critical')
)

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

const unmatched = []
const matched = []

for (const vuln of highOrCritical) {
  const rule = rules.find((r) => matchesRule(vuln, r))
  if (!rule) {
    unmatched.push({ package: vuln.name, severity: vuln.severity })
    continue
  }

  if (rule.expiresOn && rule.expiresOn < now) {
    unmatched.push({ package: vuln.name, severity: vuln.severity, reason: `allowlist expired on ${rule.expiresOn}` })
    continue
  }

  matched.push({
    package: vuln.name,
    severity: vuln.severity,
    ruleId: rule.id,
    expiresOn: rule.expiresOn || null,
    followUpIssueUrl: rule.followUpIssueUrl || null,
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
