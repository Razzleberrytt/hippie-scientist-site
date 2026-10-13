import {test} from 'node:test';import assert from 'node:assert/strict';
import {inspectDecodedProof} from './preview-proof.mjs';
const proof=()=>({origin:'independent-full-decode',previewSha256:'a'.repeat(64),decodedFrameCount:90,width:540,height:960,fps:15,roiPixels:[59,173,481,730],maxCaptionExcludedStaticSec:.33,medianChangedFraction:.2,medianBroadStructureChangedFraction:.08});
test('uses independent real-frame shape but never self-certifies excellence',()=>{const x=inspectDecodedProof(proof());assert.equal(x.status,'AUDIT_EVIDENCE_USABLE');assert.equal(x.artisticApproval,false)});
test('flags moving-poster risk even when six-second freeze check passes',()=>{const x=inspectDecodedProof({...proof(),medianChangedFraction:0});assert.equal(x.status,'AUDIT_EVIDENCE_USABLE');assert.ok(x.advisories.includes('NEAR_STATIC_MOVING_POSTER_RISK'))});
test('rejects storyboard/self-reported and caption-contaminated motion',()=>{assert.equal(inspectDecodedProof({...proof(),origin:'decoded-preview'}).status,'HOLD');assert.ok(inspectDecodedProof({...proof(),roiPixels:[0,0,500,800]}).errors.includes('CAPTION_CONTAMINATED_MOTION_REGION'))});
test('rejects missing/inconsistent decoder measurements',()=>{assert.ok(inspectDecodedProof({...proof(),medianChangedFraction:null}).errors.includes('MOTION_DENSITY_NOT_MEASURED'));assert.ok(inspectDecodedProof({...proof(),decodedFrameCount:0}).errors.includes('MISSING_DECODED_FRAME_COUNT'))});
test('6s static region is never admitted',()=>{assert.ok(inspectDecodedProof({...proof(),maxCaptionExcludedStaticSec:6.2}).errors.includes('STATIC_COMPOSITION_KILL'))});

test('confetti motion cannot mask an otherwise static hero structure',()=>{
 const x=inspectDecodedProof({...proof(),medianChangedFraction:.02,medianBroadStructureChangedFraction:0});
 assert.equal(x.status,'AUDIT_EVIDENCE_USABLE');
 assert.ok(x.advisories.includes('HERO_STRUCTURE_STILL_STATIC'));
});
