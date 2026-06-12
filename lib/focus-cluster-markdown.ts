import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const FOCUS_CLUSTER_DIR = path.join(process.cwd(), 'docs', 'content', 'focus-cluster')
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type FocusClusterArticle = {
  title: string
  seoTitle: string
  metaDescription: string
  primaryKeyword: string
  secondaryKeywords: string[]
  status: string
  cluster: string
  slug: string
  sourceFile: string
  markdown: string
  dateModified: string
}

type FocusClusterSource = {
  slug: string
  fileName: string
}

export const focusClusterArticleSources: FocusClusterSource[] = [
  {
    slug: 'best-supplements-for-adhd',
    fileName: 'best-supplements-for-adhd.md',
  },
  {
    slug: 'omega-3-for-adhd',
    fileName: 'omega-3-for-adhd.md',
  },
  {
    slug: 'magnesium-for-adhd',
    fileName: 'magnesium-for-adhd.md',
  },
  {
    slug: 'l-theanine-for-adhd',
    fileName: 'l-theanine-for-adhd.md',
  },
  {
    slug: 'citicoline-vs-alpha-gpc',
    fileName: 'citicoline-vs-alpha-gpc.md',
  },
  {
    slug: 'best-supplements-for-focus-without-caffeine',
    fileName: 'best-supplements-for-focus-without-caffeine.md',
  },
]

const ALLOWED_SOURCE_STATUSES = new Set(['draft-source'])

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean)
  }

  const stringValue = asString(value)
  if (!stringValue) return []

  return stringValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function extractSection(raw: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = raw.match(new RegExp(`##\\s+${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n##\\s|\\n---\\s*$|$)`, 'i'))
  return match?.[1]?.trim() || ''
}

function stripEditorialTerminal(raw: string): string {
  return raw
    .replace(/\n## Related Articles[\s\S]*$/i, '')
    .replace(/\n## Internal Linking Recommendations[\s\S]*$/i, '')
    .trim()
}

function parseYamlSource(raw: string, sourceFile: string): FocusClusterArticle {
  const parsed = matter(raw)
  const data = parsed.data || {}
  const content = (parsed.content || '').trim()
  const fullArticleContent = extractSection(content, 'Full Article Content') || extractSection(content, 'Full article content')
  const markdown = stripEditorialTerminal(fullArticleContent || content)
  const h1 = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const title = asString(data.title) || h1 || ''

  return {
    title,
    seoTitle: asString(data.seoTitle) || title,
    metaDescription: asString(data.metaDescription),
    primaryKeyword: asString(data.primaryKeyword),
    secondaryKeywords: asStringArray(data.secondaryKeywords),
    status: asString(data.status) || 'draft-source',
    cluster: asString(data.cluster) || 'focus-adhd',
    slug: asString(data.slug),
    sourceFile,
    markdown,
    dateModified: '2026-06-12',
  }
}

function validateArticle(article: FocusClusterArticle, expectedSlug: string): void {
  if (!SLUG_PATTERN.test(article.slug)) {
    throw new Error(`[focus-cluster] Invalid slug: ${article.slug}`)
  }

  if (article.slug !== expectedSlug) {
    throw new Error(`[focus-cluster] Frontmatter slug "${article.slug}" does not match expected route "${expectedSlug}"`)
  }

  if (!ALLOWED_SOURCE_STATUSES.has(article.status)) {
    throw new Error(`[focus-cluster] Unsupported status "${article.status}" for ${article.slug}`)
  }

  const requiredFields: Array<keyof FocusClusterArticle> = [
    'title',
    'seoTitle',
    'metaDescription',
    'primaryKeyword',
    'status',
    'cluster',
    'slug',
    'markdown',
  ]

  const missing = requiredFields.filter((field) => !String(article[field] || '').trim())
  if (missing.length > 0) {
    throw new Error(`[focus-cluster] Missing required field(s) for ${article.slug}: ${missing.join(', ')}`)
  }
}

export function getFocusClusterArticle(slug: string): FocusClusterArticle | null {
  const source = focusClusterArticleSources.find((item) => item.slug === slug)
  if (!source) return null

  const sourcePath = path.join(FOCUS_CLUSTER_DIR, source.fileName)
  if (!existsSync(sourcePath)) return null

  const raw = readFileSync(sourcePath, 'utf8')
  const sourceFile = path.relative(process.cwd(), sourcePath).replace(/\\/g, '/')
  const article = raw.trimStart().startsWith('---')
    ? parseYamlSource(raw, sourceFile)
    : null

  if (!article) {
    throw new Error(`[focus-cluster] Missing YAML frontmatter in ${source.fileName}`)
  }

  validateArticle(article, source.slug)
  return article
}

export function getAllFocusClusterArticles(): FocusClusterArticle[] {
  return focusClusterArticleSources
    .map((source) => getFocusClusterArticle(source.slug))
    .filter((article): article is FocusClusterArticle => Boolean(article))
}
