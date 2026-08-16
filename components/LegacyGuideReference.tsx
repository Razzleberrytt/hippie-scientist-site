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

const referenceActionClass =
  'inline-flex min-h-11 items-center rounded-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 dark:focus-visible:ring-brand-200/50'

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
        className={`${referenceActionClass} mr-1 text-ink hover:text-brand-900 dark:hover:text-brand-100`}
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
            className={`${referenceActionClass} ml-1 text-brand-700 hover:text-brand-900 dark:text-brand-200 dark:hover:text-brand-100`}
          >
            {sourceLabel(url)}
          </a>
        </>
      ) : null}
    </li>
  )
}
