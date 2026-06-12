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
  fallbackTitle: string
}

export const focusClusterArticleSources: FocusClusterSource[] = [
  {
    slug: 'best-supplements-for-adhd',
    fileName: 'best-supplements-for-adhd.md',
    fallbackTitle: 'Best Supplements for ADHD',
  },
  {
    slug: 'omega-3-for-adhd',
    fileName: 'omega-3-for-adhd.md',
    fallbackTitle: 'Omega-3 for ADHD',
  },
  {
    slug: 'magnesium-for-adhd',
    fileName: 'magnesium-for-adhd.md',
    fallbackTitle: 'Magnesium for ADHD',
  },
  {
    slug: 'l-theanine-for-adhd',
    fileName: 'l-theanine-for-adhd.md',
    fallbackTitle: 'L-Theanine for ADHD',
  },
  {
    slug: 'citicoline-vs-alpha-gpc',
    fileName: 'citicoline-vs-alpha-gpc.md',
    fallbackTitle: 'Citicoline vs Alpha-GPC',
  },
  {
    slug: 'best-supplements-for-focus-without-caffeine',
    fileName: 'best-supplements-for-focus-without-caffeine.md',
    fallbackTitle: 'Best Supplements for Focus Without Caffeine',
  },
]

const committedSourceFallbacks: Record<string, string> = {
  'best-supplements-for-adhd.md': 'best-supplements-for-adhd-v2-content.md',
  'omega-3-for-adhd.md': 'omega-3-and-adhd.md',
  'magnesium-for-adhd.md': 'magnesium-and-adhd.md',
  'l-theanine-for-adhd.md': 'l-theanine-and-adhd.md',
  'citicoline-vs-alpha-gpc.md': 'citicoline-vs-alpha-gpc-content-v1.md',
  'best-supplements-for-focus-without-caffeine.md': 'l-theanine-vs-caffeine-for-focus-content-v1.md',
}

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

function stripSourceHeader(raw: string): string {
  return raw
    .replace(/^# .+?\n+Status:[\s\S]*?\n---\s*\n+/i, '')
    .trim()
}

function stripEditorialTerminal(raw: string): string {
  return raw
    .replace(/\n## Related Articles[\s\S]*$/i, '')
    .replace(/\n## Internal Linking Recommendations[\s\S]*$/i, '')
    .trim()
}

function resolveSourceFile(fileName: string): string {
  const preferred = path.join(FOCUS_CLUSTER_DIR, fileName)
  if (existsSync(preferred)) return preferred

  const fallbackName = committedSourceFallbacks[fileName]
  const fallback = fallbackName ? path.join(FOCUS_CLUSTER_DIR, fallbackName) : ''
  if (fallback && existsSync(fallback)) return fallback

  return preferred
}

function parseHeadingStyleSource(raw: string, source: FocusClusterSource, sourceFile: string): FocusClusterArticle {
  const fullArticleContent = extractSection(raw, 'Full Article Content') || extractSection(raw, 'Full article content')
  const markdown = fullArticleContent || stripSourceHeader(raw)
  const h1 = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim()

  return {
    title: extractSection(raw, 'H1') || h1 || extractSection(raw, 'SEO Title') || source.fallbackTitle,
    seoTitle: extractSection(raw, 'SEO Title') || h1 || source.fallbackTitle,
    metaDescription: extractSection(raw, 'Meta Description'),
    primaryKeyword: extractSection(raw, 'Primary Keyword'),
    secondaryKeywords: asStringArray(extractSection(raw, 'Secondary Keywords')),
    status: raw.match(/^Status:\s*(.+)$/im)?.[1]?.trim() || 'draft-source',
    cluster: raw.match(/^Cluster:\s*(.+)$/im)?.[1]?.trim() || 'Focus / ADHD',
    slug: source.slug,
    sourceFile,
    markdown: stripEditorialTerminal(markdown),
    dateModified: '2026-06-12',
  }
}

function parseYamlSource(raw: string, source: FocusClusterSource, sourceFile: string): FocusClusterArticle {
  const parsed = matter(raw)
  const data = parsed.data || {}
  const markdown = stripEditorialTerminal((parsed.content || '').trim())
  const h1 = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const title = asString(data.title) || h1 || source.fallbackTitle

  return {
    title,
    seoTitle: asString(data.seoTitle) || title,
    metaDescription: asString(data.metaDescription),
    primaryKeyword: asString(data.primaryKeyword),
    secondaryKeywords: asStringArray(data.secondaryKeywords),
    status: asString(data.status) || 'draft-source',
    cluster: asString(data.cluster) || 'focus-adhd',
    slug: source.slug,
    sourceFile,
    markdown,
    dateModified: '2026-06-12',
  }
}

function validateArticle(article: FocusClusterArticle): void {
  if (!SLUG_PATTERN.test(article.slug)) {
    throw new Error(`[focus-cluster] Invalid slug: ${article.slug}`)
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

  const sourcePath = resolveSourceFile(source.fileName)
  if (!existsSync(sourcePath)) return null

  const raw = readFileSync(sourcePath, 'utf8')
  const sourceFile = path.relative(process.cwd(), sourcePath).replace(/\\/g, '/')
  const article = raw.trimStart().startsWith('---')
    ? parseYamlSource(raw, source, sourceFile)
    : parseHeadingStyleSource(raw, source, sourceFile)

  validateArticle(article)
  return article
}

export function getAllFocusClusterArticles(): FocusClusterArticle[] {
  return focusClusterArticleSources
    .map((source) => getFocusClusterArticle(source.slug))
    .filter((article): article is FocusClusterArticle => Boolean(article))
}
