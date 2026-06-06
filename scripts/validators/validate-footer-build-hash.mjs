#!/usr/bin/env node
/**
 * Validates that built HTML output does not expose a full 40-character git commit hash.
 *
 * The footer is allowed to show a truncated hash (≤8 chars) when NEXT_PUBLIC_SHOW_BUILD_META=true,
 * but must never expose the raw 40-char SHA. Full hashes in the public output are an unnecessary
 * information disclosure.
 *
 * This validator requires a completed build (out/ directory).
 * Skip gracefully if no build exists yet (pre-build stage).
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const FULL_HASH_RE = /\b[0-9a-f]{40}\b/i
const REQUIRE_BUILT = process.argv.includes('--require-built')

function main() {
  const outDir = path.join(ROOT, 'out')

  if (!fs.existsSync(outDir)) {
    if (REQUIRE_BUILT) {
      console.error('[validate-footer-build-hash] FAIL: out/ directory does not exist. Run `npm run build` first.')
      process.exit(1)
    }
    console.log('[validate-footer-build-hash] SKIP: out/ does not exist (pre-build stage).')
    return
  }

  const violations = []

  function walk(dir) {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue

      let content
      try {
        content = fs.readFileSync(fullPath, 'utf8')
      } catch {
        continue
      }

      const matches = content.match(new RegExp(FULL_HASH_RE.source, 'gi'))
      if (matches) {
        const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/')
        violations.push({ file: relPath, hashes: [...new Set(matches)] })
      }
    }
  }

  walk(outDir)

  if (violations.length === 0) {
    console.log('[validate-footer-build-hash] PASS: No full 40-char commit hashes found in built HTML.')
    return
  }

  console.error(`[validate-footer-build-hash] FAIL: Found full commit hash(es) in ${violations.length} built HTML file(s):`)
  for (const v of violations.slice(0, 10)) {
    console.error(`  ${v.file}: ${v.hashes.join(', ')}`)
  }
  console.error('\nFix: Ensure __COMMIT_HASH__ is sliced to ≤8 chars in next.config.mjs DefinePlugin.')
  console.error('     Ensure the footer does not render full git SHAs.')
  process.exit(1)
}

main()
