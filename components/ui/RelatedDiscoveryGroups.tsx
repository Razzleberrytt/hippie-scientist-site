import Link from 'next/link'

type DiscoveryLink = {
  href: string
  label: string
}

type DiscoveryGroup = {
  title: string
  description?: string
  links: DiscoveryLink[]
}

type RelatedDiscoveryGroupsProps = {
  eyebrow?: string
  title?: string
  groups: DiscoveryGroup[]
  className?: string
}

export default function RelatedDiscoveryGroups({
  eyebrow = 'Continue exploring',
  title = 'Choose a useful next step',
  groups,
  className = '',
}: RelatedDiscoveryGroupsProps) {
  const visibleGroups = groups.filter((group) => group.links.length > 0)
  if (visibleGroups.length === 0) return null

  return (
    <section className={`rounded-2xl border border-brand-900/10 bg-white/90 p-4 ${className}`.trim()}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4">
        {visibleGroups.map((group) => (
          <article key={group.title} className="w-[15rem] shrink-0 rounded-xl border border-brand-900/10 bg-white/90 p-3 md:w-auto md:shrink">
            <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
            {group.description ? <p className="mt-1 text-xs leading-5 text-muted">{group.description}</p> : null}
            <div className="mt-2 space-y-1.5">
              {group.links.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-medium text-brand-800 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
