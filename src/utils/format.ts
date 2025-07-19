import { canonicalTag } from './tagUtils'

export function decodeTag(tag: string): string {
  try {
    return JSON.parse(`"${tag}"`)
  } catch {
    return tag
  }
}

export function normalizeTag(tag: string): string {
  const decoded = decodeTag(tag).trim()
  const key = canonicalTag(decoded)
  if (key === 'ayahuasca-additive') return 'Ayahuasca'
  if (key === 'sleep') return 'Dream'
  if (key === 'sedative') return 'Sedation'
  if (/(intense|strong|powerful)/.test(key)) return '🔥 Intensity'
  if (/visionary|psychedelic|hallucinogenic/.test(key)) return 'Visionary'
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export type TagCategory = 'Effect' | 'Preparation' | 'Safety' | 'Region' | 'Chemistry' | 'Other'

export function tagCategory(tag: string): TagCategory {
  const t = normalizeTag(tag).toLowerCase()
  if (/(toxic|caution|restricted|safe)/.test(t)) return 'Safety'
  if (
    /(brew|tea|smoke|smokable|oral|chew|snuff|ferment|tincture|capsule|decoction|seed|root|bark|flower|incense)/.test(
      t
    )
  )
    return 'Preparation'
  if (
    /(stimulant|euphoria|dream|sleep|sedat|vision|dissoci|cognit|anxiolytic|energy|hallucinogen|calming|pain relief)/.test(
      t
    )
  )
    return 'Effect'
  if (/(dmt|lsa|thc|alkaloid|maoi|caffeine|nicotine|muscimol|morphine|tryptamine)/.test(t))
    return 'Chemistry'
  if (
    /(africa|america|europe|asia|amazon|andes|australia|brazil|mexico|peru|india|china|pacific|region|north|south|west|east)/.test(
      t
    )
  )
    return 'Region'
  return 'Other'
}

export function safetyColorClass(rating?: number): string {
  if (rating == null) return ''
  if (rating <= 1) return 'text-green-400'
  if (rating === 2) return 'text-yellow-300'
  return 'text-red-400'
}

export function intensityColorClass(intensity: string): string {
  const value = intensity.toLowerCase()
  if (value.includes('mild')) return 'bg-green-600'
  if (value.includes('moderate')) return 'bg-yellow-600'
  if (value.includes('strong') || value.includes('high') || value.includes('potent'))
    return 'bg-red-600'
  return 'bg-gray-600'
}

export type TagVariant = 'pink' | 'blue' | 'purple' | 'green' | 'yellow' | 'red'

export function tagVariant(tag: string): TagVariant {
  const decoded = normalizeTag(tag)
  if (/toxic|restricted|caution/i.test(decoded)) return 'red'
  if (/safe/i.test(decoded)) return 'green'
  if (/stimulant|euphoria/i.test(decoded)) return 'pink'
  if (/dissoci|sedat/i.test(decoded)) return 'purple'
  if (/dream/i.test(decoded)) return 'blue'
  if (/cognitive/i.test(decoded)) return 'yellow'
  if (/brew|smok/i.test(decoded)) return 'blue'
  if (/oral|ferment/i.test(decoded)) return 'yellow'
  if (/ritual/i.test(decoded)) return 'green'
  return 'purple'
}
