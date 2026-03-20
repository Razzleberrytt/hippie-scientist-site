import starterPackTemplate from '../../content/starter-packs/template.md?raw'

type StarterPackHerbInput =
  | string
  | {
      name: string
      purpose?: string
      effect?: string
    }

type StarterPackInput = {
  goal: string
  blendName: string
  herbs: StarterPackHerbInput[]
}

export type GeneratedGuideRecord = {
  id: string
  goal: string
  blendName: string
  herbs: string[]
  filename: string
  generatedAt: string
  content: string
}

type SaveGeneratedGuideInput = Omit<GeneratedGuideRecord, 'id' | 'generatedAt'> & {
  id?: string
  generatedAt?: string
}

const GENERATED_GUIDES_STORAGE_KEY = 'hs_generated_guides'

const fallbackEffect = 'Supports your blend goal when used consistently in a simple routine.'

const normaliseHerb = (herb: StarterPackHerbInput) => {
  if (typeof herb === 'string') {
    return {
      name: herb,
      purpose: `Supports ${herb} as part of this blend.`,
      effect: fallbackEffect,
    }
  }

  return {
    name: herb.name,
    purpose: herb.purpose ?? `Supports ${herb.name} as part of this blend.`,
    effect: herb.effect ?? fallbackEffect,
  }
}

export const generateStarterPack = ({ goal, blendName, herbs }: StarterPackInput): string => {
  const normalisedHerbs = herbs.map(normaliseHerb)
  const herbSection = normalisedHerbs
    .map(
      herb => `### ${herb.name}

**Purpose:** ${herb.purpose}

**Simple effect:** ${herb.effect}`
    )
    .join('\n\n')

  return starterPackTemplate
    .replaceAll('{{goal}}', goal)
    .replaceAll('{{blendName}}', blendName)
    .replace(/{{#each herbs}}[\s\S]*?{{\/each}}/, herbSection)
    .replace('{{herbs}}', herbSection)
    .replace('{{timingSuggestion}}', 'Late afternoon or evening for a calming routine')
    .replace('{{frequencySuggestion}}', 'Once daily, then adjust gently based on response')
    .replace('{{stackingIdea}}', 'a short breathing or journaling practice')
    .replace('{{tasteImprovement}}', 'ginger or lemon peel')
    .replace('{{routineSuggestion}}', 'the same part of your day (like after dinner)')
}

const normaliseGuideKey = (blendName: string, herbs: string[]) =>
  `${blendName.trim().toLowerCase()}::${[...herbs]
    .map(herb => herb.trim().toLowerCase())
    .sort((a, b) => a.localeCompare(b))
    .join('|')}`

const getGuideFilename = (blendName: string): string => {
  const safeBlendName = blendName.replace(/[\\/:*?"<>|]/g, '-').trim()
  return `${safeBlendName || 'starter-pack'}-starter-pack.md`
}

const parseStoredGuides = (): GeneratedGuideRecord[] => {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(GENERATED_GUIDES_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      entry =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.goal === 'string' &&
        typeof entry.blendName === 'string' &&
        Array.isArray(entry.herbs) &&
        typeof entry.filename === 'string' &&
        typeof entry.generatedAt === 'string' &&
        typeof entry.content === 'string'
    ) as GeneratedGuideRecord[]
  } catch {
    return []
  }
}

const writeStoredGuides = (records: GeneratedGuideRecord[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GENERATED_GUIDES_STORAGE_KEY, JSON.stringify(records))
}

export const getGeneratedGuides = (): GeneratedGuideRecord[] => parseStoredGuides()

export const saveGeneratedGuide = (guide: SaveGeneratedGuideInput): GeneratedGuideRecord => {
  const savedGuide: GeneratedGuideRecord = {
    ...guide,
    id: guide.id ?? `guide-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    generatedAt: guide.generatedAt ?? new Date().toISOString(),
  }

  const current = parseStoredGuides()
  const targetKey = normaliseGuideKey(savedGuide.blendName, savedGuide.herbs)
  const deduped = current.filter(
    entry => normaliseGuideKey(entry.blendName, entry.herbs) !== targetKey
  )
  writeStoredGuides([savedGuide, ...deduped])
  return savedGuide
}

export const deleteGeneratedGuide = (id: string): GeneratedGuideRecord[] => {
  const next = parseStoredGuides().filter(guide => guide.id !== id)
  writeStoredGuides(next)
  return next
}

export const clearGeneratedGuides = (): void => {
  writeStoredGuides([])
}

export const downloadStarterPackByFilename = (filename: string, content: string): boolean => {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return false

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)
  return true
}

export const downloadStarterPack = (blendName: string, content: string): boolean => {
  return downloadStarterPackByFilename(getGuideFilename(blendName), content)
}

export const getStarterPackFilename = (blendName: string): string => getGuideFilename(blendName)
