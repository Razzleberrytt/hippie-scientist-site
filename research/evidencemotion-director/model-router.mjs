/** Research-only specialist routing for cinematic shot experiments.
 * No inference, package install, credential lookup or production imports.
 * The director decides purpose; no specialist may author factual science.
 */
export const SPECIALISTS=Object.freeze({
 director:{engine:'purpose-bound shot vocabulary',execution:'LOCAL_JS',budget:'ZERO_EXTRA',createsFactualContent:false},
 reference:{engine:'SHA-locked approved still assets',execution:'REMOTE_CPU_PREVIZ',budget:'ZERO_EXTRA',createsFactualContent:false},
 depth:{engine:'authored depth plates; Depth Anything V2 Small is research candidate only',execution:'REMOTE_CPU_PREVIZ',budget:'ZERO_EXTRA',createsFactualContent:false},
 mask:{engine:'authored alpha plates; MobileSAM is research candidate only',execution:'REMOTE_CPU_PREVIZ',budget:'ZERO_EXTRA',createsFactualContent:false},
 evidence:{engine:'reviewed deterministic geometry (VTK/Pillow)',execution:'REMOTE_CPU_PREVIZ',budget:'ZERO_EXTRA',createsFactualContent:false},
 voice:{engine:'existing saved Kokoro voice; human pronunciation audit',execution:'EXISTING_GOVERNED_PRODUCER',budget:'NO_NEW_BUDGET',createsFactualContent:false},
 alignment:{engine:'existing genuine acoustic word aligner',execution:'EXISTING_GOVERNED_PRODUCER',budget:'NO_NEW_BUDGET',createsFactualContent:false},
 composite:{engine:'FFmpeg deterministic art->mechanism->trust',execution:'REMOTE_CPU_PREVIZ',budget:'ZERO_EXTRA',createsFactualContent:false},
 critic:{engine:'decoded-pixel audit plus independent human shelf review',execution:'REMOTE_CPU_PREVIZ',budget:'ZERO_EXTRA',createsFactualContent:false},
});
const HEAVY=Object.freeze(['FLUX_FULL','WAN_2_2','TRELLIS','LTX_2','LTX_2_3']);
export function routeSpecialists(shot,hardware={route:'PHONE_FIRST_REMOTE_CPU',paidInferenceAllowed:false}){
 const blocked=[];
 if(hardware.route!=='PHONE_FIRST_REMOTE_CPU'||hardware.paidInferenceAllowed!==false)
   blocked.push('FROZEN_PHONE_FIRST_OR_PAID_INFERENCE_VIOLATION');
 if(!shot?.lockedStillSha256||!/^[a-f0-9]{64}$/i.test(shot.lockedStillSha256))
   blocked.push('NO_LOCKED_STILL');
 if(shot?.needsScience&&(!shot.reviewedScienceAssetSha256||!/^[a-f0-9]{64}$/i.test(shot.reviewedScienceAssetSha256)))
   blocked.push('UNVERIFIED_SCIENCE_GEOMETRY');
 if(shot?.faceGeneration===true)blocked.push('AI_FACES_EXCLUDED');
 if(shot?.photorealGeneratedFootage===true)blocked.push('SYNTHETIC_PHOTOREAL_FOOTAGE_EXCLUDED');
 if(shot?.syntheticFactualDiagram===true)blocked.push('GENERATIVE_SCIENCE_EXCLUDED');
 if(HEAVY.includes(shot?.requestedModel))blocked.push('HEAVY_VIDEO_OR_IMAGE_MODEL_PARKED');
 const optionalBenchmarks=[];
 if(shot?.needsSegmentation&&shot?.hasReviewedAlphaLayer!==true)
   optionalBenchmarks.push('MANUAL_ALPHA_PLATE_FIRST; MOBILE_SAM_ONLY_IF_BENCHMARKED');
 if(shot?.needsParallax&&shot?.hasReviewedDepthLayer!==true)
   optionalBenchmarks.push('MANUAL_DEPTH_PLATE_FIRST; DEPTH_ANYTHING_V2_SMALL_ONLY_IF_BENCHMARKED');
 if(shot?.assetLibraryNeedsRanking)
   optionalBenchmarks.push('CLIP_EMBEDDINGS_OPTIONAL; NO_AUTOMATIC_AESTHETIC_PASS');
 const selected=['director','reference',...(shot?.needsParallax?['depth']:[]),
   ...(shot?.needsSegmentation?['mask']:[]),...(shot?.needsScience?['evidence']:[]),
   'voice','alignment','composite','critic'];
 return {status:blocked.length?'BLOCKED':'RESEARCH_ROUTED',blocked,selected,
   optionalBenchmarks,laptopRequired:false,newModelInstalled:false,
   ownerPhoneReviewRequired:true,independentCraftApprovalRequired:true,
   autoPublish:false,productionEligible:false};
}
