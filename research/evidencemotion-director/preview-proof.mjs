/** Research-only audit contract. A source label is NOT a cryptographic attestation;
 * caller must execute the independent decoder and verify bytes before evaluation.
 */
const hex = x => typeof x === 'string' && /^[a-f0-9]{64}$/i.test(x);
const num = x => typeof x === 'number' && Number.isFinite(x);
export function inspectDecodedProof(p){
 const errors=[],advisories=[];
 if(!p || p.origin !== 'independent-full-decode') errors.push('INDEPENDENT_FRAME_DECODER_REQUIRED');
 if(!hex(p?.previewSha256)) errors.push('MISSING_MEDIA_SHA256');
 if(!Number.isInteger(p?.decodedFrameCount)||p.decodedFrameCount<2) errors.push('MISSING_DECODED_FRAME_COUNT');
 if(!num(p?.fps)||p.fps<1||p.fps>60|| !Number.isInteger(p?.width)||p.width<100||p.width>720||!Number.isInteger(p?.height)||p.height<100||p.height>1280)
  errors.push('INVALID_PREVIEW_DIMENSIONS_OR_FPS');
 const roi=p?.roiPixels;
 if(!Array.isArray(roi)||roi.length!==4||roi.some(v=>!Number.isInteger(v))||
    !(roi[0]>=0&&roi[1]>=0&&roi[2]<=p.width&&roi[3]<=p.height&&roi[0]<roi[2]&&roi[1]<roi[3]))
  errors.push('INVALID_DECODED_SUBJECT_ROI');
 else if(roi[1]<Math.round(.12*p.height)||roi[3]>Math.round(.80*p.height))
  errors.push('CAPTION_CONTAMINATED_MOTION_REGION');
 if(!num(p?.maxCaptionExcludedStaticSec)||p.maxCaptionExcludedStaticSec<0)
  errors.push('STATIC_DURATION_NOT_MEASURED');
 if(!num(p?.medianChangedFraction)||p.medianChangedFraction<0||p.medianChangedFraction>1)
  errors.push('MOTION_DENSITY_NOT_MEASURED');
 if(!num(p?.medianBroadStructureChangedFraction)||p.medianBroadStructureChangedFraction<0||p.medianBroadStructureChangedFraction>1)
  errors.push('STRUCTURAL_MOTION_NOT_MEASURED');
 if(!errors.length){
  if(p.maxCaptionExcludedStaticSec>6) errors.push('STATIC_COMPOSITION_KILL');
  if(p.medianChangedFraction<.005) advisories.push('NEAR_STATIC_MOVING_POSTER_RISK');
  if(p.medianBroadStructureChangedFraction<.005) advisories.push('HERO_STRUCTURE_STILL_STATIC');
  if(p.decodedFrameCount/p.fps > 60) advisories.push('PREVIEW_LONGER_THAN_EXPECTED');
 }
 return {status:errors.length?'HOLD':'AUDIT_EVIDENCE_USABLE',errors,advisories,
  artisticApproval:false,publicationApproved:false};
}
