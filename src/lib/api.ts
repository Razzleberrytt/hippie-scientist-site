import fs from 'fs'
import path from 'path'

export interface CompoundData {
  name: string
  slug: string
  description?: string
  mechanism?: string
  safety?: string
  evidence?: string
  effects?: string[]
  [key: string]: any
}

export function getCompoundData(slug: string): CompoundData | null {
  try {
    const dataPath = path.join(process.cwd(), 'public/data/workbook-compounds.json')
    if (!fs.existsSync(dataPath)) {
      return null
    }
    const fileContent = fs.readFileSync(dataPath, 'utf8')
    const compounds = JSON.parse(fileContent)
    
    // Find the compound with the matching slug
    const compound = compounds.find(
      (c: any) => c.slug === slug || c.name.toLowerCase().replace(/ /g, '-') === slug
    )
    return compound || null
  } catch (error) {
    return null
  }
}

export function getAllCompoundSlugs(): string[] {
  try {
    const dataPath = path.join(process.cwd(), 'public/data/workbook-compounds.json')
    if (!fs.existsSync(dataPath)) {
      return []
    }
    const fileContent = fs.readFileSync(dataPath, 'utf8')
    const compounds = JSON.parse(fileContent)
    return compounds
      .map((c: any) => c.slug || c.name.toLowerCase().replace(/ /g, '-'))
      .filter(Boolean)
  } catch (error) {
    return []
  }
}
