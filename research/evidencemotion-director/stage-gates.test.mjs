// Run manually: node --test research/evidencemotion-director/stage-gates.test.mjs
// RESEARCH ONLY. Fixture "approval" booleans are synthetically supplied for contract tests.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDirectorPackage as validate} from './stage-gates.mjs';
import {sampleStoryPlan} from './story-first-fixture.mjs';
const sha=(s)=>s.repeat(64);
const good=()=>({
 track:'RESEARCH_ONLY',devicePath:'PHONE_FIRST_REMOTE_CPU',laptopRequired:false,
 stage:'PREVIZ',productionImports:false,autoPublish:false,paidInference:false,
 durationSec:5,approvedScienceManifestSha256:sha('a'),scientificVisualsAreDeterministic:true,
 storyFirstPlan:sampleStoryPlan(),
 reference:{id:'still-v1',pixelSha256:sha('b'),depthLayersSha256:sha('c'),backgroundFillSha256:sha('d'),
  approvedByOwner:true,generatedDataOrText:false,generatedHumanFaces:false,sourcePixelsReused:true,
  layers:[{id:'bg',sha256:sha('e'),depthClass:'background'},{id:'hero',sha256:sha('f'),depthClass:'foreground'}]},
 voice:{originalWavSha256:sha('b'),auditionedByHuman:true,wordTimingVerified:true,
  pronunciationLedgerApproved:true,pronunciationLedgerSha256:sha('2'),timeStretchApplied:false,
  sentences:[{id:'s1',wavSha256:sha('3'),text:'A simple test line.',auditioned:true}]},
 shots:[
  {id:'shot-1',startSec:0,endSec:2.5,cameraMove:'MACRO_PUSH',cameraMoveCount:1,
   referencePixelSha256:sha('b'),maxParallaxFractionOfWidth:0.025,compositionalChangeTimesSec:[0.5,2.3]},
  {id:'shot-2',startSec:2.5,endSec:5,cameraMove:'LATERAL_TRACK',cameraMoveCount:1,
   referencePixelSha256:sha('b'),maxParallaxFractionOfWidth:0.02,compositionalChangeTimesSec:[3.2,4.7]}
 ],hook:{textOnScreenAtSec:0.1,heroMovesAtSec:0.2,spokenLineStartsAtSec:0.1,
  mutedViewerComprehensionReviewed:true},
 mobileSafeArea:{topFraction:0.12,bottomFraction:0.22,rightFraction:0.22,captionsInsideSafeZone:true}
});
const errors=x=>validate(x).errors;
test('stage package can only request pixel audit, never release',()=>{
 const r=validate(good());assert.equal(r.status,'PREVIZ_PACKAGE_READY_FOR_PIXEL_AUDIT');
 assert.equal(r.excellentCertified,false);assert.equal(r.productionEligible,false);
});
test('phone-first, no paid inference, no production mutation',()=>{
 const g=good();g.laptopRequired=true;g.paidInference=true;
 assert.ok(errors(g).includes('PHONE_FIRST_ISOLATION'));
 assert.ok(errors(g).includes('PRODUCTION_FREEZE_VIOLATION'));
});
test('reference is exact still pixels, not reprompted appearance',()=>{
 const g=good();g.shots[1].referencePixelSha256=sha('f');
 assert.ok(errors(g).includes('SHOT_REFERENCE_IDENTITY_DRIFT'));
 const h=good();h.reference.regeneratedFromPromptBetweenShots=true;
 assert.ok(errors(h).includes('REFERENCE_PIXEL_DRIFT'));
});
test('one intentional camera move, no big parallax sweeps',()=>{
 const g=good();g.shots[0].cameraMoveCount=3;g.shots[0].maxParallaxFractionOfWidth=.12;
 assert.ok(errors(g).includes('SINGLE_CAMERA_MOVE_REQUIRED'));
 assert.ok(errors(g).includes('EXCESSIVE_PARALLAX_TRAVEL'));
});
test('sentence-size voice auditions and pronunciation dry-run',()=>{
 const g=good();g.voice.sentences[0].auditioned=false;g.voice.pronunciationLedgerApproved=false;
 assert.ok(errors(g).includes('VOICE_AUDITION_NOT_LOCKED'));
 assert.ok(errors(g).includes('PRONUNCIATION_DRY_RUN_REQUIRED'));
});
test('hook requires movement, text, spoken line before two seconds; mobile UI protected',()=>{
 const g=good();g.hook.heroMovesAtSec=2.4;g.mobileSafeArea.rightFraction=.10;
 assert.ok(errors(g).includes('THREE_OPENING_HOOKS_MISSING'));
 assert.ok(errors(g).includes('MOBILE_UI_OCCLUSION_RISK'));
});
test('documentary AI footage cannot go unlabeled, no synthetic humans',()=>{
 const g=good();g.shots[0].containsSyntheticPhotorealBroll=true;
 g.shots[1].containsSyntheticFaces=true;
 assert.ok(errors(g).includes('UNDISCLOSED_GENERATIVE_FOOTAGE'));
 assert.ok(errors(g).includes('SYNTHETIC_FACES_DISALLOWED'));
});
test('narration never stretched, metadata cannot pretend to decode pixels',()=>{
 const g=good();g.shots[1].speechRateChanged=true;g.decodedPreviewEvidence=true;
 assert.ok(errors(g).includes('AUDIO_IS_NOT_PICTURE_TIMING'));
 assert.ok(errors(g).includes('CALLER_SELF_CERTIFIED_DECODE_PROHIBITED'));
});
test('three-second pause suggests review instead of bogus visual kill',()=>{
 const g=good();g.shots[0].compositionalChangeTimesSec=[0];
 g.shots[1].compositionalChangeTimesSec=[4.5];
 const r=validate(g);assert.deepEqual(r.advisories,['CONSIDER_VISUAL_CHANGE_AT_2_TO_3_SECONDS']);
});
test('six-second static streak fails concept, independently decoded pixels also required',()=>{
 const g=good();g.durationSec=8;g.shots[0].endSec=3;g.shots[1].startSec=3;g.shots[1].endSec=8;
 g.shots[0].compositionalChangeTimesSec=[0];g.shots[1].compositionalChangeTimesSec=[];
 assert.ok(errors(g).includes('SIX_SECOND_STATIC_KILL'));
});

test('missing story or absent plain-English answer blocks the main director gate',()=>{
 const a=good();delete a.storyFirstPlan;
 assert.ok(errors(a).includes('STORY_FIRST_PREFLIGHT_REQUIRED'));
 const b=good();b.storyFirstPlan.plainAnswer='';
 assert.ok(errors(b).includes('NO_COMPLETE_BEGINNING_MIDDLE_ANSWER'));
});
test('the creative plan and actual director must point to the same source, voice, duration',()=>{
 const a=good();a.storyFirstPlan.lockedNarrationWavSha256='c'.repeat(64);
 assert.ok(errors(a).includes('STORY_SOURCE_VOICE_OR_TIMELINE_DRIFT'));
 const b=good();b.storyFirstPlan.sourceManifestSha256='d'.repeat(64);
 assert.ok(errors(b).includes('STORY_SOURCE_VOICE_OR_TIMELINE_DRIFT'));
});
