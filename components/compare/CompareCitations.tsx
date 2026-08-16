import Link from 'next/link'
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
    <div className="py-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-[color:var(--hs-ink)]">{item.name}</h3>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--hs-body)]">
          {sources.length} source{sources.length === 1 ? '' : 's'}
        </span>
      </div>
      <ol className="divide-y divide-[color:var(--hs-hairline)] border-y border-[color:var(--hs-hairline)]">
        {sources.map((source, i) => {
          const label = getSourceLabel(source, i)
          const url = getSourceUrl(source)
          return (
            <li key={`${label}-${i}`} className="grid gap-2 py-3 text-sm leading-6 text-[color:var(--hs-body)] sm:grid-cols-[2.5rem_minmax(0,1fr)]">
              <span className="font-display tabular-nums text-[color:var(--hs-gold)]">{String(i + 1).padStart(2, '0')}</span>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[color:var(--hs-hairline-strong)] underline-offset-3 hover:text-[color:var(--tone-ink)] hover:decoration-[color:var(--hs-gold)]"
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
  const item1Count = item1.sources?.length ?? 0
  const item2Count = item2.sources?.length ?? 0
  const totalSources = item1Count + item2Count
  const hasSources = totalSources > 0

  return (
    <section>
      <details className="group border-y border-[color:var(--hs-hairline-strong)] !bg-transparent !p-0 !shadow-none">
        <summary className="flex min-h-12 cursor-pointer list-none select-none items-center justify-between gap-4 py-3 text-sm font-semibold text-[color:var(--hs-ink)] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--tone-ink)]">References &amp; Sources</span>
            {hasSources ? (
              <span className="text-xs font-normal text-[color:var(--hs-body)]">{totalSources} surfaced</span>
            ) : null}
          </span>
          <svg
            className="h-4 w-4 shrink-0 text-[color:var(--hs-body)] transition-transform duration-200 group-open:rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="border-t border-[color:var(--hs-hairline)] pb-5">
          {hasSources ? (
            <div className="divide-y divide-[color:var(--hs-hairline-strong)]">
              <ItemSources item={item1} />
              <ItemSources item={item2} />
            </div>
          ) : (
            <div className="relative py-5 pl-4 before:absolute before:inset-y-5 before:left-0 before:w-0.5 before:bg-[color:var(--hs-gold)]">
              <p className="max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]">
                No source-level citations are surfaced in this comparison record. The comparison is assembled from the structured herb and compound profile data; open the full profiles below to inspect any source context available there.
              </p>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface-2)] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--tone-ink)]">
              Want the full evidence context?
            </p>
            <p className="mt-1 text-sm leading-6 text-[color:var(--hs-body)]">
              Open the full profiles for dosing notes, safety flags, mechanisms, and source-level context before deciding.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link
                href={item1.pageUrl}
                className="button-secondary rounded-full px-4 py-2 text-center text-xs font-bold"
              >
                Read {item1.name} profile →
              </Link>
              <Link
                href={item2.pageUrl}
                className="button-secondary rounded-full px-4 py-2 text-center text-xs font-bold"
              >
                Read {item2.name} profile →
              </Link>
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}
