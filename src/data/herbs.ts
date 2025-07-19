import type { Herb } from '../types'
import raw from '../../Full200.json?raw'
import { canonicalTag } from '../utils/tagUtils'
import { decodeTag } from '../utils/format'

const RAW_PATTERN = /^(?:[\p{Emoji}\p{Extended_Pictographic}]|.*\b(?:tea|snuff|mood|flower)\b)/iu

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
  if (h.affiliateLink == null) h.affiliateLink = ''
})

export default herbs
export { herbs }
