import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateStoryFirstPlan as validate,compareCreativeDirections} from './story-first-gates.mjs';
import {sampleStoryPlan} from './story-first-fixture.mjs';
const g=sampleStoryPlan,errors=x=>validate(x).errors,H='a'.repeat(64),V='b'.repeat(64);
const change=fn=>{const x=g();fn(x);return errors(x)};
test('genuine four-act story is a research preview preflight, not release',()=>{
 const r=validate(g());assert.equal(r.status,'STORY_PREFLIGHT_READY_FOR_HUMAN_AND_PIXEL_REVIEW');
 assert.equal(r.mayRenderPreview,true);assert.equal(r.mayRenderFinal,false);
 assert.equal(r.excellentCertified,false);assert.equal(r.productionEligible,false);
});
test('a missing answer rejects attractive but directionless videos',()=>{
 assert.ok(change(x=>x.plainAnswer='').includes('NO_COMPLETE_BEGINNING_MIDDLE_ANSWER'));
});
test('unintroduced technical topic fails first two seconds',()=>{
 assert.ok(change(x=>x.hookExplainsSubjectAtSec=2.5).includes('BEGINNER_HOOK_HAS_NO_ORIENTATION'));
});
test('reject shuffled or missing narrative acts',()=>{
 assert.ok(change(x=>x.acts[2].role='DISCOVERY').includes('MISSING_LOGICAL_FOUR_ACT_STORY'));
});
test('no silent gaps or edited narration',()=>{
 assert.ok(change(x=>x.acts[1].startSec=2).includes('BROKEN_NARRATION_FIRST_STORY_TIMELINE'));
 assert.ok(change(x=>x.audioRetimed=true).includes('MISSING_LOCKED_SOURCE_OR_NARRATION'));
});
test('source and claim IDs required and must belong to ledger',()=>{
 assert.ok(change(x=>x.acts[1].sourceAssetIds=[]).includes('SHOT_LACKS_TEACHING_GOAL_OR_SOURCE'));
 assert.ok(change(x=>x.acts[1].sourceClaimIds=['invented']).includes('SHOT_CLAIM_NOT_IN_EVIDENCE_LEDGER'));
});
test('chemical drawings and animal studies cannot establish human outcomes',()=>{
 assert.ok(change(x=>x.claims[0].assertsHumanEffect=true).includes('STRUCTURE_OR_ANIMAL_DATA_PROMOTED_TO_HUMAN_EFFECT'));
 const y=g();y.claims[0].evidenceClass='PRECLINICAL';y.claims[0].assertsHumanEffect=true;
 assert.ok(errors(y).includes('STRUCTURE_OR_ANIMAL_DATA_PROMOTED_TO_HUMAN_EFFECT'));
});
test('decorative motion and repetitive title cards cannot substitute for story',()=>{
 assert.ok(change(x=>x.acts[1].cosmeticMotionOnly=true).includes('MOTION_DOES_NOT_EXPLAIN_A_CLAIM'));
 assert.ok(change(x=>x.acts.forEach(a=>a.layoutId='identical')).includes('REPEATED_POSTER_LAYOUT_INSTEAD_OF_STORY'));
});
test('hero image and captions cannot overlap',()=>{
 assert.ok(change(x=>x.acts[2].captionBox={x1:.1,y1:.3,x2:.7,y2:.7}).includes('CLIPPED_OR_OVERLAPPING_STORY_ZONES'));
});
test('phone social-app UI must not cover source text',()=>{
 assert.ok(change(x=>x.acts[3].sourceBox={x1:.7,y1:.76,x2:.95,y2:.81}).includes('CLIPPED_OR_OVERLAPPING_STORY_ZONES'));
});
test('jargon-free stories may declare no technical terms',()=>{
 const plan=g();plan.firstUseTerms=[];
 assert.equal(validate(plan).status,'STORY_PREFLIGHT_READY_FOR_HUMAN_AND_PIXEL_REVIEW');
 assert.ok(change(x=>x.firstUseTerms=undefined).includes('JARGON_NOT_TAUGHT_AT_FIRST_USE'));
});
test('duplicate claim IDs fail closed even when each record looks valid',()=>{
 const plan=g();
 plan.claims.push({...plan.claims[0],evidenceClass:'HUMAN',sourceIds:['different-study']});
 assert.ok(errors(plan).includes('DUPLICATE_CLAIM_IDENTIFIERS'));
});
test('unfamiliar word must be defined before first spoken use',()=>{
 assert.ok(change(x=>x.firstUseTerms[0].explainedAtSec=2.3).includes('JARGON_NOT_TAUGHT_AT_FIRST_USE'));
});
test('3D models must be clearly estimated and no imaginary molecules or binding',()=>{
 assert.ok(change(x=>x.acts[2].computed3d=true).includes('COMPUTED_MODEL_NOT_EXPLAINED'));
 assert.ok(change(x=>x.acts[2].inventsAtomsOrBonds=true).includes('UNSUPPORTED_SCIENTIFIC_VISUAL'));
});
test('cannot self-award science, craft or release approval',()=>{
 assert.ok(change(x=>x.craftApproved=true).includes('SELF_CERTIFIED_HUMAN_APPROVAL_NOT_ALLOWED'));
 assert.ok(change(x=>x.autoPublish=true).includes('FREEZE_OR_SCHEMA_VIOLATION'));
});
const c=(id,story,hero,layout,progress)=>({id,storyApproach:story,heroVisual:hero,compositionFamily:layout,visualProgression:progress,sourceManifestSha256:H,lockedNarrationWavSha256:V});
const A=()=>c('a','forensic','chemistry','lens',['map','detail','model']);
const B=()=>c('b','evidence ladder','study','library',['question','data','answer']);
const refs=()=>[1,2,3].map(x=>({id:'reference-'+x,url:'https://example.org/'+x,ownerSelected:true}));
test('distinct concepts still need owner craft review, not machine approval',()=>{
 const result=compareCreativeDirections(A(),B(),{ownerCuratedReferences:refs()});
 assert.equal(result.status,'TWO_CONCEPTS_READY_FOR_ACTUAL_MEDIA_COMPARISON');
 assert.equal(result.ownerCraftApproved,false);assert.equal(result.mayRenderFinal,false);
});
test('recolored same hero is not a second creative direction',()=>{
 const b=B();b.heroVisual='chemistry';
 assert.ok(compareCreativeDirections(A(),b,{ownerCuratedReferences:refs()}).errors.includes('COSMETICALLY_DIFFERENT_CANDIDATES'));
});
test('owner-curated real references and identical voice+source required',()=>{
 const b=B();b.lockedNarrationWavSha256='c'.repeat(64);
 const r=compareCreativeDirections(A(),b,{ownerCuratedReferences:[]});
 assert.ok(r.errors.includes('OWNER_REFERENCE_SHELF_REQUIRED'));
 assert.ok(r.errors.includes('CANDIDATES_HAVE_DIFFERENT_SCIENCE_OR_VOICE_BASE'));
});
