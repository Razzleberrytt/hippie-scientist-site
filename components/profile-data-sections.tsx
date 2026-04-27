import Link from 'next/link'

type SourceRecord = {
  title?: string | null
  note?: string | null
  citation?: string | null
  url?: string | null
  doi?: string | null
  pmid?: string | null
}

type KeyValueItem = {
  label: string
  value: string
}

type SectionListProps = {
  title: string
  items: string[]
}

type KeyValueSectionProps = {
  title: string
  items: KeyValueItem[]
}

type SourcesSectionProps = {
  sources: SourceRecord[]
}

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/\n|;/)
      .map(item => item.trim())
      .filter(Boolean)
  }

  return []
}

const toText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

export function normalizeProfileList(value: unknown): string[] {
  return toList(value)
}

export function normalizeProfileText(value: unknown): string {
  return toText(value)
}

export function normalizeSources(value: unknown): SourceRecord[] {
  if (!Array.isArray(value)) return []

  return value.filter(
    (item): item is SourceRecord =>
      typeof item === 'object' && item !== null && !Array.isArray(item),
  )
}

export function SectionList({ title, items }: SectionListProps) {
  if (items.length === 0) return null

  return (
    <section className='ds-card'>
      <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
        {title}
      </p>

      <ul className='mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-white/75 sm:text-base'>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function KeyValueSection({ title, items }: KeyValueSectionProps) {
  const visibleItems = items.filter(item => item.value.trim())

  if (visibleItems.length === 0) return null

  return (
    <section className='ds-card'>
      <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
        {title}
      </p>

      <dl className='mt-4 space-y-4 text-sm'>
        {visibleItems.map(item => (
          <div
            key={item.label}
            className='flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0'
          >
            <dt className='text-white/55'>{item.label}</dt>
            <dd className='max-w-[65%] text-right font-medium text-white'>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function SourcesSection({ sources }: SourcesSectionProps) {
  if (sources.length === 0) return null

  return (
    <section className='ds-card'>
      <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
        Sources
      </p>

      <div className='mt-4 space-y-4'>
        {sources.map((source, index) => {
          const title = source.title?.trim() || source.citation?.trim() || `Source ${index + 1}`
          const note = source.note?.trim() || ''
          const citation = source.citation?.trim() || ''
          const doi = source.doi?.trim() || ''
          const pmid = source.pmid?.trim() || ''
          const url = source.url?.trim() || ''

          return (
            <div
              key={`${title}-${index}`}
              className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'
            >
              <p className='text-sm font-semibold text-white'>{title}</p>

              {citation ? (
                <p className='mt-2 text-sm leading-6 text-white/70'>{citation}</p>
              ) : null}

              {note ? (
                <p className='mt-2 text-sm leading-6 text-white/65'>{note}</p>
              ) : null}

              {(doi || pmid || url) ? (
                <div className='mt-3 flex flex-wrap gap-3 text-xs text-white/55'>
                  {doi ? <span>DOI: {doi}</span> : null}
                  {pmid ? <span>PMID: {pmid}</span> : null}
                  {url ? (
                    <Link
                      href={url}
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-300 transition hover:text-blue-200'
                    >
                      Open source ↗
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
