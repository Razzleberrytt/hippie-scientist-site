/**
 * EvidenceMotion mobile hook visual-copy NEGATIVE filter.
 * Count authored semantic copy groups, not mandatory small attribution nodes.
 * Producers must tag trust labels. This does not certify decoded pixels,
 * beautiful composition, or publishing authority.
 */
const plain=v=>String(v??'').replace(/<[^>]+>/g,' ').replace(/&(?:amp);/gi,'&').replace(/\s+/g,' ').trim()
const cta=/\b(?:follow(?:\s+for)?|subscribe|tap\s+(?:the|to)|share\s+this|like\s+and)\b/i
const source=/^(?:source\s*[:：]|references\s*[:：]|pmid\s*[:：])/i
const chrome=[/^\d{1,2}\s*\/\s*\d{1,2}$/, /^the side they skip$/i, /^evidencemotion\s*[·|]\s*harm reduction$/i]
const unxml=s=>s.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
export function assertMobileOpeningHookSvg(svg){
 if(typeof svg!=='string'||!/<svg\b/i.test(svg))throw Error('MOBILE_OPENING_HOLD:SCENE_SVG_REQUIRED')
 const metadata=svg.match(/<metadata>([\s\S]*?)<\/metadata>/i)
 let teachingObject=null
 if(metadata){
   try {teachingObject=JSON.parse(unxml(metadata[1])).teachingObject}
   catch {throw Error('MOBILE_OPENING_HOLD:INVALID_CANONICAL_SCENE_METADATA')}
 }
 const declared=typeof teachingObject==='string'?teachingObject:
   teachingObject&&typeof teachingObject==='object'?
     [teachingObject.kind,teachingObject.name].filter(Boolean).join(' '):''
 const texts=[...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi)]
   .filter(m=>!/\b(?:opacity\s*=\s*['"]0['"]|display\s*=\s*['"]none['"])/i.test(m[1]))
   .map(m=>({role:m[1].match(/data-em-role\s*=\s*['"]([^'"]+)['"]/i)?.[1]??null,
     text:plain(m[2])})).filter(m=>m.text)
 const trustRoles=new Set(['brand','disclosure','provenance'])
 const content=texts.filter(t=>!trustRoles.has(t.role))
 const semanticGroupCount=new Set(content.map((t,i)=>t.role==='headline'?'headline':'individual-'+i)).size
 const words=content.map(t=>t.text).join(' ').split(/\s+/).filter(Boolean)
 const reasons=[]
 if(semanticGroupCount>4)reasons.push('TEXT_BLOCKS_EXCEED_4')
 if(words.length>17)reasons.push('VISIBLE_WORDS_EXCEED_17')
 if(content.some(t=>cta.test(t.text)))reasons.push('EARLY_CTA')
 if(content.some(t=>source.test(t.text)))reasons.push('SOURCE_MUST_BE_IN_SEPARATE_AUDITED_SOURCE_BEAT')
 if(content.some(t=>chrome.some(p=>p.test(t.text))))reasons.push('DECORATIVE_CHROME_IN_OPENING')
 // Source-declared capsule is authoritative, NOT an optional caller-chosen
 // data marker. Without a registered capsule producer, HOLD, don't bluff.
 const capsuleDeclared=/\bcapsule\b/i.test(String(declared))
 const rootCapsule=/\bdata-hero-kind\s*=\s*['"]capsule['"]/i.test(svg)
 const approved=/\bdata-hero-template\s*=\s*['"]clean-capsule-v1['"]/i.test(svg)
 if((capsuleDeclared||rootCapsule)&&!(rootCapsule&&approved))
   reasons.push('CAPSULE_REQUIRES_APPROVED_SHAPE_TEMPLATE')
 // Arbitrary claim of an approved capsule with no declared science hero
 // never upgrades production approval: this is structural negative QA only.
 if(reasons.length)throw Error('MOBILE_OPENING_HOLD:'+reasons.join(';'))
 return {status:'DECLARED_COPY_NEGATIVE_FILTER_PASS_NOT_PIXEL_APPROVAL',
   visibleTextNodes:texts.length,semanticGroups:semanticGroupCount,
   contentWords:words.length,governedTrustLabelsRetained:texts.filter(t=>trustRoles.has(t.role)).length}
}
