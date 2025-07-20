import type { Herb } from '../types'
import raw from '../../Full200.json?raw'
import { canonicalTag } from '../utils/tagUtils'
import { decodeTag } from '../utils/format'

const RAW_PATTERN = /^(?:[\p{Emoji}\p{Extended_Pictographic}]|.*\b(?:tea|snuff|mood|flower)\b)/iu

function normalizeCategories(cat: string): string[] {
  return Array.from(
    new Set(
      cat
        .split(/[\/;,]/)
        .map(p => p.trim())
        .filter(Boolean)
        .filter(p => !/ritual/i.test(p))
        .map(p => {
          const c = p.toLowerCase()
          if (/(empathogen|euphoriant)/.test(c)) return 'Empathogen'
          if (/psychedelic|visionary/.test(c)) return 'Psychedelic'
          if (/dissociative|sedative/.test(c)) return 'Dissociative'
          if (/oneirogen|dream/.test(c)) return 'Oneirogen'
          if (/stimulant/.test(c)) return 'Stimulant'
          return 'Other'
        })
    )
  ).slice(0, 3)
}

const cleaned = raw.replace(/NaN/g, 'null')
const herbs = JSON.parse(cleaned) as Herb[]
herbs.forEach(h => {
  if (Array.isArray(h.tags)) {
    const filtered = h.tags.filter(t => {
      const decoded = decodeTag(t).toLowerCase().trim()
      if (/ritual/i.test(decoded)) return false
      if (RAW_PATTERN.test(decoded)) return false
      return true
    })
    const map = new Map<string, string>()
    filtered.forEach(t => map.set(canonicalTag(t), t))
    h.tags = Array.from(map.values())
  }
  h.normalizedCategories = normalizeCategories(h.category)
  if (h.affiliateLink == null) h.affiliateLink = ''
})

export default herbs
export { herbs }
