#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const reportPath = path.join(root, 'reports/production-visible-language.json')
if (!fs.existsSync(outDir)) {
  console.error('[production-visible-language] missing out/ — run a production build first')
  process.exit(1)
}

const forbidden = [
  ['pubmed-metadata-placeholder', /(?:metadata extraction (?:is )?required|still require(?:s)? pubmed metadata extraction|minimal citation row added from existing workbook)/i],
  ['editorial-todo', /\b(?:editorial|internal) todo\b/i],
  ['debug-language', /\b(?:debug string|migration comment|placeholder citation)\b/i],
  ['internal-version-prefix', /(?:^|[\s>])v\d+(?:\.\d+)*\s*:\s*[A-Z]/],
  ['object-leak', /\[object Object\]/i],
  ['lorem-ipsum', /\blorem ipsum\b/i],
  ['duplicated-evidence-word', /\bevidence\s+evidence\b/i],
]

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== '_next' && entry.name !== 'pagefind') files.push(...walk(full))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
  }
  return files
}
function routeFromFile(file) {
  let rel = path.relative(outDir, file).split(path.sep).join('/')
  if (rel === 'index.html') return '/'
  rel = rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '/')
  return `/${rel}`.replace(/\/+/g, '/')
}
function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39|lt|gt);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const findings = []
let pages = 0
for (const file of walk(outDir)) {
  pages += 1
  const route = routeFromFile(file)
  const body = visibleText(fs.readFileSync(file, 'utf8'))
  for (const [code, pattern] of forbidden) {
    const match = pattern.exec(body)
    if (!match) continue
    const start = Math.max(0, match.index - 80)
    const end = Math.min(body.length, match.index + match[0].length + 120)
    findings.push({ route, code, excerpt: body.slice(start, end) })
  }
}

const report = { generatedAt: new Date().toISOString(), pagesScanned: pages, findings, forbiddenCodes: forbidden.map(([code]) => code) }
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`[production-visible-language] scanned ${pages} HTML pages; findings=${findings.length}`)
console.log(`[production-visible-language] report: ${path.relative(root, reportPath)}`)
if (findings.length) {
  console.error(`\n[production-visible-language] FAILED — ${findings.length} production-visible leak(s)`)
  findings.slice(0, 100).forEach((finding) => console.error(`[production-visible-language] ${finding.route} · ${finding.code} · ${finding.excerpt}`))
  process.exit(1)
}
console.log('[production-visible-language] PASS')
