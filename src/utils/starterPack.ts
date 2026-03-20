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

export const downloadStarterPack = (blendName: string, content: string): boolean => {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return false

  const safeBlendName = blendName.replace(/[\\/:*?"<>|]/g, '-').trim()
  const filename = `${safeBlendName || 'starter-pack'}-starter-pack.md`

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
