import fs from 'node:fs'
import path from 'node:path'
import {
  assertUniqueArticleTitles,
  validateArticleQuality,
} from './lib/article-quality-gates.mjs'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'articles', 'articles.json')

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const toIsoDate = value => {
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

const estimateReadingTime = text => {
  const words = String(text)
    .replace(/[#*_`>-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

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

const parseFrontmatter = raw => {
  const lines = raw.split('\n')
  const meta = {}
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/)
    if (!match) { i++; continue }

    const key = match[1]
    const restOfLine = match[2].trim()

    // Inline array: key: [a, b]
    if (restOfLine.startsWith('[') && restOfLine.endsWith(']')) {
      meta[key] = restOfLine
        .slice(1, -1)
        .split(',')
        .map(s => stripQuotes(s.trim()))
        .filter(Boolean)
      i++
      continue
    }

    // Block scalar: key: |  or  key: >
    if (restOfLine === '|' || restOfLine === '>') {
      const lines2 = []
      i++
      const baseIndent = lines[i]?.match(/^(\s+)/)?.[1]?.length ?? 2
      while (i < lines.length && (lines[i].match(/^\s/) || lines[i].trim() === '')) {
        lines2.push(lines[i].slice(baseIndent))
        i++
      }
      meta[key] = lines2.join('\n').trim()
      continue
    }

    // Indented list (YAML sequence): key: followed by  - items
    if (restOfLine === '') {
      const listItems = []
      const objItems = []
      let j = i + 1
      while (j < lines.length && /^\s+-/.test(lines[j])) {
        const itemLine = lines[j].trim().replace(/^-\s*/, '')
        // Check if this starts a YAML object (key: value)
        if (itemLine.includes(':')) {
          // Parse multi-line object items
          const obj = {}
          // First key on the '- ' line
          const firstKV = itemLine.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/)
          if (firstKV) obj[firstKV[1]] = stripQuotes(firstKV[2])
          j++
          // Continue collecting indented key: value lines belonging to this object
          while (j < lines.length && /^\s{4,}[a-zA-Z]/.test(lines[j])) {
            const kv = lines[j].trim().match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/)
            if (kv) obj[kv[1]] = stripQuotes(kv[2])
            j++
          }
          objItems.push(obj)
        } else {
          listItems.push(stripQuotes(itemLine))
          j++
        }
      }
      if (objItems.length > 0) {
        meta[key] = objItems
      } else if (listItems.length > 0) {
        meta[key] = listItems
      }
      i = j
      continue
    }

    meta[key] = stripQuotes(restOfLine)
    i++
  }

  return meta
}

const parseFile = (filePath, fileName) => {
  const raw = fs.readFileSync(filePath, 'utf8')
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/)
  if (!fmMatch) {
    console.warn(`[build-articles] No frontmatter in ${fileName}, skipping.`)
    return null
  }

  const meta = parseFrontmatter(fmMatch[1])
  const body = (fmMatch[2] || '').trim()

  const slug = meta.slug || fileName.replace(/\.(md|mdx)$/i, '').toLowerCase()
  if (!SLUG_PATTERN.test(slug)) {
    console.warn(`[build-articles] Invalid slug "${slug}" in ${fileName}, skipping.`)
    return null
  }

  const title = stripQuotes(meta.title || '')
  if (!title) {
    console.warn(`[build-articles] Missing title in ${fileName}, skipping.`)
    return null
  }

  const isoDate = toIsoDate(meta.date)
  const readingTime = estimateReadingTime(body)

  // Parse references array — expects YAML sequence of objects
  const references = Array.isArray(meta.references) ? meta.references.map(ref => ({
    title: ref.title || '',
    authors: ref.authors || '',
    year: ref.year ? String(ref.year) : '',
    pmid: ref.pmid ? String(ref.pmid) : '',
    url: ref.url || (ref.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/` : ''),
  })) : []

  const faqs = Array.isArray(meta.faqs) ? meta.faqs.map(faq => ({
    question: faq.question || '',
    answer: faq.answer || '',
  })).filter(faq => faq.question && faq.answer) : []

  const article = {
    slug,
    title,
    description: stripQuotes(meta.description || meta.excerpt || ''),
    date: isoDate,
    updatedAt: meta.updatedAt ? toIsoDate(meta.updatedAt) : null,
    author: stripQuotes(meta.author || 'Will'),
    keywords: Array.isArray(meta.keywords) ? meta.keywords : [],
    featuredImage: stripQuotes(meta.featured_image || meta.featuredImage || ''),
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    readingTime,
    content: body,
    references,
    ...(faqs.length ? { faqs } : {}),
    profile_status: stripQuotes(meta.profile_status || 'published'),
    ai_assisted: meta.ai_assisted === 'true' || meta.ai_assisted === true,
  }

  const qualityIssues = validateArticleQuality(article, {
    fileName,
    requireReferences: true,
    requireEntityMatch: true,
  })

  if (qualityIssues.length > 0) {
    throw new Error(`Quality gate failed for ${fileName}:\n- ${qualityIssues.join('\n- ')}`)
  }

  return article
}

const main = () => {
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true })
    console.log('[build-articles] Created content/articles directory.')
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => /\.(md|mdx)$/i.test(f))

  const articles = []
  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const article = parseFile(filePath, file)
    if (article) articles.push(article)
  }

  const duplicateTitleIssues = assertUniqueArticleTitles(articles, 'content/articles')
  if (duplicateTitleIssues.length > 0) {
    throw new Error(`[build-articles] ${duplicateTitleIssues.join('\n')}`)
  }

  // Sort newest first
  articles.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(articles, null, 2))
  console.log(`[build-articles] Wrote ${articles.length} article(s) to data/articles/articles.json`)
}

main()
