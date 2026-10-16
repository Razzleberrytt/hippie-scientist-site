/**
 * EvidenceMotion research-only: build edit decision lists from original,
 * independently aligned approved narration; no fixed-duration voice fitting.
 * This is a proposal contract, NOT a WAV decoder, MFA runner or art approval.
 */
import {readFile, realpath, lstat} from 'node:fs/promises';
import {resolve, relative, isAbsolute, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath, URL} from 'node:url';
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
 if(!['independent-original-wav-mfa','byte-bound-textgrid-candidate'].includes(alignmentOrigin))errors.push('INDEPENDENT_REAL_WAV_ALIGNMENT_REQUIRED');
 if(!Number.isInteger(durationMs)||durationMs<=0)errors.push('UNKNOWN_AUDIO_DURATION');
 if(!Array.isArray(wordAlignment)||wordAlignment.length<3||
    Array.from(wordAlignment).some((w,i)=>!w||typeof w.word!=='string'||!w.word.trim()||!finite(w.startMs)||
     !finite(w.endMs)||w.startMs<0||w.endMs<=w.startMs||
     (i>0&&w.startMs<wordAlignment[i-1].endMs)||w.endMs>durationMs))
   errors.push('WORD_TIMING_INVALID');
 if(Array.isArray(beats)&&Array.from(beats).some(b=>!b||!Array.isArray(b.scientificAssetIDs)||
    b.scientificAssetIDs.length===0||Array.from(b.scientificAssetIDs).some(assetId=>!ID(assetId))||
    new Set(b.scientificAssetIDs).size!==b.scientificAssetIDs.length))
   errors.push('SHOT_ASSET_LINEAGE_MISSING');
 if(!Array.isArray(beats)||beats.length!==3||Array.from(beats).some((b,i)=>!b||!ID(b.id)||
    !roles.has(b.role)||!grammars.has(b.grammar)||!Number.isInteger(b.startWordIndex)||
    !Number.isInteger(b.endWordIndex)||b.startWordIndex<0||b.endWordIndex<b.startWordIndex||
    (i>0&&b.startWordIndex<=beats[i-1].endWordIndex)||
    b.endWordIndex>=wordAlignment?.length))errors.push('SHOT_WORD_ANCHORS_INVALID');
 if(errors.length)return {status:'HOLD',errors,shots:[],finalRenderEligible:false};
 // Shot identifiers are downstream timeline keys; collisions can misroute visual cuts.
 if(new Set(beats.map(b=>b.id)).size!==beats.length)errors.push('SHOT_IDENTIFIERS_NOT_UNIQUE');
 if(beats[0].role!=='hook'||beats[1].role!=='science_site_reveal'||
    beats[2].role!=='honesty_disclosure')errors.push('SCIENTIFIC_NARRATIVE_ORDER_REQUIRED');
 if(beats[0].startWordIndex!==0||beats.at(-1).endWordIndex!==wordAlignment.length-1||
    beats.some((b,i)=>i>0&&b.startWordIndex!==beats[i-1].endWordIndex+1))
   errors.push('NARRATION_WORDS_UNASSIGNED');
 if(wordAlignment[0].startMs>2000)errors.push('FIRST_SPOKEN_HOOK_AFTER_TWO_SECONDS');
 if(errors.length)return {status:'HOLD',errors,shots:[],finalRenderEligible:false};
 // Segment cuts are contiguous: natural pauses remain under the previous shot.
 const shots=beats.map((beat,i)=>{
  const end=i===beats.length-1?durationMs:wordAlignment[beats[i+1].startWordIndex].startMs;
  return {id:beat.id,role:beat.role,grammar:beat.grammar,
   startMs:i===0?0:wordAlignment[beat.startWordIndex].startMs,
   endMs:end,anchorWord:wordAlignment[beat.startWordIndex].word,
   scientificAssetIDs:[...beat.scientificAssetIDs],
   cameraMoveCount:1,voiceTimeStretch:false,metadata:'PREVIZ_ONLY'};
 });
 return {status:'PREVIZ_EDL_READY_FOR_INDEPENDENT_MEDIA_QA',errors:[],shots,
  narrationSha256:actualWavSha256,sourceManifestSha256:scienceManifestSha256,
  finalRenderEligible:false,craftCertified:false,
  caution:'Word timestamps and SHA remain a supplied contract; verify actual file bytes and original MFA receipt independently.'};
}

/** Importer's byte-checked timing remains a PREVIZ candidate. This wrapper
 * verifies fresh files on each use; it cannot certify a supplied MFA run.
 * expectedInputSha256 must come from the frozen source vault, not the report.
 */
export async function proposeFileBoundAudioLockedCuts({root,reportPath,
 expectedReportSha256,expectedInputSha256,manifest,beats,scienceManifestSha256,
 previousAlignmentRevisionSha256,previousNarrationSha256,pythonExecutable='python'}={}){
 const refusal=error=>({status:'HOLD',errors:[error],shots:[],finalRenderEligible:false});
 const fields=['wav','transcript','textgrid','dictionary','acousticModel'];
 const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
 try{
  if(!root||!hash(expectedReportSha256)||fields.some(f=>!hash(expectedInputSha256?.[f])))
   return refusal('FROZEN_ALIGNMENT_IDENTITIES_REQUIRED');
  // A new aligned WAV cannot silently inherit cuts anchored to an older take.
  if(previousNarrationSha256!==undefined &&
     (!hash(previousNarrationSha256)||previousNarrationSha256!==expectedInputSha256.wav))
   return refusal('STALE_NARRATION_REVISION_REQUIRES_NEW_CUTS');
  const base=await realpath(root);
  const load=async name=>{
   if(typeof name!=='string'||!name||name.includes('\\')||name.includes(':')||isAbsolute(name)||name.split('/').some(p=>p==='.'||p==='..'))
    throw new Error('UNSAFE_ALIGNMENT_PATH');
   const path=resolve(base,name),rel=relative(base,path);
   if(rel.startsWith('..'+sep)||isAbsolute(rel))throw new Error('UNSAFE_ALIGNMENT_PATH');
   let part=base;
   for(const segment of rel.split(sep)){
    part=resolve(part,segment);
    if((await lstat(part)).isSymbolicLink())throw new Error('LINKED_ALIGNMENT_INPUT');
   }
   const info=await lstat(path);
   if(!info.isFile()||info.size>100000000)throw new Error('ALIGNMENT_INPUT_SIZE_OR_TYPE');
   return readFile(path);
  };
  const raw=await load(reportPath);
  if(digest(raw)!==expectedReportSha256)return refusal('ALIGNMENT_REPORT_CHANGED');
  const report=JSON.parse(raw.toString('utf8'));
  if(report.schema!=='ths-exact-wav-alignment-candidate-v1'||
     report.status!=='BYTE_BOUND_WORD_TIMING_CANDIDATE_REVIEW_REQUIRED'||
     !hash(report.revisionSha256)||report.mayPublish!==false||
     report.timingAccuracyCalibrated!==false||report.pronunciationVerified!==false)
   return refusal('UNCALIBRATED_ALIGNMENT_CANDIDATE_REQUIRED');
  for(const field of fields){
   const spec=manifest?.[field],expected=expectedInputSha256[field];
   if(spec?.sha256!==expected||report.inputSha256?.[field]!==expected||
      digest(await load(spec?.path))!==expected)return refusal('ALIGNMENT_INPUT_CHANGED:'+field);
  }
  // Reparse the pinned TextGrid with the same importer, rather than trusting
  // submitted report word windows (even a newly rehashed fabricated report).
  const importerDirectory=fileURLToPath(new URL('.',import.meta.url));
  const script='import json,sys; sys.path.insert(0,sys.argv[1]); from exact_wav_alignment import inspect_alignment; print(json.dumps(inspect_alignment(sys.argv[2],json.loads(sys.argv[3]))))';
  const {stdout}=await promisify(execFile)(pythonExecutable,
   ['-c',script,importerDirectory,base,JSON.stringify(manifest)],
   {timeout:30000,maxBuffer:5000000,windowsHide:true});
  const current=JSON.parse(stdout);
  const canonical=value=>Array.isArray(value)?value.map(canonical):
   value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
  if(JSON.stringify(canonical(report))!==JSON.stringify(canonical(current)))
   return refusal('ALIGNMENT_REPORT_NOT_DERIVED_FROM_PINNED_INPUTS');
  if(previousAlignmentRevisionSha256&&previousAlignmentRevisionSha256!==report.revisionSha256)
   return refusal('STALE_CUTS_REALIGNMENT_REQUIRED');
  const planned=proposeAudioLockedCuts({approvedWavSha256:expectedInputSha256.wav,
   actualWavSha256:report.inputSha256.wav,durationMs:report.durationMs,
   wordAlignment:report.wordAlignment,alignmentOrigin:'byte-bound-textgrid-candidate',
   beats,scienceManifestSha256});
  return {...planned,alignmentRevisionSha256:report.revisionSha256,
   alignmentReportSha256:expectedReportSha256,timingAccuracyCalibrated:false,
   pronunciationVerified:false,mayPublish:false,
   caution:'Byte-bound imported TextGrid, not authenticated MFA execution or calibrated acoustic timing. PREVIZ ONLY.'};
 }catch{
  return refusal('ALIGNMENT_FILE_VALIDATION_FAILED');
 }
}
