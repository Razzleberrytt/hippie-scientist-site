export type PublicProductCopyInput = {
  title?: string
  name?: string
  brand?: string
  rationale?: string
  notes?: string
}

const FALLBACK_RATIONALE =
  'Use this as a product-format example. Verify serving size, formulation, third-party testing, and safety context before buying.'

const UNSUPPORTED_OR_DYNAMIC_COPY =
  /\b(avoids? first-pass metabolism|preferred by most sleep researchers|well-reviewed|faster absorption|superior bioavailability)\b/i

function normalizedIdentity(input: PublicProductCopyInput): string {
  const title = input.title || input.name || ''
  return `${input.brand || ''}|${title}`.trim().toLowerCase()
}

const PRODUCT_RATIONALE_OVERRIDES: Record<string, string> = {
  'now foods|now melatonin 3 mg':
    'Budget option for a simple 3 mg melatonin capsule. Check whether 3 mg matches the dose you intend to use.',
  'natrol|natrol melatonin 5 mg fast dissolve':
    'Fast-dissolve format for readers who prefer a tablet that dissolves in the mouth. Check whether 5 mg matches the dose you intend to use.',
  'thorne|thorne melaton-3':
    'Premium-format option for readers who prefer a simple 3 mg melatonin capsule from a practitioner-oriented brand.',
}

export function getPublicProductRationale(input: PublicProductCopyInput): string {
  const override = PRODUCT_RATIONALE_OVERRIDES[normalizedIdentity(input)]
  if (override) return override

  const raw = (input.rationale || input.notes || '').trim()
  if (!raw) return FALLBACK_RATIONALE

  if (UNSUPPORTED_OR_DYNAMIC_COPY.test(raw)) {
    return FALLBACK_RATIONALE
  }

  return raw
}
