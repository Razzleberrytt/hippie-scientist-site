import { test } from 'vitest'
import assert from 'node:assert/strict'
import {
  R817_CANONICAL, assertR817FirstPass, assertR817SceneBinding, assessR817EncodedMaster
} from '../r817-canonical-first-pass.mjs'

const HASH = n => String(n).repeat(64)
function fixture() {
  const sourceUrl='https://pubmed.ncbi.nlm.nih.gov/39724478/'
  const beats=[
    {id:'hook',role:'hook',start:0,end:3,visualObject:{name:'generic amber retail bottle',kind:'retail-bottle'},artMethod:'cinematic-2.5d',semanticAction:'bottle-rotates-to-reveal-label',depthPlanes:['far','mid','near'],narrationText:'A product can contain tianeptine.',captionText:'A product can contain tianeptine.',onScreenText:'Retail product with tianeptine',claimIds:['q892'],onScreenSourceIds:['PMID:39724478']},
    {id:'receptor',role:'mechanism',start:3,end:7,visualObject:{name:'mu-opioid receptor',kind:'receptor-binding',assetSha256:HASH('c')},artMethod:'rendered-3d',renderEngine:'vtk',symbolicLimitLabel:'SYMBOLIC RECEPTOR — NOT MEASURED DOCKING',semanticAction:'ligand-enters-pocket',bindingPocketVisible:true,ligandMotionVisible:true,depthPlanes:['far','mid','near'],narrationText:'It activates a mu opioid receptor.',captionText:'It activates a mu opioid receptor.',onScreenText:'SYMBOLIC OPIOID RECEPTOR',claimIds:['qMechanism'],onScreenSourceIds:['PMID:25026323']},
    {id:'evidence',role:'evidence',start:7,end:12,visualObject:{name:'study count',kind:'animated-counter'},artMethod:'cinematic-2.5d',semanticAction:'count-up-then-settle',depthPlanes:['far','mid','near'],narrationText:'The study included eight hundred ninety two reports.',captionText:'The study included eight hundred ninety two reports.',onScreenText:'892 · Single-substance poison-center reports, 2015–2023',claimIds:['q892'],onScreenSourceIds:['PMID:39724478'],numericVisual:{claimId:'q892',sourceId:'PMID:39724478',finalDisplay:'892',denominator:'Single-substance poison-center reports, 2015–2023',animation:'count-up',settleSeconds:1.4,transientCue:'COUNTING',finalFrameProofRequired:true}},
    {id:'cta',role:'cta',start:12,end:15,visualObject:{name:'emergency response',kind:'call-911'},artMethod:'cinematic-2.5d',semanticAction:'reveal-emergency-guidance',depthPlanes:['far','mid','near'],narrationText:'Call nine one one for severe symptoms.',captionText:'Call nine one one for severe symptoms.',onScreenText:'CALL 911 for an emergency. Follow for more evidence.',claimIds:[]}
  ]
  return {schemaVersion:R817_CANONICAL.schemaVersion,status:'review-ready',videoId:'pilot',sourceUrl,
    sourceContentHash:HASH('a'),reviewedClaimLedgerSha256:HASH('b'),scientificReviewAuthority:'upstream-evidence-ledger',
    output:{...R817_CANONICAL.output},voice:{...R817_CANONICAL.voice,fallbackAllowed:false},
    artisticDirection:{ownerFirst:true,noPrimitivePlaceholders:true,requires3D:true},
    retention:{hook:{beforeName:'Retail product',afterName:'Activated mu-opioid receptor',
      action:'activates',visibleChangeBySeconds:2.8,firstTimeMutedViewerTestRequired:true,
      onlyLabelOrBottle:false},
      cta:{primaryText:'CALL 911 for an emergency',secondaryLoopText:'Follow for more evidence.',
        primarySafetyPriority:true,secondaryDoesNotDisplacePrimary:true}},
    claims:[{id:'q892',sourceId:'PMID:39724478',statement:'892 reported single-substance exposures',
      displayValue:'892',denominator:'Single-substance poison-center reports, 2015–2023',
      evidenceTier:'observational',verifiedSourceSha256:HASH('a')},{id:'qMechanism',sourceId:'PMID:25026323',statement:'Tianeptine is a mu opioid receptor agonist',evidenceTier:'preclinical',verifiedSourceSha256:HASH('d')}],beats}
}
const manifest=p=>({sourceUrl:p.sourceUrl,sourceContentHash:p.sourceContentHash})
function rejects(mutator,needle){const p=fixture();mutator(p);assert.throws(()=>assertR817FirstPass(p,manifest(p)),new RegExp(needle,'i'))}

test('R817 reviewed plan passes without claiming publication or independent V approval',()=>{
  const p=fixture(),r=assertR817FirstPass(p,manifest(p))
  assert.equal(r.passesSemanticPreflight,true)
  assert.equal(r.publicationApproved,false)
  assert.equal(r.independentVVerified,false)
})
test('R817 catches incorrect percentages and source denominators before frame production',()=>{
  rejects(p=>{p.beats[2].numericVisual.finalDisplay='21.1%'},'drift')
  rejects(p=>{p.beats[2].numericVisual.denominator='All tianeptine users'},'drift')
  rejects(p=>{p.beats[2].numericVisual.sourceId='PMID:00000000'},'citation mismatch')
  rejects(p=>{p.beats[2].numericVisual.legacyValue='+574%'},'placeholders')
  rejects(p=>{p.beats[2].numericVisual.transientCue=''},'count-up')
})
test('R817 rejects visual placeholders, fictitious 3D, mismatched caption and wrong narrator',()=>{
  rejects(p=>{p.beats[0].visualObject.kind='question-mark-bottle'},'recognizable')
  rejects(p=>{p.beats[1].ligandMotionVisible=false},'pocket')
  rejects(p=>{p.beats[1].visualObject.isValidatedDocking=true},'docking proof')
  rejects(p=>{p.beats[1].symbolicLimitLabel=''},'symbolic limitation')
  rejects(p=>{p.beats[1].artMethod='cinematic-2.5d'},'declared 3D')
  rejects(p=>{p.beats[2].captionText='The wrong caption'},'caption must match')
  rejects(p=>{p.voice.name='flite'},'Kokoro')
  rejects(p=>{p.voice.fallbackAllowed=true},'alternate')
})
test('R817 catches media sequence and scene-source mismatches before rendering',()=>{
  const p=fixture()
  const scenes=p.beats.map(b=>({beatId:b.id,role:b.role,start:b.start,end:b.end,
    voiceover:b.narrationText,onScreenText:b.onScreenText}))
  assert.equal(assertR817SceneBinding(p,scenes),true)
  assert.throws(()=>assertR817SceneBinding(p,scenes.map((s,i)=>i===2?{...s,voiceover:'Copied from another scene'}:s)),/narration/)
  assert.throws(()=>assertR817SceneBinding(p,scenes.map((s,i)=>i===2?{...s,onScreenText:'21.1%'}:s)),/headline/)
  assert.throws(()=>assertR817FirstPass(p,{sourceUrl:p.sourceUrl,sourceContentHash:HASH('f')}),/identity mismatch/)
})
test('R817 encoded MP4 checks are independent from owner and human release approval',()=>{
 const r={outputSha256:HASH('a'),sourcePlanSha256:HASH('b'),
 video:{codec:'h264',width:1080,height:1920,fps:30,decoded:true},
 audio:{codec:'aac',sampleRate:44100,channels:2,decodedAudible:true,integratedLufs:-14.3,truePeakDbfs:-.7},
 originalVoice:{...R817_CANONICAL.voice},
 nativeArt:{minSourceWidth:1080,minSourceHeight:1920,wasUpscaled:false},
 visualProof:{allClaimRestingFramesChecked:true,allCaptionSafeAreasChecked:true,receptorWasSymbolicAndLabeled:true},
 captionProof:{type:'phrase-estimated'},ownerDeviceReview:{status:'pending'},independentScientificReview:{status:'pending'},ownerPublicationApproval:false}
 const a=assessR817EncodedMaster(r)
 assert.equal(a.technicalPassed,true)
 assert.equal(a.publicationReady,false)
 assert.equal(a.technicalPassed,true)
 assert.equal(a.audienceQualityPassed,false)
 assert.equal(a.postingRecommendationAllowed,false)
 assert.equal(a.audienceQuality.decision,'REVIEW_PENDING')
 assert.ok(a.blockers.some(b=>b.includes('audience-quality independent full-film review not approved')))
 assert.ok(a.blockers.includes('independent exact-audio word alignment pending'))
 assert.throws(()=>assessR817EncodedMaster({...r,audio:{...r.audio,sampleRate:48000}}),/AAC/)
 const finalApproved={...r,captionProof:{type:'mfa-offline-reviewed',mode:'mfa-acoustic-progressive-word',wordCount:35,phraseFlashFallback:false},
    motionProof:{decodedFinalMp4:true,outputSha256:HASH('a'),sampledRawFramesSha256:HASH('c'),staticFraction:.2,longestBeatStaticStreakSeconds:1.2},
    hookFrames:{outputSha256:HASH('a'),beforeSha256:HASH('d'),afterSha256:HASH('e'),afterAtSeconds:2.5},
    muteTest:{result:'pass',reviewerId:'independent-reviewer',prompt:'Describe what changed while video is muted'},
    ctaProof:{outputSha256:HASH('a'),primaryVisible:true,secondaryVisible:true,safetyPrimary:true},
    ownerDeviceReview:{status:'accepted'},independentScientificReview:{status:'approved',reviewer:'V'},ownerPublicationApproval:true}
 const withoutMute=assessR817EncodedMaster({...finalApproved,muteTest:null})
 assert.equal(withoutMute.publicationReady,false)
 const withoutCta=assessR817EncodedMaster({...finalApproved,ctaProof:null})
 assert.equal(withoutCta.publicationReady,false)
 const withoutCaption=assessR817EncodedMaster({...finalApproved,captionProof:{type:'mfa-offline-reviewed'}})
 assert.equal(withoutCaption.publicationReady,false)
 const b=assessR817EncodedMaster(finalApproved)
 assert.equal(b.publicationReady,false)
 assert.ok(b.blockers.some(x=>/telemetry/i.test(x)))
 assert.ok(b.blockers.some(x=>/rendered action/i.test(x)))
 assert.equal(b.autoPublished,false)
})

test('R817 requires visual twist and secondary CTA, with safety remaining primary',()=>{
 rejects(p=>{p.retention.hook.visibleChangeBySeconds=4},'first 3 seconds')
 rejects(p=>{p.retention.hook.onlyLabelOrBottle=true},'labeled-bottle')
 rejects(p=>{p.retention.cta.secondaryLoopText='Which states banned it?'},'verified provenance')
 rejects(p=>{p.retention.cta.secondaryDoesNotDisplacePrimary=false},'safety/emergency CTA')
})

test('R817 requires source/footer identity on hook, mechanism and evidence scenes',()=>{
 rejects(p=>{p.beats[2].onScreenSourceIds=['PMID:25026323']},'source footer')
 rejects(p=>{p.beats[1].claimIds=[]},'source-bound claim')
})
