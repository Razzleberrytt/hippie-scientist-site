import {test} from 'node:test'
import assert from 'node:assert/strict'
import {inspectSceneVisualVerbPlan as visual,inspectImprovementPrecommit as precommit} from './hero-action-contract.mjs'
const H='a'.repeat(64), V='b'.repeat(64), C='c'.repeat(64)
const event=(atSec,overrides={})=>({
 atSec,visualVerb:'OPENS_TO_REVEAL',heroObjectId:'science-vial',
 lockedHeroArtSha256:C,beforeStateId:'closed',afterStateId:'open',
 visibleObjectIds:['science-vial'],cameraMoveCount:1,...overrides
})
const scene=(beatId,startSec,endSec,family,actions)=>({
 beatId,startSec,endSec,compositionFamily:family,
 lockedNarrationWavSha256:V,sourceClaimIds:['claim1'],
 sourceAssetIds:['source1'],actions
})
const good=()=>({sourceManifestSha256:H,lockedNarrationWavSha256:V,durationSec:6,
 scenes:[scene('beat1',0,3,'macro',[event(1.5)]),
         scene('beat2',3,6,'comparison',[event(4.5)])]})
const errors=modify=>{const p=good();modify(p);return visual(p).reasons}
test('visual verbs are required for every instructional scene; never self-certify',()=>{
 const p=good(),out=visual(p)
 assert.equal(out.status,'PLAN_READY_FOR_ACTUAL_DECODED_CRAFT_REVIEW')
 assert.equal(out.physicalFrameReviewRequired,true)
 assert.equal(out.craftCertified,false)
 assert.equal(out.mayPublish,false)
 assert.ok(errors(p=>p.scenes[1].actions=[]).includes('INSTRUCTIONAL_SCENE_MISSING_VISUAL_VERB'))
})
test('camera-only, particles, text swap and unchanged hero cannot count as instruction',()=>{
 for(const verb of ['CAMERA_ONLY','PARTICLES_ONLY','TEXT_SWAP'])
  assert.ok(errors(p=>p.scenes[1].actions[0].visualVerb=verb).includes('INVALID_VISUAL_VERB_OR_AUDIO_ANCHOR'))
 assert.ok(errors(p=>p.scenes[1].actions[0].afterStateId='closed').includes('HERO_STATE_DOES_NOT_CHANGE'))
 assert.ok(errors(p=>p.scenes[1].actions[0].movingParticlesOnly=true).includes('VISUAL_EFFECT_SUBSTITUTED_FOR_ACTION'))
})
test('source, audio, timing, and composition changes are not cosmetic bypasses',()=>{
 assert.ok(errors(p=>p.scenes[1].lockedNarrationWavSha256=C).includes('SCENE_SOURCE_OR_VOICE_IDENTITY_MISSING'))
 assert.ok(errors(p=>p.scenes[1].sourceAssetIds=[]).includes('SCENE_SOURCE_OR_VOICE_IDENTITY_MISSING'))
 assert.ok(errors(p=>p.scenes[1].compositionFamily='macro').includes('NO_MEANINGFUL_COMPOSITION_FAMILY_CONTRAST'))
 assert.ok(errors(p=>p.scenes[1].actions[0].atSec=7).includes('INVALID_VISUAL_VERB_OR_AUDIO_ANCHOR'))
})
test('action-free gaps over three seconds fail; a short source read may be intentional',()=>{
 const p=good();p.durationSec=9;p.scenes[1].endSec=9
 assert.ok(visual(p).reasons.includes('PLANNED_TEACHING_ACTION_GAP_EXCEEDS_3_SECONDS'))
 const h=good();h.scenes[1]={...h.scenes[1],actions:[],staticHold:{kind:'SOURCE_EVIDENCE_READ',sourceId:'source1',reason:'Read the cited primary-source limitation'}}
 assert.equal(visual(h).status,'PLAN_READY_FOR_ACTUAL_DECODED_CRAFT_REVIEW')
 h.scenes[1].staticHold.reason='short'
 assert.ok(visual(h).reasons.includes('UNJUSTIFIED_OR_TOO_LONG_STATIC_HOLD'))
})
const brief=()=>({videoId:'video-1',dimension:'SEMANTIC_MOTION',
 metricId:'longest_stagnant_teaching_subject_sec',referenceMp4Sha256:C,
 sourceManifestSha256:H,lockedNarrationWavSha256:V,immutableBriefSha256:C,
 referenceWeaknessSec:13,baselineMetricValue:6,targetMaximumValue:3,
 expectedVisualChange:'A source-bound teaching subject changes state at the narrated cue.',
 comparabilityLimit:'Different topics are not causal A/B tests.'})
test('pre-render improvement goal is one fixed dimension and a real numerical target',()=>{
 const r=precommit(brief())
 assert.equal(r.status,'PRECOMMIT_STRUCTURALLY_READY')
 assert.equal(r.registeredBeforeRenderVerified,false)
 assert.equal(r.improvementObserved,false)
 assert.equal(r.mayPublish,false)
 const b=brief();b.metricId='repeated_teaching_layout_fraction'
 assert.ok(precommit(b).reasons.includes('EXACTLY_ONE_KNOWN_IMPROVEMENT_DIMENSION_REQUIRED'))
 b.metricId=brief().metricId;b.targetMaximumValue=6
 assert.ok(precommit(b).reasons.includes('BASELINE_AND_STRICT_TARGET_REQUIRED'))
 b.targetMaximumValue=3;b.immutableBriefSha256=''
 assert.ok(precommit(b).reasons.includes('MISSING_PRE_RENDER_REFERENCE_OR_SOURCE_PIN'))
})
