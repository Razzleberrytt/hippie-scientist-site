/** Research-only factual telemetry gate for mastered house narration.
 * Requires a separate, actual media decoder and EBU R128 analyzer.
 * DOES NOT grant a voice/artistic or production approval.
 */
const isHash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/i.test(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function assessOriginalVoiceMaster({
 originalVoiceWavSha256, measuredOriginalVoiceWavSha256,
 outputAudioStreamSha256, auditionedAudioStreamSha256,
 analyzerOrigin, originalLUFS, masteredLUFS, masteredTruePeakDbTP,
 measuredRelativeLagMs, waveformCorrelation, timeStretchApplied,
 ownerAuditioned=false
}={}){
 const issues=[];
 if(!isHash(originalVoiceWavSha256)||originalVoiceWavSha256!==measuredOriginalVoiceWavSha256)
   issues.push('ORIGINAL_NARRATION_IDENTITY_REQUIRED');
 if(!isHash(outputAudioStreamSha256)||outputAudioStreamSha256!==auditionedAudioStreamSha256)
   issues.push('AUDITION_MUST_MATCH_MASTERED_OUTPUT');
 if(analyzerOrigin!=='independent-decoded-EBU-R128-and-PCM-correlation')
   issues.push('ACTUAL_MEASUREMENTS_REQUIRED');
 if(!finite(originalLUFS)||!finite(masteredLUFS)||!finite(masteredTruePeakDbTP))
   issues.push('LOUDNESS_MEASUREMENT_MISSING');
 else{
   if(masteredLUFS< -19 || masteredLUFS> -15)issues.push('PHONE_SPEECH_LOUDNESS_OUT_OF_BOUNDS');
   if(masteredTruePeakDbTP> -1.0)issues.push('TRUE_PEAK_TOO_HIGH');
   if(masteredLUFS-originalLUFS<2)issues.push('GAIN_CHANGE_NOT_SUBSTANTIATED');
 }
 if(!finite(measuredRelativeLagMs)||Math.abs(measuredRelativeLagMs)>10)
   issues.push('NARRATION_TIMING_SHIFT');
 if(!finite(waveformCorrelation)||waveformCorrelation<.99)
   issues.push('NARRATION_PERFORMANCE_CHANGED');
 if(timeStretchApplied===true)issues.push('NO_TIME_STRETCH_ALLOWED');
 return {status:issues.length?'HOLD':'TECHNICAL_MASTERING_READY_FOR_EAR_CHECK',
   issues:[...new Set(issues)],phoneAuditionPending:!ownerAuditioned,
   craftApproved:false,productionEligible:false,
   caution:'Measured loudness and waveform identity are necessary but cannot prove pronunciation, expressiveness, naturalness or phone speaker readability.'};
}
