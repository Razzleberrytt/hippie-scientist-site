/** EM-006.04: research-only *caption intent* veto layered on the existing
 * human-annotated nonfactual botanical-crop fence. No pixel/OCR inspection,
 * scientific measurement or authenticated photograph can be inferred here.
 */
import {approveIllustrativeCrop} from './illustrative-crop-gate.mjs';

export const KNOWN_RESEARCH_BOTANICAL = Object.freeze({
  fullSourceSha256:'b041fb2ec302b869d9d69cb02dad52afd4186e6aa577e794ba93b05c79b6978d',
  admittedCropSha256:'4516b902806630ba97941636fbe11a5db8859b8c19a5089adaedbde6d497090e',
  disclosure:'AI-ILLUSTRATED BOTANICAL ART',
  width:940,
  height:1672,
  crop:Object.freeze([0,0,940,520]),
  forbiddenRegion:Object.freeze([0,521,940,1672]),
});

const HEX=/^[a-f0-9]{64}$/;
const ALLOWED=Object.freeze(['sourceAnnotation','admittedCropSha256','originType','depictionIntent','assertedEvidenceType','visibleCaption']);

export function auditBotanicalCaption(input) {
  const reasons=[];
  if(!input||typeof input!=='object'||Array.isArray(input))
    return {status:'HOLD_DECEPTIVE_OR_UNVERIFIED_BOTANICAL_CONTEXT',
      reasons:['MISSING_OR_INVALID_CANDIDATE'],sourceCropVerified:false,
      actualFrameInspected:false,scientificContentMeasured:false,mayPublish:false};
  // Prevent silent permission or meaning smuggling via extra metadata fields.
  if(Object.keys(input).some(k=>!ALLOWED.includes(k)))reasons.push('UNREVIEWED_CAPTION_OR_PERMISSION_FIELD');
  const annotation=input.sourceAnnotation;
  let cropReview={status:'HOLD',errors:['MISSING_SOURCE_ANNOTATION']};
  if(annotation&&typeof annotation==='object'&&!Array.isArray(annotation)){
    cropReview=approveIllustrativeCrop(annotation);
    if(annotation.sourceSha256!==KNOWN_RESEARCH_BOTANICAL.fullSourceSha256 ||
      annotation.width!==KNOWN_RESEARCH_BOTANICAL.width ||
      annotation.height!==KNOWN_RESEARCH_BOTANICAL.height ||
      JSON.stringify(annotation.crop)!==JSON.stringify(KNOWN_RESEARCH_BOTANICAL.crop)||
      !Array.isArray(annotation.forbiddenRegions)||
      !annotation.forbiddenRegions.some(region=>
        JSON.stringify(region?.bounds)===JSON.stringify(KNOWN_RESEARCH_BOTANICAL.forbiddenRegion)))
      reasons.push('UNPINNED_BOTANICAL_SOURCE_OR_CROP');
  }else reasons.push('MISSING_SOURCE_ANNOTATION');
  if(cropReview.status!=='ANNOTATED_NONFACTUAL_CROP_ONLY')
    reasons.push('CROP_NOT_ADMITTED:'+cropReview.errors.join(','));
  if(!HEX.test(String(input.admittedCropSha256??''))||
     input.admittedCropSha256!==KNOWN_RESEARCH_BOTANICAL.admittedCropSha256)
    reasons.push('SOURCE_CROP_SHA_MISMATCH');
  if(input.originType!=='synthetic-illustration')
    reasons.push('REAL_FILMED_OR_SCIENTIFIC_IMAGE_FALSE_PROVENANCE');
  if(input.depictionIntent!=='nonfactual-atmosphere')
    reasons.push('UNSUPPORTED_BOTANICAL_SCIENTIFIC_MEANING');
  if(input.assertedEvidenceType!=='none')
    reasons.push('FABRICATED_MEASUREMENT_OR_ANALYTICAL_EVIDENCE');
  if(input.visibleCaption!==KNOWN_RESEARCH_BOTANICAL.disclosure)
    reasons.push('MISSING_OR_DECEPTIVE_ILLUSTRATION_DISCLOSURE');
  return {
    status:reasons.length?'HOLD_DECEPTIVE_OR_UNVERIFIED_BOTANICAL_CONTEXT':'ANNOTATED_NONFACTUAL_CAPTION_RESEARCH_ONLY',
    reasons,sourceCropVerified:false,actualFrameInspected:false,
    scientificContentMeasured:false,qualifiedScienceReview:false,
    phoneContrastChecked:false,publicationApproved:false,mayPublish:false,
    limitation:'Source annotation and caption fields are caller-supplied. These tests do not open the PNG, decode the video, read on-screen pixels, authenticate a species or establish measured 7-OH in plant material.'
  };
}
