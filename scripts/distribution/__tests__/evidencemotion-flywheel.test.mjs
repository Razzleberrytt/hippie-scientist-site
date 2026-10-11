import { describe,it,expect,afterEach } from 'vitest'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  registerFlywheelVideo,appendFlywheelObservation,getFlywheelVideo,flywheelInsights,
  renderFlywheelLearningReport,proposeFlywheelTemplate,approveFlywheelTemplate,versionFlywheelTemplate,
} from '../evidencemotion-flywheel.mjs'

let roots=[]
const setup=()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'ths-flywheel-'));roots.push(root);return root}
afterEach(()=>{for(const dir of roots)fs.rmSync(dir,{recursive:true,force:true});roots=[]})
const sha=(x)=>crypto.createHash('sha256').update(x).digest('hex')
const mkVideo=(i,version='R8.10')=>({
  videoId:'published-video-'+i,platform:'tiktok',topic:['Kava risks','Kava risks','Mitragynine evidence'][i-1],
  hookTextFirst3Seconds:['What does the evidence say?','Myth or fact: safer means safe?','Two forms, different risks'][i-1],
  beatTemplateVersion:version,publishedAt:'2026-10-01T12:00:00Z',
  publishedUrl:'https://www.tiktok.com/@thehippiescientist/video/'+(10000000+i),
  artifactSha256:sha('video'+i),productionManifestSha256:sha('manifest'+i),
  publicationEvidence:'manual-owner-attested',
})
const obs=(i,views,follows=null)=>({
  videoId:'published-video-'+i,observedAt:'2026-10-08T12:00:00Z',
  metricWindow:'first-7d',source:'manual-owner-entry',
  metrics:{views,likes:Math.round(views/10),followsAttributed:follows,
    watchThroughPercent:null,averageRetentionPercent:null},
  note:'Manual demo fixture only, not published-user evidence',
})
function three(root){
  for(let i=1;i<=3;i++)registerFlywheelVideo(root,mkVideo(i))
  appendFlywheelObservation(root,obs(1,100,2))
  appendFlywheelObservation(root,obs(2,300,15))
  appendFlywheelObservation(root,obs(3,1000,60))
}
describe('EvidenceMotion append-only, manual-first learning flywheel',()=>{
  it('registers three published-example videos with one immutable identity ledger and three metric-sourced hook patterns',()=>{
    const root=setup();three(root)
    const first=getFlywheelVideo(root,'published-video-1')
    expect(fs.existsSync(path.join(root,'videos','published-video-1','MANIFEST.json'))).toBe(true)
    expect(fs.existsSync(path.join(root,'videos','published-video-1','performance-ledger.json'))).toBe(true)
    expect(first.observations).toHaveLength(1)
    const report=flywheelInsights(root)
    expect(report.registeredVideos).toBe(3)
    expect(report.hookPatterns).toHaveLength(3)
    expect(report.hookPatterns.filter(x=>x.winning).length).toBeGreaterThanOrEqual(1)
    expect(report.hookPatterns[0].followConversion).not.toBeNull()
    expect(report.topics.some(t=>t.direction==='follow-up-candidate')).toBe(true)
    const readable=renderFlywheelLearningReport(root)
    expect(readable).toContain('Last 10 videos')
    expect(readable).toContain('What to repeat / what to drop')
    expect(readable).toContain('Stats are **not** efficacy evidence')
  })
  it('does not overwrite immutable publication identity and refuses a changed observation on the same timestamp',()=>{
    const root=setup();registerFlywheelVideo(root,mkVideo(1))
    const first=obs(1,100,2)
    const saved=appendFlywheelObservation(root,first)
    expect(appendFlywheelObservation(root,first).idempotent).toBe(true)
    expect(()=>appendFlywheelObservation(root,{...first,metrics:{...first.metrics,views:200}})).toThrow(/append-only|immutable observation/)
    expect(()=>registerFlywheelVideo(root,{...mkVideo(1),topic:'rewritten topic'})).toThrow(/immutable/)
    expect(fs.readFileSync(saved.file,'utf8')).toContain('"views": 100')
  })
  it('keeps Unknown as null; never fabricates zeros or follow-through rates',()=>{
    const root=setup();registerFlywheelVideo(root,mkVideo(1))
    appendFlywheelObservation(root,obs(1,200))
    const data=flywheelInsights(root)
    expect(data.hookPatterns[0].followsAttributed).toBeNull()
    expect(data.hookPatterns[0].followConversion).toBeNull()
    expect(data.hookPatterns[0].winning).toBe(false)
    expect(data.hookPatterns[0].signal).toBe('insufficient comparable data')
    expect(renderFlywheelLearningReport(root)).toContain('Unknown')
  })
  it('creates a measured proposal, owner approval and immutable future-only template lineage',()=>{
    const root=setup();three(root)
    const request={
      proposalId:'follow-up-hook-001',fromVersion:'R8.10',toVersion:'R8.11',changeType:'hook-structure',
      description:'Test an evidence-first question opening instead of a generic disclaimer',
      scienceBoundary:'Do not alter claims, evidence strength or safety qualifiers',
      metricWindow:'first-7d',beforeVideoIds:['published-video-1'],afterVideoIds:['published-video-3'],
    }
    const proposed=proposeFlywheelTemplate(root,request)
    const proposal=JSON.parse(fs.readFileSync(proposed.file,'utf8'))
    expect(proposal.data.viewDeltaPercent).toBe(900)
    expect(proposal.data.cohortSizes).toEqual({before:1,after:1})
    expect(proposal.status).toBe('proposed')
    expect(()=>versionFlywheelTemplate(root,request.proposalId)).toThrow()
    expect(()=>approveFlywheelTemplate(root,{proposalId:request.proposalId,reviewerId:'self',reviewerRole:'owner',decision:'approved',approvedAt:'2026-10-09T14:00:00Z'})).toThrow()
    approveFlywheelTemplate(root,{proposalId:request.proposalId,reviewerId:'site-owner',reviewerRole:'owner',
      decision:'approved',scienceReviewNote:'Experimental hook only; no scientific text changes',
      approvedAt:'2026-10-09T14:00:00Z'})
    const version=versionFlywheelTemplate(root,request.proposalId)
    const data=JSON.parse(fs.readFileSync(version.file,'utf8'))
    expect(data.parentVersion).toBe('R8.10')
    expect(data.activation).toBe('future-videos-only')
    expect(data.autoDeploy).toBe(false)
    expect(()=>proposeFlywheelTemplate(root,{...request,description:'quietly changed'})).toThrow(/immutable/)
  })
  it('does not mistake lifetime counts for comparable seven-day growth',()=>{
    const root=setup()
    registerFlywheelVideo(root,mkVideo(1))
    const late={...obs(1,500,5),observedAt:'2026-10-20T12:00:00Z'}
    expect(()=>appendFlywheelObservation(root,late)).toThrow(/actual elapsed performance window/)
    const historical={...late,metricsThroughAt:'2026-10-08T12:00:00Z'}
    expect(appendFlywheelObservation(root,historical).existing).toBe(false)
    const original=getFlywheelVideo(root,'published-video-1').observations[0]
    expect(original.metricsThroughAt).toBe('2026-10-08T12:00:00Z')
    expect(original.observedAt).toBe('2026-10-20T12:00:00Z')
  })
  it('does not claim a provider-verified metric without export receipt proof',()=>{
    const root=setup()
    registerFlywheelVideo(root,mkVideo(1))
    const unverified={...obs(1,400,10),source:'verified-provider-export'}
    expect(()=>appendFlywheelObservation(root,unverified)).toThrow(/actual export receipt SHA-256/)
    const verified={...unverified,providerReceiptSha256:sha('genuine-export-content-test-fixture')}
    expect(appendFlywheelObservation(root,verified).existing).toBe(false)
  })
  it('refuses fabricated or unbounded metrics and an unproven publication identity',()=>{
    const root=setup()
    expect(()=>registerFlywheelVideo(root,{...mkVideo(1),artifactSha256:'unknown'})).toThrow()
    registerFlywheelVideo(root,mkVideo(1))
    expect(()=>appendFlywheelObservation(root,{...obs(1,200),metrics:{views:200,likes:1,followsAttributed:5,watchThroughPercent:120}})).toThrow(/0–100/)
    expect(()=>appendFlywheelObservation(root,{...obs(1,200),metrics:{views:200,likes:1,followsAttributed:500}})).toThrow(/cannot exceed views/)
    expect(()=>appendFlywheelObservation(root,{...obs(1,200),observedAt:'2026-09-29T12:00:00Z'})).toThrow(/precedes publishing/)
  })
})
