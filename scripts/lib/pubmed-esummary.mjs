/**
 * One definition of "what PubMed told us about a paper".
 *
 * Two callers need it — the bulk citation fetcher and the source attestation
 * pre-fill — and the shape has to be identical for both, because they read and
 * write the same cache file. Duplicating normalizeEntry would let the two
 * drift, and the drift would show up as bibliographic fields quietly changing
 * meaning depending on which script last wrote the record.
 *
 * Everything here is a transcription of an NCBI response. Nothing is inferred.
 */

const ESUMMARY_ENDPOINT = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
const IDCONV_ENDPOINT = 'https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/'
const USER_AGENT = 'thehippiescientist.net citation verification'

/** Year of publication, from the most specific date PubMed supplies. */
export function extractYear(entry) {
  const raw = String(entry.sortpubdate || entry.pubdate || entry.epubdate || '')
  const match = raw.match(/\b(1[89]\d{2}|20\d{2})\b/)
  return match ? Number(match[1]) : null
}

export function extractDoi(entry) {
  const ids = Array.isArray(entry.articleids) ? entry.articleids : []
  const doi = ids.find((id) => id.idtype === 'doi')
  return doi ? String(doi.value).trim() : ''
}

function authorNames(entry) {
  return Array.isArray(entry.authors)
    ? entry.authors.filter((author) => author.authtype === 'Author').map((author) => String(author.name).trim()).filter(Boolean)
    : []
}

/** "Cheah KL et al." — the form already used elsewhere in the dataset. */
export function formatAuthors(entry) {
  const authors = authorNames(entry)
  if (!authors.length) return ''
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`
  return `${authors[0]} et al.`
}

export function normalizeEntry(pmid, entry) {
  const authors = authorNames(entry)
  return {
    pmid,
    title: String(entry.title ?? '').replace(/\s+/g, ' ').replace(/\.$/, '').trim(),
    /** Display form: "Cheah KL et al." */
    authors: formatAuthors(entry),
    /**
     * Every author, in order. The display form collapses to "et al." after the
     * first name, which is right on a page and wrong in a BibTeX or RIS export
     * — a reference manager needs the full list to format any citation style.
     */
    authorList: authors,
    authorCount: authors.length,
    journal: String(entry.source ?? '').trim(),
    year: extractYear(entry),
    volume: String(entry.volume ?? '').trim(),
    pages: String(entry.pages ?? '').trim(),
    doi: extractDoi(entry),
    /** PubMed's own publication types — the authoritative study design. */
    publicationTypes: Array.isArray(entry.pubtype) ? entry.pubtype.map(String) : [],
    fetchedFrom: 'pubmed-esummary',
  }
}

/**
 * Fetch one batch of PMIDs. A PMID PubMed does not recognise is returned as a
 * failure rather than omitted, so a caller can never mistake "not fetched" for
 * "does not exist".
 */
export async function fetchEsummaryBatch(pmids) {
  const url = `${ESUMMARY_ENDPOINT}?db=pubmed&retmode=json&id=${pmids.join(',')}`
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`PubMed responded ${response.status}`)
  const payload = await response.json()
  const result = payload?.result
  if (!result) throw new Error('PubMed returned no result block')

  const out = {}
  const failures = []
  for (const pmid of pmids) {
    const entry = result[pmid]
    // PubMed reports an unknown id with an `error` key rather than omitting it.
    if (!entry || entry.error) {
      failures.push({ pmid, reason: entry?.error ? String(entry.error) : 'not-returned' })
      continue
    }
    out[pmid] = normalizeEntry(pmid, entry)
  }
  return { out, failures }
}

/**
 * Resolve PubMed Central ids to PMIDs via NCBI's own ID converter.
 *
 * A profile citing https://pmc.ncbi.nlm.nih.gov/articles/PMC7993717/ has given
 * a perfectly resolvable identifier; it is simply not the identifier anything
 * downstream looks for. Treating that as "cites nothing verifiable" understates
 * how much of the queue is actually actionable.
 */
export async function resolvePmcIds(pmcIds, { email } = {}) {
  if (!pmcIds.length) return { resolved: {}, failures: [] }
  const params = new URLSearchParams({
    ids: pmcIds.join(','),
    format: 'json',
    tool: 'hippie-scientist-source-attestation',
  })
  if (email) params.set('email', email)

  const response = await fetch(`${IDCONV_ENDPOINT}?${params}`, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`NCBI ID converter responded ${response.status}`)
  const payload = await response.json()

  const resolved = {}
  const failures = []
  for (const record of payload?.records || []) {
    const pmcid = String(record.pmcid || '').trim()
    if (!pmcid) continue
    if (record.status === 'error' || !record.pmid) {
      failures.push({ pmcid, reason: record.errmsg || record.status || 'no-pmid' })
      continue
    }
    resolved[pmcid] = { pmid: String(record.pmid), doi: record.doi ? String(record.doi) : null }
  }
  return { resolved, failures }
}

/** NCBI allows 3 requests/second without an API key; stay well inside that. */
export const REQUEST_SPACING_MS = 400
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
