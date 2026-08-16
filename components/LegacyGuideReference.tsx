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

/**
 * Compatibility reference item for older hand-authored guides that only model
 * an ordinal, citation text, and optional source URL. Keep this conservative:
 * do not infer PMID/DOI/authors/journal metadata that the source model does not
 * explicitly provide.
 */
export default function LegacyGuideReference({ n, text, url }: LegacyGuideReferenceProps) {
  const citationId = `ref-${n}`

  return (
    <li
      id={citationId}
      data-citation-source="true"
      data-citation-id={citationId}
      itemScope
      itemType="https://schema.org/CreativeWork"
      className="scroll-mt-24 text-xs leading-5 text-muted"
    >
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
