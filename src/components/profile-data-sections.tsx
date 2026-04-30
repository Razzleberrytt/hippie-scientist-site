type KeyValueItem = {
  label: string
  value?: unknown
}

type SourceItem = {
  label?: string
  title?: string
  name?: string
  url?: string
  href?: string
  source?: string
  citation?: string
  pmid?: string | number
}

export function normalizeProfileText(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (Array.isArray(value)) {
    return value
      .map(item => normalizeProfileText(item))
      .filter(Boolean)
      .join(', ')
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const preferred = record.value ?? record.text ?? record.label ?? record.name ?? record.title
    if (preferred !== undefined) return normalizeProfileText(preferred)
    return ''
  }

  return String(value).replace(/\s+/g, ' ').trim()
}

export function normalizeProfileList(value: unknown): string[] {
  if (value === null || value === undefined) return []

  if (Array.isArray(value)) {
    return value.map(item => normalizeProfileText(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/\n|;|\|/)
      .map(item => item.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
  }

  const normalized = normalizeProfileText(value)
  return normalized ? [normalized] : []
}

export function normalizeSources(value: unknown): SourceItem[] {
  if (value === null || value === undefined) return []

  const values = Array.isArray(value) ? value : [value]

  return values
    .map(item => {
      if (typeof item === 'string' || typeof item === 'number') {
        const label = normalizeProfileText(item)
        return label ? { label } : null
      }

      if (typeof item === 'object' && item) {
        const record = item as SourceItem
        const label = normalizeProfileText(
          record.label ?? record.title ?? record.name ?? record.source ?? record.citation ?? record.pmid,
        )
        const url = normalizeProfileText(record.url ?? record.href)
        if (!label && !url) return null
        return { ...record, label, url }
      }

      return null
    })
    .filter((item): item is SourceItem => Boolean(item))
}

export function KeyValueSection({ title, items }: { title: string; items: KeyValueItem[] }) {
  const visibleItems = items
    .map(item => ({ label: item.label, value: normalizeProfileText(item.value) }))
    .filter(item => item.value)

  if (visibleItems.length === 0) return null

  return (
    <section className='ds-card'>
      <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>{title}</p>
      <dl className='mt-4 space-y-3 text-sm text-white/75'>
        {visibleItems.map(item => (
          <div key={item.label}>
            <dt className='text-xs uppercase tracking-[0.2em] text-white/45'>{item.label}</dt>
            <dd className='mt-1 whitespace-pre-line'>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function SectionList({ title, items }: { title: string; items: unknown[] }) {
  const visibleItems = normalizeProfileList(items)
  if (visibleItems.length === 0) return null

  return (
    <section className='ds-card'>
      <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>{title}</p>
      <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-white/75 sm:text-base'>
        {visibleItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function SourcesSection({ sources }: { sources: SourceItem[] }) {
  const visibleSources = normalizeSources(sources)
  if (visibleSources.length === 0) return null

  return (
    <section className='ds-card'>
      <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>Sources</p>
      <ul className='mt-4 space-y-2 text-sm leading-6 text-white/75'>
        {visibleSources.map((source, index) => {
          const label = source.label || source.title || source.name || source.url || `Source ${index + 1}`
          const href = source.url || source.href

          return (
            <li key={`${label}-${index}`}>
              {href ? (
                <a className='underline decoration-white/30 underline-offset-4 hover:text-white' href={href} target='_blank' rel='noopener noreferrer'>
                  {label}
                </a>
              ) : (
                <span>{label}</span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
