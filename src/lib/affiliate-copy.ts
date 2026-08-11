export function affiliateRationaleForDisplay(
  productName: string,
  rationale?: string,
  fallback = 'Review the label, dose, third-party testing, and safety context before buying.',
): string {
  const text = rationale?.trim() || fallback

  // Product registries should describe observable product attributes, not promote a
  // retail dosage form with a pharmacokinetic claim that was established for a
  // different administration system. In particular, "fast dissolve" tablets are
  // not automatically equivalent to validated oral-transmucosal delivery systems.
  if (/\b(?:avoid|avoids|bypass|bypasses|skip|skips)(?:ing)?\s+(?:hepatic\s+)?first[- ]pass\s+metabolism\b/i.test(text)) {
    const doseMatch = productName.match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg)\b/i)?.[0]
    const doseContext = doseMatch ? ` with a clearly labeled ${doseMatch} dose` : ''
    return `${productName} uses a fast-dissolve format${doseContext}. Treat the dosage form as a convenience feature, not evidence of superior absorption or better clinical outcomes.`
  }

  return text
}
