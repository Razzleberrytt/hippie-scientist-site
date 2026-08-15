export interface ProductQualitySignals {
  transparentActiveDose: boolean
  studiedFormDisclosed: boolean
  standardizedExtractOrForm: boolean
  activeMarkerDeclared: boolean
  elementalAmountDeclared?: boolean
  thirdPartyTesting: boolean
  coaAvailable: boolean
  contaminantTesting: boolean
  adulterationControls: boolean
  proprietaryBlend: boolean
  currentFormulationVerified: boolean
}

export interface ProductQualityScore {
  score: number
  band: 'strong-label-quality' | 'adequate-label-quality' | 'limited-quality-data' | 'poor-transparency'
  positives: string[]
  cautions: string[]
}

const positiveSignals: Array<[keyof ProductQualitySignals, number, string]> = [
  ['transparentActiveDose', 15, 'Active dose is disclosed'],
  ['studiedFormDisclosed', 12, 'Form is identified clearly enough to compare with research'],
  ['standardizedExtractOrForm', 10, 'Standardized extract or defined form is disclosed'],
  ['activeMarkerDeclared', 8, 'Active-marker percentage or amount is disclosed'],
  ['thirdPartyTesting', 15, 'Independent/third-party testing is reported'],
  ['coaAvailable', 12, 'Certificate of analysis is available'],
  ['contaminantTesting', 10, 'Contaminant testing is reported'],
  ['adulterationControls', 8, 'Identity/adulteration controls are reported'],
  ['currentFormulationVerified', 10, 'Current formulation has been verified'],
]

export function scoreProductQuality(signals: ProductQualitySignals): ProductQualityScore {
  let score = 0
  const positives: string[] = []
  const cautions: string[] = []

  for (const [key, weight, description] of positiveSignals) {
    if (signals[key] === true) {
      score += weight
      positives.push(description)
    }
  }

  if (signals.elementalAmountDeclared === true) {
    score += 10
    positives.push('Elemental mineral amount is disclosed')
  }
  if (signals.elementalAmountDeclared === false) cautions.push('Elemental mineral amount is not clearly disclosed')

  if (signals.proprietaryBlend) {
    score -= 20
    cautions.push('Proprietary blend obscures individual ingredient amounts')
  }
  if (!signals.transparentActiveDose) cautions.push('Active amount per serving is unclear')
  if (!signals.thirdPartyTesting) cautions.push('Independent testing is not documented')
  if (!signals.coaAvailable) cautions.push('No accessible certificate of analysis is documented')
  if (!signals.currentFormulationVerified) cautions.push('Current formulation has not been verified')

  score = Math.max(0, Math.min(100, score))
  const band = score >= 80
    ? 'strong-label-quality'
    : score >= 60
      ? 'adequate-label-quality'
      : score >= 35
        ? 'limited-quality-data'
        : 'poor-transparency'

  return { score, band, positives, cautions }
}

/**
 * Deliberately narrow API: efficacy evidence, affiliate payout, commission rate,
 * revenue, CTR, and retailer identity are not accepted inputs. Product quality
 * must describe the product itself rather than its commercial value to the site.
 */
export function productQualityInputsDoNotIncludeCommerceOrEfficacy(): true {
  return true
}
