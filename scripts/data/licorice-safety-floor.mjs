/**
 * Protective source-backed licorice safety floor.
 *
 * This is deliberately separate from indexing and publication approval:
 * editing an exported herbs-detail JSON alone is lost on workbook regeneration.
 * Only risk/recommendation/commerce flags become more restrictive; never
 * fabricate evidence or change the site's indexing or source receipts.
 */
export const LICORICE_SAFETY_REASON =
  'Glycyrrhizin-containing licorice can increase blood pressure and cause hypokalemia and arrhythmias; restrict recommendations pending human safety review. See PMID 38246526 and NIH NCCIH licorice safety guidance.'

// Only whole-licorice records sharing glycyrrhizin exposure; DGL is a distinct preparation.
export const WHOLE_LICORICE_SLUGS = new Set(['licorice', 'licorice-root', 'glycyrrhiza-glabra'])

export function applyLicoriceSafetyFloor(kind, slug, governance) {
  if (kind !== 'herbs' || !WHOLE_LICORICE_SLUGS.has(slug)) return governance
  if (!governance || typeof governance !== 'object' || Array.isArray(governance)) {
    throw new Error('Licorice governance record is unavailable; fail closed')
  }
  return {
    ...governance,
    medicalRisk: 'high',
    monetizationAllowed: false,
    recommendationAllowed: false,
    requiresHumanReview: true,
    reason: LICORICE_SAFETY_REASON,
  }
}
