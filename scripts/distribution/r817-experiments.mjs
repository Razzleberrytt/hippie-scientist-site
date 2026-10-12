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
export function evaluateR817Experiment(plan,topicPairs){
 assertR817ExperimentPlan(plan)
 const p=plan??{},pairs=topicPairs??[]
 const minimum=p.decisionRule.minimumPairedTopics
 const views=p.decisionRule.minimumViewsPerArmPerTopic
 const valid=[]
 for(const row of pairs){
  if(!row||row.platform!==p.platform||!row.topicId||row.metric!=='threeSecondHoldPercent'||
     !Array.isArray(row.arms)||row.arms.length!==2)continue
  const byId=new Map(row.arms.map(x=>[x.id,x]))
  if(!p.arms.every(a=>byId.has(a.id)))continue
  if(!p.arms.every(a=>{
    const r=byId.get(a.id)
    return r.sourceLedgerSha256===p.sourceLedgerSha256&&
      r.narrationScriptSha256===p.canonicalNarrationScriptSha256&&
      Number.isFinite(r.value)&&r.value>=0&&r.value<=100&&r.views>=views&&
      sha(r.observationSha256)&&r.windowHours===p.decisionRule.observationWindowHours
  }))continue
  if(valid.some(x=>x.topicId===row.topicId))continue
  valid.push({topicId:row.topicId,values:p.arms.map(a=>byId.get(a.id).value)})
 }
 if(valid.length<minimum)return {status:'INSUFFICIENT_REAL_OBSERVATIONS',eligiblePairs:valid.length,
  requiredPairs:minimum,adoptable:false,causalClaimAllowed:false}
 const means=p.arms.map((a,i)=>valid.reduce((sum,x)=>sum+x.values[i],0)/valid.length)
 const winner=means[0]>means[1]?0:means[1]>means[0]?1:-1
 const relativeGain=winner<0?0:(means[winner]-means[1-winner])/Math.max(0.0001,means[1-winner])
 return {status:relativeGain>=p.decisionRule.relativeLiftThreshold?'REVIEW_PROMISING_VARIANT':'NO_PRE_REGISTERED_WINNER',
  eligiblePairs:valid.length,means:means.map(x=>Number(x.toFixed(2))),
  observedRelativeLift:Number(relativeGain.toFixed(4)),candidateArmId:winner<0?null:p.arms[winner].id,
  adoptable:false,automaticWinner:false,causalClaimAllowed:false,
  rationale:'Requires comparable posting conditions, confounder review and owner editorial decision'}
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
