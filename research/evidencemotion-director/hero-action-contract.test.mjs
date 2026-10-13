import {test} from 'node:test'
import assert from 'node:assert/strict'
import {inspectHeroAction as judge} from './hero-action-contract.mjs'
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
