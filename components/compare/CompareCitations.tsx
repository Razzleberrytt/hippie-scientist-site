import type { CompareItem } from '@/lib/compare'

interface CompareCitationsProps {
  item1: CompareItem
  item2: CompareItem
}

type SourceRecord = Record<string, unknown>

function getSourceUrl(source: unknown): string | null {
  if (typeof source !== 'object' || source === null) return null
  const s = source as SourceRecord
  const url =
    (typeof s.url === 'string' && s.url) ||
    (typeof s.pubmed === 'string' && s.pubmed
      ? `https://pubmed.ncbi.nlm.nih.gov/${s.pubmed}/`
      : null) ||
    (typeof s.pmid === 'string' && s.pmid
      ? `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`
      : null)
  return url || null
}

function getSourceLabel(source: unknown, index: number): string {
  if (typeof source === 'string') return source
  if (typeof source !== 'object' || source === null) return `Source ${index + 1}`
  const s = source as SourceRecord
  return (
    (typeof s.title === 'string' && s.title) ||
    (typeof s.citation === 'string' && s.citation) ||
    (typeof s.label === 'string' && s.label) ||
    `Source ${index + 1}`
  )
}

interface ItemSourcesProps {
  item: CompareItem
}

function ItemSources({ item }: ItemSourcesProps) {
  const sources = item.sources ?? []

  if (sources.length === 0) return null

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{item.name}</h3>
      <ol className="space-y-2">
        {sources.map((source, i) => {
          const label = getSourceLabel(source, i)
          const url = getSourceUrl(source)
          return (
            <li key={i} className="text-sm leading-relaxed text-muted">
              {i + 1}.{' '}
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-brand-700"
                >
                  {label}
                </a>
              ) : (
                <span>{label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function CompareCitations({ item1, item2 }: CompareCitationsProps) {
  const hasSources =
    (item1.sources && item1.sources.length > 0) ||
    (item2.sources && item2.sources.length > 0)

  return (
    <section>
      <details className="group rounded-2xl border border-brand-900/10 bg-white/80">
        <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-ink marker:content-none">
          <span>References &amp; Sources</span>
          <svg
            className="h-4 w-4 shrink-0 text-brand-700 transition-transform duration-200 group-open:rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="space-y-6 px-5 pb-6 pt-2">
          {hasSources ? (
            <>
              <ItemSources item={item1} />
              <ItemSources item={item2} />
            </>
          ) : (
            <p className="text-sm text-muted">
              Sources forthcoming. Data derived from herb and compound profiles.
            </p>
          )}

          <p className="border-t border-brand-900/10 pt-4 text-xs text-muted">
            Last reviewed: 2026
          </p>
        </div>
      </details>
    </section>
  )
}
