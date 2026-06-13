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
