/**
 * R8.08 exact-master HUD inspection: human-reviewed frame attestation.
 * This does not claim automated inspection of PNG/MP4 pixels. It requires
 * a reviewer to inspect the encoded master at the first, middle, limitation,
 * and source frames and mark every checkpoint as passed. The parent master-QA
 * receipt binds these attestations to the exact MP4 SHA-256 hash.
 */
export const R808_HUD_FRAME_CHECKS = Object.freeze([
  'hudFirstFrame',
  'hudMiddleFrame',
  'hudLimitationFrame',
  'hudSourceFrame',
])

export function validateR808HudReview(review) {
  const missing = R808_HUD_FRAME_CHECKS.filter(field => review?.[field] !== 'pass')
  if (missing.length) {
    throw new Error(`R8.08 exact-master HUD inspection requires pass for ${missing.join(', ')}; publication fails closed`)
  }
  return Object.fromEntries(R808_HUD_FRAME_CHECKS.map(field => [field, 'pass']))
}
