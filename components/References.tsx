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

function sourceLabel(url: string): string {
  if (url.includes('pubmed.ncbi.nlm.nih.gov')) return 'PubMed →'
  if (url.includes('doi.org')) return 'DOI →'
  return 'Source →'
}

export default function References({ refs }: { refs: Ref[] }) {
  return (
    <section
      id="references"
      aria-label="References"
      data-reference-ledger="true"
      className="max-w-4xl border-y border-[color:var(--hs-hairline)] py-7 sm:py-9"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">Source ledger</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]">
            References
          </h2>
        </div>
        <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--hs-body)]">
          {refs.length} {refs.length === 1 ? 'source' : 'sources'}
        </p>
      </div>

      <ol className="mt-5 divide-y divide-[color:var(--hs-hairline)]">
        {refs.map((ref) => {
          const citationId = `ref-${ref.n}`
          return (
            <li
              key={ref.n}
              id={`ref-${ref.n}`}
              data-citation-source="true"
              data-citation-id={citationId}
              data-citation-authors={ref.authors || undefined}
              data-citation-journal={ref.journal || undefined}
              data-pmid={ref.pmid || undefined}
              data-doi={ref.doi || undefined}
              itemScope
              itemType="https://schema.org/CreativeWork"
              className="scroll-mt-24 grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2.4rem_minmax(0,1fr)] sm:gap-4"
            >
              <a
                href={`#${citationId}`}
                aria-label={`Permanent link to reference ${ref.n}`}
                className="font-mono text-[0.66rem] font-bold tracking-[0.12em] text-[color:var(--hs-gold-ink)] underline-offset-4 hover:underline sm:pt-0.5"
              >
                {String(ref.n).padStart(2, '0')}
              </a>
              <div className="text-xs leading-5 text-[color:var(--hs-body)]">
                <cite itemProp="name" className="not-italic font-semibold text-[color:var(--hs-ink)]">
                  {ref.title || ref.text}
                </cite>
                {ref.title ? <span> {ref.text}</span> : null}
                {ref.year ? <meta itemProp="datePublished" content={String(ref.year)} /> : null}
                {ref.pmid ? <meta itemProp="identifier" content={`PMID:${ref.pmid}`} /> : null}
                {ref.doi ? <meta itemProp="identifier" content={`DOI:${ref.doi}`} /> : null}
                {ref.url ? (
                  <>
                    {' '}
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      itemProp="url"
                      className="font-semibold text-[color:var(--tone-ink)] underline decoration-[color:var(--hs-hairline-strong)] underline-offset-4 transition hover:text-[color:var(--hs-ink)]"
                    >
                      {sourceLabel(ref.url)}
                    </a>
                  </>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
