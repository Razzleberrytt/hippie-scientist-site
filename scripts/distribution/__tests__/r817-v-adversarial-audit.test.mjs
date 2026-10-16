import { test, expect } from 'vitest'
import { renderR817ProgressiveWordCaptions } from '../r810-aligned-captions.mjs'
import { measureR817CaptionHighlightPixels,assertR817CaptionPixelQA } from '../r817-caption-pixel-qa.mjs'
import { measureR817HookCenterChange,assertR817HookPixels } from '../r817-rendered-evidence.mjs'
import { measureR817AlignmentAudit, assertR817AlignmentAudit } from '../r817-alignment-qa.mjs'
import { measureR817FinalMotion,assertR817FinalMotion } from '../r817-motion-qa.mjs'
import { assertR817RetentionPlan, assessR817RetentionMaster, assertR817RenderedCtaProminence } from '../r817-retention-gates.mjs'
import { assertR817ExperimentPlan,evaluateR817Experiment } from '../r817-experiments.mjs'
const h=(v)=>v.repeat(64)
const rgb=(n,width=210,height=75)=>{const b=Buffer.alloc(width*height*3)
  for(let i=0;i<n&&i<width*height;i++){b[i*3]=255;b[i*3+1]=255;b[i*3+2]=255}
  return b
}
test('T1: 4fps PIXEL proof rejects static phrase-flash and accepts progressive changes',()=>{
 const cue=[{start:0,end:4.75,beatId:'hook',words:['one','two','three','four','five']}]
 const good=measureR817CaptionHighlightPixels(Buffer.concat(Array.from({length:20},(_,i)=>rgb(i*8))),cue)
 expect(assertR817CaptionPixelQA(good).status).toBe('CAPTION_PIXEL_MEASUREMENT_PASS')
 const flash=measureR817CaptionHighlightPixels(Buffer.concat(Array.from({length:20},(_,i)=>rgb(i<9?5:155))),cue)
 expect(()=>assertR817CaptionPixelQA(flash)).toThrow(/pixel proof/)
})
test('T2: acoustic karaoke below 80ms is imperceptible and blocked',()=>{
 expect(()=>renderR817ProgressiveWordCaptions([{beatId:'a',text:'One two three'}],[
 {start:0,end:.04},{start:.04,end:.6},{start:.6,end:1}
 ])).toThrow(/imperceptible/)
})
test('T3: independently sampled MFA start/end boundary errors cannot exceed tolerance',()=>{
 const words=Array.from({length:5},(_,i)=>({word:'w'+i,start:i,end:i+.4}))
 const refs=words.map((w,index)=>({index,word:w.word,start:w.start+.2,end:w.end+.2}))
 const result=measureR817AlignmentAudit(words,refs,{audioSha256:h('a'),authorId:'author',reviewerId:'independent'})
 expect(result.passed).toBe(false)
 expect(()=>assertR817AlignmentAudit(result,h('a'))).toThrow(/accuracy/)
})
test('T4: caption-only changes outside center do not prove hook action',()=>{
 const black=Buffer.alloc(160*176),same=Buffer.from(black)
 const measure=measureR817HookCenterChange(black,same)
 expect(measure.passed).toBe(false)
 expect(()=>assertR817HookPixels({outputSha256:h('a'),beforeSha256:measure.beforeSha256,
 afterSha256:measure.afterSha256,afterAtSeconds:2.5,pixelProof:measure},h('a'))).toThrow(/CENTRAL/)
})
test('T5: author cannot self-certify first-time muted hook',()=>{
 const m={decodedFinalMp4:true,staticFraction:.1,longestBeatStaticStreakSeconds:1}
 const check=assessR817RetentionMaster({motion:m,authorId:'author',
 muteTest:{result:'pass',reviewerId:'author',firstTimeViewer:true,prompt:'Describe what changed while video is muted'}})
 expect(check.blockers.some(x=>x.includes('non-author'))).toBe(true)
})
test('T6: slow drift / no central semantic change is not hook comprehension',()=>{
 const black=Buffer.alloc(160*176),almost=Buffer.alloc(160*176)
 for(let i=0;i<400;i++)almost[i]=255
 expect(measureR817HookCenterChange(black,almost).passed).toBe(false)
})
const frame=(n,paint)=>{const out=Buffer.alloc(160*176,20)
 if(paint)for(let i=0;i<n;i++)out[i]=235
 return out
}
test('T7: particle-only pixel motion never defeats spatial component threshold',()=>{
 const stream=Buffer.concat(Array.from({length:30},(_,i)=>{
  const f=Buffer.alloc(160*176,20)
  for(let j=0;j<370;j++) f[(j*73+i*19)%(160*176)]=220
  return f
 }))
 const result=measureR817FinalMotion(stream,[{beatId:'x',role:'hook',start:0,end:6}])
 expect(()=>assertR817FinalMotion(result)).toThrow(/motion blocked/)
})
test('T8: single frame flashes every 5.8 seconds do not reset static streak',()=>{
 const sequence=Buffer.concat(Array.from({length:60},(_,i)=>frame(5000,i===28||i===57)))
 const result=measureR817FinalMotion(sequence,[{beatId:'a',role:'hook',start:0,end:6},
  {beatId:'b',role:'evidence',start:6,end:12}])
 expect(result.perBeat.some(x=>x.longestStaticStreakSeconds>=5)).toBe(true)
 expect(()=>assertR817FinalMotion(result)).toThrow()
})
test('T9: CTA cannot claim safety dominance if font/pixel/time favor teaser',()=>{
 const obj={outputSha256:h('a'),primaryVisible:true,secondaryVisible:true,safetyPrimary:true,
  primaryFontPx:48,secondaryFontPx:42,primaryVisibleSeconds:1,secondaryVisibleSeconds:4,
  primaryPixelArea:120,secondaryPixelArea:200,decodedFrameSampleSha256:h('b'),verifiedFromDecodedMp4:true}
 expect(()=>assertR817RenderedCtaProminence(obj,h('a'))).toThrow(/prominence/)
})
test('T10: factual payoff avoids the keyword regex but still needs source',()=>{
 const p={beats:[{role:'hook',start:0,end:2},{role:'cta',onScreenText:'CALL 911. See the surprising outcome.'}],
 retention:{hook:{beforeName:'object A',afterName:'object B',action:'activates',visibleChangeBySeconds:1.5,
   firstTimeMutedViewerTestRequired:true,onlyLabelOrBottle:false},
 cta:{primaryText:'CALL 911.',secondaryLoopText:'See the surprising outcome.',
   primarySafetyPriority:true,secondaryDoesNotDisplacePrimary:true}}}
 expect(()=>assertR817RetentionPlan(p)).toThrow(/regardless of keywords/)
})
function exp(){
 const a={engine:'kokoro-onnx',speaker:'am_michael',wavSha256:h('c')}
 return {schemaVersion:'ths-r817-experiment-v1',id:'E',kind:'human-presence-vs-animation',
 registeredAt:'2026-10-13T00:00:00Z',platform:'tiktok',primaryMetric:'threeSecondHoldPercent',
 sourceLedgerSha256:h('a'),canonicalNarrationScriptSha256:h('b'),
 decisionRule:{minimumPairedTopics:5,minimumViewsPerArmPerTopic:250,relativeLiftThreshold:.15,observationWindowHours:72},
 arms:['human-presence','animated-only'].map(id=>({id,sourceLedgerSha256:h('a'),narrationScriptSha256:h('b'),voice:a}))}
}
const observations=p=>Array.from({length:5},(_,i)=>({topicId:'T'+i,platform:'tiktok',metric:'threeSecondHoldPercent',
 arms:p.arms.map((a,k)=>({id:a.id,sourceLedgerSha256:h('a'),narrationScriptSha256:h('b'),
 observationSha256:h('d'),postedAt:'2026-10-13T14:00:00Z',windowHours:72,views:300,value:k?45:60}))}))
test('T11: nonoverlapping posting windows do not make matched topics',()=>{
 const p=exp(),rows=observations(p)
 for(const row of rows)row.arms[1].postedAt='2026-10-16T14:00:00Z'
 expect(evaluateR817Experiment(p,rows).eligiblePairs).toBe(0)
})
test('T12: repeated evaluation cannot promote a winner without correction/review',()=>{
 const p=exp(),rows=observations(p)
 const r=evaluateR817Experiment(p,rows,{evaluationCount:2,priorEvaluationReceiptSha256s:[h('e')]})
 expect(r.status).toBe('MULTIPLE_COMPARISON_HOLD')
 expect(r.multipleComparisonWarning).toMatch(/false positives/)
 expect(r.adoptable).toBe(false)
})
