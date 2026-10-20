import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessNarrativeReveal as assess} from './reveal-quality-gate.mjs';
const hex='a'.repeat(64);
const proof=()=>({expectedVideoSha256:hex,
 decodedFrameAudit:{origin:'independent-full-decode',previewSha256:hex,decodedFrameCount:90,maxCaptionExcludedStaticSec:.4,medianChangedFraction:.06},
 statePairAudit:{origin:'independently-decoded-video',videoSha256:hex,changedSubjectBlocksFraction:.70}});
test('strong measured change still needs human craft review',()=>{
 const r=assess(proof());assert.equal(r.status,'HUMAN_CRAFT_REVIEW_REQUIRED');
 assert.equal(r.excellentCertified,false);assert.equal(r.productionEligible,false);
});
test('holds state change when most frames barely move',()=>{
 const x=proof();x.decodedFrameAudit.medianChangedFraction=.00278;
 const r=assess(x);assert.equal(r.status,'RESEARCH_HOLD');
 assert.ok(r.advisories.includes('NEAR_STATIC_MOVING_POSTER_RISK'));
});
test('does not reward sparse confetti with unchanged hero state',()=>{
 const x=proof();x.statePairAudit.changedSubjectBlocksFraction=.03;
 assert.ok(assess(x).advisories.includes('SUBJECT_BEFORE_AFTER_HAS_NO_LARGE_SCALE_DIFFERENCE'));
});
test('cannot borrow state pair report from a different MP4',()=>{
 const x=proof();x.statePairAudit.videoSha256='b'.repeat(64);
 assert.ok(assess(x).blockers.includes('UNBOUND_OR_MISMATCHED_MEDIA_IDENTITY'));
});
test('self-asserted decoder origin and missing motion metrics hold',()=>{
 const x=proof();x.decodedFrameAudit.origin='storyboard';x.decodedFrameAudit.medianChangedFraction=undefined;
 assert.ok(assess(x).blockers.includes('BOTH_INDEPENDENT_DECODERS_REQUIRED'));
 assert.ok(assess(x).blockers.includes('INCOMPLETE_DECODED_MEASUREMENTS'));
});
test('six-second static hard kill remains intact',()=>{
 const x=proof();x.decodedFrameAudit.maxCaptionExcludedStaticSec=6.3;
 assert.ok(assess(x).blockers.includes('LONG_STATIC_STREAK_KILL'));
});
