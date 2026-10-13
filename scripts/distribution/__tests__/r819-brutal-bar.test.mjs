import {test, expect} from 'vitest'
const assert = {equal:(a,b)=>expect(a).toBe(b),match:(a,b)=>expect(a).toMatch(b),ok:a=>expect(a).toBeTruthy()}
import {assessR819Release} from '../r819-brutal-bar.mjs'
const sha='a'.repeat(64)
const valid = () => ({
 build:{finalMp4Sha256:sha,sourceSha256:sha,pinnedArtSha256:sha,
   pinnedArtVerified:true,fullLayeredCompositor:true,trustTopmostVerified:true,
   video:{width:1080,height:1920,fps:30},
   audio:{integratedLufs:-14,truePeakDbfs:-1.4,measuredFromFinal:true,
      originalDurationPreserved:true,timeStretchApplied:false},
   hero:{declared:true,physicallyRendered:true,artisticallyDistinct:true},
   motion:{compositionSampling:'caption-excluded-object-plus-decoded-pixels',
     perBeat:[{longestCompositionalHoldSeconds:3.1}]},items:{allNarrationCued:true}},
 science:{claimLedgerSha256:sha,alignmentReceiptSha256:sha,
   attributionsChecked:true,denominatorsChecked:true,symbolicLabelsChecked:true,
   sourceFootersPixelVerified:true,exactNarrationReviewed:true,
   reviewVerdict:'APPROVE',reviewAuthor:'Independent Editor'},
 craft:{independentReviewer:'V',verdict:'APPROVE',referenceShelfCuratedByOwner:true,
   referenceShelf:['https://example.org/a','https://example.org/b','https://example.org/c'],
   phonePlaybackApproved:true,stockFeel:'PASS',clipArtFeel:'PASS'}
})
test('separate correctness and craft verdicts and never self-publish',()=>{
 const v=assessR819Release(valid());assert.equal(v.correctness.verdict,'PASS');
 assert.equal(v.craft.verdict,'PASS');assert.match(v.publicationVerdict,/SEPARATE_OWNER/)
})
test('science passes but poor craft vetoes the release with no repair loop',()=>{
 const x=valid();x.craft.stockFeel='FAIL'
 const v=assessR819Release(x);assert.equal(v.correctness.verdict,'PASS');
 assert.equal(v.craft.verdict,'REJECTED_NO_REPAIR_LOOP');assert.equal(v.noRepairLoop,true)
})
test('narration slowdown is a hard kill even if every source is correct',()=>{
 const x=valid();x.build.audio.timeStretchApplied=true
 const v=assessR819Release(x);assert.ok(v.craft.hardKills.includes('NARRATION_STRETCHED_TO_FIT_VIDEO'))
})
test('generic card grid with no hero is killed immediately',()=>{
 const x=valid();x.build.hero.artisticallyDistinct=false
 assert.ok(assessR819Release(x).craft.hardKills.includes('NO_CINEMATIC_HERO_VISUAL'))
})
test('caption pixel changes are insufficient proof of scene motion',()=>{
 const x=valid();x.build.motion.compositionSampling='full-frame-pixel-diff'
 assert.equal(assessR819Release(x).craft.verdict,'HOLD_FOR_CRAFT_REVIEW')
})
test('more than six seconds of compositional stasis kills an otherwise correct video',()=>{
 const x=valid();x.build.motion.perBeat[0].longestCompositionalHoldSeconds=6.001
 assert.ok(assessR819Release(x).craft.hardKills.includes('OVER_SIX_SECONDS_WITHOUT_MEANINGFUL_COMPOSITION_CHANGE'))
})
test('unverified science stays pending even when craft is independently approved',()=>{
 const x=valid();x.science.sourceFootersPixelVerified=false
 const v=assessR819Release(x);assert.equal(v.craft.verdict,'PASS')
 assert.equal(v.correctness.verdict,'PENDING_INDEPENDENT_REVIEW');assert.equal(v.publicationVerdict,'DO_NOT_PUBLISH')
})
test('V approval without owner-curated 3–5 niche references is not a craft pass',()=>{
 const x=valid();x.craft.referenceShelf=[]
 assert.equal(assessR819Release(x).craft.verdict,'HOLD_FOR_CRAFT_REVIEW')
})
test('art layer alone cannot masquerade as verified three-layer composition',()=>{
 const x=valid();x.build.fullLayeredCompositor=false
 assert.equal(assessR819Release(x).craft.verdict,'HOLD_FOR_CRAFT_REVIEW')
})
