/** Named reject reproductions for the canonical EvidenceMotion quality checklist.
 * All receipts are SYNTHETIC adversarial fixtures; actual media and ear checks
 * remain independently required. Reuses existing validators, never replaces.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectDecodedProof} from './preview-proof.mjs';
import {checkScientificView} from './scientific-view-contract.mjs';
import {inspectHeroAction} from './hero-action-contract.mjs';
import {validateStoryFirstPlan} from './story-first-gates.mjs';
import {sampleStoryPlan} from './story-first-fixture.mjs';
import {checkExactVoiceEarReview, HOUSE_WAV, REQUIRED_TERMS} from './exact-voice-ear-verdict.mjs';

const H='a'.repeat(64);
const sci=()=>({compoundInchiKey:'RYENLSMHLCNXJT-CYXFISRXSA-N',
 sourceGraphSha256:H,drawnGraphSha256:H,mode:'WHOLE',
 sceneBox:[0,0,540,450],graphInkBox:[40,50,480,400]});
const hero=()=>({beatId:'hook01',heroObjectId:'verified-chemistry',lockedHeroArtSha256:H,
 startSec:0,endSec:5,narrationCueSec:.2,physicalVerb:'OPENS_TO_REVEAL',
 beforeStateId:'source-incomplete',afterStateId:'source-revealed',
 visibleObjectIds:['verified-chemistry'],cameraMoveCount:1,
 effectOnly:false,movingParticlesOnly:false,flatSlideOverlay:false});
const voice=()=>({originalWavSha256:HOUSE_WAV,auditionedWavSha256:HOUSE_WAV,
 masterAudioSha256:H,actualAuditionedMasterAudioSha256:H,reviewerKind:'HUMAN_EAR',
 reviewerWasPresent:true,reviewedAt:'2026-10-13T20:00:00-04:00',
 syntheticOrAutoApproved:false,
 terms:REQUIRED_TERMS.map(term=>({term,verdict:'PASS'})),
 cadenceVerdict:'PASS',endingVerdict:'PASS'});

test('01 REJECT generic static poster / no actual hero action',()=>{
 const v=inspectDecodedProof({origin:'independent-full-decode',previewSha256:H,
  width:540,height:960,fps:15,decodedFrameCount:135,
  roiPixels:[60,175,480,730],maxCaptionExcludedStaticSec:7.1,
  medianChangedFraction:0,medianBroadStructureChangedFraction:0});
 assert.ok(v.errors.includes('STATIC_COMPOSITION_KILL'));
 const h=inspectHeroAction({...hero(),physicalVerb:'ROTATING_FLAT_CARD',flatSlideOverlay:true});
 assert.ok(h.reasons.includes('DECORATION_IS_NOT_HERO_ACTION'));
 assert.ok(h.reasons.includes('VISUAL_EFFECT_SUBSTITUTED_FOR_ACTION'));
 assert.equal(h.releaseApproved,false);
});
test('02 REJECT disconnected or changed chemical source graph',()=>{
 const v=checkScientificView({...sci(),drawnGraphSha256:'b'.repeat(64)});
 assert.ok(v.errors.includes('SOURCE_GRAPH_IDENTITY_UNVERIFIED'));
 assert.equal(v.publicationApproved,false);
 // The exact mutated-RDKit-graph disconnect is separately tested in the
 // focused Python fault-injection suite, not inferred from this hash fixture.
});
test('03 REJECT human-reported wrong pronunciation AND unverifiable auto-approval',()=>{
 const wrong=voice();wrong.terms[2]={term:'mitragynine',verdict:'FAIL',heardAs:'mispronounced'};
 assert.ok(checkExactVoiceEarReview(wrong).errors.includes('OWNER_OR_HUMAN_REJECTED_PRONUNCIATION'));
 const automatic=voice();automatic.syntheticOrAutoApproved=true;automatic.reviewerKind='AUTOMATED';
 assert.ok(checkExactVoiceEarReview(automatic).errors.includes('HUMAN_EAR_REVIEW_MISSING'));
 assert.equal(checkExactVoiceEarReview(automatic).publicationAllowed,false);
 const missing=voice();missing.terms.splice(1,1);
 assert.ok(checkExactVoiceEarReview(missing).errors.includes('EXACT_PRONUNCIATION_SET_INCOMPLETE'));
});
test('04 REJECT clipped AAC through existing strict native-master suite',()=>{
 // Real negative AUDIO_VIDEO_DURATION_MISMATCH and AAC ADTS changes are
 // checked by test_native_master_audit.py in the same protected research job.
 // This marker ensures the matrix cannot claim a simulated audio pass.
 const x=voice();x.masterAudioSha256='b'.repeat(64);
 assert.ok(checkExactVoiceEarReview(x).errors.includes('AUDITION_NOT_BOUND_TO_EXACT_MASTER_AUDIO'));
});
test('05 REJECT cropped source graph misrepresented as complete',()=>{
 const x=checkScientificView({...sci(),graphInkBox:[-10,20,560,430]});
 assert.ok(x.errors.includes('AUTHORITATIVE_2D_GRAPH_CROPPED'));
 const detail=checkScientificView({...sci(),mode:'ATOM_DETAIL',
  graphInkBox:[-10,20,560,430],scienceDetailLabel:'WHOLE',
  highlightedAtomIndex:29,sourceHydroxylAtomIndex:29,
  projectedAtomPoint:[245,180],highlightCenterPoint:[245,180]});
 assert.ok(detail.errors.includes('DETAIL_CROP_NOT_LABELED'));
});
test('06 REJECT fabricated human effects inferred from structure',()=>{
 const p=sampleStoryPlan();p.claims[0].assertsHumanEffect=true;
 assert.ok(validateStoryFirstPlan(p).errors.includes('STRUCTURE_OR_ANIMAL_DATA_PROMOTED_TO_HUMAN_EFFECT'));
 p.acts[2].depictsUnmeasuredReceptorBinding=true;
 assert.ok(validateStoryFirstPlan(p).errors.includes('UNSUPPORTED_SCIENTIFIC_VISUAL'));
});
test('07 REJECT overlapping/unsafe captions, not just metadata claims',()=>{
 const p=sampleStoryPlan();
 p.acts[1].captionBox={x1:.72,y1:.92,x2:.97,y2:.98};
 assert.ok(validateStoryFirstPlan(p).errors.includes('CLIPPED_OR_OVERLAPPING_STORY_ZONES'));
 const proof=inspectDecodedProof({origin:'independent-full-decode',previewSha256:H,
  width:540,height:960,fps:15,decodedFrameCount:90,
  roiPixels:[50,0,480,900],maxCaptionExcludedStaticSec:.1,
  medianChangedFraction:.3,medianBroadStructureChangedFraction:.1});
 assert.ok(proof.errors.includes('CAPTION_CONTAMINATED_MOTION_REGION'));
});
test('08 REJECT moving confetti/particles in place of chemistry storytelling',()=>{
 const x=inspectHeroAction({...hero(),physicalVerb:'PARTICLES_ONLY',
  movingParticlesOnly:true,effectOnly:true});
 assert.ok(x.reasons.includes('VISUAL_EFFECT_SUBSTITUTED_FOR_ACTION'));
 assert.ok(x.reasons.includes('DECORATION_IS_NOT_HERO_ACTION'));
 const y=inspectDecodedProof({origin:'independent-full-decode',previewSha256:H,
  width:540,height:960,fps:15,decodedFrameCount:90,
  roiPixels:[60,175,480,730],maxCaptionExcludedStaticSec:.4,
  medianChangedFraction:.03,medianBroadStructureChangedFraction:0});
 assert.ok(y.advisories.includes('HERO_STRUCTURE_STILL_STATIC'));
});
test('09 FAIL CLOSED on synthetic discovery/approval spoof',()=>{
 const x=checkExactVoiceEarReview({...voice(),reviewedAt:null});
 assert.ok(x.errors.includes('HUMAN_EAR_REVIEW_MISSING'));
 const story=sampleStoryPlan();story.ownerApproved=true;
 assert.ok(validateStoryFirstPlan(story).errors.includes('SELF_CERTIFIED_HUMAN_APPROVAL_NOT_ALLOWED'));
 // Node test discovery is executed (not faked) by native-test-isolation.test.mjs
 // and the path-scoped workflow. This suite's nine named tests must be present.
});
test('human-audition fixture remains strictly non-publishing even when all flags pass',()=>{
 const x=checkExactVoiceEarReview(voice());
 assert.equal(x.status,'EXACT_VOICE_READY_FOR_SEPARATE_AUDIO_SCIENCE_CRAFT_APPROVAL');
 assert.equal(x.publicationAllowed,false);
 assert.equal(x.scienceApproved,false);
 assert.equal(x.craftApproved,false);
});
