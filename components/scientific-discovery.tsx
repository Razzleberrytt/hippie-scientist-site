import Link from 'next/link'
import type { DiscoveryLink } from '@/lib/editorial-discovery'
import { cleanSummary, formatDisplayLabel, isClean, isSafeInternalHref } from '@/lib/display-utils'

type SemanticBrowseModuleProps = {
  eyebrow?: string
  title: string
  description?: string
  groups: Array<{ title: string; description: string; href: string; meta?: string }>
}

const kindStyles: Record<string, string> = {
  herb: 'identity-herb',
  compound: 'identity-compound',
  article: 'identity-article',
  path: 'identity-path',
}

export function ContentIdentityCard({ item }: { item: DiscoveryLink }) {
  const style = kindStyles[item.kind || 'path'] || kindStyles.path

  const title = formatDisplayLabel(item.title)
  const description = cleanSummary(item.description, item.kind === 'herb' ? 'herb' : 'compound')

  if (!isSafeInternalHref(item.href) || !title || !isClean(title)) return null

  return (
    <Link href={item.href} className={`scientific-card ${style} group`}>
      <div className="flex items-center justify-between gap-3">
        <span className="identity-kicker">{item.kind || 'path'}</span>
        {item.meta ? <span className="identity-meta">{item.meta}</span> : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink group-hover:text-brand-800">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#46574d]">{description}</p>
    </Link>
  )
}

export function SemanticBrowseModule({ eyebrow = 'Semantic discovery', title, description, groups }: SemanticBrowseModuleProps) {
  const visibleGroups = groups
    .map(group => ({
      ...group,
      title: formatDisplayLabel(group.title),
      description: cleanSummary(group.description, 'compound'),
      meta: formatDisplayLabel(group.meta),
    }))
    .filter(group => isSafeInternalHref(group.href) && isClean(group.title) && isClean(group.description))

  if (!visibleGroups.length) return null

  return (
    <section className="surface-depth card-spacing">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-label">{eyebrow}</p>
          <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
        </div>
        {description ? <p className="max-w-xl text-sm leading-7 text-[#46574d]">{description}</p> : null}
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleGroups.map(group => (
          <Link key={`${group.href}-${group.title}`} href={group.href} className="scientific-card group">
            <div className="flex items-center justify-between gap-3">
              <span className="identity-kicker">{group.meta || 'Explore'}</span>
              <span className="text-brand-800 transition group-hover:translate-x-0.5">→</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">{group.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#46574d]">{group.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function ResearchContinuityBlock({ title = 'Continue researching', description, items }: { title?: string; description?: string; items: DiscoveryLink[] }) {
  const visibleItems = items.filter(item => isSafeInternalHref(item.href) && isClean(item.title))

  if (!visibleItems.length) return null

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow-label">Research continuity</p>
        <h3 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-7 text-[#46574d]">{description}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map(item => <ContentIdentityCard key={item.href} item={item} />)}
      </div>
    </div>
  )
}

export function EvidenceMaturityRibbon({ label }: { label: string }) {
  const cleanLabel = formatDisplayLabel(label)

  if (!cleanLabel) return null

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-emerald-700/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900">
      <span className="h-2 w-2 rounded-full bg-emerald-600" />
      {cleanLabel}
    </div>
  )
}
