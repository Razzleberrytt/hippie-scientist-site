type LegacyGuideReferenceProps = {
  n: number
  text: string
  url?: string
}

function sourceLabel(url: string): string {
  if (url.includes('pubmed.ncbi.nlm.nih.gov')) return 'PubMed →'
  if (url.includes('doi.org')) return 'DOI →'
  return 'Source →'
}

function sourceIdentifier(url?: string): string | undefined {
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    const pathname = decodeURIComponent(parsed.pathname)

    if (hostname === 'pubmed.ncbi.nlm.nih.gov') {
      const match = pathname.match(/^\/(\d+)\/?$/)
      return match ? `PMID:${match[1]}` : undefined
    }

    if (hostname === 'doi.org' || hostname === 'www.doi.org') {
      const doi = pathname.replace(/^\//, '').trim()
      return /^10\.\d{4,9}\/\S+$/i.test(doi) ? `DOI:${doi}` : undefined
    }
  } catch {
    return undefined
  }

  return undefined
}

/**
 * Compatibility reference item for older hand-authored guides that only model
 * an ordinal, citation text, and optional source URL. Keep this conservative:
 * identifiers may be derived from authoritative PubMed/DOI URLs only; do not
 * parse citation prose to infer authors, journal metadata, dates, or study type.
 */
export default function LegacyGuideReference({ n, text, url }: LegacyGuideReferenceProps) {
  const citationId = `ref-${n}`
  const identifier = sourceIdentifier(url)

  return (
    <li
      id={citationId}
      data-citation-source="true"
      data-citation-id={citationId}
      data-source-identifier={identifier}
      itemScope
      itemType="https://schema.org/CreativeWork"
      className="scroll-mt-24 text-xs leading-5 text-muted"
    >
      {identifier ? <meta itemProp="identifier" content={identifier} /> : null}
      <a
        href={`#${citationId}`}
        aria-label={`Permanent link to reference ${n}`}
        className="font-semibold text-ink underline-offset-4 hover:underline"
      >
        [{n}]
      </a>{' '}
      <cite itemProp="name" className="not-italic">{text}</cite>
      {url ? (
        <>
          {' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            itemProp="url"
            className="text-brand-700 underline hover:text-brand-800"
          >
            {sourceLabel(url)}
          </a>
        </>
      ) : null}
    </li>
  )
}
