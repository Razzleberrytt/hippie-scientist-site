import { assertR817HookPixels } from './r817-rendered-evidence.mjs'
import { assertR817CaptionPixelQA } from './r817-caption-pixel-qa.mjs'
const clean=v=>String(v??'').trim().replace(/\s+/g,' ')
const hash=v=>/^[a-f0-9]{64}$/i.test(String(v??''))
const safeGenericLoops=new Set(['Follow for more science.','Follow for more evidence.'])
export function assertR817RetentionPlan(plan){
 const p=plan??{},errors=[],hook=p.retention?.hook??{},cta=p.retention?.cta??{}
 if(!p.beats?.length||Number(p.beats[0]?.start)!==0)errors.push('R8.17 hook must begin at zero')
 if(!clean(hook.beforeName)||!clean(hook.afterName)||clean(hook.beforeName)===clean(hook.afterName))
  errors.push('R8.17 hook needs distinct before and after objects, not a label')
 if(!/^(transforms-into|activates|converts-to|reveals-hidden-action|binds-to|changes-risk-context)$/.test(clean(hook.action)))
  errors.push('R8.17 hook meaningful action missing')
 if(!(hook.visibleChangeBySeconds>0&&hook.visibleChangeBySeconds<=3))
  errors.push('R8.17 hook must show twist within first 3 seconds')
 if(hook.firstTimeMutedViewerTestRequired!==true||hook.onlyLabelOrBottle===true)
  errors.push('R8.17 hook requires muted viewer; labeled-bottle fails')
 if(!clean(cta.primaryText)||!clean(cta.secondaryLoopText)||cta.primaryText===cta.secondaryLoopText)
  errors.push('R8.17 CTA primary and secondary text missing')
 if(cta.primarySafetyPriority!==true||cta.secondaryDoesNotDisplacePrimary!==true)
  errors.push('R8.17 primary safety/emergency CTA must dominate secondary')
 // No keyword blacklist. Only two exact, generic invitations are factual-payoff
 // exemptions. EVERY other open loop is source-bound by default.
 if(!safeGenericLoops.has(clean(cta.secondaryLoopText))&&
   (!clean(cta.secondarySourceId)||!hash(cta.secondarySourceSha256)))
  errors.push('R8.17 factual open loop needs verified provenance regardless of keywords')
 if(cta.secondaryLoopKind==='factual-payoff'&&
   (!clean(cta.secondarySourceId)||!hash(cta.secondarySourceSha256)))
  errors.push('R8.17 declared factual payoff needs verified provenance')
 const final=p.beats?.at(-1)
 if(final?.role!=='cta'||!clean(final.onScreenText).includes(clean(cta.primaryText))||
   !clean(final.onScreenText).includes(clean(cta.secondaryLoopText)))
  errors.push('R8.17 closing beat lacks both on-screen CTAs')
 if(errors.length)throw Error(errors.join('; '))
 return {hookBySeconds:hook.visibleChangeBySeconds,explicitPrimaryCta:true,secondaryLoopVerified:true,
  mutedViewerComprehensionPending:true,publicationApproved:false}
}
export function assertR817RenderedCtaProminence(cta,outputSha){
 if(cta?.outputSha256!==outputSha||!hash(outputSha)||cta.primaryVisible!==true||
    cta.secondaryVisible!==true||cta.safetyPrimary!==true||
    !Number.isFinite(cta.primaryFontPx)||!Number.isFinite(cta.secondaryFontPx)||
    cta.primaryFontPx<1.45*cta.secondaryFontPx||
    !Number.isFinite(cta.primaryVisibleSeconds)||!Number.isFinite(cta.secondaryVisibleSeconds)||
    cta.primaryVisibleSeconds<cta.secondaryVisibleSeconds||
    !Number.isFinite(cta.primaryPixelArea)||!Number.isFinite(cta.secondaryPixelArea)||
    cta.primaryPixelArea<1.5*cta.secondaryPixelArea||
    !hash(cta.decodedFrameSampleSha256)||cta.verifiedFromDecodedMp4!==true)
    throw Error('R8.17 primary safety CTA fails pixel prominence or time dominance')
 return {status:'CTA_PROMINENCE_MEASURED',primaryDominant:true}
}
export function assessR817RetentionMaster({motion,hookFrames,muteTest,captionProof,captionPixelProof,
  ctaProof,outputSha256,authorId,alignmentProof}={}){
 const blockers=[]
 if(!Number.isFinite(motion?.staticFraction)||motion?.decodedFinalMp4!==true)
  throw Error('R8.17 motion needs decoded final MP4')
 if(motion.staticFraction>=.4||!(motion.longestBeatStaticStreakSeconds<6))
  blockers.push('motion gate static >40% or >=6 seconds')
 try{assertR817HookPixels(hookFrames,outputSha256)}catch(e){blockers.push(e.message)}
 if(muteTest?.result!=='pass'||!clean(muteTest.reviewerId)||muteTest.reviewerId===authorId||
    !clean(authorId)||muteTest?.prompt!=='Describe what changed while video is muted'||
    muteTest?.firstTimeViewer!==true)
   blockers.push('independent non-author muted-viewer twist check pending')
 if(captionProof?.mode!=='mfa-acoustic-progressive-word'||
    captionProof?.phraseFlashFallback!==false||captionProof?.wordCount<1)
   blockers.push('progressive word captions missing')
 try{assertR817CaptionPixelQA(captionPixelProof)}catch(e){blockers.push(e.message)}
 try{assertR817RenderedCtaProminence(ctaProof,outputSha256)}catch(e){blockers.push(e.message)}
 if(alignmentProof?.passed!==true||alignmentProof.meanBoundaryOffsetSeconds>.12||
    alignmentProof.maxBoundaryOffsetSeconds>.22||alignmentProof.sampleWordCount<5)
   blockers.push('independent sampled MFA boundary accuracy unverified')
 return {status:blockers.length?'REVIEW_HOLD':'RETENTION_MECHANICS_PASS',
  blockers,motionMeasuredOnFinal:true,technicalRetentionPassed:!blockers.length,
  publicationApproved:false,ownerVisualApproval:false}
}
