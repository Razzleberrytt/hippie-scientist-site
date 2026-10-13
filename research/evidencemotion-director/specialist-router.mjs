/**
 * EvidenceMotion research-only specialist routing. NO model downloads,
 * invocation, credential usage, production integration, or paid inference.
 * The routing is conservative: CPU-only, phone-first; no local laptop required.
 */
export const SPECIALISTS=Object.freeze({
  art_reference:Object.freeze({engine:'PINNED_STILL_PIXELS',status:'AVAILABLE_RESEARCH',role:'Identity and look lock'}),
  visual_actor:Object.freeze({engine:'VTK_OR_AUTHORED_MASK',status:'AVAILABLE_RESEARCH',role:'Recognizable depth-aware objects'}),
  visual_atmosphere:Object.freeze({engine:'PINNED_PROCEDURAL_ART',status:'AVAILABLE_RESEARCH',role:'Nonfactual texture, lighting and backgrounds'}),
  visual_depth_optional:Object.freeze({engine:'DEPTH_ANYTHING_V2_SMALL',status:'BENCHMARK_ONLY_NOT_INSTALLED',role:'Depth map on approved source image'}),
  segmentation_optional:Object.freeze({engine:'MOBILESAM',status:'BENCHMARK_ONLY_NOT_INSTALLED',role:'Subject extraction from approved source'}),
  audio_reference:Object.freeze({engine:'KOKORO_ONNX_EXISTING',status:'EXISTING_PRODUCTION_REFERENCE_ONLY',role:'Narration; do not change production voice'}),
  alignment_reference:Object.freeze({engine:'MFA_EXISTING',status:'EXISTING_PRODUCTION_REFERENCE_ONLY',role:'Original word timestamps, not guesswork'}),
  preview_decode:Object.freeze({engine:'FFMPEG_PLUS_PIXEL_AUDIT',status:'AVAILABLE_RESEARCH',role:'Decode motion for negative filtering'}),
  human_critic:Object.freeze({engine:'OWNER_PLUS_INDEPENDENT_REVIEW',status:'REQUIRED',role:'Judge whether shot actually looks excellent'})
});
export const BLOCKED=Object.freeze(['FLUX_LARGE','WAN_2_2','TRELLIS','LTX_2','REMOTE_PAID_VIDEO_MODEL']);
const intentMap=Object.freeze({
  'everyday-to-mechanism':['art_reference','visual_actor','visual_atmosphere','preview_decode','human_critic'],
  'process-sequence':['art_reference','visual_actor','preview_decode','human_critic'],
  'study-measurement':['art_reference','visual_actor','preview_decode','human_critic'],
  'fair-comparison':['art_reference','visual_actor','preview_decode','human_critic'],
  'uncertainty':['art_reference','visual_atmosphere','preview_decode','human_critic'],
  'source-bound-scale':['art_reference','visual_actor','preview_decode','human_critic']
});
export function routeSpecialists({visualIntent,devicePath='PHONE_FIRST_REMOTE_CPU',researchOnly=true,
  requestGpu=false,requestPaid=false,requiresGeneratedFacts=false,requiresSyntheticFaces=false,
  allowExperimentalDepth=false,allowExperimentalSegmentation=false}={}){
 const errors=[];
 if(devicePath!=='PHONE_FIRST_REMOTE_CPU'||researchOnly!==true)errors.push('ISOLATED_RESEARCH_PATH_REQUIRED');
 if(requestGpu||requestPaid)errors.push('NO_GPU_OR_PAID_INFERENCE');
 if(requiresGeneratedFacts)errors.push('FACTS_MUST_BE_DETERMINISTIC');
 if(requiresSyntheticFaces)errors.push('SYNTHETIC_FACES_PROHIBITED');
 const roles=intentMap[visualIntent];
 if(!roles)errors.push('UNKNOWN_VISUAL_INTENT');
 if(errors.length)return {status:'HOLD',errors,selected:[],productionEligible:false};
 const selected=[...roles];
 const experiments=[];
 if(allowExperimentalDepth)experiments.push('visual_depth_optional');
 if(allowExperimentalSegmentation)experiments.push('segmentation_optional');
 // Experiments are NEVER silently selected for rendering; a device/cost/licensing
 // benchmark and owner approval are required before installing or executing.
 return {status:'ROUTED_RESEARCH_ONLY',selected,experiments,
   audioDependencies:['audio_reference','alignment_reference'],
   prohibitedModels:[...BLOCKED],modelInferenceExecuted:false,productionEligible:false,
   approvalRequired:['VISUAL_REFERENCE_LOCK','AUDIO_AUDITION','PHONE_PLAYBACK','HUMAN_CRAFT_REVIEW']};
}
