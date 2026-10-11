import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { getFlywheelVideo, listFlywheelSnapshots } from './evidencemotion-flywheel.mjs'

const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const clean = (value) => String(value ?? '').trim()
const safeId = (value) => /^[a-z0-9][a-z0-9_-]{2,79}$/.test(String(value ?? ''))
const shaOk = (value) => /^[a-f0-9]{64}$/i.test(String(value ?? ''))
const utcMs = (value) => {
  const n=Date.parse(value)
  if (!Number.isFinite(n)||typeof value !== 'string'||!value.endsWith('Z')) throw Error('R8.11 needs UTC publication and observation dates')
  return n
}
function immutable(file,obj) {
  const body=JSON.stringify(obj,null,2)+'\n'
  fs.mkdirSync(path.dirname(file),{recursive:true})
  if(fs.existsSync(file)) {
    if(fs.readFileSync(file,'utf8') !== body)throw Error('R8.11 immutable experiment record cannot be rewritten')
    return {file,sha256:sha(body),existing:true}
  }
  fs.writeFileSync(file,body,{flag:'wx',mode:0o444})
  return {file,sha256:sha(body),existing:false}
}
const per1000=(num,den)=>den>0&&num!==null&&num!==undefined?Number((num/den*1000).toFixed(3)):null
const mean=(arr)=>arr.length?arr.reduce((x,y)=>x+y,0)/arr.length:null
const names = ['a','b','c']
function metricFor(snapshot,metric) {
  const m=snapshot.latestObservation?.metrics
  if (!m||m.views===null||m.views<100)return null
  if(metric==='three-second-hold')return m.threeSecondHoldPercent??null
  if(metric==='watch-through')return m.watchThroughPercent??null
  if(metric==='attributed-follow-conversion')return per1000(m.followsAttributed,m.views)
  if(metric==='views-per-day')return m.views/({'first-72h':3,'first-7d':7,'first-28d':28}[snapshot.metricWindow] || 1)
  throw Error('R8.11 experiment unknown metric')
}
export function analyzeR811HookExperiment(flywheelRoot, { experimentId, metricWindow='first-7d',
  minimumSpacingHours=4, primaryMetric='three-second-hold' }) {
  if(!safeId(experimentId))throw Error('R8.11 invalid experiment ID')
  if(!['first-72h','first-7d','first-28d'].includes(metricWindow))throw Error('R8.11 A/B needs fixed age-comparable metrics window')
  if(!Number.isFinite(minimumSpacingHours)||minimumSpacingHours<4)throw Error('R8.11 posts must be spaced at least four hours apart')
  const snapshots=listFlywheelSnapshots(flywheelRoot,metricWindow).filter(x=>x.r811?.experimentId===experimentId)
  if(snapshots.length!==3) return {experimentId,status:'awaiting-all-three-actual-posts',registered:snapshots.length,
    required:3,qualityStatement:'No conclusion; three genuinely published arms required.'}
  const slots=new Map()
  for(const video of snapshots) {
    const arm=video.r811.variantId
    if(!names.includes(arm)||slots.has(arm))throw Error('R8.11 duplicate/invalid A/B arm')
    slots.set(arm,video)
  }
  if(names.some(x=>!slots.has(x)))throw Error('R8.11 lacks a published A/B/C arm')
  const ordered=names.map(id=>slots.get(id))
  const source=ordered[0].r811.sourcePacketSha256
  const approvedPlanSha256=ordered[0].r811.planSha256
  const platform=ordered[0].platform
  if (!shaOk(source)||!shaOk(approvedPlanSha256)||ordered.some(v=>v.platform!==platform||v.r811.sourcePacketSha256!==source||v.r811.planSha256!==approvedPlanSha256)) {
    throw Error('R8.11 A/B arms must share one approved experiment plan, source packet and platform')
  }
  if(new Set(ordered.map(v=>v.hookTextFirst3Seconds.toLowerCase())).size!==3)throw Error('R8.11 three hook variants cannot duplicate the same hook')
  const timed=ordered.slice().sort((a,b)=>utcMs(a.publishedAt)-utcMs(b.publishedAt))
  for(let i=1;i<timed.length;i++){
    if((utcMs(timed[i].publishedAt)-utcMs(timed[i-1].publishedAt))/3600000<minimumSpacingHours){
      throw Error('R8.11 hook posts were not spaced far enough for the declared protocol')
    }
  }
  const rows=ordered.map((v,i)=>{
    const stats=v.latestObservation
    const sample=stats?.metrics?.views??null
    const measured=metricFor(v,primaryMetric)
    return {variantId:names[i],videoId:v.videoId,platform,sourcePacketSha256:source,
      hook:v.hookTextFirst3Seconds,metricWindow,observedAt:stats?.observedAt??null,
      views:sample,likes:stats?.metrics?.likes??null,
      followsAttributed:stats?.metrics?.followsAttributed??null,
      watchThroughPercent:stats?.metrics?.watchThroughPercent??null,
      threeSecondHoldPercent:stats?.metrics?.threeSecondHoldPercent??null,
      primaryMetric,primaryValue:measured,
      observationSha256:stats?sha(JSON.stringify(stats)):null}
  })
  const complete=rows.every(x=>x.primaryValue!==null&&x.views>=100&&x.observationSha256)
  const rank=complete?rows.slice().sort((a,b)=>b.primaryValue-a.primaryValue):[]
  const lead=rank[0]||null
  return {
    schemaVersion:'ths-evidencemotion-r811-hook-comparison-v1',
    experimentId,sourcePacketSha256:source,approvedPlanSha256,platform,metricWindow,minimumSpacingHours,
    primaryMetric,armCount:3,actualVideoIds:rows.map(x=>x.videoId),arms:rows,
    status:complete?'exploratory-observed-leader':'missing-metric-or-sample',
    observedLeaderVariantId:lead?.variantId||null,
    observedDifference:complete?Number((rank[0].primaryValue-rank[2].primaryValue).toFixed(4)):null,
    causalClaimAllowed:false,automaticWinnerAllowed:false,
    scientificQualityRating:null,
    interpretation:'This is an uncontrolled real-platform comparison with timing/audience confounders. Human editorial review is required to choose a reusable pattern. Viral stats never change efficacy claims.',
  }
}
export function snapshotR811Experiment(root,flywheelRoot,options) {
  const report=analyzeR811HookExperiment(flywheelRoot,options)
  if(report.status==='awaiting-all-three-actual-posts')throw Error('R8.11 cannot record a completed A/B comparison before all three real posts exist')
  const digest=sha(JSON.stringify(report))
  return immutable(path.join(path.resolve(root),'experiments',options.experimentId,digest+'.json'),report)
}
export function approveR811HookPattern(root, flywheelRoot, {experimentId,metricWindow='first-7d',
  primaryMetric='three-second-hold',selectedVariantId,reviewerId,reviewerRole,reviewedAt,
  scienceReviewNote,comparisonSha256}) {
  const report=analyzeR811HookExperiment(flywheelRoot,{experimentId,metricWindow,primaryMetric})
  if(report.status!=='exploratory-observed-leader'||!names.includes(selectedVariantId)
     ||!clean(reviewerId)||!['owner','editorial-science-reviewer'].includes(reviewerRole)
     ||!clean(scienceReviewNote)||Number.isNaN(utcMs(reviewedAt))) {
    throw Error('R8.11 cannot promote a hook without complete measured cohort and explicit human science review')
  }
  if(sha(JSON.stringify(report))!==comparisonSha256)throw Error('R8.11 promotion approval does not bind the exact measured comparison')
  const selected=report.arms.find(x=>x.variantId===selectedVariantId)
  const approval={schemaVersion:'ths-evidencemotion-r811-human-hook-promotion-v1',
    experimentId,comparisonSha256,selectedVariantId,hookText:selected.hook,
    observedLeaderVariantId:report.observedLeaderVariantId,
    metricValue:selected.primaryValue,metricWindow,sourcePacketSha256:report.sourcePacketSha256,
    reviewerId,reviewerRole,reviewedAt,scienceReviewNote,
    humanReviewSelfAttested:true,automaticScienceRewrite:false,
    activation:'future-drafts-only',publicationAuthority:false}
  return immutable(path.join(path.resolve(root),'hook-promotions',experimentId,selectedVariantId+'-'+comparisonSha256+'.json'),approval)
}
export function getR811CadenceReport(flywheelRoot,{days=7,now=new Date(),targetVideosPerDay=2}={}) {
  if(!Number.isSafeInteger(days)||days<1||days>365||!Number.isSafeInteger(targetVideosPerDay)||targetVideosPerDay<1||targetVideosPerDay>10)throw Error('R8.11 cadence configuration out of bounds')
  const start=Number(new Date(now))-days*86400000
  const records=listFlywheelSnapshots(flywheelRoot,'first-7d')
  const recent=records.filter(v=>utcMs(v.publishedAt)>=start&&utcMs(v.publishedAt)<=Number(new Date(now)))
  const measured=recent.filter(v=>v.latestObservation).length
  const experiments=recent.filter(v=>v.r811?.experimentId).length
  const target=days*targetVideosPerDay
  const count=recent.length
  const completeness=count?Number((measured/count*100).toFixed(1)):null
  const experimentCoverage=count?Number((experiments/count*100).toFixed(1)):null
  const report=[
    '# EvidenceMotion R8.11 — Cadence and Learning',
    '',
    'Actual window: '+days+' days; local publication records only, not independent platform verification.',
    '',
    '- Published videos recorded: **'+count+' / '+target+' target**',
    '- Actual publishing rate: **'+(count/days).toFixed(2)+' per day**',
    '- Videos with first-week metrics: **'+measured+' / '+count+'**'+(completeness===null?' (no videos)':' ('+completeness+'%)'),
    '- Videos carrying one R8.11 deliberate experiment: **'+experiments+' / '+count+'**'+(experimentCoverage===null?'':' ('+experimentCoverage+'%)'),
    '- Real video quality: **Not inferred from these numbers**',
    '',
    '## Next smallest improvement',
    !count?'Publish and register the first governed video and its single experiment.':
      measured<count?'Record comparable metrics for the videos still missing their seven-day observations.':
      experiments<count?'Record one deliberate test in every future R8.11 video package.':
      count<target?'Improve governed production consistency without weakening QA to increase completed-video cadence.':
      'Compare at least three same-platform hook variants with genuinely comparable observation windows.',
    '',
    'This report does not authorize automatic publication, scientific rewrites or claims of a causal A/B winner.',
    '',
  ]
  return {markdown:report.join('\n'),metrics:{windowDays:days,targetVideos:target,
    registeredPublishedVideos:count,realPostsPerDay:Number((count/days).toFixed(3)),
    sevenDayMetricsCompletenessPercent:completeness,
    experimentCoveragePercent:experimentCoverage,verifiedScienceQuality:null}}
}
