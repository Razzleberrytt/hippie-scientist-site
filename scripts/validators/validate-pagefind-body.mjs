#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'

const root = process.cwd()
const outDir = path.join(root, 'out')

function fail(message) {
  console.error(`[validate-pagefind-body] FAIL: ${message}`)
  process.exit(1)
}

if (!fs.existsSync(outDir)) {
  console.log('[validate-pagefind-body] SKIP: out/ does not exist yet.')
  process.exit(0)
}

const htmlFiles = globPkg.sync(path.join(outDir, '**/*.html'), {
  absolute: true,
  nodir: true,
  ignore: [
    path.join(outDir, 'pagefind/**/*'),
  ],
})

if (htmlFiles.length === 0) {
  fail('No exported HTML files found under out/.')
}

const appShellPages = htmlFiles.filter(file => {
  const rel = path.relative(outDir, file).replaceAll(path.sep, '/')
  return !(
    rel === '500/index.html' ||
    rel.startsWith('blog/') ||
    rel.startsWith('lead-magnets/')
  )
})

const criticalPages = [
  'index.html',
  'articles/index.html',
  'compounds/index.html',
  'guides/index.html',
  'herbs/index.html',
  'search/index.html',
]

const missing = []
const criticalMissing = []
let marked = 0

for (const file of appShellPages) {
  const html = fs.readFileSync(file, 'utf8')
  if (!html.includes('data-pagefind-body')) {
    missing.push(path.relative(root, file))
    if (missing.length >= 20) break
  } else {
    marked += 1
  }
}

if (missing.length) {
  fail(`Missing data-pagefind-body in exported HTML:\n${missing.map(file => `  - ${file}`).join('\n')}`)
}

for (const rel of criticalPages) {
  const file = path.join(outDir, rel)
  if (!fs.existsSync(file)) {
    criticalMissing.push(`${path.relative(root, file)} (missing file)`)
    continue
  }
  const html = fs.readFileSync(file, 'utf8')
  if (!html.includes('data-pagefind-body')) criticalMissing.push(path.relative(root, file))
}

if (criticalMissing.length) {
  fail(`Critical exported pages missing data-pagefind-body:\n${criticalMissing.map(file => `  - ${file}`).join('\n')}`)
}

if (marked === 0) {
  fail('No app-shell exported pages include data-pagefind-body.')
}

console.log(
  `[validate-pagefind-body] PASS: ${marked}/${appShellPages.length} app-shell HTML files include data-pagefind-body; ` +
  `${htmlFiles.length - appShellPages.length} legacy/static HTML files skipped.`,
)
