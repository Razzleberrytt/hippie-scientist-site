import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/**
 * Structured educational content layer.
 *
 * Markdown files in `content/education/*.md` provide searchable metadata and a
 * body excerpt for the education routes that live under `app/education/*`. The
 * canonical route list is derived from the `app/education` directory so every
 * education page is searchable; markdown frontmatter enriches a page when
 * present.
 *
 * This module is server-only (uses `fs`) and is consumed at build time by
 * `scripts/data/build-search-index.mjs` and any server component that needs the
 * education registry.
 */

const educationContentDir = path.join(process.cwd(), 'content/education')
const educationRoutesDir = path.join(process.cwd(), 'app/education')

export interface EducationDoc {
  slug: string
  title: string
  summary: string
  category: string
  goals: string[]
  pathways: string[]
  evidenceGrade: string
  safety: string
  keywords: string[]
  tags: string[]
  relatedHerbs: string[]
  relatedCompounds: string[]
  readingTime: string
  href: string
  /** Plain-text body excerpt (markdown stripped, present only when a file exists). */
  excerpt: string
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .map((word) => (word.length <= 3 ? word : word[0].toUpperCase() + word.slice(1)))
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase())
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

function toExcerpt(markdown: string, max = 320): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

/** Slugs that are interactive tools rather than readable education content. */
const NON_ARTICLE_SLUGS = new Set(['explorer', 'citation-explorer', 'efficacy-model'])

function listEducationRouteSlugs(): string[] {
  if (!fs.existsSync(educationRoutesDir)) return []
  return fs
    .readdirSync(educationRoutesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => !NON_ARTICLE_SLUGS.has(slug))
}

function readMarkdownDoc(slug: string): Partial<EducationDoc> & { excerpt: string } | null {
  const filePath = ['.md', '.mdx']
    .map((ext) => path.join(educationContentDir, `${slug}${ext}`))
    .find((candidate) => fs.existsSync(candidate))
  if (!filePath) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'))
  return {
    title: typeof data.title === 'string' ? data.title : undefined,
    summary: typeof data.summary === 'string' ? data.summary : (typeof data.description === 'string' ? data.description : undefined),
    category: typeof data.category === 'string' ? data.category : undefined,
    goals: asArray(data.goals),
    pathways: asArray(data.pathways),
    evidenceGrade: typeof data.evidenceGrade === 'string' ? data.evidenceGrade : undefined,
    safety: typeof data.safety === 'string' ? data.safety : undefined,
    keywords: asArray(data.keywords),
    tags: asArray(data.tags),
    relatedHerbs: asArray(data.relatedHerbs),
    relatedCompounds: asArray(data.relatedCompounds),
    readingTime: typeof data.readingTime === 'string' ? data.readingTime : undefined,
    excerpt: toExcerpt(content),
  }
}

export function getAllEducationDocs(): EducationDoc[] {
  const slugs = new Set(listEducationRouteSlugs())
  // Include markdown-only slugs that may not have a route yet.
  if (fs.existsSync(educationContentDir)) {
    for (const file of fs.readdirSync(educationContentDir)) {
      if (/\.mdx?$/.test(file) && file.toLowerCase() !== 'readme.md') {
        slugs.add(file.replace(/\.mdx?$/, ''))
      }
    }
  }

  return Array.from(slugs)
    .sort()
    .map((slug) => {
      const md = readMarkdownDoc(slug)
      return {
        slug,
        title: md?.title ?? titleize(slug),
        summary: md?.summary ?? '',
        category: md?.category ?? 'Education',
        goals: md?.goals ?? [],
        pathways: md?.pathways ?? [],
        evidenceGrade: md?.evidenceGrade ?? 'Educational',
        safety: md?.safety ?? 'Educational overview only.',
        keywords: md?.keywords ?? [],
        tags: md?.tags ?? [],
        relatedHerbs: md?.relatedHerbs ?? [],
        relatedCompounds: md?.relatedCompounds ?? [],
        readingTime: md?.readingTime ?? '',
        href: `/education/${slug}`,
        excerpt: md?.excerpt ?? '',
      }
    })
}
