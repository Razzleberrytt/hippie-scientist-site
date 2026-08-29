const DEFAULT_FALLBACK =
  'Review the label, dose, third-party testing, and safety context before buying.'

const DYNAMIC_OR_UNSOURCED_SUPERIORITY =
  /\b(well[- ]reviewed|preferred by most sleep researchers|faster absorption|superior bioavailability)\b/i

const RANKING_PREFIXES: Array<[RegExp, string]> = [
  // Registry copy uses both “Best overall for …” and “Best overall pick for …”.
  [/^best\s+overall(?:\s+(?:pick|choice|option))?\s+for\s+/i, 'Product example for '],
  [/^best\s+overall(?:\s+(?:pick|choice|option))?\s+/i, 'Product example: '],
  [/^best\s+value(?:\s+(?:pick|choice|option))?\s+for\s+/i, 'Value-oriented product example for '],
  [/^best\s+value(?:\s+(?:pick|choice|option))?\s+/i, 'Value-oriented product example: '],
  [/^budget\s+(?:pick|choice|option)\s+for\s+/i, 'Budget product example for '],
  [/^premium\s+(?:pick|choice|option)\s+for\s+/i, 'Premium product example for '],
]

function neutralizeUnsourcedRanking(text: string): string {
  for (const [pattern, replacement] of RANKING_PREFIXES) {
    if (pattern.test(text)) return text.replace(pattern, replacement)
  }

  // Some registry rows insert a format word before “pick” (for example,
  // “Budget capsule pick for …”). Keep the useful format descriptor while removing
  // the editorial-selection word.
  const budgetFormatPick = text.match(/^budget\s+([\w-]+)\s+pick\s+for\s+/i)
  if (budgetFormatPick) {
    return text.replace(budgetFormatPick[0], `Budget ${budgetFormatPick[1]} example for `)
  }

  return text
}

function formatFirstPassFallback(productName: string): string {
  const doseMatch = productName.match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg)\b/i)?.[0]
  const doseContext = doseMatch ? ` with a clearly labeled ${doseMatch} dose` : ''
  return `${productName} uses a fast-dissolve format${doseContext}. Treat the dosage form as a convenience feature, not evidence of superior absorption or better clinical outcomes.`
}

export function affiliateRationaleForDisplay(
  productName: string,
  rationale?: string,
  fallback = DEFAULT_FALLBACK,
): string {
  const text = rationale?.trim() || fallback

  // Product registries should describe observable product attributes, not promote a
  // retail dosage form with a pharmacokinetic claim that was established for a
  // different administration system. In particular, "fast dissolve" tablets are
  // not automatically equivalent to validated oral-transmucosal delivery systems.
  if (/\b(?:avoid|avoids|bypass|bypasses|skip|skips)(?:ing)?\s+(?:hepatic\s+)?first[- ]pass\s+metabolism\b/i.test(text)) {
    return formatFirstPassFallback(productName)
  }

  // Retail rationale is rendered on decision/commercial surfaces without a source
  // attached to the product card. Dynamic popularity claims and pharmacokinetic
  // superiority therefore should not survive into public copy unless they are moved
  // into a source-backed editorial section instead.
  if (DYNAMIC_OR_UNSOURCED_SUPERIORITY.test(text)) {
    const doseMatch = productName.match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg)\b/i)?.[0]
    const doseContext = doseMatch ? ` The product label identifies a ${doseMatch} serving.` : ''
    return `Use ${productName} as a product-format example.${doseContext} Verify formulation, serving size, third-party testing, and safety context before buying.`
  }

  // Unsourced commercial cards can organize examples by registry slot, but labels
  // such as "best overall" read like evidence-backed comparative judgments. Keep the
  // useful product-format rationale while removing that unsupported ranking signal.
  return neutralizeUnsourcedRanking(text)
}
