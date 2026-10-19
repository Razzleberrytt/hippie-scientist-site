import { assessEvidenceMotionAudienceQuality } from '../../scripts/distribution/evidencemotion-audience-quality.mjs';

/** EvidenceMotion autonomous film adjudication — research-only.
 * Machine evidence can veto a movie with no owner/listener. A positive verdict
 * requires independently source-grounded claim evidence, exact WAV+transcript,
 * calibrated independent multimodal aesthetic judges and actual decoded media.
 * Repeated AI votes on invented receipts cannot establish those inputs; the
 * production runner must generate, verify and archive them.
 */
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const DIMS=['firstSecond','narrative','artDirection','motionPurpose','typography','cohesion','audioNaturalness'];
export function adjudicateFilm({videoSha256,decodedVisual,science,voice,critics=[],audienceBrief,audiencePixelReview,audienceCritics=[],observedPerformance}={}){
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
      const blankCode='INTERLEAVED_NEAR_BLANK_VISUAL_PHASE';
      const named=decodedVisual.reviewCandidates;
      const center=decodedVisual.centerHeroStasisPeripheralMotionWindowsSec??[];
      const alternate=decodedVisual.twoStateAlternationWindowsSec??[];
      const blank=decodedVisual.interleavedBlankPhaseWindowsSec??[];
      const validNames=Array.isArray(named)&&named.length>0
        &&new Set(named).size===named.length
        &&named.every(code=>[centerCode,alternateCode,blankCode].includes(code));
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
      // 1Hz optical samples (including opposite phase) bind the blank window to
      // actual measured film coverage. No impossible/out-of-range timecodes.
      const n=decodedVisual.oneHzOpticalScreenSamples;
      const validBlankGrid=Number.isInteger(n)&&n>=12&&
        Number.isInteger(decodedVisual.samples)&&decodedVisual.samples===Math.ceil(n/2)&&
        (decodedVisual.actualDurationSeconds===undefined||
          Number.isFinite(decodedVisual.actualDurationSeconds)&&
          Math.abs(n-decodedVisual.actualDurationSeconds)<=1.05);
      const validBlank=validBlankGrid&&Array.isArray(blank)&&blank.length>0&&blank.every(w=>
        w&&Number.isInteger(w.startSec)&&w.startSec>=0&&
        Number.isInteger(w.endSec)&&w.endSec>w.startSec&&w.endSec<=n&&
        Number.isInteger(w.blankSamples)&&w.blankSamples>=4&&
        w.blankSamples<=Math.floor(n/2)&&
        (w.blankPhase===0||w.blankPhase===1)&&
        w.startSec%2===w.blankPhase&&
        w.endSec-w.startSec===2*w.blankSamples-1);
      const hasCenter=Array.isArray(named)&&named.includes(centerCode);
      const hasAlternate=Array.isArray(named)&&named.includes(alternateCode);
      const hasBlank=Array.isArray(named)&&named.includes(blankCode);
      if(validNames&&
        (hasCenter?validCenter:Array.isArray(center)&&center.length===0)&&
        (hasAlternate?validAlternate:Array.isArray(alternate)&&alternate.length===0)&&
        (hasBlank?validBlank:Array.isArray(blank)&&blank.length===0)){
        if(hasCenter)needs.push('SOURCE_BOUND_CRAFT_REVIEW_FOR_STATIC_CENTER_HERO');
        if(hasAlternate)needs.push('SOURCE_BOUND_CRAFT_REVIEW_FOR_TWO_STATE_LAYOUT_LOOP');
        if(hasBlank)needs.push('SOURCE_BOUND_CRAFT_REVIEW_FOR_INTERLEAVED_BLANK_INTERVALS');
      }
      else blockers.push('VISUAL_CRAFT_HOLD_EVIDENCE_MISSING');
   }
   else if(decodedVisual.decision==='AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE'){
      // A producer may not downgrade a decoded negative-screen warning to
      // "awaiting review" by changing only its decision label. Missing,
      // malformed, or nonempty warning evidence must fail closed. Actual
      // craft/safety acceptance is independently held in all cases.
      const warningFields=[
        'reviewCandidates','centerHeroStasisPeripheralMotionWindowsSec',
        'twoStateAlternationWindowsSec','interleavedBlankPhaseWindowsSec'
      ];
      if(warningFields.some(key=>!Array.isArray(decodedVisual[key])
           ||decodedVisual[key].length!==0))
        blockers.push('VISUAL_CRAFT_WARNING_SUPPRESSED');
   }
   else blockers.push('VISUAL_DECISION_UNRECOGNIZED');
 }
 // The native decoded critic also measures 1Hz center-hero stagnation.
 // Its warning has never been a root-level issue: keep it visible as a
 // source-bound craft REVIEW dependency, not a cosmetic/publishing veto.
 // Missing legacy evidence requires a new physical review, never a PASS.
 if(decodedVisual&&decodedVisual.actualVideoSha256===videoSha256){
   const cadence=decodedVisual.oneHzHeroCadence;
   if(cadence===undefined){
     needs.push('DECODED_1HZ_HERO_CADENCE_EVIDENCE_MISSING');
   }else{
     const n=decodedVisual.oneHzOpticalScreenSamples;
     const windows=cadence?.stagnationWindows;
     const validWindow=w=>w&&Number.isInteger(w.startSec)&&w.startSec>=0
       &&Number.isInteger(w.endSec)&&w.endSec>w.startSec
       &&w.endSec<n&&Number.isInteger(w.stagnantSecondsAtOneHz)
       &&w.stagnantSecondsAtOneHz===w.endSec-w.startSec
       &&w.stagnantSecondsAtOneHz>=3
       &&w.severity===(w.stagnantSecondsAtOneHz>6?'REVISE_CANDIDATE':'CRAFT_HOLD_CANDIDATE');
     // Bound both the report's sampled clock and its window inventory to the
     // actual decoded film; shortened "clean" grids cannot hide its ending.
     const duration=decodedVisual.actualDurationSeconds;
     const longest=Array.isArray(windows)&&Number.isInteger(n)
       &&n>=4&&n<=92&&windows.length<=n
       ?windows.reduce((max,w)=>Math.max(max,w?.stagnantSecondsAtOneHz??NaN),0):NaN;
     // Each stagnant second is a pair of consecutively visible 1Hz hero
     // samples. Disjoint windows therefore require seconds+1 visible
     // samples apiece; a forged tiny visibility count cannot substantiate
     // several long freeze windows.
     const minVisible=Array.isArray(windows)&&Number.isInteger(n)&&windows.length<=n
       ?windows.reduce((sum,w)=>sum+(w?.stagnantSecondsAtOneHz??NaN)+1,0):NaN;
     const valid=cadence!==null&&typeof cadence==='object'&&Number.isInteger(n)&&n>=4&&n<=92
       &&Number.isFinite(duration)&&duration>=12&&duration<=90
       &&Math.abs(n-duration)<=1.05
       &&Number.isInteger(decodedVisual.samples)&&decodedVisual.samples===Math.ceil(n/2)
       &&cadence.probe==='SHA_PINNED_ACTUAL_FRAME_CENTER_HERO_1HZ_RESEARCH_NEGATIVE_ONLY'
       &&cadence.sampleCount===n&&cadence.thresholdSec===3
       &&Array.isArray(cadence.centerHeroBoxPixels)
       &&cadence.centerHeroBoxPixels.length===4
       &&cadence.centerHeroBoxPixels.every((v,i)=>v===[58,86,122,190][i])
       &&Number.isInteger(cadence.visibleCenterHeroSamples)
       &&cadence.visibleCenterHeroSamples>=0&&cadence.visibleCenterHeroSamples<=n
       &&cadence.visibleCenterHeroSamples>=minVisible
       &&Array.isArray(windows)&&windows.length<=n&&windows.every(validWindow)
       &&windows.every((w,i)=>i===0||windows[i-1].endSec<w.startSec)
       &&cadence.longestFlaggedStagnationSec===longest
       &&cadence.creativeScreenVerdict===(windows.length?'CRAFT_HOLD':'NO_NEGATIVE_FOUND_NOT_CRAFT_PASS')
       &&cadence.sceneSpecificHeroAndMeaningVerified===false
       &&cadence.offCenterAndIntentionalReadingHoldNotAdjudicated===true
       &&cadence.automaticallyApprovedArt===false;
     if(!valid) blockers.push('DECODED_1HZ_HERO_CADENCE_PROOF_INVALID');
     else if(windows.length)
       needs.push('SOURCE_BOUND_CRAFT_REVIEW_FOR_1HZ_HERO_STAGNATION');
   }
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
 const audienceQuality=assessEvidenceMotionAudienceQuality({
   filmSha256:videoSha256,audienceBrief,
   decodedPixelReview:audiencePixelReview,
   independentCritics:audienceCritics,observedPerformance
 });
 if(audienceQuality.decision==='HOLD_INVALID_EVIDENCE')
   blockers.push('AUDIENCE_REVIEW_INVALID_EXACT_FILM_EVIDENCE');
 fixes.push(...audienceQuality.timecodedRepairTargets);
 if(audienceQuality.decision==='REVIEW_PENDING')
   needs.push('AUDIENCE_FULL_FILM_INDEPENDENT_CRITIQUE_MISSING');
 // Until a trusted in-process runner executes the independent science, ASR
 // and multimodal models and verifies their actual inputs/results, caller-
 // supplied JSON can never serve as affirmative proof. This research stage
 // intentionally allows automatic REVISE but not fabricated AUTO_PASS.
 // Every current path still lacks a trusted in-process independent proof runner.
 needs.push('TRUSTED_MULTIMODAL_AND_SOURCE_RUN_ATTESTATION_NOT_IMPLEMENTED');
 const uniq=arr=>[...new Set(arr)];
 const decision=blockers.length?'AUTO_HOLD_INVALID_PROOF':fixes.length?'AUTO_REVISE':
   'AUTO_RUN_MISSING_REVIEWS';
 return {schema:'ths-autonomous-quality-research-v1',
    decision,qualityAcceptableForResearch:decision==='AUTO_ACCEPT_RESEARCH_QUALITY',
    blockers:uniq(blockers),fixes:uniq(fixes),missingMachineWork:uniq(needs),
    requiredHumanListener:false,requiredOwnerTasteVerdict:false,
    humanReviewerImpersonated:false,
    audienceQuality,technicalReviewNotAudienceReview:true,
    postingRecommendationAllowed:false,
    contentMayPublish:false,productionVersionFreezeLifted:false,
    caveat:'Independent calibrated multimodal models and retrieved source identity are still required; JSON shape and score votes alone are not evidence that an actual reviewer ran.'};
}
