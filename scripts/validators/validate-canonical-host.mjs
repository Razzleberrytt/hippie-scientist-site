#!/usr/bin/env node
/**
 * Validates that no active source/runtime file references the deprecated www subdomain.
 * Canonical host is: thehippiescientist.net (no www).
 * www.thehippiescientist.net should only appear in docs explaining redirect behavior.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const BAD_HOST = 'www.thehippiescientist.net'

const SCAN_DIRS = ['app', 'src', 'components', 'lib', 'scripts', 'public', 'config']
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.js', '.cjs', '.json', '.css', '.html'])

// These path segments are safe to contain the www host (docs, redirect notes, audit reports, validators)
const ALLOWLISTED_SEGMENTS = ['.md', '/docs/', '/audit/', '/audits/', 'SECURITY', 'README', 'PROGRESS', 'PLAN', 'CLAUDE', '__tests__', '.test.', '.spec.', 'scripts/validators/', 'validate-canonical-host', 'validate-sitemap']

function isAllowlisted(relPath) {
  return ALLOWLISTED_SEGMENTS.some(seg => relPath.includes(seg))
}

function scanDir(dir) {
  const absDir = path.join(ROOT, dir)
  if (!fs.existsSync(absDir)) return []

  const results = []

  function walk(currentDir) {
    let entries
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        if (['.next', 'node_modules', 'out', '.git', 'cache'].includes(entry.name)) continue
        walk(fullPath)
        continue
      }
      if (!entry.isFile()) continue
      const ext = path.extname(entry.name)
      if (!SCAN_EXTENSIONS.has(ext)) continue

      const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/')
      if (isAllowlisted(relPath)) continue

      let content
      try {
        content = fs.readFileSync(fullPath, 'utf8')
      } catch {
        continue
      }
      if (!content.includes(BAD_HOST)) continue

      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        if (line.includes(BAD_HOST)) {
          results.push({ file: relPath, line: idx + 1, text: line.trim().slice(0, 120) })
        }
      })
    }
  }

  walk(absDir)
  return results
}

function scanRootConfigs() {
  const configFiles = [
    'next.config.mjs', 'next.config.js', 'next.config.ts',
    'package.json', 'cloudflare.json', '.env.example',
  ]
  const results = []
  for (const file of configFiles) {
    const fullPath = path.join(ROOT, file)
    if (!fs.existsSync(fullPath)) continue
    let content
    try {
      content = fs.readFileSync(fullPath, 'utf8')
    } catch {
      continue
    }
    if (!content.includes(BAD_HOST)) continue
    const lines = content.split('\n')
    lines.forEach((line, idx) => {
      if (line.includes(BAD_HOST)) {
        results.push({ file, line: idx + 1, text: line.trim().slice(0, 120) })
      }
    })
  }
  return results
}

const allMatches = [
  ...SCAN_DIRS.flatMap(d => scanDir(d)),
  ...scanRootConfigs(),
]

if (allMatches.length === 0) {
  console.log(`[validate-canonical-host] PASS: No references to "${BAD_HOST}" found in active source.`)
  process.exit(0)
} else {
  console.error(`[validate-canonical-host] FAIL: Found ${allMatches.length} reference(s) to "${BAD_HOST}" in active source:`)
  allMatches.forEach(m => console.error(`  ${m.file}:${m.line}  ${m.text}`))
  console.error(`\nFix: Replace "${BAD_HOST}" with "thehippiescientist.net" (no www).`)
  process.exit(1)
}
