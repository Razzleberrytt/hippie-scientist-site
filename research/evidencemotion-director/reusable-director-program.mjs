/** Reusable story-grammar compiler. RESEARCH ONLY. No scientific claim authoring.
 * Reuses the existing G1–G6 previz director, source-first instead of 7-OH shot
 * hardcoding. Does NOT approve narration, science, craft, release or publishing.
 */
import {proposeShots,GRAMMAR} from './previz-director.mjs';
const HASH=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const ID=x=>typeof x==='string'&&/^[a-z0-9][a-z0-9_.:-]{1,90}$/.test(x);
const unique=a=>Array.isArray(a)&&a.length>0&&new Set(a).size===a.length;
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
 if(!Array.isArray(program.claimLedger)||!program.claimLedger.length
    ||!unique(program.claimLedger.map(x=>x?.id))
    ||program.claimLedger.some(x=>!ID(x?.id)||!ID(x?.sourceId)
      ||!['STRUCTURE','PRECLINICAL','HUMAN','LIMITATION','SOURCE'].includes(x?.class)
      ||x.assertsHumanEffect===true&&x.class!=='HUMAN'))
    add(errors,'UNVERIFIED_OR_MISMATCHED_CLAIMS');
 const allowed=new Set((program.claimLedger||[]).map(x=>x.id));
 if(!Array.isArray(program.beats)||program.beats.length<2||!unique(program.beats.map(x=>x?.id)))
    add(errors,'AT_LEAST_TWO_DISTINCT_SOURCE_BEATS_REQUIRED');
 const outputs=[];
 let previousGrammar=null,previousCamera=null,last=0;
 for(const b of program.beats||[]){
   if(!b||!ID(b.id)||!PURPOSES.has(b.visualIntent)||!Number.isFinite(b.startSec)
      ||!Number.isFinite(b.endSec)||b.startSec<0||b.endSec<=b.startSec
      ||Math.abs(b.startSec-last)>.035)
      add(errors,'INVALID_NARRATION_FIRST_BEAT');
   const duration=(b?.endSec??0)-(b?.startSec??0);
   last=b?.endSec??last;
   if(!ID(b?.visualPurposeId)||typeof b?.viewerLearns!=='string'||!b.viewerLearns.trim())
      add(errors,'EXPLANATION_INTENT_REQUIRED');
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
     const hero=proposed.candidates[0];
     previousGrammar=hero.grammarId;
     previousCamera=hero.camera;
     outputs.push({
       beatId:b.id,topicId:program.topicId,
       startSec:b.startSec,endSec:b.endSec,
       viewerLearns:b.viewerLearns,visualPurposeId:b.visualPurposeId,
       grammarId:hero.grammarId,grammarName:hero.grammarName,
       primaryCamera:hero.camera,transition:hero.transition,
       alternative:proposed.candidates[1],
       sourceClaimIds:hero.sourceClaimIds,scientificAssetIds:hero.scientificAssetIds,
       sourceManifestSha256:program.sourceManifestSha256,
       originalNarrationSha256:program.originalNarrationSha256,
       visualRules:['NO_NEW_SOURCE_GEOMETRY','NO_UNSOURCED_HUMAN_EFFECT',
                    'PICTURE_CUT_TO_ORIGINAL_VOICE','MOBILE_SOURCE_OVERLAY_VISIBLE'],
       status:'SOURCE_LOCKED_DIRECTOR_PREVIZ_ONLY'
     });
   }
 }
 if(program.beats?.length && Math.abs(last-program.totalNarrationDurationSec)>.035)
    add(errors,'EPISODE_NOT_TIMED_TO_ORIGINAL_VOICE');
 if(errors.length)return {status:'HOLD',errors:[...new Set(errors)],productionEligible:false,
                             excellentCertified:false,shots:[]};
 return {status:'REUSABLE_G1_G6_PROGRAM_PROPOSED',topicId:program.topicId,
  grammarCoverage:[...new Set(outputs.map(x=>x.grammarId))].sort(),
  shots:outputs,errors:[],
  exactSourceManifestSha256:program.sourceManifestSha256,
  exactOriginalNarrationSha256:program.originalNarrationSha256,
  generatedScience:false,productionEligible:false,excellentCertified:false,
  mayPublish:false,reason:'Candidates require actual source/media and quality review'};
}
