type CitationProps = {
  pmid?: string | number
  href?: string
  label?: string
}

export default function Citation({ pmid, href, label }: CitationProps) {
  const url = href || (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined)
  const displayLabel = label || (pmid ? `PMID ${pmid}` : 'Source')

  if (!url) return <span className="text-xs text-muted">[{displayLabel}]</span>

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-0.5 rounded border border-brand-900/10 bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-900 no-underline"
      aria-label={`View citation: ${displayLabel}`}
    >
      [{displayLabel}]
    </a>
  )
}
