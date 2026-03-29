#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function unescapeHtml(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function extractJsonLdScripts(html) {
  const scripts = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match = re.exec(html)
  while (match) {
    scripts.push(match[1])
    match = re.exec(html)
  }
  return scripts
}

function validateJsonLdFile(relativePath) {
  const fullPath = path.join(DIST, relativePath)
  if (!fs.existsSync(fullPath)) {
    return { file: relativePath, ok: false, reason: 'missing-file' }
  }

  const html = readFile(fullPath)
  const blocks = extractJsonLdScripts(html)
  if (blocks.length === 0) {
    return { file: relativePath, ok: false, reason: 'missing-json-ld' }
  }

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(unescapeHtml(block.trim()))
      if (!parsed || typeof parsed !== 'object' || !parsed['@context'] || !parsed['@type']) {
        return { file: relativePath, ok: false, reason: 'missing-context-or-type' }
      }
    } catch {
      return { file: relativePath, ok: false, reason: 'invalid-json' }
    }
  }

  return { file: relativePath, ok: true, scripts: blocks.length }
}

const filesToCheck = ['index.html']
const blogDir = path.join(DIST, 'blog')
if (fs.existsSync(blogDir)) {
  const candidates = fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join('blog', entry.name, 'index.html'))
  if (candidates.length > 0) filesToCheck.push(candidates[0])
}

const results = filesToCheck.map(validateJsonLdFile)
const failing = results.filter(result => !result.ok)

results.forEach(result => {
  if (result.ok) {
    console.log(`[structured-data-smoke] PASS ${result.file} scripts=${result.scripts}`)
  } else {
    console.error(`[structured-data-smoke] FAIL ${result.file} reason=${result.reason}`)
  }
})

if (failing.length > 0) {
  process.exit(1)
}
