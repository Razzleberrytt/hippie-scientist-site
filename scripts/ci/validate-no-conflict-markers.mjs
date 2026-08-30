#!/usr/bin/env node
/**
 * Refuse to ship an unresolved merge conflict.
 *
 * Why this exists
 * ---------------
 * TypeScript already catches a conflict marker in a .ts or .tsx file, loudly
 * and immediately. Nothing catches one anywhere else, and most of this repo is
 * somewhere else: 200+ .mjs pipeline scripts, the generated JSON under
 * public/data, the CSS, the Cloudflare _headers and _redirects files, and the
 * workflow YAML.
 *
 * The failure modes there are worse than a build error, because they are quiet.
 * A marker in _redirects is a broken redirect rule. A marker in a data file is
 * a parse error at build time, several steps downstream from the cause. A
 * marker in a workflow file is a job that stops running with nobody watching.
 *
 * The whole check is a string scan over tracked files and costs well under a
 * second, so it runs first — a marker anywhere makes every later gate's output
 * misleading, and forty TypeScript parse errors are a much worse description
 * of the problem than one line naming the file.
 *
 * The baseline was zero when this landed, so it enforces zero rather than
 * ratcheting.
 *
 * Usage: node scripts/ci/validate-no-conflict-markers.mjs
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

/**
 * Built by repetition rather than written out, so this file does not trip the
 * very check it implements — and so the patterns cannot be broken by an editor
 * helpfully "resolving" a literal that looks like a conflict.
 */
const OURS = '<'.repeat(7)
const THEIRS = '>'.repeat(7)
const DIVIDER = '='.repeat(7)

/**
 * Anything git will not usefully diff as text. Reading a 10MB font or image
 * looking for angle brackets is wasted work, not extra safety.
 */
const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.pdf', '.zip', '.gz', '.xlsx', '.xls', '.mp4', '.webm', '.mp3', '.wav',
])

function trackedFiles() {
  const stdout = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return stdout.split('\0').filter(Boolean)
}

const findings = []

for (const relativePath of trackedFiles()) {
  if (SKIP_EXTENSIONS.has(path.extname(relativePath).toLowerCase())) continue

  const absolute = path.join(ROOT, relativePath)
  let contents
  try {
    contents = fs.readFileSync(absolute, 'utf8')
  } catch {
    // A tracked path that cannot be read as text — a symlink or a file removed
    // from the working tree — is not this check's business to report.
    continue
  }

  // Cheap reject first: the overwhelming majority of files contain neither.
  if (!contents.includes(OURS) && !contents.includes(THEIRS)) continue

  const lines = contents.split(/\r?\n/)
  const hits = []
  let sawSideMarker = false

  lines.forEach((line, index) => {
    // A real marker is at column zero and carries a label after a space
    // ("<<<<<<< HEAD"), or stands alone. Prose about conflicts is indented or
    // fenced, and does not look like this.
    if (line.startsWith(`${OURS} `) || line === OURS || line.startsWith(`${THEIRS} `) || line === THEIRS) {
      sawSideMarker = true
      hits.push({ line: index + 1, text: line.slice(0, 60) })
    }
  })

  // `=======` alone is a Markdown heading underline, so it only counts as a
  // conflict when one of the angle-bracket markers is present in the same file.
  if (sawSideMarker) {
    lines.forEach((line, index) => {
      if (line === DIVIDER) hits.push({ line: index + 1, text: line })
    })
  }

  if (hits.length) {
    hits.sort((left, right) => left.line - right.line)
    findings.push({ file: relativePath, hits })
  }
}

if (!findings.length) {
  console.log('[conflict-markers] clean')
  process.exit(0)
}

console.error('\n[conflict-markers] unresolved merge conflict in tracked files:\n')
for (const finding of findings) {
  for (const hit of finding.hits) {
    console.error(`  ${finding.file}:${hit.line}  ${hit.text}`)
  }
}
console.error(
  `\n  ${findings.length} file(s) affected. Resolve the conflict and re-run.\n` +
    '  Committing a marker outside .ts/.tsx fails quietly: a broken redirect,\n' +
    '  a data file that will not parse, or a workflow that stops running.\n',
)
process.exit(1)
