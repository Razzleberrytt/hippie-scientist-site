#!/usr/bin/env node
/**
 * Validates that active source code does not import fonts from next/font/google
 * or reference external Google Fonts URLs.
 *
 * Rationale: fonts should be self-hosted via @fontsource packages (already in deps).
 * next/font/google fetches fonts from Google's CDN at build/dev time, which:
 *   - adds a build-time network dependency on fonts.googleapis.com
 *   - may affect CSP headers
 *   - conflicts with self-hosted font strategy
 *
 * Migration path: remove next/font/google import from app/layout.tsx and instead
 * import CSS directly: import '@fontsource-variable/fraunces' / import '@fontsource/inter'.
 * Then define --font-inter and --font-fraunces CSS variables in app/globals.css.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const BAD_IMPORT = 'next/font/google'
const BAD_FONT_URLS = ['fonts.googleapis.com', 'fonts.gstatic.com']

const SCAN_DIRS = ['app', 'src', 'components', 'lib']
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.js', '.css', '.html'])

// Allowlisted path segments — docs/markdown explaining historical behavior are OK
const ALLOWLISTED_SEGMENTS = ['.md', '/docs/', 'SECURITY', 'README', 'CLAUDE', '__tests__', '.test.', '.spec.']

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
        if (['.next', 'node_modules', 'out', '.git'].includes(entry.name)) continue
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

      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        const isBadImport = line.includes(BAD_IMPORT)
        const badUrl = BAD_FONT_URLS.find(u => line.includes(u))
        if (isBadImport || badUrl) {
          results.push({
            file: relPath,
            line: idx + 1,
            text: line.trim().slice(0, 140),
            type: isBadImport ? 'next/font/google import' : `external font URL (${badUrl})`,
          })
        }
      })
    }
  }

  walk(absDir)
  return results
}

const allMatches = SCAN_DIRS.flatMap(d => scanDir(d))

if (allMatches.length === 0) {
  console.log('[validate-fonts] PASS: No Google Fonts build dependency found in active source.')
  process.exit(0)
} else {
  console.error(`[validate-fonts] FAIL: Found ${allMatches.length} Google Fonts reference(s) in active source:`)
  allMatches.forEach(m => console.error(`  [${m.type}]  ${m.file}:${m.line}  ${m.text}`))
  console.error('\nFix: Migrate app/layout.tsx from next/font/google to @fontsource packages.')
  console.error('  1. Remove: import { Inter, Fraunces } from "next/font/google"')
  console.error('  2. Add to app/globals.css: @import "@fontsource-variable/fraunces"; @import "@fontsource/inter";')
  console.error('  3. Set --font-inter and --font-fraunces CSS variables on :root or <html>.')
  process.exit(1)
}
