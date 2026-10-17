/** EvidenceMotion autonomous film adjudication — research-only.
 * Machine evidence can veto a movie with no owner/listener. A positive verdict
 * requires independently source-grounded claim evidence, exact WAV+transcript,
 * calibrated independent multimodal aesthetic judges and actual decoded media.
 * Repeated AI votes on invented receipts cannot establish those inputs; the
 * production runner must generate, verify and archive them.
 */
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const DIMS=['firstSecond','narrative','artDirection','motionPurpose','typography','cohesion','audioNaturalness'];
export function adjudicateFilm({videoSha256,decodedVisual,science,voice,critics=[]}={}){
 const blockers=[],needs=[],fixes=[];
 if(!sha(videoSha256))blockers.push('MISSING_EXACT_FILM_SHA');
 if(!decodedVisual||decodedVisual.actualVideoSha256!==videoSha256
     ||decodedVisual.samples<4||decodedVisual.schemaVersion!=='ths-autonomous-film-critic-research-v1'||decodedVisual.critiqueScope!=='AUTONOMOUS_ACTUAL_PIXELS_NEGATIVE_SCREENING_NOT_HUMAN_QUALITY')
   blockers.push('ACTUAL_DECODED_VISUAL_PROOF_MISSING');
 else{
   if(decodedVisual.decision==='AUTO_REVISE'||decodedVisual.issues?.length)
      fixes.push(...(decodedVisual.issues||['ACTUAL_VIDEO_NEGATIVE_QA_REJECTED']));
   else if(decodedVisual.decision==='CRAFT_REVIEW_HOLD'){
      // The producer's decoded-pixel warning is only an advisory. Carry it
      // into the autonomous review queue without accepting craft quality.
      // Reject a substituted/empty receipt rather than silently blessing it.
      const centerCode='CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION';
      const alternateCode='TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION';
      const named=decodedVisual.reviewCandidates;
      const center=decodedVisual.centerHeroStasisPeripheralMotionWindowsSec??[];
      const alternate=decodedVisual.twoStateAlternationWindowsSec??[];
      const validNames=Array.isArray(named)&&named.length>0
        &&new Set(named).size===named.length
        &&named.every(code=>code===centerCode||code===alternateCode);
      const validCenter=Array.isArray(center)&&center.length>0&&center.every(w=>
        w&&Number.isFinite(w.startSec)&&w.startSec>=0&&
        Number.isFinite(w.endSec)&&w.endSec>w.startSec&&
        Number.isInteger(w.repeatedPairCount)&&w.repeatedPairCount>=3&&
        w.endSec-w.startSec===w.repeatedPairCount*2);
      const validAlternate=Array.isArray(alternate)&&alternate.length>0&&alternate.every(w=>
        w&&Number.isFinite(w.startSec)&&w.startSec>=0&&
        Number.isFinite(w.endSec)&&w.endSec>w.startSec&&
        Number.isInteger(w.lagTwoMatchedPairs)&&w.lagTwoMatchedPairs>=4&&
        w.endSec-w.startSec===(w.lagTwoMatchedPairs+1)*2);
      const hasCenter=Array.isArray(named)&&named.includes(centerCode);
      const hasAlternate=Array.isArray(named)&&named.includes(alternateCode);
      if(validNames&&
        (hasCenter?validCenter:Array.isArray(center)&&center.length===0)&&
        (hasAlternate?validAlternate:Array.isArray(alternate)&&alternate.length===0)){
        if(hasCenter)needs.push('SOURCE_BOUND_CRAFT_REVIEW_FOR_STATIC_CENTER_HERO');
        if(hasAlternate)needs.push('SOURCE_BOUND_CRAFT_REVIEW_FOR_TWO_STATE_LAYOUT_LOOP');
      }
      else blockers.push('VISUAL_CRAFT_HOLD_EVIDENCE_MISSING');
   }
   else if(decodedVisual.decision!=='AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE')
      blockers.push('VISUAL_DECISION_UNRECOGNIZED');
 }
 if(!science||science.filmSha256!==videoSha256||science.origin!=='INDEPENDENT_SOURCE_GRAPH_AUDIT'
     ||science.underlyingSourcesVerified!==true||!Array.isArray(science.claimChecks)
     ||!science.claimChecks.length)
     needs.push('INDEPENDENT_RETRIEVED_CLAIM_SOURCE_AUDIT_REQUIRED');
 else for(const claim of science.claimChecks){
   if(!sha(claim.claimTextSha256)||!Array.isArray(claim.exactSourceIds)||!claim.exactSourceIds.length
      ||!['NOT_A_HUMAN_EFFECT_CLAIM','STRUCTURAL_ONLY','PRECLINICAL_INDIRECT','DIRECT_VERIFIED_HUMAN'].includes(claim.humanEvidenceDirectness))
      needs.push('CLAIM_PROVENANCE_OR_EVIDENCE_DIRECTNESS_MISSING');
   if(claim.supportStatus==='UNSUPPORTED'||claim.supportStatus==='CONTRADICTED'
      ||claim.humanEffectAsserted===true&&claim.humanEvidenceDirectness!=='DIRECT_VERIFIED_HUMAN')
      fixes.push('CLAIM_UNSUPPORTED_OR_PROMOTED_PRECLINICAL_EFFECT');
   if(claim.supportStatus!=='SUPPORTED'&&claim.supportStatus!=='UNSUPPORTED'
      &&claim.supportStatus!=='CONTRADICTED')needs.push('CLAIM_SOURCE_REVIEW_UNDECIDED');
 }
 if(!voice||voice.filmSha256!==videoSha256||voice.origin!=='INDEPENDENT_AUDIO_ASR_AND_ACOUSTIC'
     ||!sha(voice.originalWavSha256)||!sha(voice.extractedAudioSha256)
     ||voice.exactWavLocked!==true||voice.actualAudioVerified!==true)
      needs.push('INDEPENDENT_ORIGINAL_VOICE_ASR_AND_AUDIO_RECEIPT_REQUIRED');
 else{
   if(voice.hardAudioFailures?.length)fixes.push(...voice.hardAudioFailures);
   if(voice.fittedWordAlignment!==true||voice.termPronunciationCoverage!==true
      ||!Number.isFinite(voice.pronunciationConfidence)||voice.pronunciationConfidence<.92||voice.pronunciationConfidence>1
      ||!Number.isFinite(voice.asrCoverage)||voice.asrCoverage<.94||voice.asrCoverage>1)
       needs.push('SPECIALIST_PRONUNCIATION_OR_EXACT_WORD_COVERAGE_UNCERTAIN');
   if(voice.verifiedMispronunciations?.length)fixes.push('AUTOMATED_VOICE_PRONUNCIATION_REJECT');
 }
 const voted=critics.filter(c=>c&&c.filmSha256===videoSha256
  &&c.origin==='INDEPENDENT_FULL_VIDEO_MULTIMODAL_CRITIC'
  &&sha(c.modelRunSha256)&&sha(c.referenceSetSha256)
  &&c.calibrationPassed===true
  &&Number.isFinite(c.anchorFalsePassRate)&&c.anchorFalsePassRate>=0&&c.anchorFalsePassRate<=.05
  &&Number.isFinite(c.anchorFalseRejectRate)&&c.anchorFalseRejectRate>=0&&c.anchorFalseRejectRate<=.15
  &&c.reviewedFullAudioAndVideo===true&&c.scienceJudgeSeparate===true
  &&DIMS.every(dim=>Number.isFinite(c.scores?.[dim])&&c.scores[dim]>=0&&c.scores[dim]<=10)
  &&Array.isArray(c.timecodedFaults));
 if(voted.length<2||new Set(voted.map(v=>v.modelFamily)).size<2||
    new Set(voted.map(v=>v.modelRunSha256)).size<2||
    new Set(voted.map(v=>v.referenceSetSha256)).size!==1)
     needs.push('TWO_DIFFERENT_CALIBRATED_MULTIMODAL_REVIEWERS_MISSING');
 else{
   for(const dim of DIMS){
     if(voted.some(v=>v.scores[dim]<8.3))
       fixes.push('AUTOMATED_CRAFT_BELOW_PREMIUM_BAR:'+dim);
     if(Math.max(...voted.map(v=>v.scores[dim]))-Math.min(...voted.map(v=>v.scores[dim]))>1.5)
       needs.push('BLIND_CRAFT_JUDGES_DISAGREE:'+dim);
   }
   if(voted.some(v=>v.timecodedFaults.some(f=>f.severity==='CRITICAL')))
     fixes.push('CRITICAL_PERCEPTUAL_VIDEO_DEFECT');
 }
 // Until a trusted in-process runner executes the independent science, ASR
 // and multimodal models and verifies their actual inputs/results, caller-
 // supplied JSON can never serve as affirmative proof. This research stage
 // intentionally allows automatic REVISE but not fabricated AUTO_PASS.
 if(!blockers.length&&!fixes.length&&!needs.length)
   needs.push('TRUSTED_MULTIMODAL_AND_SOURCE_RUN_ATTESTATION_NOT_IMPLEMENTED');
 const uniq=arr=>[...new Set(arr)];
 const decision=blockers.length?'AUTO_HOLD_INVALID_PROOF':fixes.length?'AUTO_REVISE':
   'AUTO_RUN_MISSING_REVIEWS';
 return {schema:'ths-autonomous-quality-research-v1',
    decision,qualityAcceptableForResearch:decision==='AUTO_ACCEPT_RESEARCH_QUALITY',
    blockers:uniq(blockers),fixes:uniq(fixes),missingMachineWork:uniq(needs),
    requiredHumanListener:false,requiredOwnerTasteVerdict:false,
    humanReviewerImpersonated:false,
    contentMayPublish:false,productionVersionFreezeLifted:false,
    caveat:'Independent calibrated multimodal models and retrieved source identity are still required; JSON shape and score votes alone are not evidence that an actual reviewer ran.'};
}
