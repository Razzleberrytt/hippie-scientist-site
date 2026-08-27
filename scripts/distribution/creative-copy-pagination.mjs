const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

export function paginateGovernedCopy(value, { maxChars = 150, maxPages = 12 } = {}) {
  const text = clean(value)
  if (!text) throw new Error('governed copy is required')
  if (!Number.isInteger(maxChars) || maxChars < 24) throw new Error('maxChars must be an integer >= 24')
  if (!Number.isInteger(maxPages) || maxPages < 1) throw new Error('maxPages must be a positive integer')

  const words = text.split(' ')
  if (words.some((word) => word.length > maxChars)) {
    throw new Error('governed copy contains a token that cannot fit losslessly within the page budget')
  }

  const pages = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }
    pages.push(current)
    current = word
    if (pages.length >= maxPages) throw new Error('governed copy exceeds the maximum lossless page count')
  }
  if (current) pages.push(current)
  if (pages.length > maxPages) throw new Error('governed copy exceeds the maximum lossless page count')

  const reconstructed = pages.join(' ')
  if (reconstructed !== text) throw new Error('lossless pagination invariant failed')

  return {
    original: text,
    maxChars,
    totalPages: pages.length,
    pages: pages.map((content, index) => ({
      index: index + 1,
      total: pages.length,
      content,
      continuation: index > 0,
      continues: index < pages.length - 1,
      factualAuthority: 'canonical-input',
      rewriteAllowed: false,
      truncationAllowed: false,
    })),
    integrity: {
      reconstruction: reconstructed,
      exactNormalizedMatch: reconstructed === text,
      truncation: false,
      rewrite: false,
    },
  }
}

export function buildLosslessCreativeCopyPlan({ finding, limitation }, options = {}) {
  return {
    version: 1,
    finding: paginateGovernedCopy(finding, options),
    limitation: paginateGovernedCopy(limitation, options),
    rendererContract: {
      renderEveryPageInOrder: true,
      mayDropContinuationPages: false,
      mayRewriteFactualCopy: false,
      mayTruncateFactualCopy: false,
      continuationIndicatorRequired: true,
    },
  }
}
