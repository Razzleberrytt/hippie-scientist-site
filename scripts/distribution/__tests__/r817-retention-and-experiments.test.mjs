import { test, expect } from 'vitest'
import { renderR817ProgressiveWordCaptions } from '../r810-aligned-captions.mjs'
import { assertR817RetentionPlan, assessR817RetentionMaster } from '../r817-retention-gates.mjs'
import { assertR817ExperimentPlan, evaluateR817Experiment } from '../r817-experiments.mjs'
import { measureR817FinalMotion, assertR817FinalMotion } from '../r817-motion-qa.mjs'

const h=n=>n.repeat(64)
const makePlan=()=>({
  beats:[{start:0,end:3,role:'hook'},{start:3,end:6,role:'cta',onScreenText:'CALL 911. Follow for more science.'}],
  retention:{hook:{beforeName:'Tianeptine bottle',afterName:'μ-opioid receptor activation',
    action:'activates',visibleChangeBySeconds:2.7,firstTimeMutedViewerTestRequired:true,onlyLabelOrBottle:false},
    cta:{primaryText:'CALL 911.',secondaryLoopText:'Follow for more science.',
      primarySafetyPriority:true,secondaryDoesNotDisplacePrimary:true}}
})
test('R8.17 uses genuinely acoustic word timing with one progressive ASS marker per spoken word',()=>{
 const scenes=[{beatId:'hook',text:'Tianeptine binds opioid receptors.'}]
 const words=[{word:'Tianeptine',start:0,end:0.4},{word:'binds',start:0.4,end:0.85},
   {word:'opioid',start:0.85,end:1.35},{word:'receptors.',start:1.35,end:2}]
 const rendered=renderR817ProgressiveWordCaptions(scenes,words)
 expect(rendered.wordCount).toBe(4)
 expect(rendered.mode).toBe('mfa-acoustic-progressive-word')
 const dialogues=rendered.ass.split('\n').filter(s=>s.startsWith('Dialogue:'))
 expect(dialogues).toHaveLength(1)
 expect((dialogues[0].match(/\{\\k\d+\}/g)||[])).toHaveLength(4)
 expect(dialogues[0]).toContain('{\\k40}Tianeptine')
 expect(dialogues[0]).toContain('{\\k45}binds')
 expect(rendered.phraseFlashFallback).toBe(false)
})
test('R8.17 rejects captions with missing acoustic timestamps',()=>{
 expect(()=>renderR817ProgressiveWordCaptions([{beatId:'hook',text:'One two'}],
    [{start:0,end:0.4},{start:0.4,end:0.4}])).toThrow()
})
test('R8.17 visual twist and evidence-sourced secondary safety CTA',()=>{
 expect(assertR817RetentionPlan(makePlan()).explicitPrimaryCta).toBe(true)
 const stale=makePlan();stale.retention.hook.onlyLabelOrBottle=true
 expect(()=>assertR817RetentionPlan(stale)).toThrow(/labeled-bottle/)
 const falseClaim=makePlan();falseClaim.retention.cta.secondaryLoopText='Which states banned it?'
 expect(()=>assertR817RetentionPlan(falseClaim)).toThrow(/verified provenance/)
})
test('R8.17 encoded retention must not self-approve human muted-viewer comprehension',()=>{
 const p={motion:{decodedFinalMp4:true,staticFraction:.25,longestBeatStaticStreakSeconds:1.2},
   hookFrames:{beforeSha256:h('a'),afterSha256:h('b'),afterAtSeconds:2.4},
   captionProof:{mode:'mfa-acoustic-progressive-word',wordCount:15,phraseFlashFallback:false}}
 expect(assessR817RetentionMaster(p).technicalRetentionPassed).toBe(false)
 expect(assessR817RetentionMaster({...p,authorId:'owner',muteTest:{result:'pass',reviewerId:'owner',prompt:'Describe what changed while video is muted',firstTimeViewer:true}}).technicalRetentionPassed).toBe(false)
})
function exp(){
 const a={engine:'kokoro-onnx',speaker:'am_michael',wavSha256:h('d')}
 return {schemaVersion:'ths-r817-experiment-v1',id:'experiment-01',kind:'human-presence-vs-animation',
   registeredAt:'2026-10-12T15:00:00Z',platform:'tiktok',primaryMetric:'threeSecondHoldPercent',
   sourceLedgerSha256:h('a'),canonicalNarrationScriptSha256:h('b'),
   decisionRule:{minimumPairedTopics:5,minimumViewsPerArmPerTopic:250,relativeLiftThreshold:.15,observationWindowHours:72},
   arms:['human-presence','animated-only'].map(id=>({id,narrationScriptSha256:h('b'),sourceLedgerSha256:h('a'),voice:{...a}}))}
}
test('R8.17 A/B harness pre-registers 5-topic 15% rule but never fabricates a winner',()=>{
 const p=exp()
 expect(assertR817ExperimentPlan(p).automaticWinner).toBe(false)
 expect(evaluateR817Experiment(p,[]).status).toBe('INSUFFICIENT_REAL_OBSERVATIONS')
 const pairs=Array.from({length:5},(_,i)=>({topicId:'topic'+i,platform:'tiktok',
   metric:'threeSecondHoldPercent',arms:p.arms.map((a,j)=>({id:a.id,sourceLedgerSha256:h('a'),
     narrationScriptSha256:h('b'),views:350,value:j===0?57:45,
     observationSha256:h('e'),windowHours:72,postedAt:'2026-10-13T14:00:00Z'}))}))
 const result=evaluateR817Experiment(p,pairs)
 expect(result.status).toBe('REVIEW_PROMISING_VARIANT')
 expect(result.adoptable).toBe(false)
 expect(result.causalClaimAllowed).toBe(false)
})
test('R8.17 motion gate fails on static-scene frames even when no subtitles are drawn',()=>{
 const stride=160*176
 const image=(n)=>Buffer.alloc(stride,n)
 const raw=Buffer.concat(Array.from({length:60},(_,i)=>image(i<32?10:220)))
 const scenes=[{beatId:'hook',role:'hook',start:0,end:6},{beatId:'cta',role:'cta',start:6,end:12}]
 const m=measureR817FinalMotion(raw,scenes)
 expect(m.staticFraction).toBeGreaterThan(.4)
 expect(()=>assertR817FinalMotion(m)).toThrow(/motion blocked/)
})
