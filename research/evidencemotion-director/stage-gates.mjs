/**
 * EvidenceMotion director RESEARCH lane only. No imports into production.
 * "Still-first" locks visual IDENTITY (source pixels), never animation timing.
 * Narration remains authoritative for cuts, captions, and scientific cues.
 */
import {createHash} from 'node:crypto';
import {validateStoryFirstPlan} from './story-first-gates.mjs';
const hex64=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const isId=x=>typeof x==='string'&&/^[a-z0-9][a-z0-9_.:-]{1,79}$/i.test(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const ordered=a=>Array.isArray(a)&&a.every((x,i)=>finite(x)&&x>=0&&(i===0||x>a[i-1]));
export const SHA256_BYTES=buf=>createHash('sha256').update(buf).digest('hex');
export const APPROVED_STAGES=Object.freeze(['CONCEPT','REFERENCE_STILL_LOCKED','VOICE_AUDITIONED','PREVIZ','HUMAN_CONCEPT_ACCEPTED','FINAL_RENDER']);
export const CAMERA_MOVES=Object.freeze(['STATIC','MACRO_PUSH','LATERAL_TRACK','ORBIT_REVEAL','FOCUS_TRANSFER','PULLBACK_SCALE']);
const fail=(errors,extra={})=>({status:'HOLD',errors,productionEligible:false,...extra});
const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;

/** Metadata gate. These assertions require independently verified producer receipts;
 * booleans such as "looksCinematic: true" are never creative approval.
 */
export function validateDirectorPackage(pkg){
 const errors=[];
 if(!pkg||typeof pkg!=='object')return fail(['MISSING_DIRECTOR_PACKAGE']);
 if(pkg.track!=='RESEARCH_ONLY'||pkg.devicePath!=='PHONE_FIRST_REMOTE_CPU'||pkg.laptopRequired!==false)
   errors.push('PHONE_FIRST_ISOLATION');
 if(pkg.productionImports||pkg.autoPublish||pkg.paidInference)errors.push('PRODUCTION_FREEZE_VIOLATION');
 if(pkg.stage!=='PREVIZ'&&pkg.stage!=='HUMAN_CONCEPT_ACCEPTED')errors.push('PREVIEW_STAGE_ONLY');
 const story=validateStoryFirstPlan(pkg.storyFirstPlan);
 if(story.status!=='STORY_PREFLIGHT_READY_FOR_HUMAN_AND_PIXEL_REVIEW')
   errors.push('STORY_FIRST_PREFLIGHT_REQUIRED',...story.errors);
 if(story.mayRenderFinal===true||story.excellentCertified===true)
   errors.push('STORY_PREVIEW_CANNOT_SELF_CERTIFY');
 const ref=pkg.reference??{};
 if(!isId(ref.id)||!hex64(ref.pixelSha256)||!hex64(ref.depthLayersSha256)||!hex64(ref.backgroundFillSha256)||
    ref.approvedByOwner!==true||ref.generatedDataOrText===true||ref.generatedHumanFaces===true)
   errors.push('UNLOCKED_OR_UNTRUSTED_STILL');
 if(!Array.isArray(ref.layers)||ref.layers.length<2||!unique(ref.layers.map(l=>l.id))||
    ref.layers.some(l=>!isId(l.id)||!hex64(l.sha256)||!['background','mid','foreground'].includes(l.depthClass)))
   errors.push('INVALID_PARALLAX_LAYERS');
 if(ref.sourcePixelsReused!==true||ref.regeneratedFromPromptBetweenShots===true)
   errors.push('REFERENCE_PIXEL_DRIFT');
 const voice=pkg.voice??{};
 if(!hex64(voice.originalWavSha256)||voice.auditionedByHuman!==true||voice.wordTimingVerified!==true||
    voice.timeStretchApplied===true||!Array.isArray(voice.sentences)||!voice.sentences.length||
    voice.sentences.some(s=>!isId(s.id)||!hex64(s.wavSha256)||!s.text?.trim()||s.auditioned!==true))
   errors.push('VOICE_AUDITION_NOT_LOCKED');
 if(!voice.pronunciationLedgerApproved||!hex64(voice.pronunciationLedgerSha256))
   errors.push('PRONUNCIATION_DRY_RUN_REQUIRED');
 if(!hex64(pkg.approvedScienceManifestSha256)||pkg.scientificVisualsAreDeterministic!==true)
   errors.push('UNVERIFIED_SCIENCE_LAYER');
 const shots=pkg.shots??[];
 if(!Array.isArray(shots)||!shots.length||!unique(shots.map(s=>s.id)))errors.push('MISSING_OR_DUPLICATE_SHOTS');
 let previousEnd=0; const changeMarks=[];
 for(const s of Array.isArray(shots)?shots:[]){
   if(!isId(s.id)||!finite(s.startSec)||!finite(s.endSec)||s.endSec<=s.startSec||s.startSec<previousEnd-0.01)
     errors.push('INVALID_SHOT_TIMING');
   if(!CAMERA_MOVES.includes(s.cameraMove)||s.cameraMoveCount!==1)
     errors.push('SINGLE_CAMERA_MOVE_REQUIRED');
   if(s.cameraMove==='ORBIT_REVEAL'&&(s.orbitDegrees??0)>8)
     errors.push('EXCESSIVE_PARALLAX_ORBIT');
   if(!finite(s.maxParallaxFractionOfWidth)||s.maxParallaxFractionOfWidth<0||s.maxParallaxFractionOfWidth>0.05)
     errors.push('EXCESSIVE_PARALLAX_TRAVEL');
   if(s.referencePixelSha256!==ref.pixelSha256||s.regenerateLook===true)
     errors.push('SHOT_REFERENCE_IDENTITY_DRIFT');
   if(s.containsSyntheticPhotorealBroll===true&&s.conspicuousAiLabel!==true)
     errors.push('UNDISCLOSED_GENERATIVE_FOOTAGE');
   if(s.containsSyntheticFaces===true)errors.push('SYNTHETIC_FACES_DISALLOWED');
   if(s.aiGeneratedScientificSymbolsOrNumbers===true)errors.push('AI_GENERATED_SCIENCE_DISALLOWED');
   if(s.speechRateChanged===true||s.audioStretched===true)
     errors.push('AUDIO_IS_NOT_PICTURE_TIMING');
   if(!ordered(s.compositionalChangeTimesSec)||s.compositionalChangeTimesSec.some(t=>t>s.endSec))
     errors.push('BAD_VISUAL_CHANGE_TIMES');
   else changeMarks.push(...s.compositionalChangeTimesSec);
   previousEnd=s.endSec;
 }
 if(shots.length&&shots[0].startSec!==0)errors.push('MISSING_ZERO_TIME_OPEN');
 // Authoring goals must refer to the identical source, voice and audio duration.
 if(pkg.storyFirstPlan&&(
    pkg.storyFirstPlan.sourceManifestSha256!==pkg.approvedScienceManifestSha256||
    pkg.storyFirstPlan.lockedNarrationWavSha256!==pkg.voice?.originalWavSha256||
    Math.abs(pkg.storyFirstPlan.durationSec-pkg.durationSec)>.05))
   errors.push('STORY_SOURCE_VOICE_OR_TIMELINE_DRIFT');
 const duration=finite(pkg.durationSec)?pkg.durationSec:-1;
 if(duration<=0||!finite(previousEnd)||Math.abs(previousEnd-duration)>0.05)
   errors.push('TIMELINE_DOES_NOT_MATCH_AUDIO');
 const hook=pkg.hook??{};
 if(!(hook.textOnScreenAtSec>=0&&hook.textOnScreenAtSec<=2&&hook.heroMovesAtSec>=0&&hook.heroMovesAtSec<=2&&
    hook.spokenLineStartsAtSec>=0&&hook.spokenLineStartsAtSec<=2))
   errors.push('THREE_OPENING_HOOKS_MISSING');
 if(!hook.mutedViewerComprehensionReviewed)
   errors.push('MUTED_HOOK_HUMAN_REVIEW_REQUIRED');
 const safe=pkg.mobileSafeArea??{};
 if(![safe.topFraction,safe.bottomFraction,safe.rightFraction].every(finite)||
    safe.topFraction<0.10||safe.bottomFraction<0.18||safe.rightFraction<0.20||
    safe.captionsInsideSafeZone!==true)
   errors.push('MOBILE_UI_OCCLUSION_RISK');
 const meaningful=Array.from(new Set([...changeMarks,duration].filter(finite))).sort((a,b)=>a-b);
 let last=0,maxGap=0;
 for(const t of meaningful){if(t>=last){maxGap=Math.max(maxGap,t-last);last=t;}}
 const suggestions=maxGap>3?['CONSIDER_VISUAL_CHANGE_AT_2_TO_3_SECONDS']:[];
 if(maxGap>6)errors.push('SIX_SECOND_STATIC_KILL');
 if(pkg.decodedPreviewEvidence===true)errors.push('CALLER_SELF_CERTIFIED_DECODE_PROHIBITED');
 if(errors.length)return fail([...new Set(errors)],{advisories:suggestions});
 return {status:'PREVIZ_PACKAGE_READY_FOR_PIXEL_AUDIT',errors:[],advisories:suggestions,
   excellentCertified:false,productionEligible:false,estimatedMaxStaticGapSec:maxGap};
}
