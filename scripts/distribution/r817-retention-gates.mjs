// R8.17 retention gates are additive to scientific/owner approval, never new
// evidence authority. A hook must explain the premise VISUALLY while muted.
const clean=v=>String(v??'').trim().replace(/\s+/g,' ')
const hash=v=>/^[a-f0-9]{64}$/i.test(String(v??''))
export function assertR817RetentionPlan(plan){
 const p=plan??{},errors=[]
 const hook=p.retention?.hook??{},cta=p.retention?.cta??{}
 if(!p.beats?.length||Number(p.beats[0]?.start)!==0)errors.push('R8.17 retention hook must begin at 0 seconds')
 if(!clean(hook.beforeName)||!clean(hook.afterName)||clean(hook.beforeName).toLowerCase()===clean(hook.afterName).toLowerCase())
    errors.push('R8.17 hook must show a before -> after conceptual twist, not a static labeled object')
 if(!/^(transforms-into|activates|converts-to|reveals-hidden-action|binds-to|changes-risk-context)$/.test(clean(hook.action)))
    errors.push('R8.17 hook needs a visible, meaningful transformation verb')
 if(!(Number(hook.visibleChangeBySeconds)>0&&Number(hook.visibleChangeBySeconds)<=3))
    errors.push('R8.17 hook visual twist must occur within first 3 seconds')
 if(hook.firstTimeMutedViewerTestRequired!==true||hook.onlyLabelOrBottle===true)
    errors.push('R8.17 hook requires independent first-time muted comprehension check; no labeled-bottle shortcut')
 if(!clean(cta.primaryText)||!clean(cta.secondaryLoopText)||clean(cta.primaryText)===clean(cta.secondaryLoopText))
    errors.push('R8.17 CTA requires a distinct primary action plus smaller follow-earning open loop')
 if(cta.primarySafetyPriority!==true||cta.secondaryDoesNotDisplacePrimary!==true)
    errors.push('R8.17 safety/emergency CTA must remain primary; follow loop stays secondary')
 if(/(?:which states|banned|%|study|deaths|legal)/i.test(clean(cta.secondaryLoopText))&&
    (!clean(cta.secondarySourceId)||!hash(cta.secondarySourceSha256)))
    errors.push('R8.17 factual open loop needs verified provenance; do not invent state-law or risk teaser')
 const final=p.beats.at(-1)
 if(final?.role!=='cta'||!clean(final?.onScreenText).includes(clean(cta.primaryText))||
    !clean(final?.onScreenText).includes(clean(cta.secondaryLoopText)))
    errors.push('R8.17 primary and secondary CTA text must appear in actual authored closing scene')
 if(errors.length)throw Error(errors.join('; '))
 return {hookBySeconds:hook.visibleChangeBySeconds,explicitPrimaryCta:true,secondaryLoopVerified:true,
     mutedViewerComprehensionPending:true,publicationApproved:false}
}
export function assessR817RetentionMaster({motion,hookFrames,muteTest,captionProof}={}){
 const blockers=[]
 if(!Number.isFinite(Number(motion?.staticFraction))||motion?.decodedFinalMp4!==true)
    throw Error('R8.17 motion gate requires actual decoded-final-MP4 measurement')
 if(Number(motion.staticFraction)>=0.4)blockers.push('final MP4 >40% static: re-render required')
 if(!(Number(motion.longestBeatStaticStreakSeconds)<6))blockers.push('scene has >=6 seconds without meaningful central visual change')
 if(!hash(hookFrames?.beforeSha256)||!hash(hookFrames?.afterSha256)||
    hookFrames.beforeSha256===hookFrames.afterSha256||Number(hookFrames?.afterAtSeconds)>3)
    blockers.push('hook has no two distinct first-three-second exact-master frame receipts')
 if(muteTest?.result!=='pass'||!clean(muteTest?.reviewerId)||
    muteTest?.prompt!=='Describe what changed while video is muted')
    blockers.push('independent first-time muted-viewer twist comprehension pending')
 if(captionProof?.mode!=='mfa-acoustic-progressive-word'||
    captionProof?.phraseFlashFallback!==false||!Number.isInteger(captionProof.wordCount)||
    captionProof.wordCount<=0)blockers.push('reviewed progressive word captions absent')
 return {status:blockers.length?'REVIEW_HOLD':'RETENTION_MECHANICS_PASS',
  blockers,motionMeasuredOnFinal:true,technicalRetentionPassed:blockers.length===0,
  publicationApproved:false,ownerVisualApproval:false}
}
