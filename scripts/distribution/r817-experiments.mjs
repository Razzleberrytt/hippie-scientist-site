// R8.17 first-class creative experiments. PRE-REGISTER before publishing; a
// real platform observation is data, not automatic causal proof or license to
// rewrite scientific claims, the original narrator, or the editorial rules.
const clean=v=>String(v??'').trim()
const sha=v=>/^[a-f0-9]{64}$/i.test(String(v??''))
export function assertR817ExperimentPlan(plan){
 const p=plan??{},issues=[]
 if(p.schemaVersion!=='ths-r817-experiment-v1'||!clean(p.id)||!clean(p.registeredAt)||!Number.isFinite(Date.parse(p.registeredAt)))
  issues.push('experiment requires explicit pre-registered identity and date')
 if(!['human-presence-vs-animation','house-voice-delivery'].includes(p.kind))issues.push('unknown controlled comparison')
 if(p.primaryMetric!=='threeSecondHoldPercent'||p.decisionRule?.minimumPairedTopics!==5||
    p.decisionRule?.minimumViewsPerArmPerTopic<250||p.decisionRule?.relativeLiftThreshold!==0.15||
    !(p.decisionRule?.observationWindowHours>=24))
    issues.push('pre-register >=5 matched topics, >=250 views per arm/topic and +15% relative 3s hold')
 if(!sha(p.sourceLedgerSha256)||!sha(p.canonicalNarrationScriptSha256))
    issues.push('both variants must bind same scientific ledger and same script')
 if(!Array.isArray(p.arms)||p.arms.length!==2||new Set(p.arms.map(x=>x.id)).size!==2)
    issues.push('experiment requires exactly two distinct, named arms')
 if(p.kind==='human-presence-vs-animation'&&
    !(['human-presence','animated-only'].every(x=>p.arms?.some(a=>a.id===x))))
    issues.push('first experiment must explicitly compare human presence with animated-only')
 if(p.kind==='house-voice-delivery'&&p.ownerApprovedVoiceExperiment!==true)
    issues.push('voice variation requires explicit owner permission before creating variants')
 for(const a of p.arms??[]){
  if(a.narrationScriptSha256!==p.canonicalNarrationScriptSha256||a.sourceLedgerSha256!==p.sourceLedgerSha256)
    issues.push('experimental creative variants cannot change spoken science or sources')
  if(a.voice?.engine!=='kokoro-onnx'||a.voice?.speaker!=='am_michael'||!sha(a.voice?.wavSha256))
    issues.push('every experimental audio arm needs its own verified exact original-house-voice WAV')
 }
 if(issues.length)throw Error(issues.join('; '))
 return {id:p.id,kind:p.kind,status:'PRE_REGISTERED_NO_OBSERVATIONS',automaticWinner:false,
  methodologicalWarning:'Platform timing, distribution and audience are confounders'}
}
export function evaluateR817Experiment(plan,topicPairs,{evaluationCount=1,priorEvaluationReceiptSha256s=[]}={}){
 assertR817ExperimentPlan(plan)
 const p=plan??{},pairs=topicPairs??[]
 if(!Number.isInteger(evaluationCount)||evaluationCount<1||!Array.isArray(priorEvaluationReceiptSha256s)||
   priorEvaluationReceiptSha256s.length!==evaluationCount-1||
   priorEvaluationReceiptSha256s.some(v=>!sha(v)))
  throw Error('R8.17 evaluation audit history / count inconsistent')
 const minimum=p.decisionRule.minimumPairedTopics
 const views=p.decisionRule.minimumViewsPerArmPerTopic
 const valid=[],rejections=[]
 for(const row of pairs){
  if(!row||row.platform!==p.platform||!row.topicId||row.metric!=='threeSecondHoldPercent'||
     !Array.isArray(row.arms)||row.arms.length!==2){rejections.push('incomplete');continue}
  const byId=new Map(row.arms.map(x=>[x.id,x]))
  if(!p.arms.every(a=>byId.has(a.id))){rejections.push('arm-missing');continue}
  if(!p.arms.every(a=>{
    const r=byId.get(a.id)
    return r.sourceLedgerSha256===p.sourceLedgerSha256&&
      r.narrationScriptSha256===p.canonicalNarrationScriptSha256&&
      Number.isFinite(r.value)&&r.value>=0&&r.value<=100&&r.views>=views&&
      sha(r.observationSha256)&&r.windowHours===p.decisionRule.observationWindowHours&&
      Number.isFinite(Date.parse(r.postedAt))
  })){rejections.push('invalid-measurement');continue}
  const starts=p.arms.map(a=>Date.parse(byId.get(a.id).postedAt))
  if(Math.abs(starts[0]-starts[1])>24*60*60*1000){
   rejections.push('non-overlapping-posting-window');continue
  }
  if(valid.some(x=>x.topicId===row.topicId)){rejections.push('duplicate-topic');continue}
  valid.push({topicId:row.topicId,values:p.arms.map(a=>byId.get(a.id).value)})
 }
 const meta={evaluationCount,multipleComparisonWarning:evaluationCount>1?
  'Repeated comparison can inflate false positives; requires independent holdout review':
  'One preregistered look does not prove causation',rejections,
  automaticWinner:false,adoptable:false,causalClaimAllowed:false}
 if(valid.length<minimum)return {...meta,status:'INSUFFICIENT_REAL_OBSERVATIONS',
  eligiblePairs:valid.length,requiredPairs:minimum}
 const means=p.arms.map((a,i)=>valid.reduce((sum,x)=>sum+x.values[i],0)/valid.length)
 const winner=means[0]>means[1]?0:means[1]>means[0]?1:-1
 const relativeGain=winner<0?0:(means[winner]-means[1-winner])/Math.max(.0001,means[1-winner])
 // Block a one-topic outlier from masquerading as a reliable 5-topic pattern.
 const consistent=winner<0?0:valid.filter(x=>x.values[winner]>x.values[1-winner]).length
 const qualifies=relativeGain>=p.decisionRule.relativeLiftThreshold&&consistent>=Math.ceil(.8*valid.length)
 return {...meta,status:qualifies&&evaluationCount===1?'REVIEW_PROMISING_VARIANT':
   qualifies?'MULTIPLE_COMPARISON_HOLD':'NO_PRE_REGISTERED_WINNER',
  eligiblePairs:valid.length,means:means.map(x=>Number(x.toFixed(2))),
  consistentPairedWins:consistent,
  observedRelativeLift:Number(relativeGain.toFixed(4)),candidateArmId:qualifies?p.arms[winner].id:null,
  rationale:'Matched time windows and directional consistency required; human editor still reviews'}
}
export const R817_FIRST_EXPERIMENT = Object.freeze({
 schemaVersion:'ths-r817-experiment-v1',id:'R817-HUMAN-PRESENCE-01',
 kind:'human-presence-vs-animation',status:'DRAFT_NEEDS_REGISTRATION',
 primaryMetric:'threeSecondHoldPercent',
 decisionRule:{minimumPairedTopics:5,minimumViewsPerArmPerTopic:250,relativeLiftThreshold:0.15,
  observationWindowHours:72},
 conditions:'Identical approved sources, script, original-house-voice WAV, target platform, format and comparative posting window. Human footage must be consented and rights-cleared.',
 arms:['human-presence','animated-only'],
 ownerApprovalRequired:true,publicationPermission:false,
 note:'Illustrative pre-registration template; IDs/hashes/date must be populated from actual authorized media before experiment begins'
})
