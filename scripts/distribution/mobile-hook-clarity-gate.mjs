/**
 * EvidenceMotion mobile hook copy-density negative filter.
 * Hash-verified rendered SVG is mandatory. Source/disclosure obligations
 * remain in later audited beats; this does not edit governed facts.
 */
const plain=v=>String(v??'').replace(/<[^>]+>/g,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()
const cta=/\b(?:follow(?:\s+for)?|subscribe|tap\s+(?:the|to)|share\s+this|like\s+and)\b/i
const source=/^(?:source\s*[:：]|references\s*[:：]|pmid\s*[:：])/i
const chrome=[/^\d{1,2}\s*\/\s*\d{1,2}$/, /^the side they skip$/i, /^evidencemotion\s*[·|]\s*harm reduction$/i]
export function assertMobileOpeningHookSvg(svg){
 if(typeof svg!=='string'||!/<svg\b/i.test(svg))throw Error('MOBILE_OPENING_HOLD:SCENE_SVG_REQUIRED')
 const texts=[...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi)]
   .filter(m=>!/\b(?:opacity\s*=\s*['"]0['"]|display\s*=\s*['"]none['"])/i.test(m[1]))
   .map(m=>plain(m[2])).filter(Boolean)
 const words=texts.join(' ').split(/\s+/).filter(Boolean)
 const reasons=[]
 if(texts.length>4)reasons.push('TEXT_BLOCKS_EXCEED_4')
 if(words.length>17)reasons.push('VISIBLE_WORDS_EXCEED_17')
 if(texts.some(t=>cta.test(t)))reasons.push('EARLY_CTA')
 if(texts.some(t=>source.test(t)))reasons.push('SOURCE_MUST_BE_IN_SEPARATE_AUDITED_SOURCE_BEAT')
 if(texts.some(t=>chrome.some(p=>p.test(t))))reasons.push('DECORATIVE_CHROME_IN_OPENING')
 if(/data-hero-kind\s*=\s*['"]capsule['"]/i.test(svg)&&!/data-hero-template\s*=\s*['"]clean-capsule-v1['"]/i.test(svg))
   reasons.push('CAPSULE_REQUIRES_APPROVED_SHAPE_TEMPLATE')
 if(reasons.length)throw Error('MOBILE_OPENING_HOLD:'+reasons.join(';'))
 return {status:'DECLARED_COPY_NEGATIVE_FILTER_PASS_NOT_PIXEL_APPROVAL',texts:texts.length,words:words.length}
}
