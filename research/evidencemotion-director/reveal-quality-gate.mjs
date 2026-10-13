/** Research-only pair of independent negative filters. NEVER an aesthetic approval. */
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x)
const finite=x=>typeof x==='number'&&Number.isFinite(x)
export function assessNarrativeReveal({decodedFrameAudit,statePairAudit,expectedVideoSha256}={}){
 const blockers=[],advisories=[];
 if(!sha(expectedVideoSha256)||!sha(decodedFrameAudit?.previewSha256)||!sha(statePairAudit?.videoSha256)||
    decodedFrameAudit.previewSha256!==expectedVideoSha256||statePairAudit.videoSha256!==expectedVideoSha256)
  blockers.push('UNBOUND_OR_MISMATCHED_MEDIA_IDENTITY');
 if(decodedFrameAudit?.origin!=='independent-full-decode'||statePairAudit?.origin!=='independently-decoded-video')
  blockers.push('BOTH_INDEPENDENT_DECODERS_REQUIRED');
 if(!Number.isInteger(decodedFrameAudit?.decodedFrameCount)||decodedFrameAudit.decodedFrameCount<2||
    !finite(decodedFrameAudit?.maxCaptionExcludedStaticSec)||
    !finite(decodedFrameAudit?.medianChangedFraction)||
    !finite(statePairAudit?.changedSubjectBlocksFraction))
  blockers.push('INCOMPLETE_DECODED_MEASUREMENTS');
 if(finite(decodedFrameAudit?.maxCaptionExcludedStaticSec)&&decodedFrameAudit.maxCaptionExcludedStaticSec>6)
  blockers.push('LONG_STATIC_STREAK_KILL');
 if(finite(decodedFrameAudit?.medianChangedFraction)&&decodedFrameAudit.medianChangedFraction<.005)
  advisories.push('NEAR_STATIC_MOVING_POSTER_RISK');
 if(finite(statePairAudit?.changedSubjectBlocksFraction)&&statePairAudit.changedSubjectBlocksFraction<.25)
  advisories.push('SUBJECT_BEFORE_AFTER_HAS_NO_LARGE_SCALE_DIFFERENCE');
 if(!blockers.length&&!advisories.length)return {
  status:'HUMAN_CRAFT_REVIEW_REQUIRED',blockers:[],advisories:[],
  excellentCertified:false,scientificApproval:false,productionEligible:false};
 return {status:'RESEARCH_HOLD',blockers:[...new Set(blockers)],advisories,
  excellentCertified:false,scientificApproval:false,productionEligible:false};
}
