#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const herbsPath = path.join(root, 'public/data/herbs.json')
const compoundsPath = path.join(root, 'public/data/compounds.json')
const blogManifestPaths = [
  path.join(root, 'data/articles/articles.json'),
  path.join(root, 'public/blogdata/index.json'),
  path.join(root, 'data/blog/posts.json'),
]
const outPath = path.join(root, 'src/generated/site-counts.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function safeCount(value) {
  return Array.isArray(value) ? value.length : 0
}

function countArticles() {
  const slugs = new Set()
  for (const manifestPath of blogManifestPaths) {
    if (!fs.existsSync(manifestPath)) continue
    const payload = readJson(manifestPath)
    if (Array.isArray(payload)) {
      payload.filter(item => Boolean(item?.slug)).forEach(item => slugs.add(item.slug))
    }
  }
  return slugs.size
}

const herbs = safeCount(readJson(herbsPath))
const compounds = safeCount(readJson(compoundsPath))
const articles = countArticles()

const payload = {
  herbs,
  compounds,
  articles,
  generatedAt: new Date().toISOString(),
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Wrote ${path.relative(root, outPath)} with counts`, payload)
