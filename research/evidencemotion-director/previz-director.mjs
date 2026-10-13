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
const uniqueIds=a=>Array.isArray(a)&&a.every(x=>typeof x==='string'&&x.trim()!=='')&&new Set(a).size===a.length;
const fail=(code)=>({status:'HOLD',code,candidates:[],productionEligible:false});

export function proposeShots(beat,{previousGrammar=null,previousCamera=null}={}){
  if(!beat||!clean(beat.id)||!Number.isFinite(beat.durationSec)||beat.durationSec<=0)
    return fail('INVALID_BEAT');
  if(!Array.isArray(beat.spokenAnchorTimes)||!beat.spokenAnchorTimes.length||
     beat.spokenAnchorTimes.some(t=>!Number.isFinite(t)||t<0||t>beat.durationSec))
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
 * Critique evidence collected from actual preview rendering (not the authored
 * storyboard). This API is a *contract*, not a pixel decoder. Receipts alone
 * are not cryptographic proof; final review requires independent media checks.
 */
export function evaluatePreviz(candidate,receipt){
  const reasons=[];
  const decoded=inspectDecodedProof(receipt);
  for(const code of decoded.errors){
    reasons.push(code==='STATIC_COMPOSITION_KILL'?code:'DECODED_PROOF_'+code);
  }
  // An apparent moving-poster effect is a creative HOLD requiring a real
  // owner critique. A few changing pixels cannot prove purposeful animation.
  if(decoded.advisories.includes('NEAR_STATIC_MOVING_POSTER_RISK'))
    reasons.push('MOVING_POSTER_CONCEPT_REVIEW_HOLD');
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
