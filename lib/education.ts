import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface EducationArticle {
  slug: string
  title: string
  description: string
  lastUpdated: string
  evidenceFocus: string
  relatedComponents: string[]
  readingTime: string
  content: string
}

export type MdxBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'p'; text: string }
  | {
      type: 'TrialDesignInsight'
      props: {
        designType: string
        sampleSize?: number
        duration?: string
        blinding?: string
        control?: string
        title?: string
      }
      content: string
    }
  | {
      type: 'EvidenceGradeRationale'
      props: {
        grade: string
        designMatch: string
        riskOfBias: string
        consistency: string
      }
      content: string
    }

const educationDir = path.join(process.cwd(), 'content/education')

export function getEducationArticleBySlug(slug: string): EducationArticle | null {
  const filePath = path.join(educationDir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      lastUpdated: String(data.lastUpdated ?? ''),
      evidenceFocus: data.evidenceFocus ?? '',
      relatedComponents: Array.isArray(data.relatedComponents) ? data.relatedComponents : [],
      readingTime: data.readingTime ?? '',
      content,
    }
  } catch (error) {
    console.error(`Error loading education article ${slug}:`, error)
    return null
  }
}

export function getAllEducationArticles(): EducationArticle[] {
  if (!fs.existsSync(educationDir)) return []

  try {
    const files = fs.readdirSync(educationDir)
    return files
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => getEducationArticleBySlug(f.replace('.mdx', '')))
      .filter((a): a is EducationArticle => a !== null)
  } catch (error) {
    console.error('Error reading education directory:', error)
    return []
  }
}

function parseAttributes(attrString: string): Record<string, any> {
  const attrs: Record<string, any> = {}
  const regex = /(\w+)=(?:"([^"]*)"|{([^}]*)})/g
  let match

  while ((match = regex.exec(attrString)) !== null) {
    const key = match[1]
    const valStr = match[2] !== undefined ? match[2] : match[3]
    
    if (valStr && /^\d+$/.test(valStr)) {
      attrs[key] = parseInt(valStr, 10)
    } else if (valStr === 'true') {
      attrs[key] = true
    } else if (valStr === 'false') {
      attrs[key] = false
    } else {
      attrs[key] = valStr
    }
  }
  return attrs
}

export function parseMdxBlocks(raw: string): MdxBlock[] {
  const blocks: MdxBlock[] = []
  const lines = raw.split(/\r?\n/)
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i++
      continue
    }

    // TrialDesignInsight parsing
    if (line.startsWith('<TrialDesignInsight')) {
      let tagStr = line
      let j = i + 1
      while (j < lines.length && !tagStr.includes('>')) {
        tagStr += ' ' + lines[j].trim()
        j++
      }

      const props = parseAttributes(tagStr)
      const contentLines: string[] = []

      while (j < lines.length) {
        const currentLine = lines[j]
        if (currentLine.trim().includes('</TrialDesignInsight>')) {
          const closeIdx = currentLine.indexOf('</TrialDesignInsight>')
          if (closeIdx > 0) {
            contentLines.push(currentLine.slice(0, closeIdx).trim())
          }
          j++
          break
        }
        contentLines.push(currentLine)
        j++
      }

      blocks.push({
        type: 'TrialDesignInsight',
        props: {
          designType: props.designType || 'RCT',
          sampleSize: props.sampleSize,
          duration: props.duration,
          blinding: props.blinding,
          control: props.control,
          title: props.title,
        },
        content: contentLines.join('\n').trim(),
      })

      i = j
      continue
    }

    // EvidenceGradeRationale parsing
    if (line.startsWith('<EvidenceGradeRationale')) {
      let tagStr = line
      let j = i + 1
      while (j < lines.length && !tagStr.includes('>')) {
        tagStr += ' ' + lines[j].trim()
        j++
      }

      const props = parseAttributes(tagStr)
      const contentLines: string[] = []

      while (j < lines.length) {
        const currentLine = lines[j]
        if (currentLine.trim().includes('</EvidenceGradeRationale>')) {
          const closeIdx = currentLine.indexOf('</EvidenceGradeRationale>')
          if (closeIdx > 0) {
            contentLines.push(currentLine.slice(0, closeIdx).trim())
          }
          j++
          break
        }
        contentLines.push(currentLine)
        j++
      }

      blocks.push({
        type: 'EvidenceGradeRationale',
        props: {
          grade: props.grade || 'C',
          designMatch: props.designMatch || '',
          riskOfBias: props.riskOfBias || 'High',
          consistency: props.consistency || 'Inconsistent',
        },
        content: contentLines.join('\n').trim(),
      })

      i = j
      continue
    }

    // Standard markdown tags
    if (line === '---') {
      blocks.push({ type: 'hr' })
      i++
      continue
    }
    if (line.startsWith('# ')) {
      // H1 is usually handled outside the block renderer (as title)
      i++
      continue
    }
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: line.slice(5) })
      i++
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) })
      i++
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) })
      i++
      continue
    }
    if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', text: line.slice(2) })
      i++
      continue
    }

    // Tables
    if (line.startsWith('|') && lines[i + 1]?.trim().match(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/)) {
      const splitRow = (value: string) =>
        value
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((cell) => cell.trim())
      const headers = splitRow(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i].trim()))
        i++
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    // Lists
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // Group consecutive normal text paragraphs
    const paragraph = [line]
    i++
    while (i < lines.length) {
      const next = lines[i].trim()
      if (
        !next ||
        next.startsWith('#') ||
        next === '---' ||
        /^[-*]\s+/.test(next) ||
        /^\d+\.\s+/.test(next) ||
        next.startsWith('|') ||
        next.startsWith('<TrialDesignInsight') ||
        next.startsWith('<EvidenceGradeRationale')
      )
        break
      paragraph.push(next)
      i++
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') })
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Search-index education registry
//
// Separate from the article renderer above: this powers global search by
// pairing every `app/education/*` route with optional `content/education/*`
// frontmatter so the whole education surface is searchable. Consumed at build
// time by `scripts/data/build-search-index.mjs`.
// ---------------------------------------------------------------------------

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
  /** Plain-text body excerpt (markup stripped, present only when a file exists). */
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

function readMarkdownDoc(slug: string): (Partial<EducationDoc> & { excerpt: string }) | null {
  const filePath = ['.md', '.mdx']
    .map((ext) => path.join(educationDir, `${slug}${ext}`))
    .find((candidate) => fs.existsSync(candidate))
  if (!filePath) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'))
  return {
    title: typeof data.title === 'string' ? data.title : undefined,
    summary:
      typeof data.summary === 'string'
        ? data.summary
        : typeof data.description === 'string'
          ? data.description
          : undefined,
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
  if (fs.existsSync(educationDir)) {
    for (const file of fs.readdirSync(educationDir)) {
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
