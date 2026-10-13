import {test} from 'node:test';import assert from 'node:assert/strict';
import {assessOriginalVoiceMaster as assess} from './audio-mastering-gate.mjs';
const hash='a'.repeat(64);
const fixture=()=>({
 originalVoiceWavSha256:hash,measuredOriginalVoiceWavSha256:hash,
 outputAudioStreamSha256:hash,auditionedAudioStreamSha256:hash,
 analyzerOrigin:'independent-decoded-EBU-R128-and-PCM-correlation',
 originalLUFS:-27.79,masteredLUFS:-17.52,masteredTruePeakDbTP:-1.49,
 measuredRelativeLagMs:0,waveformCorrelation:.99836,timeStretchApplied:false,
 ownerAuditioned:false
});
test('measured phone-loudness correction never self-certifies craft or owner hearing',()=>{
 const r=assess(fixture());assert.equal(r.status,'TECHNICAL_MASTERING_READY_FOR_EAR_CHECK');
 assert.equal(r.phoneAuditionPending,true);assert.equal(r.craftApproved,false);
 assert.equal(r.productionEligible,false);
});
test('original -27.8 LUFS too-quiet track cannot be release-ready',()=>{
 assert.ok(assess({...fixture(),masteredLUFS:-27.79}).issues.includes('PHONE_SPEECH_LOUDNESS_OUT_OF_BOUNDS'));
});
test('reject peak clipping and timing-shifted voice',()=>{
 const x=assess({...fixture(),masteredTruePeakDbTP:-.1,measuredRelativeLagMs:45});
 assert.ok(x.issues.includes('TRUE_PEAK_TOO_HIGH'));
 assert.ok(x.issues.includes('NARRATION_TIMING_SHIFT'));
});
test('reject model performance change or voice time-stretch',()=>{
 const x=assess({...fixture(),waveformCorrelation:.85,timeStretchApplied:true});
 assert.ok(x.issues.includes('NARRATION_PERFORMANCE_CHANGED'));
 assert.ok(x.issues.includes('NO_TIME_STRETCH_ALLOWED'));
});
test('require original WAV and mastered actual-audition file identity',()=>{
 const x=assess({...fixture(),measuredOriginalVoiceWavSha256:'b'.repeat(64),auditionedAudioStreamSha256:'b'.repeat(64)});
 assert.ok(x.issues.includes('ORIGINAL_NARRATION_IDENTITY_REQUIRED'));
 assert.ok(x.issues.includes('AUDITION_MUST_MATCH_MASTERED_OUTPUT'));
});
test('unverifiable telemetry fails closed',()=>{
 assert.equal(assess({...fixture(),analyzerOrigin:'scorecard-only'}).status,'HOLD');
});
