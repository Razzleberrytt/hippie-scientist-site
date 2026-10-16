/**
 * EvidenceMotion research-only specialist routing. No downloads, inference,
 * credential usage, production integration, or paid models.
 * Select tools for the storytelling purpose, NOT because weights exist.
 */
export const SPECIALISTS=Object.freeze({
  art_reference:Object.freeze({engine:'PINNED_STILL_PIXELS',status:'AVAILABLE_RESEARCH',role:'Look and pixel identity'}),
  visual_actor:Object.freeze({engine:'VTK_OR_AUTHORED_MASK',status:'AVAILABLE_RESEARCH',role:'Recognizable spatial objects'}),
  visual_atmosphere:Object.freeze({engine:'PINNED_PROCEDURAL_ART',status:'AVAILABLE_RESEARCH',role:'Nonfactual atmospheric background'}),
  visual_depth_optional:Object.freeze({engine:'DEPTH_ANYTHING_V2_SMALL',status:'BENCHMARK_ONLY_NOT_INSTALLED',role:'Optional depth from approved still'}),
  segmentation_optional:Object.freeze({engine:'MOBILESAM',status:'BENCHMARK_ONLY_NOT_INSTALLED',role:'Optional extraction of approved subject'}),
  audio_reference:Object.freeze({engine:'KOKORO_ONNX_EXISTING',status:'EXISTING_PRODUCTION_REFERENCE_ONLY',role:'Original narration; no rate stretching'}),
  alignment_reference:Object.freeze({engine:'MFA_EXISTING',status:'EXISTING_PRODUCTION_REFERENCE_ONLY',role:'Real acoustic word timestamps'}),
  preview_decode:Object.freeze({engine:'FFMPEG_PLUS_PIXEL_AUDIT',status:'AVAILABLE_RESEARCH',role:'Actual MP4 motion filter'}),
  human_critic:Object.freeze({engine:'OWNER_PLUS_INDEPENDENT_REVIEW',status:'REQUIRED',role:'Recognizability, materials, originality and craft veto'})
});
export const BLOCKED=Object.freeze(['FLUX_FULL','WAN_2_2','TRELLIS','LTX_2','LTX_2_3','LTX_2_5','REMOTE_PAID_VIDEO_MODEL']);
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
 requiresPhotorealSyntheticBroll=false,allowExperimentalDepth=false,allowExperimentalSegmentation=false}={}){
 const errors=[];
 if(devicePath!=='PHONE_FIRST_REMOTE_CPU'||researchOnly!==true)errors.push('ISOLATED_RESEARCH_PATH_REQUIRED');
 if(requestGpu||requestPaid)errors.push('NO_GPU_OR_PAID_INFERENCE');
 if(requiresGeneratedFacts)errors.push('FACTS_MUST_BE_DETERMINISTIC');
 if(requiresSyntheticFaces)errors.push('SYNTHETIC_FACES_PROHIBITED');
 if(requiresPhotorealSyntheticBroll)errors.push('NO_SYNTHETIC_DOCUMENTARY_FOOTAGE');
 const roles=intentMap[visualIntent];
 if(!roles)errors.push('UNKNOWN_VISUAL_INTENT');
 if(errors.length)return {status:'HOLD',errors,selected:[],productionEligible:false};
 const experiments=[];
 if(allowExperimentalDepth)experiments.push('visual_depth_optional');
 if(allowExperimentalSegmentation)experiments.push('segmentation_optional');
 return {status:'ROUTED_RESEARCH_ONLY',selected:[...roles],experiments,
  audioDependencies:['audio_reference','alignment_reference'],
  prohibitedModels:[...BLOCKED],modelInferenceExecuted:false,productionEligible:false,
  laptopRequired:false,paidInferenceUsed:false,
  approvalRequired:['VISUAL_REFERENCE_LOCK','AUDIO_AUDITION','PHONE_PLAYBACK','HUMAN_CRAFT_REVIEW']};
}
