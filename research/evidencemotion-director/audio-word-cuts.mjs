/**
 * EvidenceMotion research-only: build edit decision lists from original,
 * independently aligned approved narration; no fixed-duration voice fitting.
 * This is a proposal contract, NOT a WAV decoder, MFA runner or art approval.
 */
const hash=x=>typeof x==='string'&&/^[a-f\d]{64}$/i.test(x);
const finite=x=>Number.isFinite(x)&&typeof x==='number';
const ID=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{1,60}$/i.test(x);
const roles=new Set(['hook','science_site_reveal','honesty_disclosure']);
const grammars=new Set(['G1','G2','G3','G4','G5','G6']);
export function proposeAudioLockedCuts({approvedWavSha256,actualWavSha256,
 durationMs,wordAlignment,beats,scienceManifestSha256,alignmentOrigin}={}){
 const errors=[];
 if(!hash(approvedWavSha256)||approvedWavSha256!==actualWavSha256)
   errors.push('WRONG_OR_UNAPPROVED_ORIGINAL_WAV');
 if(!hash(scienceManifestSha256))errors.push('SCIENCE_MANIFEST_UNVERIFIED');
 if(alignmentOrigin!=='independent-original-wav-mfa')errors.push('INDEPENDENT_REAL_WAV_ALIGNMENT_REQUIRED');
 if(!Number.isInteger(durationMs)||durationMs<=0)errors.push('UNKNOWN_AUDIO_DURATION');
 if(!Array.isArray(wordAlignment)||wordAlignment.length<3||
    wordAlignment.some((w,i)=>!w||!w.word?.trim()||!finite(w.startMs)||
     !finite(w.endMs)||w.startMs<0||w.endMs<=w.startMs||
     (i>0&&w.startMs<wordAlignment[i-1].endMs)||w.endMs>durationMs))
   errors.push('WORD_TIMING_INVALID');
 if(!Array.isArray(beats)||beats.length!==3||beats.some((b,i)=>!b||!ID(b.id)||
    !roles.has(b.role)||!grammars.has(b.grammar)||!Number.isInteger(b.startWordIndex)||
    !Number.isInteger(b.endWordIndex)||b.endWordIndex<b.startWordIndex||
    (i>0&&b.startWordIndex<=beats[i-1].endWordIndex)||
    b.endWordIndex>=wordAlignment?.length))errors.push('SHOT_WORD_ANCHORS_INVALID');
 if(errors.length)return {status:'HOLD',errors,shots:[],finalRenderEligible:false};
 if(beats[0].role!=='hook'||beats[1].role!=='science_site_reveal'||
    beats[2].role!=='honesty_disclosure')errors.push('SCIENTIFIC_NARRATIVE_ORDER_REQUIRED');
 if(beats[0].startWordIndex!==0||beats.at(-1).endWordIndex!==wordAlignment.length-1||
    beats.some((b,i)=>i>0&&b.startWordIndex!==beats[i-1].endWordIndex+1))
   errors.push('NARRATION_WORDS_UNASSIGNED');
 if(wordAlignment[0].startMs>2000)errors.push('FIRST_SPOKEN_HOOK_AFTER_TWO_SECONDS');
 if(errors.length)return {status:'HOLD',errors,shots:[],finalRenderEligible:false};
 const shots=beats.map((beat,i)=>{
  const end=i===beats.length-1?durationMs:wordAlignment[beat.endWordIndex].endMs;
  return {id:beat.id,role:beat.role,grammar:beat.grammar,
   startMs:i===0?0:wordAlignment[beat.startWordIndex].startMs,
   endMs:end,anchorWord:wordAlignment[beat.startWordIndex].word,
   scientificAssetIDs:[...(beat.scientificAssetIDs||[])],
   cameraMoveCount:1,voiceTimeStretch:false,metadata:'PREVIZ_ONLY'};
 });
 return {status:'PREVIZ_EDL_READY_FOR_INDEPENDENT_MEDIA_QA',errors:[],shots,
  narrationSha256:actualWavSha256,sourceManifestSha256:scienceManifestSha256,
  finalRenderEligible:false,craftCertified:false,
  caution:'Word timestamps and SHA remain a supplied contract; verify actual file bytes and original MFA receipt independently.'};
}
