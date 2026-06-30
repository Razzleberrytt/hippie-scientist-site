import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks } from '../../../src/lib/runtime-data'
import { itemListJsonLd, breadcrumbJsonLd } from '../../../src/lib/seo'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { mergeStackEcosystems } from '../../../src/lib/stack-ecosystems'
import StackCard from '@/components/StackCard'
import PathwayVisualChip from '../../../src/components/pathway-visual-chip'
import { getUnifiedRuntimeRecords } from '../../../src/lib/runtime-record-index'
import { getAffiliateShopLinks } from '../../../src/lib/affiliate'
import AuthorCredentials from '@/components/AuthorCredentials'

type Params = { params: Promise<{ slug: string }> }
type StackItemRecord = Record<string, unknown>
type RoleGroups = { anchor: StackItemRecord[]; amplifier: StackItemRecord[]; support: StackItemRecord[] }
type NamedStackDefinition = {
  parentSlug: string
  title: string
  summary: string
}

const namedStackDefinitions: Record<string, NamedStackDefinition> = {
  'sleep-recovery-stack': {
    parentSlug: 'sleep',
    title: 'Sleep Recovery Stack',
    summary: 'A named sleep protocol built around circadian timing, neuromuscular relaxation, and bedtime wind-down support.',
  },
  'stress-resilience-stack': {
    parentSlug: 'stress',
    title: 'Stress Resilience Stack',
    summary: 'A named stress protocol for comparing anchor adaptogens, acute calm support, and recovery-oriented timing.',
  },
  'calm-focus-stack': {
    parentSlug: 'cognition',
    title: 'Calm Focus Stack',
    summary: 'A named cognition protocol focused on alertness, cholinergic support, and stimulation-aware focus.',
  },
}

const categoryStackLinks: Record<string, Array<{ slug: string; title: string; description: string }>> = {
  sleep: [
    {
      slug: 'sleep-recovery-stack',
      title: 'Sleep Recovery Stack',
      description: namedStackDefinitions['sleep-recovery-stack'].summary,
    },
  ],
  stress: [
    {
      slug: 'stress-resilience-stack',
      title: 'Stress Resilience Stack',
      description: namedStackDefinitions['stress-resilience-stack'].summary,
    },
  ],
  cognition: [
    {
      slug: 'calm-focus-stack',
      title: 'Calm Focus Stack',
      description: namedStackDefinitions['calm-focus-stack'].summary,
    },
  ],
}

const formatGoal = (value?: string) =>
  String(value || 'wellness')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

const stackGoal = (stack: Record<string, unknown>) => stack?.goal_slug || stack?.goal || stack?.slug

const groupByRole = (items: StackItemRecord[]): RoleGroups => {
  const groups: RoleGroups = { anchor: [], amplifier: [], support: [] }
  items.forEach(item => {
    const role = String(item.role || '').toLowerCase()
    if (role.includes('anchor') || role.includes('core')) groups.anchor.push(item)
    else if (role.includes('amplifier')) groups.amplifier.push(item)
    else groups.support.push(item)
  })
  return groups
}

const SLUG_MAPPING: Record<string, string> = {
  'citicoline': 'cdp-choline',
  'collagen': 'collagen-peptides',
  'coq10': 'coenzyme-q10',
  'green-tea-extract-egcg': 'green-tea-extract',
  'rhodiola-rosea': 'rhodiola',
}

function resolveStackItemSlug(item: StackItemRecord) {
  const raw = String(item.compound_slug || item.compound || item.slug || '')
  return SLUG_MAPPING[raw] || raw
}

function stackItemToRecord(item: StackItemRecord, herbSlugs: Set<string> = new Set()) {
  const slug = resolveStackItemSlug(item)
  return {
    slug,
    name: String(item.compound || item.name || slug),
    displayName: String(item.compound || item.name || slug),
    entityType: herbSlugs.has(slug) ? 'herb' : 'compound',
    effects: [item.role, item.rationale].filter(Boolean),
    mechanisms: [item.rationale].filter(Boolean),
    pathways: [item.role].filter(Boolean),
    summary: String(item.rationale || ''),
  }
}

export async function generateStaticParams() {
  const stacks = mergeStackEcosystems(await getStacks())
  const slugs = new Set([
    ...stacks.map(s => s.slug),
    ...Object.keys(namedStackDefinitions),
  ])
  return [...slugs].map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const stacks = mergeStackEcosystems(await getStacks())
  const namedStack = namedStackDefinitions[slug]
  const stack = stacks.find(s => s.slug === (namedStack?.parentSlug || slug))

  return {
    title: namedStack?.title || (stack ? stack.title : 'Stack'),
    description: namedStack?.summary || stack?.summary || 'Evidence-based supplement stack.',
    alternates: { canonical: `/stacks/${slug}/` },
  }
}

export default async function StackPage({ params }: Params) {
  const { slug } = await params
  const stacks = mergeStackEcosystems(await getStacks())
  const namedStack = namedStackDefinitions[slug]
  const stack = stacks.find(s => s.slug === (namedStack?.parentSlug || slug))
  if (!stack) return notFound()

  const displayTitle = namedStack?.title || stack.title
  const displaySummary = namedStack?.summary || stack.summary || 'Stack designed from available human evidence and mechanism support.'
  const categoryLinks = categoryStackLinks[slug] || []
  const items: StackItemRecord[] = [...(stack.compounds || stack.stack || [])]
  const goal = formatGoal(String(stackGoal(stack) || ''))

  if (categoryLinks.length > 0) {
    const overviewListJsonLd = itemListJsonLd({
      name: displayTitle,
      path: `/stacks/${slug}`,
      items: categoryLinks.map(item => ({
        name: item.title,
        url: `/stacks/${item.slug}`,
      })),
    })

    const overviewBreadcrumbJsonLd = breadcrumbJsonLd([
      { name: 'Stacks', url: 'https://thehippiescientist.net/stacks/' },
      { name: displayTitle, url: `https://thehippiescientist.net/stacks/${slug}/` },
    ])

    return (
      <div className="space-y-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(overviewListJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(overviewBreadcrumbJsonLd) }}
        />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Stacks', href: '/stacks' },
            { label: displayTitle },
          ]}
        />
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Stack Overview</p>
          <h1 className="heading-premium text-ink">{displayTitle}</h1>
          <p className="detail-reading max-w-3xl text-base text-muted sm:text-lg">
            Use this category page to compare named protocols before opening the deeper stack detail.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {categoryLinks.map((item) => (
            <Link
              key={item.slug}
              href={`/stacks/${item.slug}`}
              className="card-premium p-6 transition hover:border-brand-700/20 hover:bg-white hover:shadow-sm"
            >
              <p className="eyebrow-label">Named stack</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
              <span className="mt-4 inline-flex text-sm font-bold text-brand-800">Open protocol -&gt;</span>
            </Link>
          ))}
        </section>

        <section className="compact-section section-rhythm-compact">
          <p className="eyebrow-label">{goal} ingredients</p>
          <h2 className="compact-heading">Category-level stack components</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {items.map((item, index) => (
              <article key={`${item.compound || item.name || index}`} className="rounded-2xl border border-brand-900/10 bg-white/70 p-4">
                <h3 className="text-sm font-semibold text-ink">{String(item.compound || item.name || 'Stack component')}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{String(item.rationale || item.role || 'Review the named protocol for context.')}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    )
  }

  const { herbRecords, allRecords } = await getUnifiedRuntimeRecords()
  const herbSlugs = new Set<string>(herbRecords.map((h: Record<string, unknown>) => String(h.slug || '')))

  const groups = groupByRole(items)
  const relatedRecords = items.map(item => stackItemToRecord(item, herbSlugs)).filter((record) => record.slug)

  const stackListJsonLd = itemListJsonLd({
    name: displayTitle,
    path: `/stacks/${slug}`,
    items: relatedRecords.map(item => ({
      name: item.name,
      url: item.entityType === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`,
    })),
  })

  const stackBreadcrumbJsonLd = breadcrumbJsonLd([
    { name: 'Stacks', url: 'https://thehippiescientist.net/stacks/' },
    ...(namedStack
      ? [{ name: formatGoal(namedStack.parentSlug), url: `https://thehippiescientist.net/stacks/${namedStack.parentSlug}/` }]
      : []),
    { name: displayTitle, url: `https://thehippiescientist.net/stacks/${slug}/` },
  ])

  // Helper to resolve affiliate fields for a stack item card
  const getCardAffiliateProps = (item: StackItemRecord, entityType: 'herb' | 'compound') => {
    const itemSlug = resolveStackItemSlug(item)
    const record = (allRecords as Record<string, unknown>[]).find(r => r.slug === itemSlug)
    if (!record) return {}
    const shopLinks = getAffiliateShopLinks(record, String(record.name || itemSlug), entityType)
    const primary = shopLinks.find(l => l.url)
    return primary ? { affiliateUrl: primary.url, affiliateLabel: primary.label } : {}
  }

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stackListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stackBreadcrumbJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Stacks', href: '/stacks' },
          ...(namedStack
            ? [{ label: formatGoal(namedStack.parentSlug), href: `/stacks/${namedStack.parentSlug}` }]
            : []),
          { label: displayTitle },
        ]}
      />
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <div className="space-y-5">
          <p className="eyebrow-label">Semantic Stack</p>
          <h1 className="heading-premium text-ink">{namedStack ? displayTitle : `Best Supplements for ${goal}`}</h1>
          <p className="detail-reading max-w-3xl text-base text-muted sm:text-lg">
            {displaySummary}
          </p>
          <div className="flex flex-wrap gap-2">
            {[stack.primary_effect, stack.time_to_effect, stack.evidence_level].filter(Boolean).map((signal: string) => (
              <PathwayVisualChip key={signal} pathway={signal} />
            ))}
          </div>
          <Link
            href="#stack"
            className="button-primary inline-flex rounded-full px-5 py-3 text-sm"
          >
            Open full stack ↓
          </Link>
          {namedStack ? (
            <Link
              href={`/stacks/${namedStack.parentSlug}`}
              className="inline-flex rounded-full border border-brand-900/10 bg-white/70 px-5 py-3 text-sm font-semibold text-brand-900 transition hover:border-brand-700/30 hover:bg-white"
            >
              Back to {formatGoal(namedStack.parentSlug)} overview -&gt;
            </Link>
          ) : null}
        </div>
      </section>

      <section id="stack" className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Anchor</h2>
          {groups.anchor.map((item, i) => {
            const itemSlug = resolveStackItemSlug(item)
            const entityType = herbSlugs.has(itemSlug) ? 'herb' : 'compound'
            const affProps = getCardAffiliateProps(item, entityType)
            return <StackCard key={i} item={item} entityType={entityType} {...affProps} />
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Amplifier</h2>
          {groups.amplifier.map((item, i) => {
            const itemSlug = resolveStackItemSlug(item)
            const entityType = herbSlugs.has(itemSlug) ? 'herb' : 'compound'
            const affProps = getCardAffiliateProps(item, entityType)
            return <StackCard key={i} item={item} entityType={entityType} {...affProps} />
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Support</h2>
          {groups.support.map((item, i) => {
            const itemSlug = resolveStackItemSlug(item)
            const entityType = herbSlugs.has(itemSlug) ? 'herb' : 'compound'
            const affProps = getCardAffiliateProps(item, entityType)
            return <StackCard key={i} item={item} entityType={entityType} {...affProps} />
          })}
        </div>
      </section>

      <section className="compact-section section-rhythm-compact">
        <div className="space-y-2">
          <p className="eyebrow-label">Stack Decision Context</p>
          <h2 className="compact-heading">Routine-level context matters.</h2>
          <p className="compact-copy">
            Stack exploration should account for overlap, timing, tolerance, evidence maturity, and user-specific safety context rather than simply combining popular ingredients.
          </p>
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>
            <tr className="border-b border-brand-900/10">
              <td className="py-2 text-muted">Primary effect</td>
              <td className="py-2 text-ink">{stack.primary_effect || 'Varies by user'}</td>
            </tr>
            <tr className="border-b border-brand-900/10">
              <td className="py-2 text-muted">Time to effect</td>
              <td className="py-2 text-ink">{stack.time_to_effect || 'Varies'}</td>
            </tr>
            <tr>
              <td className="py-2 text-muted">Evidence level</td>
              <td className="py-2 text-ink">{stack.evidence_level || 'Mixed'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <AuthorCredentials />
    </div>
  )
}
