import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routeSpecialists,SPECIALISTS} from './model-router.mjs';
const sha='a'.repeat(64);
test('phone-first deterministic models and evidence-bound roles',()=>{
 const x=routeSpecialists({lockedStillSha256:sha,needsScience:true,reviewedScienceAssetSha256:sha,needsParallax:true,hasReviewedDepthLayer:true});
 assert.equal(x.status,'RESEARCH_ROUTED');assert.equal(x.laptopRequired,false);
 assert.deepEqual(x.selected,['director','reference','depth','evidence','voice','alignment','composite','critic']);
 assert.equal(x.productionEligible,false);assert.equal(x.optionalBenchmarks.length,0);
 assert.ok(Object.values(SPECIALISTS).every(v=>v.createsFactualContent===false));
});
test('small depth and segmentation models remain optional experiments',()=>{
 const x=routeSpecialists({lockedStillSha256:sha,needsParallax:true,needsSegmentation:true});
 assert.equal(x.status,'RESEARCH_ROUTED');assert.equal(x.newModelInstalled,false);
 assert.equal(x.optionalBenchmarks.length,2);
});
test('heavy video generators, fake faces, fake source diagrams blocked',()=>{
 for(const model of ['FLUX_FULL','WAN_2_2','TRELLIS','LTX_2','LTX_2_3'])
  assert.ok(routeSpecialists({lockedStillSha256:sha,requestedModel:model}).blocked.includes('HEAVY_VIDEO_OR_IMAGE_MODEL_PARKED'));
 assert.equal(routeSpecialists({lockedStillSha256:sha,faceGeneration:true}).status,'BLOCKED');
 assert.equal(routeSpecialists({lockedStillSha256:sha,syntheticFactualDiagram:true}).status,'BLOCKED');
});
test('unverified science and laptop/paid path blocked',()=>{
 const x=routeSpecialists({lockedStillSha256:sha,needsScience:true},{route:'RTX3050',paidInferenceAllowed:true});
 assert.equal(x.status,'BLOCKED');assert.equal(x.blocked.length,2);
});
