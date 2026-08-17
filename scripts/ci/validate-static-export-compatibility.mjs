#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const repoRoot = process.cwd()
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const IGNORE_DIRS = new Set(['node_modules', '.next', 'out', 'coverage', '.git'])
const ROOT_SCAN_DIRS = ['app', 'components', 'lib']
const SRC_ROOT = 'src'

const BLOCK_RULES = [
  {
    id: 'app-non-get-route',
    test: (rel, content) => {
      if (!/(^|\/)app\/.+\/route\.(ts|tsx|js|jsx)$/.test(rel)) return false
      const nonGetExportRegex = /\bexport\s+(async\s+)?(const|function|let|var)\s+(POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/
      return nonGetExportRegex.test(content)
    }
  },
  { id: 'middleware-file', test: (rel) => /(^|\/)middleware\.(ts|js)$/.test(rel) },
  { id: 'use-server', pattern: /['"]use server['"]/ },
  { id: 'next-headers-import', pattern: /from\s+['"]next\/headers['"]/ },
  { id: 'next-server-import', pattern: /from\s+['"]next\/server['"]/ },
  { id: 'cookies-call', pattern: /\bcookies\s*\(/ },
  { id: 'headers-call', pattern: /\bheaders\s*\(/ },
  { id: 'draftMode-call', pattern: /\bdraftMode\s*\(/ },
  { id: 'force-dynamic', pattern: /(?:export\s+const\s+)?dynamic\s*=\s*['"]force-dynamic['"]/ },
  { id: 'unstable_noStore-call', pattern: /\bunstable_noStore\s*\(/ },
  { id: 'noStore-call', pattern: /\bnoStore\s*\(/ },
  { id: 'revalidate-export', pattern: /export\s+const\s+revalidate\s*=/ },
  { id: 'next-revalidate-tag', pattern: /\brevalidate(Tag|Path)\s*\(/ },
]

const importRegex = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+[^'";]*from\s+|import\s*\()\s*['"]([^'"]+)['"]/g

/**
 * Blank out comment text so the line rules only see executable code.
 *
 * The rules match bare identifiers — `headers(`, `cookies(`, `noStore(` — which
 * are ordinary English inside a comment. A JSDoc block describing JPEG frame
 * headers tripped `headers-call` and failed this gate for the whole repository,
 * blocking every open PR behind a false positive.
 *
 * Comment characters are replaced with spaces rather than removed so line
 * numbers and columns in the violation report stay accurate. String literals
 * are tracked only so a `//` or an apostrophe inside one is not mistaken for a
 * comment delimiter; their contents are deliberately left intact, because a
 * forbidden call written as a string is still worth a human look.
 *
 * @param {string} source
 * @returns {string}
 */
function stripComments(source) {
  let out = ''
  let state = 'code'
  let quote = ''

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i]
    const next = source[i + 1]

    if (state === 'code') {
      if (ch === '"' || ch === "'" || ch === '`') {
        state = 'string'
        quote = ch
        out += ch
        continue
      }
      if (ch === '/' && next === '/') {
        state = 'line-comment'
        out += '  '
        i += 1
        continue
      }
      if (ch === '/' && next === '*') {
        state = 'block-comment'
        out += '  '
        i += 1
        continue
      }
      out += ch
      continue
    }

    if (state === 'string') {
      // A backslash escapes the next character, including the closing quote.
      if (ch === '\\') {
        out += ch + (next ?? '')
        i += 1
        continue
      }
      if (ch === quote) state = 'code'
      // An unterminated string cannot span a newline outside a template
      // literal; recovering here keeps a stray quote from swallowing the file.
      if (ch === '\n' && quote !== '`') state = 'code'
      out += ch
      continue
    }

    if (state === 'line-comment') {
      if (ch === '\n') {
        state = 'code'
        out += ch
        continue
      }
      out += ' '
      continue
    }

    // block-comment
    if (ch === '*' && next === '/') {
      state = 'code'
      out += '  '
      i += 1
      continue
    }
    out += ch === '\n' ? ch : ' '
  }

  return out
}

function normalize(rel) { return rel.split(path.sep).join('/') }
function isSourceFile(file) { return SOURCE_EXTENSIONS.has(path.extname(file)) }

async function exists(p) { try { await fs.access(p); return true } catch { return false } }

async function walk(dir, files, ignoredCounter) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) { ignoredCounter.count += 1; continue }
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) { await walk(abs, files, ignoredCounter); continue }
    if (!entry.isFile()) continue
    if (!isSourceFile(entry.name)) { ignoredCounter.count += 1; continue }
    if (entry.name.endsWith('.audit.json')) { ignoredCounter.count += 1; continue }
    files.add(abs)
  }
}

function resolveImport(fromFile, spec) {
  if (!spec || spec.startsWith('node:') || (!spec.startsWith('.') && !spec.startsWith('@/') && !spec.startsWith('/'))) return null
  let base
  if (spec.startsWith('@/')) base = path.join(repoRoot, spec.slice(2))
  else if (spec.startsWith('/')) base = path.join(repoRoot, spec.slice(1))
  else base = path.resolve(path.dirname(fromFile), spec)

  const candidates = [base, ...[...SOURCE_EXTENSIONS].map(ext => `${base}${ext}`), ...[...SOURCE_EXTENSIONS].map(ext => path.join(base, `index${ext}`))]
  return candidates
}

async function collectActiveSrcFiles(seedFiles) {
  const queue = [...seedFiles]
  const visited = new Set()
  const included = new Set()

  while (queue.length) {
    const current = queue.pop()
    if (!current || visited.has(current)) continue
    visited.add(current)
    if (!(await exists(current))) continue
    const rel = normalize(path.relative(repoRoot, current))
    if (!rel.startsWith(`${SRC_ROOT}/`)) continue
    included.add(current)
    const content = await fs.readFile(current, 'utf8')
    for (const match of content.matchAll(importRegex)) {
      const spec = match[1]
      const resolvedCandidates = resolveImport(current, spec)
      if (!resolvedCandidates) continue
      for (const c of resolvedCandidates) {
        if (await exists(c)) { queue.push(c); break }
      }
    }
  }
  return included
}

async function main() {
  const candidateFiles = new Set()
  const ignoredCounter = { count: 0 }

  for (const dir of ROOT_SCAN_DIRS) {
    const abs = path.join(repoRoot, dir)
    if (await exists(abs)) await walk(abs, candidateFiles, ignoredCounter)
  }

  const seedFiles = []
  for (const rootDir of ['app', 'components', 'lib']) {
    for (const file of candidateFiles) {
      const rel = normalize(path.relative(repoRoot, file))
      if (rel.startsWith(`${rootDir}/`)) seedFiles.push(file)
    }
  }

  const activeSrcFiles = await collectActiveSrcFiles(seedFiles)
  for (const srcFile of activeSrcFiles) candidateFiles.add(srcFile)

  const sorted = [...candidateFiles].sort()
  const violations = []

  for (const file of sorted) {
    const rel = normalize(path.relative(repoRoot, file))
    const content = await fs.readFile(file, 'utf8')

    for (const rule of BLOCK_RULES) {
      if (rule.test && rule.test(rel, content)) {
        violations.push(`${rel}: [${rule.id}] matched forbidden file pattern`)
      }
    }

    // Match against code only; the reported excerpt still comes from the
    // original line so the message shows what the author actually wrote.
    const codeLines = stripComments(content).split('\n')
    const rawLines = content.split('\n')
    codeLines.forEach((line, i) => {
      for (const rule of BLOCK_RULES) {
        if (rule.pattern && rule.pattern.test(line)) {
          violations.push(`${rel}:${i + 1}: [${rule.id}] ${(rawLines[i] ?? line).trim()}`)
        }
      }
    })
  }

  console.log(`[static-export-guard] scanned files: ${sorted.length}`)
  console.log(`[static-export-guard] ignored entries: ${ignoredCounter.count}`)

  if (violations.length > 0) {
    console.error('[static-export-guard] static export compatibility violations found:')
    for (const v of violations) console.error(`- ${v}`)
    process.exit(1)
  }

  console.log('[static-export-guard] PASS: no static export compatibility violations found.')
}

main().catch((error) => {
  console.error('[static-export-guard] unexpected failure')
  console.error(error)
  process.exit(1)
})
