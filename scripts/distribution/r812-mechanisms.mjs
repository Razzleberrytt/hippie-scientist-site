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
  if (!clean(m.qualifier) || clean(m.qualifier).length > 110) errors.push('R8.12 readable evidence qualifier missing')
  if (clean(m.inputName).toLowerCase()===clean(m.outputName).toLowerCase() && m.template!=='receptor-binding') errors.push('R8.12 transformation lacks a distinct product')
  return errors
}
export function assertR812Mechanism(mechanism) {
  const errors = r812MechanismErrors(mechanism)
  if (errors.length) throw Error(errors.join('; '))
  return mechanism
}
export function assertR812Storyboard(beats, {requireHooks = false, hookApproaches = []} = {}) {
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
    if (['evidence','lab-evidence','human-evidence'].includes(beat.role) && duration>6.001) throw Error('R8.12 evidence beat longer than six seconds: split the nine-second beat')
  }
  if (requireHooks && (hookApproaches.length!==3 || new Set(hookApproaches).size!==3 || hookApproaches.some(x=>!['question','contrast','reveal'].includes(x)))) {
    throw Error('R8.12 requires three distinct rendered hook approaches: question, contrast, reveal')
  }
  return true
}
export function renderR812MechanismSvg(m, {x=120,y=820,width=840,phase='post',foreground='#def5ed'}={}) {
  assertR812Mechanism(m)
  if (!['pre','post'].includes(phase)) throw Error('R8.12 unknown animation phase')
  const left=x+115, mid=x+width/2, right=x+width-115
  const fill='#69b7a2', base='#182e31', active=phase==='post'
  const label=(xx,yy,value,size=28)=>`<text text-anchor="middle" x="${xx}" y="${yy}" font-size="${size}" font-family="sans-serif" fill="${foreground}">${esc(value)}</text>`
  const molecule=(xx,yy,filled)=>`<g data-r812-object="${filled?'after':'before'}"><circle cx="${xx}" cy="${yy}" r="60" stroke="${foreground}" stroke-width="5" fill="${filled?fill:base}"/><circle cx="${xx-20}" cy="${yy-12}" r="17" fill="${filled?base:fill}"/><circle cx="${xx+20}" cy="${yy+10}" r="13" fill="${filled?base:fill}"/></g>`
  const catalyst=`<rect x="${mid-76}" y="${y-76}" width="152" height="152" rx="32" fill="${base}" stroke="${fill}" stroke-width="5"/>`
  let drawing=''
  if(m.template==='enzyme-conversion'){
    drawing=molecule(left,y,false)+catalyst+(active?molecule(right,y,true):`<circle cx="${right}" cy="${y}" r="60" stroke="${foreground}" stroke-opacity=".2" stroke-dasharray="12 8" fill="none"/>`)
  }else if(m.template==='receptor-binding'){
    const receptor=`<path d="M ${mid-55} ${y+65} L ${mid-55} ${y-40} Q ${mid} ${y-100} ${mid+55} ${y-40} L ${mid+55} ${y+65}" stroke="${fill}" stroke-width="14" fill="none"/>`
    drawing=molecule(active?mid:left,active?y-55:y,false)+receptor+`<circle cx="${right}" cy="${y}" r="60" fill="none" stroke="${foreground}" stroke-opacity=".3"/>`
  }else{
    drawing=molecule(left,y,false)+(active?molecule(right,y,true):`<circle cx="${right}" cy="${y}" r="60" fill="none" stroke="${foreground}" stroke-dasharray="12 8" stroke-opacity=".3"/>`)
  }
  const arrow=`<path d="M ${left+82} ${y} L ${mid-91} ${y} M ${mid+91} ${y} L ${right-82} ${y}" stroke="${fill}" stroke-width="7" fill="none"/>`
  const word=`<text x="${mid}" y="${y+130}" text-anchor="middle" font-size="29" fill="${foreground}">${esc(m.actionVerb)}</text>`
  return `<g data-r812-mechanism="${m.template}" data-r812-phase="${phase}">${drawing}${arrow}${label(left,y+110,m.inputName)}${label(mid,y-115,m.targetName)}${label(right,y+110,m.outputName)}${word}${label(x+width/2,y+190,m.qualifier,24)}${label(x+width/2,y+240,m.onScreenSources,24)}</g>`
}
