#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const siteOrigin = 'https://thehippiescientist.net'

if (!fs.existsSync(outDir)) {
  console.log('[static-script-references] SKIP: out/ not found')
  process.exit(0)
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'pagefind') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtml(full, files)
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
  }
  return files
}

function pageRoute(file) {
  const rel = path.relative(outDir, file).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`
}

function localPathFor(src) {
  if (!src) return null
  if (src.startsWith('/')) return src.split(/[?#]/)[0]

  try {
    const url = new URL(src)
    if (url.origin !== siteOrigin) return null
    return url.pathname
  } catch {
    return null
  }
}

function rankedCounts(rows, key, limit = 30) {
  const counts = new Map()
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) || 0) + 1)
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)))
    .slice(0, limit)
}

const htmlFiles = walkHtml(outDir)
const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
const absentLocalFiles = []
const external = new Map()
let localReferences = 0

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  const sourcePage = pageRoute(file)

  for (const match of html.matchAll(scriptPattern)) {
    const src = match[1]
    const localPath = localPathFor(src)
    if (!localPath) {
      external.set(src, (external.get(src) || 0) + 1)
      continue
    }

    localReferences += 1
    const diskPath = path.join(outDir, localPath.replace(/^\/+/, ''))
    if (!fs.existsSync(diskPath)) {
      absentLocalFiles.push({ sourcePage, src, localPath })
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  scannedPages: htmlFiles.length,
  localReferences,
  absentLocalReferenceCount: absentLocalFiles.length,
  uniqueAbsentLocalFiles: new Set(absentLocalFiles.map((row) => row.localPath)).size,
  affectedPages: new Set(absentLocalFiles.map((row) => row.sourcePage)).size,
  frequentAbsentLocalFiles: rankedCounts(absentLocalFiles, 'localPath'),
  externalScripts: [...external.entries()]
    .map(([src, references]) => ({ src, references }))
    .sort((a, b) => b.references - a.references || a.src.localeCompare(b.src)),
  references: absentLocalFiles,
}

fs.mkdirSync(path.join(root, 'ops', 'reports'), { recursive: true })
fs.writeFileSync(
  path.join(root, 'ops', 'reports', 'static-script-references.json'),
  JSON.stringify(report, null, 2),
)

console.log(
  `[static-script-references] pages=${report.scannedPages} localRefs=${report.localReferences} absentRefs=${report.absentLocalReferenceCount} uniqueAbsent=${report.uniqueAbsentLocalFiles} affectedPages=${report.affectedPages} externalSources=${report.externalScripts.length}`,
)

for (const row of report.frequentAbsentLocalFiles) {
  console.warn(`[static-script-references] local ${row.value} (${row.count})`)
}
for (const row of report.externalScripts) {
  console.log(`[static-script-references] external ${row.src} (${row.references})`)
}
