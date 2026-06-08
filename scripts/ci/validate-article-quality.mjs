import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import {
  assertUniqueArticleTitles,
  validateArticleQuality,
} from '../lib/article-quality-gates.mjs'

const ROOT = process.cwd()
const CONTENT_TARGETS = [
  {
    dir: path.join(ROOT, 'content', 'articles'),
    sourceName: 'content/articles',
    requireReferences: true,
    requireEntityMatch: true,
  },
  {
    dir: path.join(ROOT, 'content', 'blog'),
    sourceName: 'content/blog',
    requireReferences: false,
    requireEntityMatch: false,
  },
]

const stripQuotes = value => {
  const trimmed = String(value || '').trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const readRecords = target => {
  if (!fs.existsSync(target.dir)) return []

  return fs
    .readdirSync(target.dir)
    .filter(fileName => /\.(md|mdx)$/i.test(fileName))
    .map(fileName => {
      const raw = fs.readFileSync(path.join(target.dir, fileName), 'utf8')
      const { data, content } = matter(raw)
      const slug = String(data.slug || fileName.replace(/\.(md|mdx)$/i, '')).trim().toLowerCase()
      return {
        slug,
        title: stripQuotes(data.title || ''),
        date: data.date ? new Date(data.date).toISOString().slice(0, 10) : '',
        description: stripQuotes(data.description || data.excerpt || data.summary || ''),
        excerpt: stripQuotes(data.excerpt || data.summary || ''),
        content,
        tags: Array.isArray(data.tags) ? data.tags : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        references: Array.isArray(data.references) ? data.references : [],
        __fileName: `${target.sourceName}/${fileName}`,
      }
    })
}

const issues = []

for (const target of CONTENT_TARGETS) {
  const records = readRecords(target)
  for (const record of records) {
    issues.push(...validateArticleQuality(record, {
      fileName: record.__fileName,
      requireReferences: target.requireReferences,
      requireEntityMatch: target.requireEntityMatch,
    }))
  }
  issues.push(...assertUniqueArticleTitles(records, target.sourceName))
}

if (issues.length > 0) {
  console.error('[validate-article-quality] FAIL')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('[validate-article-quality] PASS')
