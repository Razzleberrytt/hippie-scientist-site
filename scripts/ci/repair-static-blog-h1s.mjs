#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const BLOG_OUT_DIR = path.join(process.cwd(), 'out', 'blog')

const decodeEntities = (value) => String(value || '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const titleFromHtml = (html) => {
  const match = html.match(/<title>([^<]+)<\/title>/i)
  return decodeEntities(match?.[1] || '').replace(/\s+—\s+The Hippie Scientist$/i, '').trim()
}

const repairFile = (filePath) => {
  const html = fs.readFileSync(filePath, 'utf8')
  if (/<h1\b/i.test(html)) return false
  if (!/<main\s+id=["']blog-post["'][^>]*>/i.test(html)) return false

  const title = titleFromHtml(html)
  if (!title) return false

  const heading = `\n      <h1>${escapeHtml(title)}</h1>`
  const repaired = html.replace(/(<main\s+id=["']blog-post["'][^>]*>)/i, `$1${heading}`)

  if (repaired === html) return false
  fs.writeFileSync(filePath, repaired, 'utf8')
  return true
}

const walkIndexHtml = (dir) => {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkIndexHtml(fullPath)
    return entry.isFile() && entry.name === 'index.html' ? [fullPath] : []
  })
}

const files = walkIndexHtml(BLOG_OUT_DIR)
let repairedCount = 0

for (const filePath of files) {
  if (repairFile(filePath)) repairedCount += 1
}

console.log(`[repair-static-blog-h1s] repaired ${repairedCount} static blog page(s)`)
