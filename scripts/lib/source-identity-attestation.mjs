function normalizedText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeDoi(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
    .replace(/^doi:\s*/, '')
}

export function normalizeTitle(value) {
  return normalizedText(value)
}

export function titleTokenSimilarity(left, right) {
  const a = new Set(normalizeTitle(left).split(' ').filter(Boolean))
  const b = new Set(normalizeTitle(right).split(' ').filter(Boolean))
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const token of a) if (b.has(token)) intersection += 1
  const union = new Set([...a, ...b]).size
  return union ? intersection / union : 0
}

export function extractPubmedDoi(entry) {
  const ids = Array.isArray(entry?.articleids) ? entry.articleids : []
  const doi = ids.find((id) => String(id?.idtype ?? '').toLowerCase() === 'doi')
  return normalizeDoi(doi?.value)
}

export function extractPubmedYear(entry) {
  const raw = String(entry?.sortpubdate || entry?.pubdate || entry?.epubdate || '')
  const match = raw.match(/\b(1[89]\d{2}|20\d{2})\b/)
  return match ? Number(match[1]) : null
}

export function compareCandidateToPubmed(candidate, entry, { minTitleSimilarity = 0.72 } = {}) {
  const issues = []
  const pmid = String(candidate?.pmid ?? '').trim()
  const resolvedPmid = String(entry?.uid ?? entry?.pmid ?? '').trim()
  const candidateDoi = normalizeDoi(candidate?.doi)
  const resolvedDoi = extractPubmedDoi(entry)
  const candidateTitle = String(candidate?.title ?? '').trim()
  const resolvedTitle = String(entry?.title ?? '').replace(/\s+/g, ' ').replace(/\.$/, '').trim()
  const candidateYear = Number.isInteger(candidate?.publicationYear) ? candidate.publicationYear : null
  const resolvedYear = extractPubmedYear(entry)
  const titleSimilarity = titleTokenSimilarity(candidateTitle, resolvedTitle)

  if (!pmid) issues.push('candidate PMID is missing')
  if (!resolvedPmid) issues.push('PubMed response is missing uid/pmid')
  if (pmid && resolvedPmid && pmid !== resolvedPmid) {
    issues.push(`PMID mismatch: candidate=${pmid} resolved=${resolvedPmid}`)
  }

  if (!resolvedTitle) {
    issues.push('PubMed response is missing title')
  } else if (titleSimilarity < minTitleSimilarity) {
    issues.push(
      `title mismatch: similarity=${titleSimilarity.toFixed(3)} candidate=${JSON.stringify(candidateTitle)} resolved=${JSON.stringify(resolvedTitle)}`,
    )
  }

  if (candidateDoi) {
    if (!resolvedDoi) issues.push(`DOI mismatch: candidate=${candidateDoi} resolved=<missing>`)
    else if (candidateDoi !== resolvedDoi) issues.push(`DOI mismatch: candidate=${candidateDoi} resolved=${resolvedDoi}`)
  }

  if (candidateYear && resolvedYear && Math.abs(candidateYear - resolvedYear) > 1) {
    issues.push(`publication year mismatch: candidate=${candidateYear} resolved=${resolvedYear}`)
  }

  if (candidate?.canonicalUrl) {
    try {
      const url = new URL(candidate.canonicalUrl)
      if (url.hostname.toLowerCase() === 'pubmed.ncbi.nlm.nih.gov') {
        const pathPmid = url.pathname.split('/').filter(Boolean)[0] || ''
        if (pmid && pathPmid !== pmid) {
          issues.push(`PubMed canonical URL mismatch: candidate PMID=${pmid} url PMID=${pathPmid || '<missing>'}`)
        }
      }
    } catch {
      issues.push(`canonicalUrl is not a valid URL: ${candidate.canonicalUrl}`)
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    resolved: {
      pmid: resolvedPmid,
      doi: resolvedDoi,
      title: resolvedTitle,
      year: resolvedYear,
      titleSimilarity,
    },
  }
}

export function extractCrossrefRecord(payload) {
  const message = payload?.message ?? payload
  const title = Array.isArray(message?.title) ? message.title[0] : message?.title
  const years = [
    message?.published?.['date-parts']?.[0]?.[0],
    message?.['published-print']?.['date-parts']?.[0]?.[0],
    message?.['published-online']?.['date-parts']?.[0]?.[0],
    message?.issued?.['date-parts']?.[0]?.[0],
  ].filter(Number.isInteger)
  return {
    doi: normalizeDoi(message?.DOI),
    title: String(title ?? '').replace(/\s+/g, ' ').trim(),
    year: years[0] ?? null,
  }
}

export function compareCandidateToCrossref(candidate, payload, { minTitleSimilarity = 0.72 } = {}) {
  const issues = []
  const resolved = extractCrossrefRecord(payload)
  const candidateDoi = normalizeDoi(candidate?.doi)
  const candidateTitle = String(candidate?.title ?? '').trim()
  const candidateYear = Number.isInteger(candidate?.publicationYear) ? candidate.publicationYear : null
  const titleSimilarity = titleTokenSimilarity(candidateTitle, resolved.title)

  if (!candidateDoi) issues.push('candidate DOI is missing')
  if (!resolved.doi) issues.push('Crossref response is missing DOI')
  if (candidateDoi && resolved.doi && candidateDoi !== resolved.doi) {
    issues.push(`DOI mismatch: candidate=${candidateDoi} resolved=${resolved.doi}`)
  }
  if (!resolved.title) issues.push('Crossref response is missing title')
  else if (titleSimilarity < minTitleSimilarity) {
    issues.push(
      `title mismatch: similarity=${titleSimilarity.toFixed(3)} candidate=${JSON.stringify(candidateTitle)} resolved=${JSON.stringify(resolved.title)}`,
    )
  }
  if (candidateYear && resolved.year && Math.abs(candidateYear - resolved.year) > 1) {
    issues.push(`publication year mismatch: candidate=${candidateYear} resolved=${resolved.year}`)
  }

  return {
    ok: issues.length === 0,
    issues,
    resolved: { ...resolved, titleSimilarity },
  }
}
