/** Manual-annotation honesty gate for generated art, never a computer-vision factual verifier. */
const hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const box=x=>Array.isArray(x)&&x.length===4&&x.every(Number.isFinite)&&x[0]>=0&&x[1]>=0&&x[2]>x[0]&&x[3]>x[1];
const overlaps=(a,b)=>Math.min(a[2],b[2])>Math.max(a[0],b[0])&&Math.min(a[3],b[3])>Math.max(a[1],b[1]);
export function approveIllustrativeCrop({sourceSha256,width,height,crop,forbiddenRegions,humanReviewedSourceSha256,humanReviewerNote}={}){
 const errors=[];
 if(!hex(sourceSha256)||sourceSha256!==humanReviewedSourceSha256||!humanReviewerNote?.trim())errors.push('SOURCE_NOT_HUMAN_REVIEWED');
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||!box(crop)||crop[2]>width||crop[3]>height)errors.push('INVALID_OR_OUT_OF_BOUNDS_CROP');
 if(!Array.isArray(forbiddenRegions)||!forbiddenRegions.length||forbiddenRegions.some(x=>!box(x.bounds)||!x.reason||x.bounds[2]>width||x.bounds[3]>height))errors.push('MISSING_OR_INVALID_FORBIDDEN_REGIONS');
 else if(box(crop)&&forbiddenRegions.some(x=>overlaps(x.bounds,crop)))errors.push('CROP_CONTAINS_UNAPPROVED_GENERATIVE_SCIENCE');
 return {status:errors.length?'HOLD':'ANNOTATED_NONFACTUAL_CROP_ONLY',errors,publicationApproved:false,
  caveat:'Manual source annotations constrain allowed source pixels; only qualified visual inspection can determine whether the crop itself contains unsupported science.'};
}
