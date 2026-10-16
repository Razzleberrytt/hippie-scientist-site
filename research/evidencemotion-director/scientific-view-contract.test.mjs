import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkScientificView as check} from './scientific-view-contract.mjs';
const h='a'.repeat(64);
const normal=()=>({compoundInchiKey:'RYENLSMHLCNXJT-CYXFISRXSA-N',
 sourceGraphSha256:h,drawnGraphSha256:h,mode:'WHOLE',
 sceneBox:[0,0,540,450],graphInkBox:[32,70,508,380],
 generatedAtomsOrBonds:false,claimedExperimentalPose:false});
test('complete source-linked molecular diagram awaits decoded image review',()=>{
 const r=check(normal());
 assert.equal(r.status,'RESEARCH_METADATA_READY_FOR_IMAGE_AUDIT');
 assert.equal(r.publicationApproved,false);assert.equal(r.craftApproved,false);
});
test('reject a clipped authoritative 2D structure',()=>{
 const r=check({...normal(),graphInkBox:[-20,50,560,410]});
 assert.ok(r.errors.includes('AUTHORITATIVE_2D_GRAPH_CROPPED'));
});
test('allow a deliberately close detail only with accurate source-linked OH',()=>{
 const p={...normal(),mode:'ATOM_DETAIL',scienceDetailLabel:'DETAIL VIEW',
   highlightedAtomIndex:29,sourceHydroxylAtomIndex:29,
   projectedAtomPoint:[340,290],highlightCenterPoint:[341,290.5],
   graphInkBox:[-120,-30,590,480]};
 assert.equal(check(p).status,'RESEARCH_METADATA_READY_FOR_IMAGE_AUDIT');
 assert.ok(check({...p,scienceDetailLabel:'FULL STRUCTURE'}).errors.includes('DETAIL_CROP_NOT_LABELED'));
 assert.ok(check({...p,highlightCenterPoint:[360,320]}).errors.includes('HYDROXYL_ANNOTATION_NOT_SOURCE_PROJECTED'));
});
test('reject source drift or generated bonds',()=>{
 assert.ok(check({...normal(),drawnGraphSha256:'b'.repeat(64)}).errors.includes('SOURCE_GRAPH_IDENTITY_UNVERIFIED'));
 assert.ok(check({...normal(),generatedAtomsOrBonds:true}).errors.includes('GENERATIVE_OR_EXPERIMENTAL_CHEMISTRY_PROHIBITED'));
});
