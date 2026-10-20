/** Passive research-only source-card guard.
 * A legitimate readable citation card may be intentionally static; motion/hero tests
 * MUST continue to evaluate non-source shots. This grants no craft or release status.
 */
const digest = s => typeof s === 'string' && /^[0-9a-f]{64}$/i.test(s);

export function assessSourceReadingHold({beat, citation, decodedSample} = {}) {
  const errors = [];
  if (beat?.id !== 'source_hold' || beat?.role !== 'source' || beat?.spoken !== false)
    errors.push('NOT_AN_AUTHORIZED_SILENT_SOURCE_HOLD');
  const start=beat?.start, end=beat?.end;
  if (!(Number.isFinite(start) && Number.isFinite(end) && end-start>=3 && end-start<=5))
    errors.push('SOURCE_READ_WINDOW_INVALID');
  if (citation?.cid !== 44301524 ||
      citation?.url !== 'https://pubchem.ncbi.nlm.nih.gov/compound/44301524' ||
      citation?.visibleCidText !== '44301524' ||
      citation?.visibleSourceHost !== 'pubchem.ncbi.nlm.nih.gov')
    errors.push('UNVERIFIED_OR_UNREADABLE_SOURCE_IDENTITY');
  if (decodedSample?.origin !== 'independent-full-decode' ||
      !digest(decodedSample?.finalMasterSha256) ||
      !digest(decodedSample?.samplePngSha256) ||
      !Number.isFinite(decodedSample?.sampleSecond) ||
      !(decodedSample.sampleSecond>=start && decodedSample.sampleSecond<end) ||
      decodedSample.width !== 1080 || decodedSample.height !== 1920)
    errors.push('ACTUAL_FULL_HD_FRAME_SAMPLE_REQUIRED');
  return {
    status: errors.length ? 'HOLD' : 'SOURCE_READING_HOLD_EXEMPT_FROM_MOVING_POSTER_ONLY',
    errors,
    excludeOnlySourceWindowFromMotionKill: errors.length===0,
    allOtherShotsStillRequireMotionQA: true,
    citationLegibilityMachineCertified: false,
    separatePhoneReadabilityReviewRequired: true,
    excellentCertified: false,
    releaseApproved: false,
  };
}
