/** Reusable story-grammar compiler. RESEARCH ONLY. No scientific claim authoring.
 * Reuses the existing G1–G6 previz director, source-first instead of 7-OH shot
 * hardcoding. Does NOT approve narration, science, craft, release or publishing.
 */
import {proposeShots,GRAMMAR,auditShotRepetition} from './previz-director.mjs';
const HASH=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const ID=x=>typeof x==='string'&&/^[a-z0-9][a-z0-9_.:-]{1,90}$/.test(x);
const unique=a=>Array.isArray(a)&&a.length>0&&new Set(a).size===a.length;
// Research declaration, not independent decoded-camera or learning proof.
const meaningful=v=>typeof v==='string'&&v===v.trim()&&
  /[\p{L}\p{N}]/u.test(v.normalize('NFKC'));
const hasCameraTeachingPlan=b=>{
 const p=b?.cameraTeachingPlan;
 return p&&typeof p==='object'&&!Array.isArray(p)&&
   typeof p.camera==='string'&&meaningful(p.action)&&
   ID(p.visualPurposeId)&&p.visualPurposeId===b.visualPurposeId&&
   ID(p.claimId)&&Array.isArray(b.claimIds)&&b.claimIds.includes(p.claimId)&&
   ID(p.assetId)&&Array.isArray(b.scientificAssetIds)&&b.scientificAssetIds.includes(p.assetId)&&
   Number.isFinite(p.narrationAnchorSec)&&Array.isArray(b.spokenAnchorTimes)&&
   b.spokenAnchorTimes.includes(p.narrationAnchorSec);
};
const actionKey=v=>v.normalize('NFKC').toLowerCase()
 .replace(/[^\p{L}\p{N}]+/gu,' ').trim();
// This is a source-pinned *author-declaration* negative review, not a score.
const repeatedCameraTeachingActions=shots=>{
 const findings=[];
 for(let start=0;start<shots.length;){
  const key=actionKey(shots[start].cameraTeachingPlan.action);
  let end=start+1;
  while(end<shots.length&&actionKey(shots[end].cameraTeachingPlan.action)===key)end++;
  if(end-start>=3&&new Set(shots.slice(start,end).map(s=>s.visualPurposeId)).size>=2)
   findings.push({
    reason:'THREE_PLUS_RECYCLED_CAMERA_ACTIONS_ACROSS_DISTINCT_LESSONS',
    firstBeatId:shots[start].beatId,lastBeatId:shots[end-1].beatId,
    consecutiveCount:end-start
   });
  start=end;
 }
 return findings;
};
const PURPOSES=new Set([
 'everyday-to-mechanism','process-sequence','study-measurement',
 'fair-comparison','uncertainty','source-bound-scale'
]);
const add=(a,item)=>{if(!a.includes(item))a.push(item)};
export const DIRECTOR_SCHEMAS=Object.freeze(Object.keys(GRAMMAR).map(id=>Object.freeze({
 id,name:GRAMMAR[id].name,
 transitions:[...GRAMMAR[id].transition],
 cameras:[...GRAMMAR[id].camera]
})));
export function compileReusableDirector(program){
 const errors=[];
 if(!program||typeof program!=='object')return {status:'HOLD',errors:['MISSING_EPISODE'],productionEligible:false};
 if(program.schema!=='ths-source-locked-director-research-v1'||program.researchOnly!==true
    ||program.mayPublish!==false)add(errors,'RESEARCH_BOUNDARY_REQUIRED');
 if(!ID(program.topicId)||!HASH(program.sourceManifestSha256)||!HASH(program.originalNarrationSha256))
    add(errors,'EXACT_TOPIC_SOURCE_VOICE_IDENTITY_REQUIRED');
 // Malformed external claim ledgers must HOLD, not throw during .map/.some.
 // Only arrays are eligible to establish source lineage.
 const claimLedger=Array.isArray(program.claimLedger)?program.claimLedger:[];
 if(!claimLedger.length||!unique(claimLedger.map(x=>x?.id))
    ||claimLedger.some(x=>!ID(x?.id)||!ID(x?.sourceId)
      ||!['STRUCTURE','PRECLINICAL','HUMAN','LIMITATION','SOURCE'].includes(x?.class)
      ||x.assertsHumanEffect===true&&x.class!=='HUMAN'))
    add(errors,'UNVERIFIED_OR_MISMATCHED_CLAIMS');
 const allowed=new Set(claimLedger.map(x=>x.id));
 if(!Array.isArray(program.beats)||program.beats.length<2||!unique(program.beats.map(x=>x?.id)))
    add(errors,'AT_LEAST_TWO_DISTINCT_SOURCE_BEATS_REQUIRED');
 const outputs=[];
 let previousGrammar=null,previousCamera=null,last=0;
 for(const b of Array.isArray(program.beats)?program.beats:[]){
   if(!b||!ID(b.id)||!PURPOSES.has(b.visualIntent)||!Number.isFinite(b.startSec)
      ||!Number.isFinite(b.endSec)||b.startSec<0||b.endSec<=b.startSec
      ||Math.abs(b.startSec-last)>.035)
      add(errors,'INVALID_NARRATION_FIRST_BEAT');
   const duration=(b?.endSec??0)-(b?.startSec??0);
   last=b?.endSec??last;
   if(!ID(b?.visualPurposeId)||typeof b?.viewerLearns!=='string'||!b.viewerLearns.trim())
      add(errors,'EXPLANATION_INTENT_REQUIRED');
   if(!hasCameraTeachingPlan(b))add(errors,'SOURCE_BOUND_CAMERA_TEACHING_PLAN_REQUIRED');
    if(!unique(b?.claimIds)||b.claimIds.some(x=>!allowed.has(x)))
      add(errors,'SOURCE_CLAIM_LEDGER_MISMATCH');
   if(!unique(b?.scientificAssetIds))
      add(errors,'SOURCE_ASSET_IDS_MISSING');
   if(b?.audioStretched===true||b?.generatesScientificGeometry===true
      ||b?.claimsUnmeasuredEffect===true)add(errors,'UNSAFE_SYNTHETIC_EFFECT_OR_RETIMED_VOICE');
   if(Array.isArray(b?.spokenAnchorTimes)
      &&b.spokenAnchorTimes.some(t=>!Number.isFinite(t)||t<0||t>duration))
      add(errors,'BAD_WORD_CUE');
   if(errors.length)continue;
   const proposed=proposeShots({
     id:b.id,durationSec:duration,
     spokenAnchorTimes:b.spokenAnchorTimes,
     visualIntent:b.visualIntent,claimIds:b.claimIds,
     scientificAssetIds:b.scientificAssetIds,
     sequenceReviewed:b.sequenceReviewed,
     comparisonOrScaleReviewed:b.comparisonOrScaleReviewed
   },{previousGrammar,previousCamera});
   if(proposed.status!=='PROPOSED')add(errors,proposed.code);
   else {
     // Choose the authored explanation-specific camera, never variation alone.
      const hero=proposed.candidates.find(x=>x.camera===b.cameraTeachingPlan.camera);
      if(!hero){add(errors,'CAMERA_NOT_ALLOWED_FOR_VISUAL_INTENT');continue;}
     previousGrammar=hero.grammarId;
     previousCamera=hero.camera;
     outputs.push({
       beatId:b.id,topicId:program.topicId,
       startSec:b.startSec,endSec:b.endSec,
       viewerLearns:b.viewerLearns,visualPurposeId:b.visualPurposeId,
        cameraTeachingPlan:{...b.cameraTeachingPlan},
        cameraPurposeStatus:'AUTHOR_DECLARED_REQUIRES_DECODED_FILM_REVIEW',
       grammarId:hero.grammarId,grammarName:hero.grammarName,
       primaryCamera:hero.camera,transition:hero.transition,
       alternative:proposed.candidates.find(x=>x.id!==hero.id),
       sourceClaimIds:hero.sourceClaimIds,scientificAssetIds:hero.scientificAssetIds,
       sourceManifestSha256:program.sourceManifestSha256,
       originalNarrationSha256:program.originalNarrationSha256,
       visualRules:['NO_NEW_SOURCE_GEOMETRY','NO_UNSOURCED_HUMAN_EFFECT',
                    'PICTURE_CUT_TO_ORIGINAL_VOICE','MOBILE_SOURCE_OVERLAY_VISIBLE'],
       status:'SOURCE_LOCKED_DIRECTOR_PREVIZ_ONLY'
     });
   }
 }
 if(!Number.isFinite(program.totalNarrationDurationSec)
    ||program.totalNarrationDurationSec<=0
    ||Math.abs(last-program.totalNarrationDurationSec)>.035)
    add(errors,'EPISODE_NOT_TIMED_TO_ORIGINAL_VOICE');
 if(errors.length)return {status:'HOLD',errors:[...new Set(errors)],productionEligible:false,
                             excellentCertified:false,shots:[]};
 // Mechanical negative review only: no grammar/camera variation, storyboard
 // claim or decoded-pixel quantity is sufficient to certify good craft.
 const sequenceCraft=auditShotRepetition(outputs);
 if(sequenceCraft.status==='HOLD')return {status:'HOLD',
  errors:sequenceCraft.errors,shots:[],productionEligible:false,
  excellentCertified:false,mayPublish:false};
 // Camera motion can be formally documented while still being conceptually
 // unmotivated. Flag 3+ recycled instructions across distinct lessons.
 const cameraWarnings=repeatedCameraTeachingActions(outputs);
 const craftFindings=[...sequenceCraft.findings,...cameraWarnings];
 const craftReview={...sequenceCraft,findings:craftFindings,
   status:craftFindings.length?'CRAFT_REDIRECTION_REQUIRED':sequenceCraft.status,
   craftRemediationRequired:craftFindings.length>0};
 return {status:'REUSABLE_G1_G6_PROGRAM_PROPOSED',topicId:program.topicId,
  grammarCoverage:[...new Set(outputs.map(x=>x.grammarId))].sort(),
  shots:outputs,errors:[],
  sequenceCraftReview:craftReview,
  compositionRedirectionRequired:craftReview.craftRemediationRequired,
  exactSourceManifestSha256:program.sourceManifestSha256,
  exactOriginalNarrationSha256:program.originalNarrationSha256,
  generatedScience:false,productionEligible:false,excellentCertified:false,
  mayPublish:false,reason:'Candidates require actual source/media and quality review'};
}
