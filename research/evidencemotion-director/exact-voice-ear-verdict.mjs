/** Research-only human-ear pronunciation verdict gate.
 * This checks exact-file review identity and rejects reported mistakes.
 * It CANNOT listen to audio or detect mispronunciation automatically.
 */
const sha=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
export const HOUSE_WAV='9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435';
export const REQUIRED_TERMS=Object.freeze(['7-OH','hydroxyl','mitragynine']);
export function checkExactVoiceEarReview(r){
 const errors=[];
 if(!r||typeof r!=='object')return {status:'HOLD',errors:['MISSING_HUMAN_LISTENING_RECEIPT'],publicationAllowed:false};
 if(r.originalWavSha256!==HOUSE_WAV||r.auditionedWavSha256!==HOUSE_WAV)errors.push('EAR_REVIEW_WRONG_OR_REGENERATED_WAV');
 if(!sha(r.masterAudioSha256)||r.masterAudioSha256!==r.actualAuditionedMasterAudioSha256)
  errors.push('AUDITION_NOT_BOUND_TO_EXACT_MASTER_AUDIO');
 if(r.reviewerKind!=='HUMAN_EAR' || r.reviewerWasPresent!==true || !r.reviewedAt || typeof r.reviewedAt!=='string')
  errors.push('HUMAN_EAR_REVIEW_MISSING');
 if(r.syntheticOrAutoApproved===true)errors.push('SYNTHETIC_REVIEW_CANNOT_CERTIFY_PRONUNCIATION');
 if(!Array.isArray(r.terms)||r.terms.length!==REQUIRED_TERMS.length||
    new Set(r.terms.map(x=>x?.term)).size!==REQUIRED_TERMS.length||
    REQUIRED_TERMS.some(term=>!r.terms.some(x=>x.term===term&&['PASS','FAIL'].includes(x.verdict))))
  errors.push('EXACT_PRONUNCIATION_SET_INCOMPLETE');
 if(Array.isArray(r.terms)&&r.terms.some(x=>x?.verdict==='FAIL'))
  errors.push('OWNER_OR_HUMAN_REJECTED_PRONUNCIATION');
 if(!['PASS','FAIL'].includes(r.cadenceVerdict)||!['PASS','FAIL'].includes(r.endingVerdict))
  errors.push('CADENCE_OR_ENDINGS_NOT_EAR_CHECKED');
 if(r.cadenceVerdict==='FAIL'||r.endingVerdict==='FAIL')
  errors.push('AUDIBLE_PERFORMANCE_REJECTED');
 return {status:errors.length?'HOLD':'EXACT_VOICE_READY_FOR_SEPARATE_AUDIO_SCIENCE_CRAFT_APPROVAL',
  errors:[...new Set(errors)],humanVoiceVerdictCaptured:errors.length===0,
  publicationAllowed:false,scienceApproved:false,craftApproved:false,
  caution:'A reviewer-supplied FAIL reproduces the rejected mispronunciation path; this is NOT machine speech recognition.'};
}
