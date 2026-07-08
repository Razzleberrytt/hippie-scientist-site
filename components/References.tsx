export type Ref = {
  n: number
  text: string
  url?: string
  title?: string
  authors?: string
  journal?: string
  year?: string | number
  pmid?: string
  doi?: string
}

export default function References({ refs }: { refs: Ref[] }) {
  return (
    <section id="references" aria-label="References" className="card-premium p-6 space-y-3 max-w-4xl">
      <h2 className="text-xl font-semibold text-ink">References</h2>
      <ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        {refs.map((ref) => (
          <li key={ref.n} id={`ref-${ref.n}`} itemScope itemType="https://schema.org/CreativeWork">
            <span className="font-semibold text-ink">[{ref.n}]</span>{' '}
            <span itemProp="name">{ref.title || ref.text}</span>
            {ref.title ? <span> {ref.text}</span> : null}
            {ref.authors ? <meta itemProp="author" content={ref.authors} /> : null}
            {ref.journal ? <meta itemProp="isPartOf" content={ref.journal} /> : null}
            {ref.year ? <meta itemProp="datePublished" content={String(ref.year)} /> : null}
            {ref.pmid ? <meta itemProp="identifier" content={`PMID:${ref.pmid}`} /> : null}
            {ref.doi ? <meta itemProp="identifier" content={`DOI:${ref.doi}`} /> : null}
            {ref.url ? (
              <>
                {' '}
                <a href={ref.url} target="_blank" rel="noopener noreferrer" itemProp="url" className="text-brand-700 underline hover:text-brand-800">
                  PubMed →
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
