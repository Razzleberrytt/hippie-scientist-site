// R8.12 governed "show, don't tell" mechanism templates.
// No chemical bond diagrams or claims are inferred: every object and source is explicit.
const clean = value => String(value ?? '').trim().replace(/\s+/g, ' ')
const esc = value => clean(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[x]))
export const MECHANISM_TEMPLATES = Object.freeze(['molecule-transform','enzyme-conversion','receptor-binding'])
const verbs = /\b(convert(?:s|ed|ing)?|transform(?:s|ed|ing)?|bind(?:s|ing)?|inhibit(?:s|ed|ing)?|block(?:s|ed|ing)?|activat(?:e|es|ed|ing)|metaboli[sz](?:e|es|ed|ing))\b/i
function sourceIds(m) { return Array.isArray(m?.sourceIds) ? m.sourceIds : [] }
export function r812MechanismErrors(mechanism) {
  const m = mechanism ?? {}, errors = []
  if (!MECHANISM_TEMPLATES.includes(m.template)) errors.push('R8.12 requires a named mechanism animation template')
  for (const field of ['inputName','targetName','outputName','actionVerb']) {
    const value = clean(m[field])
    if (!value || value.length > 48 || /[<>]/.test(value)) errors.push('R8.12 name this object: '+field)
  }
  if (!verbs.test(clean(m.actionVerb))) errors.push('R8.12 verb-check: graphic must perform an evidence-appropriate mechanism verb')
  if (m.template === 'enzyme-conversion' && !/enzyme|cyp|liver|oxidase|protein/i.test(clean(m.targetName))) errors.push('R8.12 enzyme-conversion requires a named enzyme or catalyst')
  if (m.template === 'receptor-binding' && !/receptor|channel|binding site/i.test(clean(m.targetName))) errors.push('R8.12 receptor-binding must name the receptor or binding site')
  if (!['preclinical-or-mechanism','human'].includes(m.evidenceTier)) errors.push('R8.12 evidence tier missing')
  if (m.evidenceTier === 'preclinical-or-mechanism' && !/lab|in vitro|preclinical|human liver preparation|mechanis/i.test(clean(m.qualifier))) errors.push('R8.12 lab-vs-human qualifier missing')
  if (!sourceIds(m).length || sourceIds(m).some(x => !clean(x))) errors.push('R8.12 original source IDs missing')
  if (!Array.isArray(m.claimIds) || !m.claimIds.length || m.claimIds.some(x=>!clean(x))) errors.push('R8.12 governed claim IDs missing')
  if (!/^PMID:\s*\d{7,9}(?:\s*[,;/+]\s*\d{7,9})*$/i.test(clean(m.onScreenSources))) errors.push('R8.12 requires real visible on-screen PMID identifiers')
  if (!clean(m.qualifier) || clean(m.qualifier).length > 90) errors.push('R8.12 readable evidence qualifier must fit in three 42px lines')
  if (clean(m.onScreenSources).length > 58) errors.push('R8.12 visible PMIDs exceed two 42px lines')
  if (clean(m.inputName).toLowerCase()===clean(m.outputName).toLowerCase() && m.template!=='receptor-binding') errors.push('R8.12 transformation lacks a distinct product')
  return errors
}
export function assertR812Mechanism(mechanism) {
  const errors = r812MechanismErrors(mechanism)
  if (errors.length) throw Error(errors.join('; '))
  return mechanism
}
export function assertR812Storyboard(beats, {requireHooks = false, hookApproaches = [], ctaUrl = null} = {}) {
  if (typeof ctaUrl !== 'string' || !/^https:\/\/thehippiescientist\.net\/articles\/[a-z0-9-]+\/?$/.test(ctaUrl)) throw Error('R8.12 CTA must name the exact HTTPS article URL on screen')
  if (!Array.isArray(beats) || !beats.length) throw Error('R8.12 requires named narrative beats')
  const realActions = beats.filter(b => b.mechanism || b?.r812?.mechanism || b.r812Mechanism)
  if (!realActions.length) throw Error('R8.12 show, don\'t tell requires a mechanism instead of decorative movement')
  for (const beat of beats) {
    const duration = Number(beat.durationSeconds ?? (Number(beat.end)-Number(beat.start)))
    if (!Number.isFinite(duration) || duration<=0) throw Error('R8.12 invalid scene duration')
    const m = beat.mechanism ?? beat?.r812?.mechanism ?? beat.r812Mechanism
    if (m) {
      assertR812Mechanism(m)
      // Visible object labels and both qualifiers are part of the template itself.
      if (!verbs.test(clean(m.actionVerb))) throw Error('R8.12 visual action cannot be a vague hold')
    }
    if (beat.role==='cta' && duration>5.001) throw Error('R8.12 CTA must be at most 5 seconds; no frozen nine-second signoff')
    if (['evidence','lab-evidence','human-evidence'].includes(beat.r812Role || beat.role) && duration>6.001) throw Error('R8.12 evidence beat longer than six seconds: split the nine-second beat')
  }
  if (requireHooks && (hookApproaches.length!==3 || new Set(hookApproaches).size!==3 || hookApproaches.some(x=>!['question','contrast','reveal'].includes(x)))) {
    throw Error('R8.12 requires three distinct rendered hook approaches: question, contrast, reveal')
  }
  return true
}
// The same minimum 42px used for R8.10 governed overlays applies to EVERY
// necessary mechanism label; do not shrink evidence PMIDs to win space.
export const R812_MIN_LABEL_PX = 42
function wrapLabel(input, limit, maxLines) {
  const chars = clean(input)
  const tokens = chars.replace(/-/g,'- ').split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (let token of tokens) {
    while (token.length > limit) {
      if (current) { lines.push(current); current='' }
      lines.push(token.slice(0,limit))
      token = token.slice(limit)
    }
    if (!token) continue
    const joined=current ? current+' '+token : token
    if (joined.length > limit && current) { lines.push(current); current=token }
    else current=joined
  }
  if(current)lines.push(current)
  if(lines.length>maxLines)throw Error('R8.12 visible evidence label cannot fit safe area at 42px; revise approved text, do not shrink')
  return lines
}
export function renderR812MechanismSvg(m, {x=120,y=820,width=840,phase='post',foreground='#def5ed'}={}) {
  assertR812Mechanism(m)
  if(!['pre','post'].includes(phase))throw Error('R8.12 unknown animation phase')
  const left=x+105,mid=x+width/2,right=x+width-105
  const fill='#69b7a2',base='#182e31',active=phase==='post'
  const label=(xx,yy,value,size=R812_MIN_LABEL_PX)=>`<text text-anchor="middle" x="${xx}" y="${yy}" font-size="${size}" font-family="sans-serif" fill="${foreground}">${esc(value)}</text>`
  const objectName=(xx,caption)=>{
    const lines=wrapLabel(caption,13,3)
    return `<g data-r812-full-object-name="${esc(caption)}">`+lines.map((line,i)=>label(xx,y+92+i*48,line)).join('')+'</g>'
  }
  const molecule=(xx,yy,filled)=>`<g data-r812-object="${filled?'after':'before'}"><circle cx="${xx}" cy="${yy}" r="53" stroke="${foreground}" stroke-width="5" fill="${filled?fill:base}"/><circle cx="${xx-16}" cy="${yy-12}" r="14" fill="${filled?base:fill}"/><circle cx="${xx+18}" cy="${yy+10}" r="12" fill="${filled?base:fill}"/></g>`
  const catalyst=`<rect x="${mid-60}" y="${y-60}" width="120" height="120" rx="30" fill="${base}" stroke="${fill}" stroke-width="5"/>`
  let drawing=''
  if(m.template==='enzyme-conversion'){
    drawing=molecule(left,y,false)+catalyst+(active?molecule(right,y,true):`<circle cx="${right}" cy="${y}" r="53" stroke="${foreground}" stroke-opacity=".2" stroke-dasharray="12 8" fill="none"/>`)
  }else if(m.template==='receptor-binding'){
    const receptor=`<path d="M ${mid-55} ${y+50} L ${mid-55} ${y-35} Q ${mid} ${y-90} ${mid+55} ${y-35} L ${mid+55} ${y+50}" stroke="${fill}" stroke-width="11" fill="none"/>`
    drawing=molecule(active?mid:left,active?y-45:y,false)+receptor+`<circle cx="${right}" cy="${y}" r="53" fill="none" stroke="${foreground}" stroke-opacity=".3"/>`
  }else{
    drawing=molecule(left,y,false)+(active?molecule(right,y,true):`<circle cx="${right}" cy="${y}" r="53" fill="none" stroke="${foreground}" stroke-dasharray="12 8" stroke-opacity=".3"/>`)
  }
  const arrows=`<path d="M ${left+70} ${y} L ${mid-78} ${y} M ${mid+78} ${y} L ${right-70} ${y}" stroke="${fill}" stroke-width="6" fill="none"/>`
  const qualifierLines=wrapLabel(m.qualifier,33,3)
  const pmidLines=wrapLabel(m.onScreenSources,33,2)
  // Text and its source are in different sections; no object should be
  // understood only through teal/orange color or an unrelated legend.
  const evidence=`<g data-r812-evidence-boundary="named-and-readable" data-r812-full-qualifier="${esc(m.qualifier)}" data-r812-full-pmids="${esc(m.onScreenSources)}">`+
    qualifierLines.map((line,i)=>label(mid,y+286+i*50,line)).join('')+
    pmidLines.map((line,i)=>label(mid,y+455+i*50,line)).join('')+
    '</g>'
  return `<g data-r812-mechanism="${m.template}" data-r812-phase="${phase}" data-r812-min-font-size="42">`+
    drawing+arrows+
    `<g data-r812-object-names="redundant-not-color-only">`+objectName(left,m.inputName)+objectName(mid,m.targetName)+objectName(right,m.outputName)+'</g>'+
    label(mid,y+235,m.actionVerb)+evidence+'</g>'
}
