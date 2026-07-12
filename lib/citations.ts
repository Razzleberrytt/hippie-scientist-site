import type { Citation } from '@/components/ui/ShowMeTheStudies'

function parsePmid(value: string): string | undefined {
  const match = value.match(/\b(\d{7,8})\b/)
  return match?.[1]
}

function parseDoi(value: string): string | undefined {
  const match = value.match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i)
  return match?.[1]?.replace(/[.,;)]$/, '')
}

function doiUrl(doi: string | undefined): string | undefined {
  return doi ? `https://doi.org/${doi}` : undefined
}

function sourceObjectToCitation(src: Record<string, unknown>): Citation {
  const title =
    (src.title as string) ||
    (src.citation as string) ||
    (src.ref as string) ||
    ''
  const rawUrl = String(src.url || src.href || '').trim()
  const citationText = String(src.citation || '').trim()
  const doi = src.doi
    ? parseDoi(String(src.doi)) || String(src.doi).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    : parseDoi(rawUrl) || parseDoi(citationText)
  const pmid =
    src.pmid
      ? String(src.pmid)
      : parsePmid(rawUrl) || parsePmid(citationText)
  const url = rawUrl || doiUrl(doi) || (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined)

  return {
    title,
    pmid,
    doi,
    url,
    year: src.year as number | string | undefined,
    authors: (src.authors || src.author_or_label) as string | undefined,
    studyType: (src.studyType || src.study_type || src.type) as string | undefined,
    sampleSize: (src.sampleSize || src.sample_size || src.n) as string | number | undefined,
  }
}

function stringToCitation(src: string): Citation {
  const pmid = parsePmid(src)
  const doi = parseDoi(src)
  const directUrl = /^https?:\/\//i.test(src.trim()) ? src.trim() : undefined
  const url = directUrl || doiUrl(doi) || (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined)
  return { title: src, pmid, doi, url }
}

function citationKey(citation: Citation): string {
  return citation.pmid
    ? `pmid:${citation.pmid}`
    : citation.doi
      ? `doi:${citation.doi.toLowerCase()}`
      : citation.url
        ? `url:${citation.url.toLowerCase()}`
        : `title:${citation.title.trim().toLowerCase()}`
}

export function extractCitationsFromRecord(record: Record<string, unknown>): Citation[] {
  const results: Citation[] = []
  const seen = new Set<string>()

  const pushCitation = (citation: Citation) => {
    if (!citation.title && !citation.pmid && !citation.doi && !citation.url) return
    const key = citationKey(citation)
    if (seen.has(key)) return
    seen.add(key)
    results.push(citation)
  }

  const sources = record?.sources
  if (Array.isArray(sources)) {
    for (const src of sources) {
      if (!src) continue
      if (typeof src === 'string') {
        pushCitation(stringToCitation(src))
      } else if (typeof src === 'object') {
        pushCitation(sourceObjectToCitation(src as Record<string, unknown>))
      }
    }
  }

  const pmids = record?.pmids
  if (Array.isArray(pmids)) {
    for (const pmid of pmids) {
      if (!pmid) continue
      const id = String(pmid)
      pushCitation({
        title: `PubMed ${id}`,
        pmid: id,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      })
    }
  }

  const references = record?.references
  if (Array.isArray(references)) {
    for (const ref of references) {
      if (!ref) continue
      if (typeof ref === 'string') {
        pushCitation(stringToCitation(ref))
      } else if (typeof ref === 'object') {
        pushCitation(sourceObjectToCitation(ref as Record<string, unknown>))
      }
    }
  }

  return results
}
