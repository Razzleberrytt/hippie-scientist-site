#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const BLOG_DIR = path.resolve('content/blog')
const OUTPUT_PATH = path.resolve('ops/reports/blog-content-audit.json')
const SKELETON_THRESHOLD = 100

const WORD_PATTERN = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g

function countWords(text) {
  return (text.match(WORD_PATTERN) || []).length
}

function stripHighlightsSection(content) {
  const lines = content.split(/\r?\n/)
  const kept = []
  let inHighlights = false

  for (const line of lines) {
    if (!inHighlights && /^##\s+Highlights\s*$/i.test(line.trim())) {
      inHighlights = true
      continue
    }

    if (inHighlights && /^#{1,2}\s+/.test(line.trim())) {
      inHighlights = false
    }

    if (!inHighlights) {
      kept.push(line)
    }
  }

  return kept.join('\n')
}

function stripFirstH1(content) {
  let removed = false
  return content
    .split(/\r?\n/)
    .filter(line => {
      if (!removed && /^#\s+/.test(line.trim())) {
        removed = true
        return false
      }
      return true
    })
    .join('\n')
}

function stripFirstItalicSummaryLine(content) {
  let removed = false
  return content
    .split(/\r?\n/)
    .filter(line => {
      const trimmed = line.trim()
      if (!removed && /^_[^_].*[^_]_$/.test(trimmed)) {
        removed = true
        return false
      }
      return true
    })
    .join('\n')
}

function normalizeForWordCount(content) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function auditPost(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(source)

  const slug = path.basename(filePath).replace(/\.(mdx)$/i, '')
  const rawBodyWordCount = countWords(normalizeForWordCount(content))

  const withoutHighlights = stripHighlightsSection(content)
  const withoutH1 = stripFirstH1(withoutHighlights)
  const withoutSummary = stripFirstItalicSummaryLine(withoutH1)
  const meaningfulBodyWordCount = countWords(normalizeForWordCount(withoutSummary))

  const draft = Boolean(data?.draft)
  const isSkeleton = meaningfulBodyWordCount < SKELETON_THRESHOLD
  const published = !draft
  const seoLiability = published && isSkeleton

  return {
    title: String(data?.title || '').trim() || slug,
    slug,
    date: data?.date ? String(data.date) : null,
    tags: toStringArray(data?.tags),
    draft,
    bodyWordCount: rawBodyWordCount,
    meaningfulBodyWordCount,
    isSkeleton,
    seoLiability,
    seoLiabilityReason: seoLiability
      ? 'Published post has under 100 meaningful body words (SEO liability).'
      : null,
    sourcePath: path.relative(process.cwd(), filePath),
  }
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    throw new Error(`Blog directory not found: ${BLOG_DIR}`)
  }

  const postFiles = fs
    .readdirSync(BLOG_DIR)
    .filter(name => /\.mdx$/i.test(name))
    .sort()
    .map(name => path.join(BLOG_DIR, name))

  const posts = postFiles.map(auditPost)

  const totals = {
    totalPosts: posts.length,
    publishedCount: posts.filter(post => !post.draft).length,
    draftSkeletonCount: posts.filter(post => post.draft && post.isSkeleton).length,
    draftSubstantiveCount: posts.filter(post => post.draft && !post.isSkeleton).length,
    publishedSkeletonCount: posts.filter(post => !post.draft && post.isSkeleton).length,
  }

  const report = {
    generatedAt: new Date().toISOString(),
    skeletonThreshold: SKELETON_THRESHOLD,
    ...totals,
    publishedSkeletonSeoLiabilities: posts
      .filter(post => post.seoLiability)
      .map(post => ({
        slug: post.slug,
        title: post.title,
        meaningfulBodyWordCount: post.meaningfulBodyWordCount,
        seoLiabilityReason: post.seoLiabilityReason,
      })),
    posts,
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8')

  console.log(
    `[audit-blog-content] Audited ${totals.totalPosts} posts. ` +
      `Published skeleton SEO liabilities: ${totals.publishedSkeletonCount}. ` +
      `Report: ${path.relative(process.cwd(), OUTPUT_PATH)}`
  )
}

main()
