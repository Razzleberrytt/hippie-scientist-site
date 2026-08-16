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
    <section className={`border-y border-[color:var(--hs-hairline-strong)] py-5 ${className}`.trim()}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="text-lg font-semibold tracking-tight text-[color:var(--hs-ink)]">{title}</h2>
      </div>

      <div className="mt-4 flex overflow-x-auto border-t border-[color:var(--hs-hairline)] pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4">
        {visibleGroups.map((group, groupIndex) => (
          <article
            key={group.title}
            className="w-[15rem] shrink-0 border-r border-[color:var(--hs-hairline)] px-4 py-4 first:pl-0 last:border-r-0 md:w-auto md:shrink md:border-b md:last:border-b-0 lg:border-b-0 lg:even:border-r lg:[&:nth-child(4n)]:border-r-0"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xs tabular-nums text-[color:var(--hs-gold)]" aria-hidden="true">
                {String(groupIndex + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold text-[color:var(--hs-ink)]">{group.title}</h3>
            </div>
            {group.description ? (
              <p className="mt-1 text-xs leading-5 text-[color:var(--hs-body)]">{group.description}</p>
            ) : null}

            <div className="mt-3 divide-y divide-[color:var(--hs-hairline)]">
              {group.links.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="group flex min-h-11 items-center justify-between gap-3 py-2 text-sm font-medium text-[color:var(--tone-ink)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
                >
                  <span className="group-hover:underline group-hover:underline-offset-4">{item.label}</span>
                  <span aria-hidden="true" className="text-[color:var(--hs-body)] transition group-hover:translate-x-1 group-hover:text-[color:var(--hs-gold)]">→</span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
