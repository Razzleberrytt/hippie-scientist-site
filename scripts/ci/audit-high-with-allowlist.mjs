#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const repoRoot = process.cwd()
const allowlistPath = path.join(repoRoot, 'security', 'audit-allowlist.json')
const auditOutPath = path.join(repoRoot, 'npm-audit.after.json')

function fail(message) {
  console.error(`[audit:high] FAIL: ${message}`)
  process.exit(1)
}

function parseJson(text, label) {
  try { return JSON.parse(text) } catch { fail(`Could not parse ${label} JSON`) }
}

if (!fs.existsSync(allowlistPath)) fail(`Missing allowlist file: ${allowlistPath}`)
const allowlist = parseJson(fs.readFileSync(allowlistPath, 'utf8'), 'allowlist')
const entries = Array.isArray(allowlist.entries) ? allowlist.entries : []
if (entries.length === 0) fail('Allowlist has no entries.')

let auditRaw = ''
try {
  auditRaw = execSync('npm audit --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
} catch (error) {
  auditRaw = String(error?.stdout || '')
  if (!auditRaw.trim()) fail('npm audit --json did not produce JSON output.')
}
fs.writeFileSync(auditOutPath, auditRaw)

const audit = parseJson(auditRaw, 'npm audit')
const vulnerabilities = audit.vulnerabilities || {}
const findings = Object.values(vulnerabilities).filter(v => ['high', 'critical'].includes(v.severity))

const today = new Date().toISOString().slice(0, 10)
for (const entry of entries) {
  if (!entry.reviewBy) fail(`Allowlist entry ${entry.package} missing reviewBy date`)
  if (entry.reviewBy < today) fail(`Allowlist entry ${entry.package} expired on ${entry.reviewBy}`)
}

let xlsxOutsideScripts = ''
try {
  xlsxOutsideScripts = execSync("rg -n \"from 'xlsx'|from \\\"xlsx\\\"|require\\(['\\\"]xlsx['\\\"]\\)\" app pages src lib components --glob '!**/*.md'", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
} catch (error) {
  xlsxOutsideScripts = String(error?.stdout || '').trim()
}
if (xlsxOutsideScripts) fail(`xlsx runtime/user-upload reachability detected outside scripts:\n${xlsxOutsideScripts}`)

const nonAllowlisted = []
for (const finding of findings) {
  const match = entries.find(entry => {
    if (entry.package !== finding.name) return false
    const advisories = (finding.via || []).filter(v => typeof v === 'object').map(v => v.source)
    if (!Array.isArray(entry.advisoryIds) || entry.advisoryIds.length === 0) return true
    return advisories.some(id => entry.advisoryIds.includes(id))
  })
  if (!match) nonAllowlisted.push(finding)
}

if (nonAllowlisted.length > 0) {
  const detail = nonAllowlisted.map(v => `- ${v.name} (${v.severity}) range=${v.range}`).join('\n')
  fail(`Unallowlisted high/critical vulnerabilities found:\n${detail}`)
}

console.log(`[audit:high] PASS: ${findings.length} high/critical finding(s), all allowlisted and unexpired.`)
console.log(`[audit:high] Raw audit JSON written to ${path.relative(repoRoot, auditOutPath)}`)
