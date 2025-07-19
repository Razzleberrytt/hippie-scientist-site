import type { Herb } from '../types'
import raw from '../../Full200.json?raw'
import { canonicalTag } from '../utils/tagUtils'

const cleaned = raw.replace(/NaN/g, 'null')
const herbs = JSON.parse(cleaned) as Herb[]
herbs.forEach(h => {
  if (Array.isArray(h.tags)) {
    const map = new Map<string, string>()
    h.tags.forEach(t => map.set(canonicalTag(t), t))
    h.tags = Array.from(map.values())
  }
  if (h.affiliateLink == null) h.affiliateLink = ''
})

export default herbs
export { herbs }
