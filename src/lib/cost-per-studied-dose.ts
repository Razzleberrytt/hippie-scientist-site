export type DoseMassUnit = 'mcg' | 'mg' | 'g'

export type CostPerStudiedDoseInput = {
  priceUsd: number | null | undefined
  servingsPerContainer: number | null | undefined
  amountPerServing: number | null | undefined
  amountUnit: DoseMassUnit | null | undefined
  studiedDose: number | null | undefined
  studiedDoseUnit: DoseMassUnit | null | undefined
  productDataReliable: boolean
  formulationMatchesEvidence: boolean
  reviewedAt?: string | null
  maxProductAgeDays?: number
  now?: Date
}

export type CostPerStudiedDoseFailureReason =
  | 'unreliable-product-data'
  | 'formulation-does-not-match-evidence'
  | 'missing-or-invalid-price'
  | 'missing-or-invalid-package-quantity'
  | 'missing-or-invalid-amount-per-serving'
  | 'missing-or-invalid-studied-dose'
  | 'missing-unit'
  | 'stale-product-data'

export type CostPerStudiedDoseResult =
  | {
      available: true
      costUsd: number
      servingsNeeded: number
      costPerServingUsd: number
      studiedDoseMg: number
      amountPerServingMg: number
    }
  | {
      available: false
      reason: CostPerStudiedDoseFailureReason
    }

const MG_PER_UNIT: Record<DoseMassUnit, number> = {
  mcg: 0.001,
  mg: 1,
  g: 1000,
}

function positiveFinite(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function toMg(value: number, unit: DoseMassUnit): number {
  return value * MG_PER_UNIT[unit]
}

function isStale(reviewedAt: string | null | undefined, maxAgeDays: number, now: Date): boolean {
  if (!reviewedAt) return true
  const reviewed = new Date(reviewedAt)
  if (Number.isNaN(reviewed.getTime())) return true
  const ageMs = now.getTime() - reviewed.getTime()
  return ageMs > maxAgeDays * 86_400_000
}

/**
 * Calculate product cost for the dose actually studied in evidence.
 *
 * This intentionally fails closed. A comparison page should omit cost-per-studied-dose
 * when current product economics, package quantity, active amount, or formulation match
 * are not explicitly reliable. Missing data must never be interpreted as a cheap product.
 */
export function calculateCostPerStudiedDose(input: CostPerStudiedDoseInput): CostPerStudiedDoseResult {
  if (!input.productDataReliable) return { available: false, reason: 'unreliable-product-data' }
  if (!input.formulationMatchesEvidence) return { available: false, reason: 'formulation-does-not-match-evidence' }
  if (!positiveFinite(input.priceUsd)) return { available: false, reason: 'missing-or-invalid-price' }
  if (!positiveFinite(input.servingsPerContainer)) return { available: false, reason: 'missing-or-invalid-package-quantity' }
  if (!positiveFinite(input.amountPerServing)) return { available: false, reason: 'missing-or-invalid-amount-per-serving' }
  if (!positiveFinite(input.studiedDose)) return { available: false, reason: 'missing-or-invalid-studied-dose' }
  if (!input.amountUnit || !input.studiedDoseUnit) return { available: false, reason: 'missing-unit' }

  const maxProductAgeDays = input.maxProductAgeDays ?? 90
  const now = input.now ?? new Date()
  if (isStale(input.reviewedAt, maxProductAgeDays, now)) {
    return { available: false, reason: 'stale-product-data' }
  }

  const amountPerServingMg = toMg(input.amountPerServing, input.amountUnit)
  const studiedDoseMg = toMg(input.studiedDose, input.studiedDoseUnit)
  const servingsNeeded = studiedDoseMg / amountPerServingMg
  const costPerServingUsd = input.priceUsd / input.servingsPerContainer
  const costUsd = costPerServingUsd * servingsNeeded

  return {
    available: true,
    costUsd: Number(costUsd.toFixed(2)),
    servingsNeeded: Number(servingsNeeded.toFixed(4)),
    costPerServingUsd: Number(costPerServingUsd.toFixed(4)),
    studiedDoseMg: Number(studiedDoseMg.toFixed(4)),
    amountPerServingMg: Number(amountPerServingMg.toFixed(4)),
  }
}
