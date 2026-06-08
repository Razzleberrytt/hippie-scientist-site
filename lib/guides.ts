import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import type { GuideData } from './schemas/guide-schemas'

const GUIDES_DIR = join(process.cwd(), 'public', 'data', 'guides')

export function getGuideBySlug(slug: string): GuideData | null {
  const filePath = join(GUIDES_DIR, `${slug}.json`)
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as GuideData
  } catch {
    return null
  }
}

export function getAllGuideSlugs(): string[] {
  if (!existsSync(GUIDES_DIR)) return []
  try {
    return readdirSync(GUIDES_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
  } catch {
    return []
  }
}
