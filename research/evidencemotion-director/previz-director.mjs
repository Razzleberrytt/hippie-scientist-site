import {inspectDecodedProof} from './preview-proof.mjs';
/**
 * EvidenceMotion research-only shot proposal and preview critique.
 * NO production imports, network, model execution, or publish permissions.
 * Scientific claims, molecule structure and source-bound quantities are NEVER generated here.
 */
export const GRAMMAR = Object.freeze({
  G1: Object.freeze({name:'Object-to-Mechanism',camera:['MACRO_PUSH','ORBIT_REVEAL'],transition:['OCCLUSION_REVEAL','HARD_CUT']}),
  G2: Object.freeze({name:'Follow-the-Process',camera:['LATERAL_TRACK','ORBIT_REVEAL'],transition:['MATCH_ON_ACTION','SPATIAL_CONTINUITY']}),
  G3: Object.freeze({name:'Evidence Under the Lens',camera:['FOCUS_TRANSFER','MACRO_PUSH'],transition:['EVIDENCE_APERTURE','HARD_CUT']}),
  G4: Object.freeze({name:'Two-World Contrast',camera:['LATERAL_TRACK','FOCUS_TRANSFER'],transition:['SPATIAL_CONTINUITY','HARD_CUT']}),
  G5: Object.freeze({name:'Uncertainty in Depth',camera:['FOCUS_TRANSFER','LOCKED_HOLD'],transition:['OCCLUSION_REVEAL','HARD_CUT']}),
  G6: Object.freeze({name:'Scale and Consequence',camera:['PULLBACK_SCALE','LATERAL_TRACK'],transition:['MATCH_ON_ACTION','HARD_CUT']}),
});
const INTENTS=Object.freeze({
  'everyday-to-mechanism':'G1',
  'process-sequence':'G2',
  'study-measurement':'G3',
  'fair-comparison':'G4',
  'uncertainty':'G5',
  'source-bound-scale':'G6',
});
const clean=v=>String(v??'').trim();
// Share the exact same meaningful-text rule between fail-closed validation
// and the teaching-payoff comparison: punctuation/invisible marks are not a lesson.
const normalizedLesson=v=>clean(v).normalize('NFKC').toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const uniqueIds=a=>Array.isArray(a)&&a.length>0&&a.every(x=>typeof x==='string'&&x.trim()!==''&&x===x.trim())&&new Set(a).size===a.length;
const fail=(code)=>({status:'HOLD',code,candidates:[],productionEligible:false});

export function proposeShots(beat,{previousGrammar=null,previousCamera=null}={}){
  if(!beat||!clean(beat.id)||!Number.isFinite(beat.durationSec)||beat.durationSec<=0)
    return fail('INVALID_BEAT');
  // Word-aligned cue times must progress in original narration order.
  // Duplicates or reversed anchors cannot govern a deterministic shot plan.
  // A dense copy turns sparse array holes into undefined, which fail the
  // finite-value gate. Array.prototype.some on the raw array skips holes.
  const anchors=Array.isArray(beat.spokenAnchorTimes)?Array.from(beat.spokenAnchorTimes):[];
  if(!anchors.length||anchors.some((t,i)=>!Number.isFinite(t)||t<0||
       t>beat.durationSec||(i>0&&t<=anchors[i-1])))
    return fail('MISSING_AUDIO_ANCHORS');
  if(!uniqueIds(beat.claimIds)||!uniqueIds(beat.scientificAssetIds))
    return fail('SOURCE_BOUND_IDS_REQUIRED');
  const grammarId=INTENTS[clean(beat.visualIntent)];
  if(!grammarId)return fail('UNKNOWN_VISUAL_INTENT');
  // G4/G6 require explicit upstream review; this flag only asserts handoff status,
  // NEVER independently verifies the scientific source.
  if(['G4','G6'].includes(grammarId)&&beat.comparisonOrScaleReviewed!==true)
    return fail('COMPARISON_OR_SCALE_REVIEW_REQUIRED');
  if(grammarId==='G2'&&beat.sequenceReviewed!==true)
    return fail('PROCESS_REVIEW_REQUIRED');
  const grammar=GRAMMAR[grammarId];
  const camera=grammar.camera[0]===previousCamera ? grammar.camera[1]:grammar.camera[0];
  const altCamera=grammar.camera.find(c=>c!==camera)??camera;
  const candidates=[camera,altCamera].map((cam,i)=>({
    id:clean(beat.id)+':'+grammarId+':'+String(i+1),
    beatId:clean(beat.id),grammarId,grammarName:grammar.name,
    camera:cam,transition:grammar.transition[i]??grammar.transition[0],
    // A repeated grammar is permissible when explanatory continuity warrants it,
    // but the author must explicitly review adjacent repetition.
    adjacentGrammarRepeat:previousGrammar===grammarId,
    timingAuthority:'locked-original-narration',
    originalBeatDurationSec:beat.durationSec,
    anchorTimes:[...beat.spokenAnchorTimes],
    sourceClaimIds:[...beat.claimIds],
    scientificAssetIds:[...beat.scientificAssetIds],
    status:'PREVIZ_PROPOSAL_NOT_APPROVED',
    generatedScientificClaims:false,
    generatedScientificGeometry:false,
    budgetClass:'REMOTE_CPU_PREVIZ_ONLY'
  }));
  return {status:'PROPOSED',code:'TWO_CANDIDATES',candidates,productionEligible:false};
}

/**
 * Research-only negative filter for the same picture endlessly repeated.
 * Three adjacent shots using the same source assets under the same visual
 * grammar need a specifically redesigned idea, even if the camera moves,
 * subtitles, palette, claims or wording change. Those changes alone are not
 * meaningful visual variety. Use the actual decoded film for final critique.
 *
 * This is deliberately NOT an autonomous art score. Alternating grammars or
 * assets merely removes this one mechanical warning; it never passes craft.
 */
export function auditShotRepetition(shots){
  const refusal=code=>({status:'HOLD',errors:[code],findings:[],
    craftRemediationRequired:true,excellentCertified:false,
    productionEligible:false,mayPublish:false});
  if(!Array.isArray(shots)||shots.length<2)
    return refusal('SHOT_SEQUENCE_REQUIRED');
  const keys=[];
  const ids=new Set();
  let previousEndSec=null;
  for(const shot of shots){
    if(!shot||typeof shot!=='object'||!clean(shot.beatId)||
       ids.has(shot.beatId)||!Object.hasOwn(GRAMMAR,shot.grammarId)||
       !uniqueIds(shot.scientificAssetIds)||
       !Number.isFinite(shot.startSec)||!Number.isFinite(shot.endSec)||
       shot.endSec<=shot.startSec)
      return refusal('INCOMPLETE_OR_DUPLICATE_SHOT_SEQUENCE');
    // This function is also exported directly. Do not rely on the separate
    // story compiler having already validated each scene's teaching/source
    // lineage or chronological placement before declaring reviewable craft.
    if(!uniqueIds(shot.sourceClaimIds)||
       typeof shot.viewerLearns!=='string'||!normalizedLesson(shot.viewerLearns))
      return refusal('UNBOUND_SHOT_LESSON_OR_CLAIM');
    if(shot.startSec<0||(previousEndSec!==null&&shot.startSec<previousEndSec))
      return refusal('OUT_OF_ORDER_OR_OVERLAPPING_SHOTS');
    previousEndSec=shot.endSec;
    ids.add(shot.beatId);
    keys.push(JSON.stringify([shot.grammarId,[...shot.scientificAssetIds].sort()]));
  }
  const findings=[];
  let runStart=0;
  for(let i=1;i<=shots.length;i++){
    if(i!==shots.length&&keys[i]===keys[runStart])continue;
    if(i-runStart>=3){
      findings.push({reason:'THREE_PLUS_REPEATED_GRAMMAR_AND_SOURCE_SHOTS',
        firstBeatId:shots[runStart].beatId,lastBeatId:shots[i-1].beatId,
        consecutiveCount:i-runStart,grammarId:shots[runStart].grammarId,
        scientificAssetIds:[...shots[runStart].scientificAssetIds].sort()});
    }
    runStart=i;
  }
  // Mechanical teaching-progression negative screen. A new visual grammar,
  // camera, palette or transition does not by itself supply a new learning
  // payoff. This compares declared outcomes and the pinned evidence/asset IDs,
  // not audience comprehension, paraphrase meaning or actual film pixels.
  // All source-derived findings require independent artistic review.
  const payoffKeys=shots.map(shot=>{
    const outcome=normalizedLesson(shot.viewerLearns);
    // Lesson and claim/asset identity were validated above. Preserve the
    // exact shared normalization for comparison; no absent evidence placeholder.
    const evidence=[...shot.sourceClaimIds].sort();
    return JSON.stringify([outcome,[...shot.scientificAssetIds].sort(),evidence]);
  });
  // Three or more consecutive shots promising the identical learning with
  // identical evidence but cosmetically different grammars need redirection.
  // Do not double-report an existing identical-grammar/source plateau.
  for(let start=0;start<shots.length;){
    let end=start+1;
    if(payoffKeys[start]!==null)
      while(end<shots.length&&payoffKeys[end]===payoffKeys[start])end++;
    if(payoffKeys[start]!==null&&end-start>=3&&
       !keys.slice(start,end).every(key=>key===keys[start]))
      findings.push({reason:'THREE_PLUS_IDENTICAL_TEACHING_PAYOFFS_DESPITE_VISUAL_CHURN',
        firstBeatId:shots[start].beatId,lastBeatId:shots[end-1].beatId,
        consecutiveCount:end-start});
    start=end;
  }
  // An A/B/A/B/A/B teaching-outcome loop otherwise evades the adjacent rule.
  // Intentional didactic comparisons may be valid; this is a research HOLD,
  // never an automatic artistic or scientific verdict.
  for(let start=0;start+5<shots.length;){
    const a=payoffKeys[start],b=payoffKeys[start+1];
    if(a===null||b===null||a===b){start++;continue;}
    let end=start+2;
    while(end<shots.length&&payoffKeys[end]===((end-start)%2===0?a:b))end++;
    if(end-start>=6){
      findings.push({reason:'REPEATED_TWO_PAYOFF_TEACHING_CYCLE_REQUIRES_REVIEW',
        firstBeatId:shots[start].beatId,lastBeatId:shots[end-1].beatId,
        consecutiveCount:end-start,alternatingPayoffCount:2});
      start=end;
    }else start++;
  }
  return {status:findings.length?'CRAFT_REDIRECTION_REQUIRED':'SEQUENCE_REVIEW_REQUIRED',
    errors:[],findings,craftRemediationRequired:findings.length>0,
    excellentCertified:false,mayPublish:false,
    caveat:'Source-bound sequence metadata alone cannot establish composition novelty or film quality. Inspect actual preview frames and reference clips.'};
}

/**
 * Critique evidence collected from actual preview rendering (not the authored
 * storyboard). This API is a *contract*, not a pixel decoder. Receipts alone
 * are not cryptographic proof; final review requires independent media checks.
 */
const sameList=(left,right)=>Array.isArray(left)&&Array.isArray(right)&&left.length>0&&
  left.length===right.length&&left.every((value,index)=>value===right[index]);

/**
 * Tie an independently decoded preview receipt to its exact authored shot.
 * These equalities detect stale/swapped review files; they DO NOT prove that
 * receipt contents came from the media. The independent byte decoder must
 * still establish that separately.
 */
export function evaluatePreviz(candidate,receipt){
  const reasons=[];
  const bound=Boolean(candidate&&receipt&&
    typeof candidate.id==='string'&&candidate.id.length>0&&
    receipt.candidateId===candidate.id&&
    receipt.beatId===candidate.beatId&&
    receipt.grammarId===candidate.grammarId&&
    receipt.camera===candidate.camera&&
    Number.isFinite(candidate.originalBeatDurationSec)&&candidate.originalBeatDurationSec>0&&
    receipt.originalBeatDurationSec===candidate.originalBeatDurationSec&&
    sameList(candidate.sourceClaimIds,receipt.sourceClaimIds)&&
    sameList(candidate.scientificAssetIds,receipt.scientificAssetIds)&&
    sameList(candidate.anchorTimes,receipt.anchorTimes));
  if(!bound)reasons.push('SHOT_REVIEW_SOURCE_OR_TIMING_IDENTITY_MISMATCH');
  const decoded=inspectDecodedProof(receipt);
  for(const code of decoded.errors){
    reasons.push(code==='STATIC_COMPOSITION_KILL'?code:'DECODED_PROOF_'+code);
  }
  // An apparent moving-poster effect is a creative HOLD requiring a real
  // owner critique. A few changing pixels cannot prove purposeful animation.
  if(decoded.advisories.includes('NEAR_STATIC_MOVING_POSTER_RISK'))
    reasons.push('MOVING_POSTER_CONCEPT_REVIEW_HOLD');
  if(decoded.advisories.includes('HERO_STRUCTURE_STILL_STATIC'))
    reasons.push('HERO_STATIC_CONCEPT_REVIEW_HOLD');
  if(!candidate||candidate.status!=='PREVIZ_PROPOSAL_NOT_APPROVED')
    reasons.push('NOT_AN_AUTHORED_CANDIDATE');
  if(!receipt||(receipt.origin!=='independent-full-decode'||receipt.schemaVersion!=='ths-director-decoded-pixels-v1')||!clean(receipt.previewSha256)||
     !/^[a-f0-9]{64}$/i.test(clean(receipt.previewSha256))||
     !Number.isInteger(receipt.decodedFrameCount)||receipt.decodedFrameCount<=0)
    reasons.push('ACTUAL_DECODED_PREVIEW_RECEIPT_REQUIRED');
  if(receipt?.voiceTimeStretched===true)reasons.push('VOICE_TIME_STRETCH_KILL');
  if(receipt?.factualGeometryGenerated===true)reasons.push('GENERATIVE_SCIENCE_KILL');
  if(receipt?.photorealSyntheticBroll===true&&receipt?.prominentSyntheticDisclosure!==true)
    reasons.push('UNDISCLOSED_SYNTHETIC_BROLL_KILL');
  if(receipt?.heroAbsent===true)reasons.push('HERO_ABSENT_KILL');
  if(receipt?.stockClipArtDetected===true)reasons.push('STOCK_CLIP_ART_KILL');
  if(Number.isFinite(receipt?.maxCaptionExcludedStaticSec)&&receipt.maxCaptionExcludedStaticSec>6)
    reasons.push('STATIC_COMPOSITION_KILL');
  if(!Number.isFinite(receipt?.maxCaptionExcludedStaticSec))
    reasons.push('PIXEL_STATIC_MEASUREMENT_REQUIRED');
  if(receipt?.sourceLocked!==true)reasons.push('SOURCE_LOCK_RECEIPT_REQUIRED');
  if(receipt?.narrationSha256!==receipt?.approvedNarrationSha256||
     !/^[a-f0-9]{64}$/i.test(clean(receipt?.approvedNarrationSha256)))
    reasons.push('NARRATION_IDENTITY_MISMATCH');
  if(receipt?.phonePlaybackApproved===false)
    reasons.push('PHONE_PLAYBACK_PENDING');
  const kill=reasons.some(x=>x.endsWith('_KILL'));
  if(kill)return {status:'KILL',reasons,mayRenderFinal:false,excellentCertified:false};
  if(reasons.length)return {status:'HOLD',reasons,mayRenderFinal:false,excellentCertified:false};
  // A human must judge whether a proposed shot is appealing, original, readable
  // and competitive with curated reference films. Structural checks cannot do so.
  return {status:'PERCEPTUAL_REVIEW_REQUIRED',reasons:[],mayRenderFinal:false,excellentCertified:false};
}
