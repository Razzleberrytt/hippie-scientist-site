export type ProductLifecycleStatus = 'active' | 'stale' | 'discontinued' | 'formulation-changed' | 'unverified'

export interface ProductLifecycleMetadata {
  status?: ProductLifecycleStatus
  lastVerifiedAt?: string
  reviewedFormulationFingerprint?: string
  currentFormulationFingerprint?: string
  reviewedEvidenceForm?: string
  currentProductForm?: string
  discontinued?: boolean
}

export interface ProductLifecycleDecision {
  status: ProductLifecycleStatus
  action: 'allow' | 'review' | 'block'
  reasons: string[]
}

const DAY_MS = 86_400_000

function parseTime(value?: string) {
  if (!value) return Number.NaN
  return Date.parse(value)
}

export function evaluateProductLifecycle(
  product: ProductLifecycleMetadata,
  now = new Date(),
  staleAfterDays = 90,
): ProductLifecycleDecision {
  const reasons: string[] = []

  if (product.discontinued || product.status === 'discontinued') {
    return { status: 'discontinued', action: 'block', reasons: ['Product is marked discontinued.'] }
  }

  const formulationChanged = Boolean(
    product.status === 'formulation-changed' ||
    (product.reviewedFormulationFingerprint && product.currentFormulationFingerprint && product.reviewedFormulationFingerprint !== product.currentFormulationFingerprint) ||
    (product.reviewedEvidenceForm && product.currentProductForm && product.reviewedEvidenceForm.trim().toLowerCase() !== product.currentProductForm.trim().toLowerCase()),
  )
  if (formulationChanged) {
    return {
      status: 'formulation-changed',
      action: 'block',
      reasons: ['Current formulation no longer matches the reviewed formulation/evidence form.'],
    }
  }

  const verifiedAt = parseTime(product.lastVerifiedAt)
  if (Number.isFinite(verifiedAt)) {
    const ageDays = Math.max(0, (now.getTime() - verifiedAt) / DAY_MS)
    if (ageDays > staleAfterDays || product.status === 'stale') {
      reasons.push(`Product verification is ${Math.floor(ageDays)} days old.`)
      return { status: 'stale', action: 'review', reasons }
    }
    return { status: product.status === 'active' ? 'active' : 'active', action: 'allow', reasons: ['Product metadata is within the verification window.'] }
  }

  return {
    status: product.status ?? 'unverified',
    action: product.status === 'active' ? 'review' : 'review',
    reasons: ['No current product-verification date is recorded.'],
  }
}

export function shouldSuppressProductRecommendation(product: ProductLifecycleMetadata) {
  return evaluateProductLifecycle(product).action === 'block'
}
