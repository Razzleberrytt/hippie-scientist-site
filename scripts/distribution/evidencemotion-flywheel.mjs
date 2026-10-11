import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { verifyR810WordAlignment } from './r810-package-qa.mjs'
import { verifyR811Package } from './r811-package-qa.mjs'

const digest = (content) => crypto.createHash('sha256').update(content).digest('hex')
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const shaPattern = /^[a-f0-9]{64}$/i
const idPattern = /^[a-z0-9][a-z0-9_-]{2,79}$/
const dateMs = (value) => {
  const ms = Date.parse(value)
  if (!Number.isFinite(ms) || typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) throw Error('Flywheel requires an ISO-8601 UTC timestamp')
  return ms
}
const isoKey = (value) => new Date(dateMs(value)).toISOString().replace(/[-:.]/g, '')
const safeId = (value, label = 'video id') => {
  if (!idPattern.test(String(value ?? ''))) throw Error('Flywheel invalid ' + label)
  return value
}
const stable = (value) => JSON.stringify(value, null, 2) + '\n'
const immutable = (file, value) => {
  const body = stable(value)
  if (fs.existsSync(file)) {
    if (fs.readFileSync(file, 'utf8') === body) return { file, existing: true, sha256: digest(body) }
    throw Error('Flywheel append-only conflict: immutable file already exists: ' + path.basename(file))
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body, { encoding: 'utf8', flag: 'wx', mode: 0o444 })
  return { file, existing: false, sha256: digest(body) }
}
const json = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const files = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort() : []
const med = (values) => {
  const a = values.filter(Number.isFinite).sort((x,y)=>x-y)
  if (!a.length) return null
  const i = Math.floor(a.length/2)
  return a.length%2 ? a[i] : (a[i-1]+a[i])/2
}
const ratio = (a,b) => b>0 ? a/b : null
const rounded = (v) => v === null || v === undefined || !Number.isFinite(v) ? null : Number(v.toFixed(4))
const dateString = (date) => new Date(date).toISOString().slice(0,10)
const reserved = new Set(['template','manifests','observations','reports','videos','approvals'])

export function registerFlywheelVideo(root, record) {
  const id=safeId(record?.videoId)
  if (reserved.has(id)) throw Error('Flywheel video ID is reserved')
  if (!['tiktok','youtube','instagram','facebook'].includes(record?.platform)) throw Error('Flywheel supported platform required')
  for (const field of ['topic','hookTextFirst3Seconds','beatTemplateVersion','publishedUrl']) if(!clean(record?.[field])) throw Error('Flywheel missing '+field)
  if(!/^R8\.(?:0[5-9]|1[0-9])(?:-[a-z0-9.-]+)?$/.test(record.beatTemplateVersion))throw Error('Flywheel template version must identify the video release')
  dateMs(record.publishedAt)
  const url=new URL(record.publishedUrl)
  if(!['https:'].includes(url.protocol))throw Error('Flywheel publication URL must be HTTPS')
  if(!shaPattern.test(record.artifactSha256)||!shaPattern.test(record.productionManifestSha256))throw Error('Flywheel requires actual artifact/production manifest SHA-256 receipts')
  if(!['manual-owner-attested','provider-verified'].includes(record.publicationEvidence))throw Error('Flywheel requires explicit publication evidence confidence')
  if (record.r811 && (!/^[a-z0-9][a-z0-9_-]{2,79}$/.test(record.r811.experimentId)
      || !['a','b','c'].includes(record.r811.variantId)
      || !shaPattern.test(record.r811.sourcePacketSha256)
      || !shaPattern.test(record.r811.planSha256)
      || record.r811.methodology !== 'R8.10' || record.beatTemplateVersion !== 'R8.10')) {
    throw Error('R8.11 immutable flywheel identity must refer to an actual source-bound experiment arm')
  }
  const dir=path.join(path.resolve(root),'videos',id)
  const manifest={schemaVersion:'ths-evidencemotion-flywheel-manifest-v1',videoId:id,
    productionManifestSha256:record.productionManifestSha256,
    artifactSha256:record.artifactSha256,
    productionAuthority:'read-only-receipt-reference',
    note:'This manifest records published-asset identity; it never authorizes science or publication.'}
  // Never adopt an existing but different video identity.
  const ledger={schemaVersion:'ths-evidencemotion-flywheel-video-v1',videoId:id,topic:clean(record.topic),
    hookTextFirst3Seconds:clean(record.hookTextFirst3Seconds),beatTemplateVersion:record.beatTemplateVersion,
    platform:record.platform,publishedAt:record.publishedAt,publishedUrl:record.publishedUrl,
    publicationEvidence:record.publicationEvidence,r811:record.r811 || null,qualityAssessment:null,autoPublishAllowed:false}
  const oldManifest=path.join(dir,'MANIFEST.json'),oldLedger=path.join(dir,'performance-ledger.json')
  for(const [file,value] of [[oldManifest,manifest],[oldLedger,ledger]]) {
    if(fs.existsSync(file)&&fs.readFileSync(file,'utf8')!==stable(value))throw Error('Flywheel conflicting published-video registration is immutable')
  }
  const a=immutable(oldManifest,manifest),b=immutable(oldLedger,ledger)
  return {videoId:id,manifest:a,ledger:b}
}

export function getFlywheelVideo(root,id) {
  safeId(id)
  const dir=path.join(path.resolve(root),'videos',id)
  if(!fs.existsSync(path.join(dir,'performance-ledger.json'))||!fs.existsSync(path.join(dir,'MANIFEST.json')))throw Error('Flywheel unregistered video '+id)
  const ledger=json(path.join(dir,'performance-ledger.json')),manifest=json(path.join(dir,'MANIFEST.json'))
  if(ledger.videoId!==id||manifest.videoId!==id)throw Error('Flywheel video/manifest identity mismatch')
  const observations=files(path.join(dir,'observations')).map(name=>json(path.join(dir,'observations',name)))
    .sort((a,b)=>dateMs(a.observedAt)-dateMs(b.observedAt))
  return { ...ledger,manifest,observations }
}
export function appendFlywheelObservation(root, observation) {
  const id=safeId(observation?.videoId)
  const v=getFlywheelVideo(root,id)
  dateMs(observation.observedAt)
  if(dateMs(observation.observedAt)<dateMs(v.publishedAt))throw Error('Flywheel observation precedes publishing')
  const metricWindow=observation.metricWindow
  if(!['first-72h','first-7d','first-28d','lifetime'].includes(metricWindow))throw Error('Flywheel explicit comparison window required')
  // Entry time is not the measurement window. Historical screenshots may be
  // entered later; each snapshot records when its metrics actually ended.
  const metricsThroughAt = observation.metricsThroughAt || observation.observedAt
  const throughMs = dateMs(metricsThroughAt)
  if(throughMs>dateMs(observation.observedAt)||throughMs<dateMs(v.publishedAt))throw Error('Flywheel metric coverage must follow publication and cannot postdate collection')
  const expectedDays = {'first-72h':3,'first-7d':7,'first-28d':28}[metricWindow]
  if(expectedDays!==undefined) {
    const days=(throughMs-dateMs(v.publishedAt))/86400000
    const tolerance=expectedDays===28?2:expectedDays===7?1:0.5
    if(Math.abs(days-expectedDays)>tolerance)throw Error('Flywheel '+metricWindow+' snapshot must represent its actual elapsed performance window')
  }
  const providerReceiptSha256 = observation.source==='verified-provider-export' ? String(observation.providerReceiptSha256||'') : null
  if(observation.source==='verified-provider-export' && !shaPattern.test(providerReceiptSha256))throw Error('Flywheel provider-verified statistics require an actual export receipt SHA-256')
  if(observation.source!=='manual-owner-entry' && observation.source!=='verified-provider-export')throw Error('Flywheel requires explicit metrics provenance')
  const fields=['views','likes','followsAttributed']
  const metrics={}
  for(const field of fields){
    const value=observation.metrics?.[field]
    if(value===null||value===undefined){metrics[field]=null;continue}
    if(!Number.isSafeInteger(value)||value<0)throw Error('Flywheel '+field+' must be a nonnegative whole number or null')
    metrics[field]=value
  }
  for(const field of ['watchThroughPercent','averageRetentionPercent','threeSecondHoldPercent']){
    const value=observation.metrics?.[field]
    if(value===null||value===undefined){metrics[field]=null;continue}
    if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>100)throw Error('Flywheel '+field+' must be 0–100 or null')
    metrics[field]=value
  }
  if(metrics.followsAttributed!==null&&metrics.views!==null&&metrics.followsAttributed>metrics.views)throw Error('Flywheel attributed follows cannot exceed views')
  const previous=v.observations.filter(o=>o.metricWindow===metricWindow)
  if(previous.some(o=>o.observedAt===observation.observedAt)){
    const existing=previous.find(o=>o.observedAt===observation.observedAt)
    if(existing.source===observation.source && existing.metricsThroughAt===metricsThroughAt && existing.providerReceiptSha256===providerReceiptSha256
      && stable(existing.metrics)===stable(metrics)
      && existing.note===clean(observation.note))return {idempotent:true,videoId:id,observedAt:observation.observedAt}
    throw Error('Flywheel immutable observation timestamp already recorded with different metrics')
  }
  if(previous.length&&dateMs(observation.observedAt)<=Math.max(...previous.map(o=>dateMs(o.observedAt))))throw Error('Flywheel cannot backdate an already-observed window')
  const row={schemaVersion:'ths-evidencemotion-flywheel-observation-v1',videoId:id,
    observedAt:observation.observedAt,metricsThroughAt,metricWindow,source:observation.source,providerReceiptSha256,metrics,
    note:clean(observation.note),qualityAssessment:null}
  const name=isoKey(observation.observedAt)+'-'+metricWindow+'.json'
  const receipt=immutable(path.join(path.resolve(root),'videos',id,'observations',name),row)
  persistFlywheelHookPatterns(root,{metricWindow})
  persistFlywheelTopicSignals(root,{metricWindow})
  return receipt
}
export function getFlywheelSnapshot(root, videoId, metricWindow='first-7d') {
  const v=getFlywheelVideo(root,videoId)
  return {...v,metricWindow,latestObservation:v.observations.filter(o=>o.metricWindow===metricWindow).at(-1)||null}
}
export function listFlywheelSnapshots(root,metricWindow='first-7d') {
  const dir=path.join(path.resolve(root),'videos')
  if(!fs.existsSync(dir))return []
  return fs.readdirSync(dir,{withFileTypes:true}).filter(d=>d.isDirectory()&&idPattern.test(d.name))
    .map(d=>getFlywheelSnapshot(root,d.name,metricWindow))
    .sort((a,b)=>dateMs(b.publishedAt)-dateMs(a.publishedAt))
}
const eligible = (items) => items.filter(v=>v.latestObservation?.metrics?.views>=100)
const conversion = (v) => {
  const m=v.latestObservation?.metrics
  return m?.followsAttributed == null ? null : ratio(m.followsAttributed,m.views)
}
function quartile(values) {
  if(!values.length)return null
  const sorted=[...values].sort((a,b)=>a-b)
  return sorted[Math.max(0,Math.ceil(sorted.length*.75)-1)]
}
export function flywheelInsights(root,{metricWindow='first-7d',minimumComparable=3}={}) {
  const all=listFlywheelSnapshots(root,metricWindow)
  const byPlatform=eligible(all).reduce((acc,v)=>{(acc[v.platform]??=[]).push(v);return acc},{})
  const observations=eligible(all)
  const hooks=all.filter(v=>v.latestObservation).map(v=>{
    const m=v.latestObservation.metrics
    const peers=byPlatform[v.platform]||[]
    const comparable=peers.length>=minimumComparable && m.views>=100
    const viewCut=comparable?quartile(peers.map(p=>p.latestObservation.metrics.views)):null
    const conversionPeers=peers.filter(p=>conversion(p)!==null)
    const convCut=conversionPeers.length>=minimumComparable?quartile(conversionPeers.map(conversion)):null
    const viewWin=comparable&&m.views>=viewCut
    const followWin=convCut!==null&&conversion(v)!==null&&conversion(v)>=convCut
    const pattern=/\b(myth|false|true|fact)\b/i.test(v.hookTextFirst3Seconds)?'myth-or-fact':
      /[?]$/.test(v.hookTextFirst3Seconds)?'question':
      /\b(but|versus|vs|instead)\b/i.test(v.hookTextFirst3Seconds)?'contrast':'direct-explainer'
    return {videoId:v.videoId,topic:v.topic,platform:v.platform,templateVersion:v.beatTemplateVersion,
      pattern,templateText:v.hookTextFirst3Seconds,views:m.views,
      followsAttributed:m.followsAttributed,followConversion:rounded(conversion(v)),
      winning: Boolean(viewWin||followWin),signal:!comparable?'insufficient comparable data':'observed-top-quartile',
      observationWindow:metricWindow,observationAt:v.latestObservation.observedAt,
      reusePolicy:'editorial science approval required for factual adaptation'}
  }).sort((a,b)=>(Number(b.winning)-Number(a.winning))||(b.views??0)-(a.views??0))
  const topics=[]
  const grouped=new Map()
  for(const v of observations){const k=v.platform+'|'+v.topic.toLowerCase();(grouped.get(k)||grouped.set(k,[]).get(k)).push(v)}
  for(const group of grouped.values()){
    const platform=group[0].platform
    const peers=byPlatform[platform]||[]
    const baseline=peers.length>=minimumComparable?med(peers.map(p=>p.latestObservation.metrics.views)):null
    const topicViews=med(group.map(v=>v.latestObservation.metrics.views))
    const lift=baseline===null?null:rounded(ratio(topicViews,baseline))
    const direction=lift===null?'insufficient-baseline':lift>=1.3?'follow-up-candidate':lift<=0.7?'deprioritize-not-delete':'hold'
    topics.push({topic:group[0].topic,platform,videoIds:group.map(v=>v.videoId),medianViews:topicViews,
      baselineMedianViews:baseline,viewLiftRatio:lift,direction,
      followUpFormats:direction==='follow-up-candidate'?['deeper dive','myth vs fact','part 2']:[],
      reason:lift===null?'Fewer than '+minimumComparable+' comparable videos in this platform/window':
        'Observed topic median is '+rounded(lift*100)+'% of the platform '+metricWindow+' median; no scientific-quality inference'})
  }
  topics.sort((a,b)=>(b.viewLiftRatio??-1)-(a.viewLiftRatio??-1))
  return {generatedFrom:'immutable-local-manual-ledger',metricWindow,registeredVideos:all.length,
    observedVideos:all.filter(v=>v.latestObservation).length,
    qualifyingVideos:observations.length,hookPatterns:hooks,topics,
    caveats:['Performance ≠ scientific quality.','The ledger cannot authorize publication or scientific rewriting.',
      'Top-quartile means highest observed rank within a comparable platform/window, not statistical significance.',
      'No provider verification is implied for manually entered metrics.']}
}
// Persistent, immutable hook snapshots: future performance changes create new
// observations and new pattern revisions rather than rewriting old recommendations.
export function persistFlywheelHookPatterns(root,{metricWindow='first-7d'}={}) {
  const patterns=flywheelInsights(root,{metricWindow}).hookPatterns
  const saved=[]
  for(const pattern of patterns){
    const body={schemaVersion:'ths-evidencemotion-hook-pattern-v1',...pattern,
      qualityAssessment:null,publishingAuthority:false,automaticScientificCopy:false}
    const signature=digest(stable(body)).slice(0,16)
    const name=isoKey(pattern.observationAt)+'-'+metricWindow+'-'+signature+'.json'
    saved.push(immutable(path.join(path.resolve(root),'hook-patterns',pattern.videoId,name),body))
  }
  return saved
}

// Every observed topic recommendation is a dated, immutable explanation.
// A later baseline shift creates a new receipt; historical deprioritizations
// remain visible rather than silently changing along with the current ranking.
export function persistFlywheelTopicSignals(root,{metricWindow='first-7d'}={}) {
  const topics=flywheelInsights(root,{metricWindow}).topics
  return topics.map(topic=>{
    const key=topic.topic.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60).replace(/^-|-$/g,'')||'topic'
    const signature=digest(stable(topic)).slice(0,16)
    const body={schemaVersion:'ths-evidencemotion-topic-signal-v1',...topic,
      metricWindow,learningOnly:true,scienceJudgment:false,autoPublishAllowed:false}
    return immutable(path.join(path.resolve(root),'topic-signals',key,metricWindow+'-'+signature+'.json'),body)
  })
}

export function registerFlywheelFromPackage(root, input) {
  const dir=path.resolve(input?.packageDir||'')
  const manifestFile=path.join(dir,'video-asset-manifest.json')
  const mp4File=path.join(dir,'short-video.mp4')
  const receiptFile=path.join(dir,'short-video.mp4.receipt.json')
  const qaFile=path.join(dir,'r805-master-qa.receipt.json')
  const mb=fs.readFileSync(manifestFile)
  const manifest=JSON.parse(mb.toString('utf8'))
  const bytes=fs.readFileSync(mp4File),rec=json(receiptFile),qa=json(qaFile)
  const artifactSha256=digest(bytes)
  if(rec.output?.sha256!==artifactSha256 || rec.parentManifestSha256!==digest(mb)
    || qa.exactArtifactReviewed!==true || qa.artifact?.sha256!==artifactSha256
    || qa.parentManifestSha256!==digest(mb))throw Error('Flywheel source video is not an exact reviewed encoded master')
  const creativeMethodRelease=manifest.creativeMethodRelease
  if(!/^R8\./.test(String(creativeMethodRelease||'')))throw Error('Flywheel package missing creative release version')
  // The first three seconds must come from genuine word timestamps, never guessed.
  // For an older non-aligned R8.09 release, require explicit owner-entered hook text.
  let hook=clean(input.hookTextFirst3Seconds)
  if(creativeMethodRelease==='R8.10'){
    const aligned=verifyR810WordAlignment(dir)
    if(!hook)hook=(aligned.receipt.words||[]).filter(w=>Number(w.start)<3).map(w=>clean(w.word)).join(' ')
  }
  if(!hook)throw Error('Flywheel requires the actual first-three-second hook')
  const r811 = manifest.productionSystemRelease === 'R8.11'
    ? (() => {
      const proof = verifyR811Package(dir, { manifest })
      const plan = json(path.join(dir, manifest.r811Plan.file))
      if (!proof.oneExperiment || manifest.r811Experiment?.planSha256 !== proof.planSha256
          || plan.chosenHookId !== manifest.r811Experiment?.chosenHookId) {
        throw Error('Flywheel cannot register R8.11 without the actual approved experiment plan')
      }
      return { experimentId:proof.experimentId,variantId:plan.chosenHookId,
        planSha256:proof.planSha256,sourcePacketSha256:plan.sourcePacketSha256,
        methodology:'R8.10' }
    })() : null
  return registerFlywheelVideo(root,{...input,hookTextFirst3Seconds:hook,
    beatTemplateVersion:creativeMethodRelease,artifactSha256,
    productionManifestSha256:digest(mb),r811})
}

export function renderFlywheelLearningReport(root,{metricWindow='first-7d',last=10}={}) {
  const ins=flywheelInsights(root,{metricWindow})
  const videos=listFlywheelSnapshots(root,metricWindow).slice(0,last)
  const fmt=(value)=>value===null||value===undefined?'Unknown':String(value)
  const out=['# EvidenceMotion Flywheel — Learning Report','',
    'Window: **'+metricWindow+'** | Last '+last+' published videos | Report is reproducible from local immutable entries.','',
    '**Published records:** '+ins.registeredVideos+'  ·  **Metrics submitted:** '+ins.observedVideos+
    '  ·  **Comparable (≥100 views):** '+ins.qualifyingVideos,'',
    '## Last '+last+' videos',
    '| Published | Topic | Hook | Views | Follows attributed | Watch-through |',
    '|---|---|---|---:|---:|---:|']
  for(const v of videos){
    const m=v.latestObservation?.metrics
    out.push('| '+dateString(v.publishedAt)+' | '+v.topic.replace(/\|/g,'/')+' | '+v.hookTextFirst3Seconds.replace(/\|/g,'/').slice(0,88)+
      ' | '+fmt(m?.views)+' | '+fmt(m?.followsAttributed)+' | '+(m?.watchThroughPercent==null?'Unknown':m.watchThroughPercent+'%')+' |')
  }
  out.push('','## Hook patterns (reusable only after factual review)')
  if(!ins.hookPatterns.length)out.push('No observations submitted yet.')
  for(const h of ins.hookPatterns.slice(0,10)){
    out.push('- **'+h.pattern+'** · '+h.videoId+' · '+fmt(h.views)+' views · '+
      (h.followConversion==null?'conversion Unknown':(h.followConversion*100).toFixed(2)+'% attributed follow rate')+
      ' · '+(h.winning?'top-quartile observed':'candidate / '+h.signal)+' — '+h.templateText)
  }
  out.push('','## Topics: repeat, explore, or deprioritize')
  if(!ins.topics.length)out.push('No comparable topics to score yet.')
  for(const t of ins.topics)out.push('- **'+t.topic+'** · '+t.direction+' · '+fmt(t.viewLiftRatio)+'× baseline. '+t.reason+
    (t.followUpFormats.length?' · Possible formats: '+t.followUpFormats.join(', '):''))
  out.push('','## What to repeat / what to drop')
  const repeat=ins.hookPatterns.filter(h=>h.winning).slice(0,3)
  out.push(repeat.length ? 'Repeat for **editorial consideration**: '+repeat.map(h=>h.pattern+' ('+h.videoId+')').join('; ') :
    'No validated repeat signal yet; capture at least three comparable results before selecting a winner.')
  const deprioritize=ins.topics.filter(t=>t.direction==='deprioritize-not-delete')
  out.push(deprioritize.length?'Deprioritize, never delete: '+deprioritize.map(t=>t.topic+' ('+t.viewLiftRatio+'×)').join('; '):
    'Do not drop a topic without a comparable underperformance signal.')
  out.push('','## Approval boundary','Stats are **not** efficacy evidence, automated scientific copy, evidence grades, or upload permission.',
    'Templates remain unchanged until an independently recorded owner/editorial approval.','')
  return out.join('\n')
}
export function proposeFlywheelTemplate(root,input) {
  const id=safeId(input?.proposalId,'proposal ID')
  if(!/^R8\.\d+(?:-[a-z0-9.-]+)?$/.test(input.fromVersion)||!/^R8\.\d+(?:-[a-z0-9.-]+)?$/.test(input.toVersion)||input.fromVersion===input.toVersion)throw Error('Flywheel requires distinct lineage versions')
  if(!['hook-structure','beat-order','caption-style','visual-layout'].includes(input.changeType))throw Error('Flywheel unsupported template change')
  if(!clean(input.description)||!clean(input.scienceBoundary))throw Error('Flywheel proposal needs description and science boundary')
  const metricWindow=input.metricWindow||'first-7d'
  const all=listFlywheelSnapshots(root,metricWindow)
  const group=(ids,label)=>{
    if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw Error('Flywheel needs nonempty unique '+label+' cohort')
    return ids.map(id=>{
      const v=all.find(x=>x.videoId===id)
      if(!v||!v.latestObservation||v.latestObservation.metrics.views===null)throw Error('Flywheel missing exact observed video '+id)
      return v
    })
  }
  const before=group(input.beforeVideoIds,'before'),after=group(input.afterVideoIds,'after')
  if([...before,...after].some(v=>v.platform!==before[0].platform)||before.some(v=>v.metricWindow!==metricWindow))throw Error('Flywheel cohorts must match platform and observation window')
  if(new Set([...before,...after].map(v=>v.videoId)).size!==before.length+after.length)throw Error('Flywheel before/after cohorts overlap')
  const measure=(group)=>med(group.map(v=>v.latestObservation.metrics.views))
  const beforeMedian=measure(before),afterMedian=measure(after),viewLiftRatio=ratio(afterMedian,beforeMedian)
  if(viewLiftRatio===null)throw Error('Flywheel view baseline is zero; cannot compute delta')
  const conversions=(group)=>group.filter(v=>conversion(v)!==null).map(conversion)
  const beforeConv=med(conversions(before)),afterConv=med(conversions(after))
  const report={beforeMedianViews:beforeMedian,afterMedianViews:afterMedian,
    viewLiftRatio:rounded(viewLiftRatio),viewDeltaPercent:rounded((viewLiftRatio-1)*100),
    beforeMedianFollowConversion:rounded(beforeConv),afterMedianFollowConversion:rounded(afterConv),
    followConversionDeltaPercentagePoints:beforeConv===null||afterConv===null?null:rounded((afterConv-beforeConv)*100),
    cohortSizes:{before:before.length,after:after.length},
    interpretation:'Exploratory association only; observational metrics do not prove template causality.'}
  const proposal={schemaVersion:'ths-evidencemotion-flywheel-template-proposal-v1',
    proposalId:id,fromVersion:input.fromVersion,toVersion:input.toVersion,changeType:input.changeType,
    description:clean(input.description),scienceBoundary:clean(input.scienceBoundary),
    metricWindow,platform:before[0].platform,beforeVideoIds:before.map(v=>v.videoId),
    afterVideoIds:after.map(v=>v.videoId),data:report,approvalRequired:true,
    appliesToInFlight:false,status:'proposed',autoApplyAllowed:false}
  return immutable(path.join(path.resolve(root),'template-proposals',id+'.json'),proposal)
}
export function approveFlywheelTemplate(root,input) {
  const id=safeId(input?.proposalId,'proposal ID')
  const proposalFile=path.join(path.resolve(root),'template-proposals',id+'.json')
  const original=fs.readFileSync(proposalFile)
  const p=JSON.parse(original.toString())
  if(!clean(input.reviewerId)||!['owner','editorial-science-reviewer'].includes(input.reviewerRole)||
      input.decision!=='approved'||!clean(input.scienceReviewNote))throw Error('Flywheel independent owner/editorial approval required; no automatic approval')
  const receipt={schemaVersion:'ths-evidencemotion-flywheel-human-approval-v1',proposalId:id,
    proposalSha256:digest(original),reviewerId:clean(input.reviewerId),
    reviewerRole:input.reviewerRole,decision:input.decision,scienceReviewNote:clean(input.scienceReviewNote),
    approvedAt:input.approvedAt,provenance:'owner-attested; identity not cryptographically verified',
    appliesToInFlight:false}
  dateMs(receipt.approvedAt)
  return immutable(path.join(path.resolve(root),'template-approvals',id+'.json'),receipt)
}
export function versionFlywheelTemplate(root,proposalId) {
  const id=safeId(proposalId,'proposal ID')
  const pfile=path.join(path.resolve(root),'template-proposals',id+'.json')
  const afile=path.join(path.resolve(root),'template-approvals',id+'.json')
  const pb=fs.readFileSync(pfile),ab=fs.readFileSync(afile)
  const p=JSON.parse(pb.toString()),a=JSON.parse(ab.toString())
  if(a.decision!=='approved'||a.proposalSha256!==digest(pb)||a.proposalId!==p.proposalId)throw Error('Flywheel template approval does not bind immutable source proposal')
  const version={schemaVersion:'ths-evidencemotion-flywheel-template-version-v1',
    version:p.toVersion,parentVersion:p.fromVersion,changeType:p.changeType,changeDescription:p.description,
    proposalId:id,proposalSha256:digest(pb),approvalSha256:digest(ab),
    measuredDelta:p.data,scienceBoundary:p.scienceBoundary,
    activation:'future-videos-only',autoDeploy:false,publicationAuthority:false}
  return immutable(path.join(path.resolve(root),'template-versions',p.toVersion+'.json'),version)
}
