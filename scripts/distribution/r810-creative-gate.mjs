import crypto from 'node:crypto'
import { buildR809CreativeReceipt } from './r809-creative-gate.mjs'

const clean = (v) => String(v ?? '').trim().replace(/\s+/g, ' ')
const hash = (v) => crypto.createHash('sha256').update(v).digest('hex')
const hex = /^[a-f0-9]{64}$/i
export const R810_ROLES = Object.freeze(['hook','what-it-is','lab-evidence','human-evidence','safety','unknowns','follow'])
const physicalRoles = {
  hook:['hook'],'what-it-is':['finding'],'lab-evidence':['evidence'],
  'human-evidence':['finding'],safety:['limitation','context'],unknowns:['limitation'],follow:['cta'],
}
const budgets = {hook:[2,5],'what-it-is':[3,9],'lab-evidence':[3,12],'human-evidence':[3,14],safety:[4,14],unknowns:[3,12],follow:[2,7]}
const guardedTerms = ['not','no','never','without','avoid','cannot','do not','contraindicated','may','might','possibly','possible','rare','limited','uncertain','unknown','preliminary','animal','in vitro','not established','human evidence']
const tokens = (value) => ' ' + clean(value).toLowerCase().replace(/[^a-z0-9]+/g,' ') + ' '
const includesTerm = (value,term) => tokens(value).includes(' '+tokens(term).trim()+' ')
export function r810TextSafetyErrors(narration, screenText, additional = []) {
  return [...new Set([...guardedTerms,...additional.map(x=>clean(x).toLowerCase()).filter(Boolean)])]
    .filter(term=>includesTerm(narration,term) && !includesTerm(screenText,term))
    .map(term=>'on-screen text omitted governing qualifier/negation: '+term)
}
const validDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v

export function validateR810CreativeBrief(brief,{now=new Date()}={}) {
  const errors=[]
  try { buildR809CreativeReceipt(brief) } catch(e) {errors.push('R8.09 inherited brief invalid: '+e.message)}
  const layer=brief?.r810
  if (!layer || typeof layer!=='object') return [...errors,'R8.10 semantic plan is required']
  const slots=Array.isArray(layer.slots)?layer.slots:[]
  if(slots.length!==7) errors.push('R8.10 requires exactly seven ordered narrative slots')
  const beats=Array.isArray(brief?.beats)?brief.beats:[]
  const used=new Set()
  for(let i=0;i<slots.length;i++){
    const slot=slots[i],role=R810_ROLES[i],beatId=clean(slot?.beatId)
    if(slot?.role!==role) errors.push('R8.10 narrative slot '+(i+1)+' must use '+role)
    const beat=beats.find(b=>clean(b?.id)===beatId)
    if(!beat||used.has(beatId)){errors.push('R8.10 missing or duplicate physical beat: '+beatId);continue}
    used.add(beatId)
    if(!physicalRoles[role]?.includes(clean(beat.role))) errors.push('R8.10 illegal legacy role mapping for '+role)
    if(!clean(beat.narration)||!clean(beat.onScreenText)) errors.push('R8.10 requires spoken and visible content for '+role)
    if(clean(slot.narration)!==clean(beat.narration)||clean(slot.screenText)!==clean(beat.onScreenText)) errors.push('R8.10 text stale against governed '+role+' beat')
    if(!Array.isArray(slot.claimIds)||!slot.claimIds.length||slot.claimIds.some(x=>!clean(x))) errors.push('R8.10 '+role+' requires governed claim IDs')
    if(!Array.isArray(slot.sourceIds)||!slot.sourceIds.length||slot.sourceIds.some(x=>!clean(x))) errors.push('R8.10 '+role+' requires exact source IDs')
    if(['lab-evidence','human-evidence'].includes(role)&&slot.evidenceTier!==(role==='lab-evidence'?'preclinical-or-mechanism':'human')) errors.push('R8.10 evidence tier invalid for '+role)
    if(['safety','unknowns','lab-evidence','human-evidence'].includes(role)) errors.push(...r810TextSafetyErrors(beat.narration,beat.onScreenText,slot.requiredQualifiers||[]).map(e=>role+': '+e))
    if(slot.approval!=='editorial-reviewed') errors.push('R8.10 '+role+' requires editorial-reviewed mapping')
    const review=slot.reviewReceipt
    const approvedClaims=Array.isArray(slot.claimIds)?slot.claimIds.map(clean):[]
    if(review?.decision!=='approved'||review?.reviewerRole!=='editorial-science-reviewer'
      ||!clean(review?.reviewerId)||!validDate(review?.reviewedAt)
      ||review?.approvedNarrationSha256!==hash(clean(beat.narration))
      ||review?.approvedOverlaySha256!==hash(clean(beat.onScreenText))
      ||JSON.stringify(review?.governedClaimIds)!==JSON.stringify(approvedClaims)){
      errors.push('R8.10 '+role+' missing named hash-bound independent editorial review receipt')
    }
    const budget=budgets[role]
    if(slot.durationSeconds!=null && (!Number.isFinite(slot.durationSeconds)||slot.durationSeconds<budget[0]||slot.durationSeconds>budget[1]))errors.push('R8.10 '+role+' duration outside readable natural-speech budget')
  }
  const source=beats.filter(b=>b?.role==='source')
  if(source.length!==1||clean(source[0]?.narration))errors.push('R8.10 requires one silent source-ledger scene')
  if(source[0]&&used.has(clean(source[0].id)))errors.push('R8.10 ledger must not be a narrated slot')
  if(source[0]&&clean(source[0].onScreenText)!==clean(brief.sourceIdentity?.sourceUrl))errors.push('R8.10 source card URL must remain canonical')
  const ledger=layer.sourceLedger
  const lines=Array.isArray(ledger?.lines)?ledger.lines:[]
  const renderedText=lines.join('\n')
  if(!lines.length||lines.length>5||lines.some(x=>!clean(x)||clean(x).length>62))errors.push('R8.10 ledger needs 1–5 short legible citation lines')
  if(ledger?.approvedText!==renderedText||!hex.test(clean(ledger?.approvedTextSha256))||hash(renderedText)!==ledger.approvedTextSha256)errors.push('R8.10 source ledger text/hash differs from approved notes')
  if(ledger?.reviewStatus!=='approved'||!clean(ledger?.approvedBy)||!validDate(ledger?.reviewedAt))errors.push('R8.10 source ledger needs dated editorial approval')
  if(ledger?.minimumVisibleSeconds!=null&&Number(ledger.minimumVisibleSeconds)<3)errors.push('R8.10 source ledger dwell under three seconds')
  const attestations=Array.isArray(layer.claimAttestations)?layer.claimAttestations:[]
  const nowMs=Number(new Date(now))
  if(!Number.isFinite(nowMs))errors.push('R8.10 invalid review time')
  const allClaims=new Set(slots.flatMap(s=>Array.isArray(s.claimIds)?s.claimIds.map(clean):[]))
  for(const a of attestations){
    if(!allClaims.has(clean(a?.claimId)))errors.push('R8.10 ungoverned claim attestation')
    if(!validDate(a?.claimVerifiedAt)||!hex.test(clean(a?.verifiedSourceSha256))||!clean(a?.verifiedSourceId)||!clean(a?.reviewerId)){errors.push('R8.10 temporal attestation missing pinned source/reviewer/date');continue}
    if(!Number.isInteger(a.maxAgeDays)||a.maxAgeDays<1||a.maxAgeDays>365)errors.push('R8.10 invalid maxAgeDays')
    const age=(nowMs-Date.parse(a.claimVerifiedAt+'T23:59:59Z'))/86400000
    if(age>a.maxAgeDays||age< -1)errors.push('R8.10 claim date stale or future dated: '+a.claimId)
    if(!slots.some(s=>s.claimIds?.includes(a.claimId)&&clean(s.screenText).includes(a.claimVerifiedAt)))errors.push('R8.10 as-of date not visible in governed screen text: '+a.claimId)
  }
  for(const s of slots)if(s?.timeSensitive===true&&!attestations.some(a=>s.claimIds?.includes(a.claimId)))errors.push('R8.10 time-sensitive claim missing attestation')
  if(layer.publicationApproval!=='exact-master-required')errors.push('R8.10 exact encoded-master review required')
  if(layer.estimatedWordTimingAllowed===true)errors.push('R8.10 cannot claim estimated phrase timing is word-level proof')
  return [...new Set(errors)]
}
export function assertR810TimedScenes(brief, scenes) {
  const all=Array.isArray(scenes)?scenes:[]
  for(const slot of brief.r810.slots){
    const role=slot.role, scene=all.find(s=>s.beatId===slot.beatId)
    if(!scene)throw Error('R8.10 missing exact voiced scene for '+role)
    const seconds=Number(scene.speechEnd)-Number(scene.start)
    const bounds=budgets[role]
    if(!bounds||!Number.isFinite(seconds)||seconds<bounds[0]||seconds>bounds[1]){
      throw Error('R8.10 natural spoken duration outside '+role+' readability budget')
    }
  }
  const ledger=all.filter(s=>s.role==='source')
  if(ledger.length!==1||clean(ledger[0].voiceover)||Number(ledger[0].end)-Number(ledger[0].start)<3){
    throw Error('R8.10 silent source ledger must remain readable for at least three seconds')
  }
  return true
}

export function assertR810CreativeBrief(brief,options){
  const errors=validateR810CreativeBrief(brief,options)
  if(errors.length)throw Error('R8.10 preflight failed:\n- '+errors.join('\n- '))
  return brief
}
export function buildR810CreativeReceipt(brief,options){
  assertR810CreativeBrief(brief,options)
  const inherited=buildR809CreativeReceipt(brief)
  return {
    schemaVersion:'ths-r810-creative-receipt-v1',
    release:'R8.10',runtimeBaseRelease:'R8.05',status:'approved',
    inheritedR809OverlaySha256:inherited.overlaySha256,
    governedPlanSha256:hash(JSON.stringify(brief.r810)),
    sourceLedgerTextSha256:brief.r810.sourceLedger.approvedTextSha256,
    sourceLedgerLines:brief.r810.sourceLedger.lines,
    claimAttestations:brief.r810.claimAttestations,
    noPaidGenerationCredits:true,
    wordAlignmentPolicy:'independent-local-proof-required-before-publishing',
  }
}
