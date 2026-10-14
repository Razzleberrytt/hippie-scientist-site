/** Research-only geometry contract for a locked deterministic chemical diagram.
 * It validates pre-render metadata, not any pixels or biochemical interpretation.
 * Actual PNG/video frame decoding and human craft QA remain independent requirements.
 */
const verifiedKey='RYENLSMHLCNXJT-CYXFISRXSA-N';
const hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const point=x=>Array.isArray(x)&&x.length===2&&x.every(v=>typeof v==='number'&&Number.isFinite(v));
const box=x=>Array.isArray(x)&&x.length===4&&x.every(v=>typeof v==='number'&&Number.isFinite(v))&&x[2]>x[0]&&x[3]>x[1];
export function checkScientificView({
 compoundInchiKey,sourceGraphSha256,drawnGraphSha256,
 mode,sceneBox,graphInkBox,scienceDetailLabel,
 highlightedAtomIndex,sourceHydroxylAtomIndex,projectedAtomPoint,highlightCenterPoint,
 generatedAtomsOrBonds=false,claimedExperimentalPose=false,
 marginPx=6
}={}){
 const errors=[];
 if(compoundInchiKey!==verifiedKey||!hex(sourceGraphSha256)||sourceGraphSha256!==drawnGraphSha256)
   errors.push('SOURCE_GRAPH_IDENTITY_UNVERIFIED');
 if(!['WHOLE','ATOM_DETAIL'].includes(mode))errors.push('UNKNOWN_VIEW_MODE');
 if(!box(sceneBox)||!box(graphInkBox))errors.push('INVALID_GRAPH_VIEW_BOUNDS');
 if(generatedAtomsOrBonds||claimedExperimentalPose)errors.push('GENERATIVE_OR_EXPERIMENTAL_CHEMISTRY_PROHIBITED');
 if(mode==='WHOLE'&&box(sceneBox)&&box(graphInkBox)&&(
   graphInkBox[0]<sceneBox[0]+marginPx||graphInkBox[1]<sceneBox[1]+marginPx||
   graphInkBox[2]>sceneBox[2]-marginPx||graphInkBox[3]>sceneBox[3]-marginPx))
   errors.push('AUTHORITATIVE_2D_GRAPH_CROPPED');
 if(mode==='ATOM_DETAIL'){
   if(scienceDetailLabel!=='DETAIL VIEW')errors.push('DETAIL_CROP_NOT_LABELED');
   if(!Number.isInteger(highlightedAtomIndex)||highlightedAtomIndex!==sourceHydroxylAtomIndex||
      !point(projectedAtomPoint)||!point(highlightCenterPoint)||
      Math.hypot(projectedAtomPoint?.[0]-highlightCenterPoint?.[0],
        projectedAtomPoint?.[1]-highlightCenterPoint?.[1])>2)
      errors.push('HYDROXYL_ANNOTATION_NOT_SOURCE_PROJECTED');
 }
 return {status:errors.length?'HOLD':'RESEARCH_METADATA_READY_FOR_IMAGE_AUDIT',
   errors,publicationApproved:false,craftApproved:false,
   caveat:'Bounding boxes and source hashes here are provided metadata. Verify actual source and pixels independently before any acceptance.'};
}
