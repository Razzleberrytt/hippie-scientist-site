import { describe, it, expect, afterEach } from 'vitest'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { validateR811Plan, buildR811Receipt } from '../r811-creative-operations.mjs'
import { buildR811DraftAssets, verifyR811DraftAssets } from '../r811-derived-assets.mjs'
import { registerR811Asset, loadR811Asset, r811AssetReuseReport } from '../r811-asset-library.mjs'
import { registerFlywheelVideo, appendFlywheelObservation, proposeFlywheelTemplate, approveFlywheelTemplate } from '../evidencemotion-flywheel.mjs'
import { analyzeR811HookExperiment, snapshotR811Experiment, approveR811HookPattern, getR811CadenceReport } from '../r811-learning-operations.mjs'
import { registerR811ComponentVersion, getR811ComponentLineage } from '../r811-template-lineage.mjs'

const sha=(v)=>crypto.createHash('sha256').update(v).digest('hex')
const source=sha('reviewed research source packet fixture')
const approved={status:'approved',governedPlanSha256:sha('governed R8.10 narrative plan fixture')}
function fixture(){
  const script=[
    ['a','What does kava research really show?'],
    ['b','Can kava benefits hide real risks?'],
    ['c','Three kava facts with important limits.'],
  ]
  return {
    schemaVersion:'ths-evidencemotion-r811-plan-v1',productionSystemRelease:'R8.11',
    creativeMethodRelease:'R8.10',videoId:'kava-experiment-01',sourcePacketSha256:source,
    r810GovernedPlanSha256:approved.governedPlanSha256,
    sourceReview:{status:'approved',sourcePacketSha256:source,reviewerId:'scientific-editor',reviewedAt:'2026-10-10'},
    experiment:{id:'kava-hook-experiment',variable:'hook-structure',
      primaryMetric:'three-second-hold',hypothesis:'An evidence question improves 3-second hold.',
      baseline:'Current question hook has unmeasured hold.',expectedDirection:'increase'},
    componentVersions:{hook:'hook-v3',beatSkeleton:'beat-skeleton-v2',
      captionStyle:'caption-style-v3',actorStyle:'actor-style-v1'},
    hookVariants:script.map(([id,narration])=>({
      id,narration,screenText:narration,durationSeconds:2.9,
      claimIds:['kava-reviewed-claim'],sourceIds:['PMID:12345678'],
      reviewReceipt:{decision:'approved',reviewerRole:'editorial-science-reviewer',
        reviewerId:'scientific-editor',reviewedAt:'2026-10-10',
        sourcePacketSha256:source,narrationSha256:sha(narration),overlaySha256:sha(narration)},
    })),
    chosenHookId:'a',abTest:{autoPublishAllowed:false,autoChooseWinner:false,
      comparisonPolicy:'same-platform-same-window',minimumPostSpacingHours:4},
    zeroCost:{mode:'offline-no-paid-credits',accountRequired:false,meteredCreditsAllowed:false,
      hostedGenerationAllowed:false,autoPublishingAllowed:false,dependencies:[{provider:'ffmpeg',billable:false,networkRequired:false}]},
    publicationPolicy:'every-output-independent-human-QA',
    templatePolicy:'approval-only-future-videos',
    provenanceCard:{sourcePacketSha256:source,claimsVerifiedAt:'2026-10-10',
      canonicalSourceUrl:'https://thehippiescientist.net/herbs/kava',
      badge:'Source-linked, reviewed as of'},
  }
}
let dirs=[]
const tmp=()=>{const d=fs.mkdtempSync(path.join(os.tmpdir(),'ths-r811-test-'));dirs.push(d);return d}
afterEach(()=>{for(const d of dirs)fs.rmSync(d,{recursive:true,force:true});dirs=[]})
function three(root){
  const labels=['a','b','c'],published=['08','12','16'],held=[16,24,38]
  for(let i=0;i<3;i++){
    const id='experiment-video-'+labels[i]
    registerFlywheelVideo(root,{videoId:id,platform:'tiktok',topic:'Kava safety',
      hookTextFirst3Seconds:fixture().hookVariants[i].narration,
      beatTemplateVersion:'R8.10',publishedAt:'2026-10-01T'+published[i]+':00:00Z',
      publishedUrl:'https://www.tiktok.com/@testing/video/12345'+i,
      publicationEvidence:'manual-owner-attested',
      artifactSha256:sha('mp4-'+i),productionManifestSha256:sha('manifest-'+i),
      r811:{experimentId:'kava-hook-experiment',variantId:labels[i],
        sourcePacketSha256:source,planSha256:sha('one-approved-experiment-plan'),methodology:'R8.10'}})
    appendFlywheelObservation(root,{videoId:id,observedAt:'2026-10-08T'+published[i]+':00:00Z',
      metricWindow:'first-7d',source:'manual-owner-entry',
      metrics:{views:200+i*100,likes:25+i*10,followsAttributed:2+i*3,
        watchThroughPercent:30+i*2,threeSecondHoldPercent:held[i],averageRetentionPercent:null},
      note:'Synthetic fixture, not actual TikTok proof'})
  }
}
describe('EvidenceMotion R8.11 compounding production gates',()=>{
  it('requires exactly one experiment, 3 scientifically approved hooks, pinned templates and zero credits',()=>{
    expect(validateR811Plan(fixture(),{creativeR810:approved})).toEqual([])
    const receipt=buildR811Receipt(fixture(),{creativeR810:approved})
    expect(receipt.release).toBe('R8.11')
    expect(receipt.experimentId).toBe('kava-hook-experiment')
    expect(receipt.variantIds).toEqual(['a','b','c'])
    expect(receipt.publishingPermission).toBe(false)
  })
  it('rejects overlapping experiments, invented source provenance and premium generation',()=>{
    const x=fixture();x.experiment.secondaryExperiments=[{variable:'beat-order'}]
    expect(validateR811Plan(x,{creativeR810:approved}).join('|')).toMatch(/exactly one/)
    const y=fixture();y.zeroCost.dependencies=[{provider:'paid-tts',billable:true,networkRequired:true}]
    expect(validateR811Plan(y,{creativeR810:approved}).join('|')).toMatch(/paid|hosted/)
    const z=fixture();z.provenanceCard.claimsVerifiedAt='2026-10-11'
    expect(validateR811Plan(z,{creativeR810:approved}).join('|')).toMatch(/later than the actual source review/)
    const p=fixture();p.r810GovernedPlanSha256='1'.repeat(64)
    expect(validateR811Plan(p,{creativeR810:approved}).join('|')).toMatch(/inherit the exact/)
  })
  it('rejects unsupported 3s claims, unsafe hook overlay and self-approved review',()=>{
    const p=fixture();p.hookVariants[0].narration='Kava may be useful.'
    p.hookVariants[0].screenText='Kava is useful.'
    p.hookVariants[0].reviewReceipt.narrationSha256=sha('Kava may be useful.')
    p.hookVariants[0].reviewReceipt.overlaySha256=sha('Kava is useful.')
    expect(validateR811Plan(p,{creativeR810:approved}).join('|')).toMatch(/drops spoken qualifier/)
    const q=fixture();q.hookVariants[1].durationSeconds=5
    expect(validateR811Plan(q,{creativeR810:approved}).join('|')).toMatch(/first three seconds/)
    const r=fixture();r.hookVariants[0].reviewReceipt.reviewerRole='ai-auto'
    expect(validateR811Plan(r,{creativeR810:approved}).join('|')).toMatch(/named scientific/)
  })
  it('renders 3 visually different draft intro assets and exact evidence-as-of previews without publishing rights',()=>{
    const dir=tmp(),plan=fixture()
    const previews=buildR811DraftAssets({packageDir:dir,plan,creativeR810:approved,
      firstHookScene:{beatId:'intro',role:'hook',onScreenText:plan.hookVariants[0].screenText,
        voiceover:plan.hookVariants[0].narration,start:0,speechEnd:2.9,end:3,motionType:'highlight'},
      renderScene:(scene)=>({svg:'<svg xmlns="http://www.w3.org/2000/svg"><text>'+scene.onScreenText+'</text></svg>'}),
      sourceUrl:plan.provenanceCard.canonicalSourceUrl,
      contentHash:source,disclosure:'Educational only'})
    expect(previews.previewAssets).toHaveLength(3)
    expect(new Set(previews.previewAssets.map(x=>x.sha256)).size).toBe(3)
    expect(fs.readFileSync(path.join(dir,'r811-evidence-cover-preview.svg'),'utf8')).toContain('2026-10-10')
    const manifest={productionSystemRelease:'R8.11',r811Experiment:previews.receipt,
      r811Derivatives:{...previews.workOrderFile,planSha256:previews.receipt.planSha256}}
    expect(verifyR811DraftAssets(dir,manifest).totalAssets).toBe(5)
    expect(previews.outputs.filter(x=>x.type.startsWith('hook-variant')).every(x=>x.needsIndependentAudioAndMasterQa)).toBe(true)
  })
  it('never promotes a synthetic A/B leader without explicit reviewed choice and a bound report',()=>{
    const root=tmp();three(root)
    const report=analyzeR811HookExperiment(root,{experimentId:'kava-hook-experiment'})
    expect(report.status).toBe('exploratory-observed-leader')
    expect(report.observedLeaderVariantId).toBe('c')
    expect(report.approvedPlanSha256).toBe(sha('one-approved-experiment-plan'))
    expect(report.causalClaimAllowed).toBe(false)
    expect(snapshotR811Experiment(root,root,{experimentId:'kava-hook-experiment'}).existing).toBe(false)
    expect(()=>approveR811HookPattern(root,root,{experimentId:'kava-hook-experiment',selectedVariantId:'c',reviewerId:'owner',
      reviewerRole:'owner',reviewedAt:'2026-10-09T10:00:00Z',scienceReviewNote:'Preclinical-only',
      comparisonSha256:'0'.repeat(64)})).toThrow(/does not bind/)
    const approvedPattern=approveR811HookPattern(root,root,{experimentId:'kava-hook-experiment',
      selectedVariantId:'c',reviewerId:'site-owner',reviewerRole:'owner',
      reviewedAt:'2026-10-09T10:00:00Z',scienceReviewNote:'Retain original scientific claim scope',
      comparisonSha256:sha(JSON.stringify(report))})
    expect(fs.readFileSync(approvedPattern.file,'utf8')).toContain('future-drafts-only')
    expect(getR811CadenceReport(root,{days:9,now:new Date('2026-10-09T12:00:00Z')}).metrics.registeredPublishedVideos).toBe(3)
  })
  it('persists measured approved component version lineage without touching old templates',()=>{
    const root=tmp();three(root)
    proposeFlywheelTemplate(root,{proposalId:'hook-trial-811',fromVersion:'R8.10',toVersion:'R8.11',
      changeType:'hook-structure',description:'Try evidence-first questions',
      scienceBoundary:'Keep the same evidence qualifiers and approvals',
      metricWindow:'first-7d',beforeVideoIds:['experiment-video-a'],
      afterVideoIds:['experiment-video-c']})
    approveFlywheelTemplate(root,{proposalId:'hook-trial-811',
      reviewerId:'owner',reviewerRole:'owner',decision:'approved',
      scienceReviewNote:'Only test first-seconds hook; do not rewrite health claims',
      approvedAt:'2026-10-09T10:00:00Z'})
    const written=registerR811ComponentVersion(root,{proposalId:'hook-trial-811',kind:'hook',
      fromComponentVersion:'hook-v2',toComponentVersion:'hook-v3',
      previousTemplateContentSha256:sha('old'),newTemplateContentSha256:sha('new')})
    expect(written.existing).toBe(false)
    expect(getR811ComponentLineage(root,'hook')[0]).toMatchObject({parentVersion:'hook-v2',
      version:'hook-v3',activation:'future-videos-only',autoApply:false})
  })
  it('catalogs neutral SVGs but prohibits silent science-context reuse',()=>{
    const root=tmp()
    const svg='<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L3 3"/></svg>'
    const asset=registerR811Asset(root,{content:svg,type:'vector-actor',
      name:'research-orb',version:'actor-v1',license:'original-owned',
      creator:'EvidenceMotion local renderer',reusableAcrossTopics:true,
      altText:'Neutral animated evidence orb',createdFromVideoId:'source-video-01'})
    expect(loadR811Asset(root,asset.contentSha256).metadata.reusableAcrossTopics).toBe(true)
    expect(r811AssetReuseReport(root).measuredMinutesSaved).toBeNull()
    expect(()=>registerR811Asset(root,{content:svg,type:'source-trust-card',
      name:'risk-proof',version:'card-v1',license:'original-owned',creator:'EvidenceMotion',
      reusableAcrossTopics:true,altText:'Risk claim',createdFromVideoId:'source-video-01'})).toThrow(/science-specific/)
  })
})
