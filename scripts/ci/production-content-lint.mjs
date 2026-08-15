#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const reportDir = path.join(root, 'public', 'data', 'reports')
const outDir = path.join(root, 'out')
const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'
const nodeCommand = process.execPath

const checks = [
  { id: 'metadata', label: 'Titles, descriptions, canonicals', command: nodeCommand, args: ['scripts/ci/audit-metadata-duplicates.mjs'] },
  { id: 'build-seo', label: 'Built SEO metadata and indexability', command: nodeCommand, args: ['scripts/ci/validate-build-seo-metadata.mjs'] },
  { id: 'internal-links', label: 'Internal links', command: nodeCommand, args: ['scripts/ci/audit-internal-links.mjs'] },
  { id: 'redirects', label: 'Redirects', command: nodeCommand, args: ['scripts/verify-redirects.mjs'] },
  { id: 'structured-data', label: 'Structured data', command: nodeCommand, args: ['scripts/ci/audit-structured-data.mjs'] },
  { id: 'sitemap', label: 'Sitemap validity', command: nodeCommand, args: ['scripts/ci/validate-sitemap.mjs', '--require-built'] },
  { id: 'sitemap-completeness', label: 'Sitemap completeness', command: nodeCommand, args: ['scripts/ci/validate-sitemap-completeness.mjs', '--require-built'] },
  { id: 'robots', label: 'Robots/index directives', command: nodeCommand, args: ['scripts/ci/validate-robots.mjs', '--require-built'] },
  { id: 'a11y', label: 'Accessibility basics', command: npmCommand, args: ['run', '-s', 'test:a11y'] },
]

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function stripTags(value) {
  return decodeHtmlEntities(String(value || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function routeFromFile(filePath) {
  const rel = path.relative(outDir, filePath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`.replace(/\/+/g, '/')
}

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return []
  const files = []
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '_next') continue
      const filePath = path.join(current, entry.name)
      if (entry.isDirectory()) walk(filePath)
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(filePath)
    }
  }
  walk(dir)
  return files
}

function auditH1Uniqueness() {
  const groups = new Map()
  const missing = []
  const multiple = []

  for (const filePath of walkHtml(outDir)) {
    const route = routeFromFile(filePath)
    if (route === '/404' || route === '/500') continue
    const html = fs.readFileSync(filePath, 'utf8')
    const robots = (html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) || [])[1] || ''
    if (/\bnoindex\b/i.test(robots)) continue
    const values = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean)

    if (values.length === 0) missing.push(route)
    if (values.length > 1) multiple.push({ route, h1s: values })
    if (values.length === 1) {
      const normalized = values[0].toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      if (normalized) groups.set(normalized, [...(groups.get(normalized) || []), { route, h1: values[0] }])
    }
  }

  const duplicates = [...groups.values()]
    .filter((rows) => rows.length > 1)
    .sort((a, b) => b.length - a.length || a[0].h1.localeCompare(b[0].h1))

  return { passed: missing.length === 0 && multiple.length === 0 && duplicates.length === 0, missing, multiple, duplicates }
}

function runCheck(check) {
  const started = Date.now()
  const result = spawnSync(check.command, check.args, {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return {
    id: check.id,
    label: check.label,
    passed: result.status === 0,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - started,
    stdout: String(result.stdout || '').trim().slice(-4000),
    stderr: String(result.stderr || '').trim().slice(-4000),
  }
}

function markdown(report) {
  const rows = report.checks.map((check) => `| ${check.passed ? '✅' : '❌'} | ${check.label} | ${check.durationMs} ms |`).join('\n')
  const h1 = report.h1Audit
  const h1Line = h1.passed
    ? '✅ H1 uniqueness: no missing, multiple, or exact duplicate H1s on indexable built pages.'
    : `❌ H1 uniqueness: ${h1.missing.length} missing, ${h1.multiple.length} multiple-H1 pages, ${h1.duplicates.length} duplicate H1 groups.`
  return `## Production content quality summary\n\nStatus: **${report.passed ? 'PASS' : 'FAIL'}**  \nGenerated: ${report.generatedAt}\n\n| Status | Check | Duration |\n|---|---|---:|\n${rows}\n\n${h1Line}\n\nThis consolidated gate reuses the repository's existing metadata, canonical, indexability, link, redirect, sitemap, structured-data, robots, and accessibility validators rather than maintaining parallel rules.\n`
}

function main() {
  if (!fs.existsSync(outDir)) {
    console.error('[production-content-lint] built output is required. Run the production build first.')
    process.exit(2)
  }

  fs.mkdirSync(reportDir, { recursive: true })
  const h1Audit = auditH1Uniqueness()
  const results = checks.map(runCheck)
  const report = {
    generatedAt: new Date().toISOString(),
    contract: 'production-content-lint/v1',
    passed: h1Audit.passed && results.every((check) => check.passed),
    h1Audit,
    checks: results,
  }
  const md = markdown(report)

  fs.writeFileSync(path.join(reportDir, 'production-content-lint.json'), `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(path.join(reportDir, 'production-content-lint.md'), md)
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${md}\n`)

  console.log(md)
  if (!report.passed) {
    for (const check of results.filter((item) => !item.passed)) {
      console.error(`\n[${check.id}] ${check.label} failed (exit ${check.exitCode})`)
      if (check.stderr) console.error(check.stderr)
      else if (check.stdout) console.error(check.stdout)
    }
    process.exit(1)
  }
}

main()
