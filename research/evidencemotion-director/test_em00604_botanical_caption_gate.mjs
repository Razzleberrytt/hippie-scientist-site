import test from 'node:test';
import assert from 'node:assert/strict';
import {auditBotanicalCaption,KNOWN_RESEARCH_BOTANICAL as art}
  from './botanical_caption_honesty_gate.mjs';

const base=()=>({
  sourceAnnotation:{
    sourceSha256:art.fullSourceSha256,
    humanReviewedSourceSha256:art.fullSourceSha256,
    humanReviewerNote:'One bounded botanical-only source crop; all model-generated diagrams outside source crop remain rejected. No species or chemical effect verified.',
    width:art.width,height:art.height,crop:[...art.crop],
    forbiddenRegions:[{bounds:[...art.forbiddenRegion],
      reason:'Model-generated scientific labels and molecule geometry are forbidden.'}]
  },
  admittedCropSha256:art.admittedCropSha256,
  originType:'synthetic-illustration',
  depictionIntent:'nonfactual-atmosphere',
  assertedEvidenceType:'none',
  visibleCaption:art.disclosure
});
const hold=(record,expected)=> {
  const r=auditBotanicalCaption(record);
  assert.equal(r.status,'HOLD_DECEPTIVE_OR_UNVERIFIED_BOTANICAL_CONTEXT');
  assert.ok(r.reasons.includes(expected),JSON.stringify(r));
  assert.equal(r.mayPublish,false);
  return r;
};

test('the only admitted metadata is limited source-crop annotation, not a real-frame or science pass',()=>{
  const r=auditBotanicalCaption(base());
  assert.equal(r.status,'ANNOTATED_NONFACTUAL_CAPTION_RESEARCH_ONLY');
  assert.deepEqual(r.reasons,[]);
  for(const claim of ['sourceCropVerified','actualFrameInspected','scientificContentMeasured',
   'qualifiedScienceReview','phoneContrastChecked','publicationApproved','mayPublish'])
    assert.equal(r[claim],false,claim);
});

test('a missing annotated source cannot produce a caption clearance',()=>{
  const x=base();delete x.sourceAnnotation;
  hold(x,'MISSING_SOURCE_ANNOTATION');
});
test('source image digest substitution invalidates metadata admission',()=>{
  const x=base();x.sourceAnnotation.sourceSha256='a'.repeat(64);
  hold(x,'UNPINNED_BOTANICAL_SOURCE_OR_CROP');
});
test('unreviewed source digest rejects prior annotation',()=>{
  const x=base();x.sourceAnnotation.humanReviewedSourceSha256='b'.repeat(64);
  const r=auditBotanicalCaption(x);
  assert.ok(r.reasons.some(e=>e.startsWith('CROP_NOT_ADMITTED:')));
});
test('a swapped safe-crop digest cannot borrow annotation',()=>{
  const x=base();x.admittedCropSha256='f'.repeat(64);
  hold(x,'SOURCE_CROP_SHA_MISMATCH');
});
test('fake chemical pixels overlapping admitted art stay forbidden',()=>{
  const x=base();x.sourceAnnotation.crop=[0,0,940,900];
  const r=auditBotanicalCaption(x);
  assert.ok(r.reasons.includes('UNPINNED_BOTANICAL_SOURCE_OR_CROP'));
  assert.ok(r.reasons.some(e=>e.includes('CROP_CONTAINS_UNAPPROVED_GENERATIVE_SCIENCE')));
});
test('no source exclusion inventory means source annotation is inadequate',()=>{
  const x=base();x.sourceAnnotation.forbiddenRegions=[];
  const r=auditBotanicalCaption(x);
  assert.ok(r.reasons.some(e=>e.includes('CROP_NOT_ADMITTED:')));
});
test('an authentic filmed-as-real label is rejected for AI source art',()=>{
  const x=base();x.originType='on-location-clinical-photograph';
  hold(x,'REAL_FILMED_OR_SCIENTIFIC_IMAGE_FALSE_PROVENANCE');
});
test('a species-authentication implication is not allowed',()=>{
  const x=base();x.depictionIntent='authenticated-mitragyna-speciosa-leaf';
  hold(x,'UNSUPPORTED_BOTANICAL_SCIENTIFIC_MEANING');
});
test('a plant alkaloid assay is not accepted from generated illustration',()=>{
  const x=base();x.assertedEvidenceType='verified-7OH-quantitation-assay';
  hold(x,'FABRICATED_MEASUREMENT_OR_ANALYTICAL_EVIDENCE');
});
test('a plant screenshot styled as chemical analysis is rejected',()=>{
  const x=base();x.assertedEvidenceType='microscopy-or-measured-data';
  hold(x,'FABRICATED_MEASUREMENT_OR_ANALYTICAL_EVIDENCE');
});
test('missing illustration disclosure is a deceptive candidate',()=>{
  const x=base();delete x.visibleCaption;
  hold(x,'MISSING_OR_DECEPTIVE_ILLUSTRATION_DISCLOSURE');
});
test('disclaimer replacement with measured plant-content claim is rejected',()=>{
  const x=base();x.visibleCaption='LAB TEST: 7-OH MEASURED IN THIS PLANT';
  hold(x,'MISSING_OR_DECEPTIVE_ILLUSTRATION_DISCLOSURE');
});
test('an extraneous human effectiveness claim or publication flag cannot be smuggled into metadata',()=>{
  const x=base();x.unreviewedHumanDose='helps people sleep';x.mayPublish=true;
  hold(x,'UNREVIEWED_CAPTION_OR_PERMISSION_FIELD');
});
test('null or array candidates are rejected, never cast as evidence',()=>{
  hold(null,'MISSING_OR_INVALID_CANDIDATE');
  hold([],'MISSING_OR_INVALID_CANDIDATE');
});
