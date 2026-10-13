import test from 'node:test';
import assert from 'node:assert/strict';
import {routeSpecialists,SPECIALISTS} from './specialist-router.mjs';
test('routes compelling visual elements to purpose-built CPU research tools',()=>{
 const r=routeSpecialists({visualIntent:'everyday-to-mechanism'});
 assert.equal(r.status,'ROUTED_RESEARCH_ONLY');
 assert.equal(r.productionEligible,false);
 assert.ok(r.selected.includes('visual_actor'));
 assert.ok(r.selected.includes('human_critic'));
 assert.deepEqual(r.audioDependencies,['audio_reference','alignment_reference']);
 assert.equal(r.modelInferenceExecuted,false);
});
test('rejects pay-to-render GPU and fabricated scientific facts',()=>{
 for(const x of [{requestGpu:true},{requestPaid:true},{requiresGeneratedFacts:true},{requiresSyntheticFaces:true}]){
  const r=routeSpecialists({visualIntent:'uncertainty',...x});
  assert.equal(r.status,'HOLD');assert.equal(r.selected.length,0);
 }
});
test('small AI depth and segmentation are uninstalled benchmark experiments only',()=>{
 const r=routeSpecialists({visualIntent:'study-measurement',
  allowExperimentalDepth:true,allowExperimentalSegmentation:true});
 assert.deepEqual(r.experiments,['visual_depth_optional','segmentation_optional']);
 assert.ok(!r.selected.includes('visual_depth_optional'));
 assert.equal(SPECIALISTS.visual_depth_optional.status,'BENCHMARK_ONLY_NOT_INSTALLED');
});
test('no laptop is required or silently substituted as execution path',()=>{
 assert.equal(routeSpecialists({visualIntent:'uncertainty',devicePath:'LOCAL_LAPTOP'}).status,'HOLD');
 assert.equal(routeSpecialists({visualIntent:'process-sequence'}).status,'ROUTED_RESEARCH_ONLY');
});
test('unrecognized visual intentions do not become arbitrary cinematic choices',()=>{
 assert.equal(routeSpecialists({visualIntent:'because-it-looks-cool'}).status,'HOLD');
});
