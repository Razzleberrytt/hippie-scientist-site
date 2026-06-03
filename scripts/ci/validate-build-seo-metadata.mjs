#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const buildDir = path.join(rootDir, 'out')

// Cap to avoid scanning all 900+ pages — sample a representative spread
const MAX_PAGES = 60

function collectHtmlFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (results.length >= MAX_PAGES * 4) break // over-collect then sample
    const res = path.resolve(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip raw data directories — not real HTML pages
      if (['blogdata', '_next'].includes(entry.name)) continue
      collectHtmlFiles(res, results)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(res)
    }
  }
  return results
}

// Sample evenly from collected files
function sampleFiles(files, n) {
  if (files.length <= n) return files
  const step = Math.floor(files.length / n)
  return files.filter((_, i) => i % step === 0).slice(0, n)
}

console.log(`[seo-metadata-validation] scanning build directory: ${path.relative(rootDir, buildDir)}`)

const allFiles = collectHtmlFiles(buildDir)
const filesToCheck = sampleFiles(allFiles, MAX_PAGES)

let totalPages = 0
let failedPages = 0
const errors = []

for (const filePath of filesToCheck) {
  totalPages++
  const relPath = path.relative(buildDir, filePath).replace(/\\/g, '/')

  // Read only the first 8KB — enough for <head> checks, avoids slow reads on huge pages
  const fd = fs.openSync(filePath, 'r')
  const buf = Buffer.alloc(8192)
  const bytesRead = fs.readSync(fd, buf, 0, 8192, 0)
  fs.closeSync(fd)
  const content = buf.slice(0, bytesRead).toString('utf8')

  const pageErrors = []

  // 1. Verify title
  const titleMatch = content.match(/<title>(.*?)<\/title>/i)
  if (!titleMatch) {
    pageErrors.push('Missing <title> tag')
  } else if (!titleMatch[1].trim()) {
    pageErrors.push('Empty <title> tag')
  }

  // 2. Verify meta description
  const metaDescMatch =
    content.match(/<meta\s+[^>]*name=["']description["']\s+[^>]*content=["']([^"']*)['"]/i) ||
    content.match(/<meta\s+[^>]*content=["']([^"']*)['"]\s+[^>]*name=["']description["']/i)
  if (!metaDescMatch) {
    pageErrors.push('Missing <meta name="description"> tag')
  } else if (!metaDescMatch[1].trim()) {
    pageErrors.push('Empty <meta name="description"> tag')
  }

  // 3. Verify viewport meta tag
  const viewportMatch = content.match(/<meta\s+[^>]*name=["']viewport["']/i)
  if (!viewportMatch) {
    pageErrors.push('Missing <meta name="viewport"> tag')
  }

  if (pageErrors.length > 0) {
    failedPages++
    errors.push(`Page: /${relPath}\n${pageErrors.map(e => `  - ${e}`).join('\n')}`)
  }
}

console.log(`[seo-metadata-validation] sampled ${totalPages} of ${allFiles.length} static pages.`)

if (failedPages > 0) {
  console.error(`[seo-metadata-validation] FAIL: ${failedPages} pages failed validation:`)
  errors.forEach(err => console.error(err))
  process.exit(1)
}

console.log('[seo-metadata-validation] PASS: all sampled static pages verified successfully.')
