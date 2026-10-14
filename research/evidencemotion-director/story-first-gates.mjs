/**
 * RESEARCH-ONLY EvidenceMotion story preflight; never a science, visual-art, or
 * publication certificate. Metadata boxes cannot prove decoded-frame layout.
 */
const HEX=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const TEXT=x=>typeof x==='string'&&x.trim().length>0;
const FIN=x=>typeof x==='number'&&Number.isFinite(x);
const IDS=a=>Array.isArray(a)&&a.length>0&&a.every(TEXT)&&new Set(a).size===a.length;
const ACTS=['QUESTION','DISCOVERY','EVIDENCE','ANSWER'];
const INTENT=new Set(['COMPARE_VERIFIED_STRUCTURES','REVEAL_SOURCE_DETAIL','DEPICT_COMPUTED_MODEL','SHOW_MEASURED_EVIDENCE','SHOW_EVIDENCE_LIMIT','EXPLAIN_SOURCE_RECORD','ANSWER_QUESTION']);
const HOLDS=['SCIENTIFIC_HUMAN_REVIEW_PENDING','REAL_FRAME_LAYOUT_REVIEW_PENDING','REFERENCE_SHELF_CRAFT_REVIEW_PENDING','OWNER_IPHONE_REVIEW_PENDING'];
const add=(arr,code)=>{if(!arr.includes(code))arr.push(code)};
const BOX=b=>b&&['x1','y1','x2','y2'].every(k=>FIN(b[k]))&&b.x1>=0&&b.y1>=0&&b.x2<=1&&b.y2<=1&&b.x1<b.x2&&b.y1<b.y2;
const OVERLAP=(a,b)=>a.x1<b.x2&&a.x2>b.x1&&a.y1<b.y2&&a.y2>b.y1;

/** Structured story and spoken-word contracts; does not decode a video. */
export function validateStoryFirstPlan(p){
 const errors=[];
 if(!p||typeof p!=='object')return {status:'HOLD',errors:['MISSING_STORY_PLAN'],mayRenderPreview:false,mayRenderFinal:false,productionEligible:false};
 if(p.schemaVersion!=='ths-story-first-research-v1'||p.track!=='RESEARCH_ONLY'||p.autoPublish!==false||p.productionIntegration!==false)
  add(errors,'FREEZE_OR_SCHEMA_VIOLATION');
 if(!HEX(p.sourceManifestSha256)||!HEX(p.lockedNarrationWavSha256)||!FIN(p.durationSec)||p.durationSec<=0||
    p.audioRetimed!==false||p.narrationFirst!==true)add(errors,'MISSING_LOCKED_SOURCE_OR_NARRATION');
 if(!TEXT(p.question)||!TEXT(p.plainAnswer)||!TEXT(p.whyItMatters)||!TEXT(p.evidenceBoundary)||
    p.question.trim().toLowerCase()===p.plainAnswer.trim().toLowerCase())add(errors,'NO_COMPLETE_BEGINNING_MIDDLE_ANSWER');
 if(!FIN(p.hookExplainsSubjectAtSec)||p.hookExplainsSubjectAtSec<0||p.hookExplainsSubjectAtSec>2)
  add(errors,'BEGINNER_HOOK_HAS_NO_ORIENTATION');
 const a=p.acts;
 if(!Array.isArray(a)||a.length!==4||a.some((s,i)=>s?.role!==ACTS[i]))
  add(errors,'MISSING_LOGICAL_FOUR_ACT_STORY');
 let end=0;
 if(Array.isArray(a))for(let i=0;i<a.length;i++){
  const s=a[i]??{};
  if(!FIN(s.startSec)||!FIN(s.endSec)||s.startSec<0||s.endSec<=s.startSec||
     (i===0&&s.startSec!==0)||(i>0&&Math.abs(s.startSec-end)>.035)||s.endSec>p.durationSec+.035)
   add(errors,'BROKEN_NARRATION_FIRST_STORY_TIMELINE');
  if(!FIN(s.spokenAnchorSec)||s.spokenAnchorSec<s.startSec||s.spokenAnchorSec>s.endSec)
   add(errors,'BEAT_DOES_NOT_MATCH_LOCKED_SPEECH');
  if(!TEXT(s.viewerLearns)||!TEXT(s.visualPurpose)||!TEXT(s.layoutId)||!TEXT(s.grammarId)||!IDS(s.sourceAssetIds)||!IDS(s.sourceClaimIds))
   add(errors,'SHOT_LACKS_TEACHING_GOAL_OR_SOURCE');
  if(!INTENT.has(s.visualIntent)||s.cosmeticMotionOnly===true||s.transitionOnly===true)
   add(errors,'MOTION_DOES_NOT_EXPLAIN_A_CLAIM');
  if(s.computed3d===true&&s.modelDisclosedInPublicCopy!==true)
   add(errors,'COMPUTED_MODEL_NOT_EXPLAINED');
  if(s.depictsUnmeasuredReceptorBinding===true||s.inventsAtomsOrBonds===true)
   add(errors,'UNSUPPORTED_SCIENTIFIC_VISUAL');
  if(!BOX(s.heroBox)||!BOX(s.captionBox)||!BOX(s.sourceBox))
   add(errors,'INVALID_PHONE_COMPOSITION_BOX');
  else {
   const safe=b=>b.x1>=.055&&b.x2<=.80&&b.y1>=.11&&b.y2<=.82;
   if(!safe(s.heroBox)||!safe(s.captionBox)||!safe(s.sourceBox)||
      OVERLAP(s.heroBox,s.captionBox)||OVERLAP(s.heroBox,s.sourceBox)||OVERLAP(s.captionBox,s.sourceBox))
    add(errors,'CLIPPED_OR_OVERLAPPING_STORY_ZONES');
  }
  end=s.endSec;
 }
 if(FIN(p.durationSec)&&Math.abs(end-p.durationSec)>.035)add(errors,'STORY_DOES_NOT_END_WITH_VOICE');
 if(Array.isArray(a)&&new Set(a.map(s=>s?.layoutId)).size<3)
  add(errors,'REPEATED_POSTER_LAYOUT_INSTEAD_OF_STORY');
 const words=p.firstUseTerms;
 if(!Array.isArray(words)||words.some(w=>!TEXT(w.term)||!TEXT(w.simpleDefinition)||
   !FIN(w.spokenAtSec)||!FIN(w.explainedAtSec)||w.spokenAtSec<0||w.spokenAtSec>p.durationSec||
   w.explainedAtSec<0||w.explainedAtSec>w.spokenAtSec+.001))
  add(errors,'JARGON_NOT_TAUGHT_AT_FIRST_USE');
 const claims=p.claims;
 if(!Array.isArray(claims)||!claims.length||claims.some(c=>!TEXT(c.id)||!IDS(c.sourceIds)||
    !['STRUCTURE','PRECLINICAL','HUMAN'].includes(c.evidenceClass)))
  add(errors,'SOURCE_EVIDENCE_BOUNDARY_MISSING');
 if(Array.isArray(claims)&&claims.length!==new Set(claims.map(c=>c?.id)).size)
  add(errors,'DUPLICATE_CLAIM_IDENTIFIERS');
 if(Array.isArray(claims)&&claims.some(c=>['STRUCTURE','PRECLINICAL'].includes(c.evidenceClass)&&c.assertsHumanEffect===true))
  add(errors,'STRUCTURE_OR_ANIMAL_DATA_PROMOTED_TO_HUMAN_EFFECT');
 if(Array.isArray(a)&&Array.isArray(claims)){
  const known=new Set(claims.map(c=>c.id));
  if(a.some(s=>Array.isArray(s?.sourceClaimIds)&&s.sourceClaimIds.some(id=>!known.has(id))))
   add(errors,'SHOT_CLAIM_NOT_IN_EVIDENCE_LEDGER');
 }
 if(p.scientificEditorialApproved===true||p.craftApproved===true||p.ownerApproved===true)
  add(errors,'SELF_CERTIFIED_HUMAN_APPROVAL_NOT_ALLOWED');
 return {status:errors.length?'HOLD':'STORY_PREFLIGHT_READY_FOR_HUMAN_AND_PIXEL_REVIEW',
  errors,outstandingHumanAndActualMediaGates:HOLDS,mayRenderPreview:errors.length===0,
  mayRenderFinal:false,productionEligible:false,excellentCertified:false};
}

/** Different concepts must differ in story, hero, layout, and progression, not palette. */
export function compareCreativeDirections(first,second,{ownerCuratedReferences=[]}={}){
 const errors=[];
 for(const [i,c] of [first,second].entries())
  if(!c||!TEXT(c.id)||!TEXT(c.storyApproach)||!TEXT(c.heroVisual)||!TEXT(c.compositionFamily)||
     !IDS(c.visualProgression)||!HEX(c.sourceManifestSha256)||!HEX(c.lockedNarrationWavSha256))
   add(errors,'CANDIDATE_'+(i+1)+'_MISSING_SOURCE_OR_DIRECTION');
 if(first&&second){
  if(first.id===second.id||first.storyApproach===second.storyApproach||
    first.compositionFamily===second.compositionFamily||first.heroVisual===second.heroVisual||
    JSON.stringify(first.visualProgression)===JSON.stringify(second.visualProgression))
   add(errors,'COSMETICALLY_DIFFERENT_CANDIDATES');
  if(first.sourceManifestSha256!==second.sourceManifestSha256||
     first.lockedNarrationWavSha256!==second.lockedNarrationWavSha256)
   add(errors,'CANDIDATES_HAVE_DIFFERENT_SCIENCE_OR_VOICE_BASE');
 }
 if(!Array.isArray(ownerCuratedReferences)||ownerCuratedReferences.length<3||ownerCuratedReferences.length>5||
    !ownerCuratedReferences.every(r=>TEXT(r.id)&&TEXT(r.url)&&r.ownerSelected===true)||
    new Set(ownerCuratedReferences.map(r=>r.id)).size!==ownerCuratedReferences.length)
  add(errors,'OWNER_REFERENCE_SHELF_REQUIRED');
 return {status:errors.length?'HOLD':'TWO_CONCEPTS_READY_FOR_ACTUAL_MEDIA_COMPARISON',
  errors,referencesActuallyViewed:false,ownerCraftApproved:false,mayRenderFinal:false,productionEligible:false};
}
