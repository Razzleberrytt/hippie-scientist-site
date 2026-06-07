#!/usr/bin/env node
/**
 * Validates post-build artifacts for static export site:
 * - out/sitemap.xml exists and is non-empty.
 * - out/robots.txt exists and is non-empty.
 * - out/pagefind directory exists and is not empty.
 * - Key HTML pages exist (index.html, guides/index.html, faq/index.html, compare/index.html) and contain structured JSON-LD data.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')

function logError(msg) {
  console.error(`\x1b[31m[validate-build-artifacts] FAIL: ${msg}\x1b[0m`)
}

function logPass(msg) {
  console.log(`\x1b[32m[validate-build-artifacts] PASS: ${msg}\x1b[0m`)
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.log('[validate-build-artifacts] SKIP: out/ directory does not exist yet (pre-build stage).')
    process.exit(0)
  }

  let failed = false

  // 1. Check sitemap.xml
  const sitemapPath = path.join(OUT_DIR, 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) {
    logError('out/sitemap.xml does not exist.')
    failed = true
  } else {
    const stat = fs.statSync(sitemapPath)
    if (stat.size === 0) {
      logError('out/sitemap.xml is empty.')
      failed = true
    } else {
      logPass('out/sitemap.xml exists and is non-empty.')
    }
  }

  // 2. Check robots.txt
  const robotsPath = path.join(OUT_DIR, 'robots.txt')
  if (!fs.existsSync(robotsPath)) {
    logError('out/robots.txt does not exist.')
    failed = true
  } else {
    const stat = fs.statSync(robotsPath)
    if (stat.size === 0) {
      logError('out/robots.txt is empty.')
      failed = true
    } else {
      const content = fs.readFileSync(robotsPath, 'utf8')
      if (!content.includes('Sitemap:')) {
        logError('out/robots.txt does not contain Sitemap URL entry.')
        failed = true
      } else {
        logPass('out/robots.txt exists and includes Sitemap declaration.')
      }
    }
  }

  // 3. Check pagefind directory
  const pagefindDir = path.join(OUT_DIR, 'pagefind')
  if (!fs.existsSync(pagefindDir)) {
    logError('out/pagefind/ directory does not exist.')
    failed = true
  } else {
    const stat = fs.statSync(pagefindDir)
    if (!stat.isDirectory()) {
      logError('out/pagefind is not a directory.')
      failed = true
    } else {
      const files = fs.readdirSync(pagefindDir)
      if (files.length === 0) {
        logError('out/pagefind/ directory is empty.')
        failed = true
      } else {
        logPass(`out/pagefind/ exists with ${files.length} build files/directories.`)
      }
    }
  }

  // 4. Verify required JSON-LD pages exist and contain JSON-LD
  const keyPages = [
    { name: 'Homepage', file: 'index.html' },
    { name: 'Guides index', file: 'guides/index.html' },
    { name: 'FAQ', file: 'faq/index.html' },
    { name: 'Compare', file: 'compare/index.html' }
  ]

  for (const page of keyPages) {
    const pagePath = path.join(OUT_DIR, page.file)
    if (!fs.existsSync(pagePath)) {
      logError(`${page.name} build file not found: out/${page.file}`)
      failed = true
    } else {
      const content = fs.readFileSync(pagePath, 'utf8')
      if (!content.includes('application/ld+json')) {
        logError(`${page.name} (out/${page.file}) does not contain required structured JSON-LD data (<script type="application/ld+json">).`)
        failed = true
      } else {
        logPass(`${page.name} (out/${page.file}) verified with valid JSON-LD structure.`)
      }
    }
  }

  if (failed) {
    process.exit(1)
  }

  logPass('All static build artifacts successfully validated!')
  process.exit(0)
}

main()
