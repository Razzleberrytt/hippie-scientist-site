import {test} from 'node:test'
import assert from 'node:assert/strict'
import {inspectHeroAction as judge, inspectSceneVisualVerbPlan as visual, inspectImprovementPrecommit as precommit} from './hero-action-contract.mjs'
const h='a'.repeat(64)
const good=()=>({beatId:'hero-1',heroObjectId:'physical-vial',lockedHeroArtSha256:h,
 startSec:0,endSec:6,narrationCueSec:1.5,physicalVerb:'OPENS_TO_REVEAL',
 beforeStateId:'closed-lid',afterStateId:'open-lid',visibleObjectIds:['physical-vial','cap'],
 cameraMoveCount:1,effectOnly:false,movingParticlesOnly:false,flatSlideOverlay:false,
 scientificMeaningClaimed:false,photorealSyntheticFootage:false})
test('real object opening gets preview only, never excellence',()=>{
 const x=judge(good());assert.equal(x.status,'READY_FOR_PHYSICAL_PREVIZ_AND_HUMAN_CRAFT_VETO')
 assert.equal(x.craftCertified,false);assert.equal(x.productionEligible,false)
})
test('rejects confetti, graphic wipes and rotating cards as hero action',()=>{
 for(const physicalVerb of ['PARTICLES_ONLY','COLOR_WIPE','TEXT_SWAP','ROTATING_FLAT_CARD'])
  assert.ok(judge({...good(),physicalVerb}).reasons.includes('DECORATION_IS_NOT_HERO_ACTION'))
})
test('requires distinct before and after state on tracked hero',()=>{
 const x=judge({...good(),afterStateId:'closed-lid',visibleObjectIds:['cap']})
 assert.ok(x.reasons.includes('HERO_STATE_DOES_NOT_CHANGE'))
 assert.ok(x.reasons.includes('HERO_NOT_TRACKABLE_IN_SCENE'))
})
test('locks timing to actual narration and just one camera move',()=>{
 const x=judge({...good(),narrationCueSec:7,cameraMoveCount:3})
 assert.ok(x.reasons.includes('ACTION_NOT_BOUND_TO_LOCKED_AUDIO'))
 assert.ok(x.reasons.includes('MORE_THAN_ONE_CAMERA_MOVE'))
})
test('cannot imply molecular proof from decorative geometry',()=>{
 const x=judge({...good(),scientificMeaningClaimed:true})
 assert.ok(x.reasons.includes('FALSIFIABLE_SCIENCE_REQUIREMENTS_MISSING'))
})
test('blocks undisclosed photoreal synthetic B-roll',()=>{
 const x=judge({...good(),photorealSyntheticFootage:true})
 assert.ok(x.reasons.includes('UNDISCLOSED_SYNTHETIC_FOOTAGE'))
})
test('static hero with only particles is not semantically progressing',()=>{
 const x=judge({...good(),movingParticlesOnly:true})
 assert.ok(x.reasons.includes('VISUAL_EFFECT_SUBSTITUTED_FOR_ACTION'))
})

// Research-only creative improvement negative regressions; kept in the existing CI-invoked suite.
{
const H='a'.repeat(64), V='b'.repeat(64), C='c'.repeat(64)
const event=(atSec,overrides={})=>({
 atSec,visualVerb:'OPENS_TO_REVEAL',heroObjectId:'science-vial',
 lockedHeroArtSha256:C,beforeStateId:'closed',afterStateId:'open',
 sourceClaimId:'claim1',sourceAssetId:'source1',
 visibleObjectIds:['science-vial'],cameraMoveCount:1,...overrides
})
const scene=(beatId,startSec,endSec,family,actions)=>({
 beatId,startSec,endSec,compositionFamily:family,
 heroBox:{x1:0.2,y1:0.25,x2:0.72,y2:0.65},
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
test('each teaching action binds its own scene-approved claim and visual asset',()=>{
 for (const key of ['sourceClaimId','sourceAssetId'])
  assert.ok(errors(p=>delete p.scenes[0].actions[0][key]).includes('UNBOUND_ACTION_SOURCE_OR_CLAIM'))
 assert.ok(errors(p=>p.scenes[0].actions[0].sourceClaimId='foreign-claim').includes('UNBOUND_ACTION_SOURCE_OR_CLAIM'))
 assert.ok(errors(p=>p.scenes[1].actions[0].sourceAssetId='foreign-asset').includes('UNBOUND_ACTION_SOURCE_OR_CLAIM'))
 const p=good();p.scenes[0].sourceClaimIds.push('second-claim')
 p.scenes[0].actions[0].sourceClaimId='second-claim'
 assert.equal(visual(p).status,'PLAN_READY_FOR_ACTUAL_DECODED_CRAFT_REVIEW')
 assert.equal(visual(p).craftCertified,false)
})
test('replayed hero state transition is not a new teaching event or pacing escape',()=>{
 const p=good()
 p.scenes[0].actions=[event(1),event(2.5)]
 const repeat=visual(p)
 assert.equal(repeat.status,'HOLD')
 assert.ok(repeat.reasons.includes('REPLAYED_HERO_TRANSITION_NOT_NEW_TEACHING_ACTION'))
 assert.equal(repeat.craftCertified,false)
 assert.equal(repeat.mayPublish,false)
 // A genuinely new declared state within the same shot clears only this
 // negative authoring screen; still requires physically decoded proof.
 p.scenes[0].actions[1].beforeStateId='open'
 p.scenes[0].actions[1].afterStateId='visible-evidence'
 assert.equal(visual(p).status,'PLAN_READY_FOR_ACTUAL_DECODED_CRAFT_REVIEW')
 assert.equal(visual(p).craftCertified,false)
 // Reuse across distinct scene cuts is not automatically fraudulent.
 assert.equal(visual(good()).status,'PLAN_READY_FOR_ACTUAL_DECODED_CRAFT_REVIEW')
})
test('hero ROI is explicit, visible and bounded away from phone UI',()=>{
 assert.ok(errors(p=>delete p.scenes[1].heroBox).includes('MISSING_OR_UNSAFE_SCENE_HERO_ROI'))
 assert.ok(errors(p=>p.scenes[0].heroBox={x1:0,y1:0,x2:1,y2:1}).includes('MISSING_OR_UNSAFE_SCENE_HERO_ROI'))
 assert.ok(errors(p=>p.scenes[0].heroBox={x1:.2,y1:.2,x2:.22,y2:.22}).includes('MISSING_OR_UNSAFE_SCENE_HERO_ROI'))
})
test('source, audio, timing, and composition changes are not cosmetic bypasses',()=>{
 assert.ok(errors(p=>p.scenes[1].lockedNarrationWavSha256=C).includes('SCENE_SOURCE_OR_VOICE_IDENTITY_MISSING'))
 assert.ok(errors(p=>p.scenes[1].sourceAssetIds=[]).includes('SCENE_SOURCE_OR_VOICE_IDENTITY_MISSING'))
 assert.ok(errors(p=>p.scenes[1].compositionFamily='macro').includes('NO_MEANINGFUL_COMPOSITION_FAMILY_CONTRAST'))
 assert.ok(errors(p=>p.scenes[1].actions[0].atSec=7).includes('INVALID_VISUAL_VERB_OR_AUDIO_ANCHOR'))
})
test('many individually short source cards cannot hide a long stagnant sequence',()=>{
 const p=good();p.scenes=Array.from({length:6},(_,i)=>({
   ...scene('source-read-'+i,i,i+1,'source',[]),
   staticHold:{kind:'SOURCE_EVIDENCE_READ',sourceId:'source1',
     reason:'Read the cited primary-source limitation'}
 }))
 assert.equal(visual(p).status,'HOLD')
 assert.ok(visual(p).reasons.includes('CONSECUTIVE_STATIC_HOLDS_HIDE_STAGNATION'))
 assert.ok(visual(p).reasons.includes('SOURCE_CARDS_ALONE_DO_NOT_PROVE_VISUAL_STORY'))
 // Even two source cards cannot masquerade as a complete teaching film.
 p.scenes=p.scenes.slice(0,2);p.durationSec=2
 assert.ok(visual(p).reasons.includes('SOURCE_CARDS_ALONE_DO_NOT_PROVE_VISUAL_STORY'))
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

}
