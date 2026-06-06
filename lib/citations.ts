import type { Citation } from '@/components/ui/ShowMeTheStudies'

function parsePmid(value: string): string | undefined {
  const match = value.match(/\b(\d{7,8})\b/)
  return match?.[1]
}

function sourceObjectToCitation(src: Record<string, unknown>): Citation {
  const title =
    (src.title as string) ||
    (src.citation as string) ||
    (src.ref as string) ||
    ''

  const pmid =
    src.pmid
      ? String(src.pmid)
      : typeof src.href === 'string'
        ? parsePmid(src.href)
        : typeof src.citation === 'string'
          ? parsePmid(src.citation)
          : undefined

  return {
    title,
    pmid,
    year: src.year as number | string | undefined,
    authors: src.authors as string | undefined,
    studyType: (src.studyType || src.study_type || src.type) as string | undefined,
    sampleSize: (src.sampleSize || src.sample_size || src.n) as string | number | undefined,
  }
}

function stringToCitation(src: string): Citation {
  const pmid = parsePmid(src)
  return { title: src, pmid }
}

export function extractCitationsFromRecord(record: Record<string, unknown>): Citation[] {
  const results: Citation[] = []

  const sources = record?.sources
  if (Array.isArray(sources)) {
    for (const src of sources) {
      if (!src) continue
      if (typeof src === 'string') {
        results.push(stringToCitation(src))
      } else if (typeof src === 'object') {
        results.push(sourceObjectToCitation(src as Record<string, unknown>))
      }
    }
  }

  const pmids = record?.pmids
  if (Array.isArray(pmids)) {
    for (const pmid of pmids) {
      if (!pmid) continue
      const id = String(pmid)
      if (!results.some(c => c.pmid === id)) {
        results.push({ title: `PubMed ${id}`, pmid: id })
      }
    }
  }

  const references = record?.references
  if (Array.isArray(references)) {
    for (const ref of references) {
      if (!ref) continue
      if (typeof ref === 'string') {
        const pmid = parsePmid(ref)
        if (!results.some(c => c.pmid === pmid)) {
          results.push(stringToCitation(ref))
        }
      } else if (typeof ref === 'object') {
        const c = sourceObjectToCitation(ref as Record<string, unknown>)
        if (!results.some(r => r.pmid && r.pmid === c.pmid)) {
          results.push(c)
        }
      }
    }
  }

  return results.filter(c => c.title || c.pmid)
}
