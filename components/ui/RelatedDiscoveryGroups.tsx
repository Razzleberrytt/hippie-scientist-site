import Link from 'next/link'

type DiscoveryLink = {
  href: string
  label: string
  score?: number
  type?: string
  clusters?: string[]
  sharedClusters?: string[]
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

function humanizeCluster(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getDiscoveryLinkContext(link: DiscoveryLink): string | null {
  const shared = [...new Set((link.sharedClusters || []).filter(Boolean))].slice(0, 2)
  if (shared.length > 0) {
    return `Shared topic: ${shared.map(humanizeCluster).join(' + ')}`
  }
  if (/\/compare\//.test(link.href)) return 'Side-by-side comparison'
  if (link.type === 'safety' || /safety|interaction|contraindication|disclaimer/.test(link.href)) return 'Safety context'
  return null
}

function getGroupDescription(group: DiscoveryGroup): string | null {
  if (group.description) return group.description
  const title = group.title.toLowerCase()
  if (title.includes('herb')) return 'Botanicals connected by the same goals, effects, or research topics.'
  if (title.includes('compound')) return 'Compounds connected by the same goals, effects, or research topics.'
  if (title.includes('safety')) return 'Safety checks and cautions relevant to this decision.'
  if (title.includes('guide') || title.includes('article')) return 'Deeper context, comparisons, and practical research paths.'
  return null
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
        {visibleGroups.map((group, groupIndex) => {
          const description = getGroupDescription(group)
          return (
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
              {description ? (
                <p className="mt-1 text-xs leading-5 text-[color:var(--hs-body)]">{description}</p>
              ) : null}

              <div className="mt-3 divide-y divide-[color:var(--hs-hairline)]">
                {group.links.slice(0, 4).map((item) => {
                  const context = getDiscoveryLinkContext(item)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className="group flex min-h-11 items-center justify-between gap-3 py-2 text-sm font-medium text-[color:var(--tone-ink)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
                    >
                      <span className="min-w-0">
                        <span className="block group-hover:underline group-hover:underline-offset-4">{item.label}</span>
                        {context ? (
                          <span className="mt-0.5 block text-[11px] font-normal leading-4 text-[color:var(--hs-body)]">{context}</span>
                        ) : null}
                      </span>
                      <span aria-hidden="true" className="shrink-0 text-[color:var(--hs-body)] transition group-hover:translate-x-1 group-hover:text-[color:var(--hs-gold)]">→</span>
                    </Link>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
