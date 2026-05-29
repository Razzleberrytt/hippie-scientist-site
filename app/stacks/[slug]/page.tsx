import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks } from '@/lib/runtime-data'
import { itemListJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import { mergeStackEcosystems } from '@/lib/stack-ecosystems'
import StackCard from '@/components/StackCard'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { getAffiliateShopLinks } from '@/lib/affiliate'

type Params = { params: Promise<{ slug: string }> }
type StackItemRecord = Record<string, any>
type RoleGroups = { anchor: StackItemRecord[]; amplifier: StackItemRecord[]; support: StackItemRecord[] }

const formatGoal = (value?: string) =>
  String(value || 'wellness')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

const stackGoal = (stack: any) => stack?.goal_slug || stack?.goal || stack?.slug

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
}

function resolveStackItemSlug(item: StackItemRecord) {
  const raw = item.compound_slug || item.compound || item.slug || ''
  return SLUG_MAPPING[raw] || raw
}

function stackItemToRecord(item: StackItemRecord, herbSlugs: Set<string> = new Set()) {
  const slug = resolveStackItemSlug(item)
  return {
    slug,
    name: item.compound || item.name || slug,
    displayName: item.compound || item.name || slug,
    entityType: herbSlugs.has(slug) ? 'herb' : 'compound',
    effects: [item.role, item.rationale].filter(Boolean),
    mechanisms: [item.rationale].filter(Boolean),
    pathways: [item.role].filter(Boolean),
    summary: item.rationale,
  }
}

export async function generateStaticParams() {
  const stacks = mergeStackEcosystems(await getStacks())
  return stacks.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const stacks = mergeStackEcosystems(await getStacks())
  const stack = stacks.find(s => s.slug === slug)

  return {
    title: stack ? stack.title : 'Stack',
    description: stack?.summary || 'Evidence-based supplement stack.',
  }
}

export default async function StackPage({ params }: Params) {
  const { slug } = await params
  const stacks = mergeStackEcosystems(await getStacks())
  const stack = stacks.find(s => s.slug === slug)
  if (!stack) return notFound()

  const { herbRecords, allRecords } = await getUnifiedRuntimeRecords()
  const herbSlugs = new Set(herbRecords.map((h: any) => h.slug))

  const items: StackItemRecord[] = [...(stack.compounds || stack.stack || [])]
  const groups = groupByRole(items)
  const goal = formatGoal(stackGoal(stack))
  const relatedRecords = items.map(item => stackItemToRecord(item, herbSlugs)).filter((record) => record.slug)

  const stackListJsonLd = itemListJsonLd({
    name: stack.title,
    path: `/stacks/${stack.slug}`,
    items: relatedRecords.map(item => ({
      name: item.name,
      url: item.entityType === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`,
    })),
  })

  const stackBreadcrumbJsonLd = breadcrumbJsonLd([
    { name: 'Stacks', url: 'https://www.thehippiescientist.net/stacks' },
    { name: stack.title, url: `https://www.thehippiescientist.net/stacks/${stack.slug}` },
  ])

  // Helper to resolve affiliate fields for a stack item card
  const getCardAffiliateProps = (item: StackItemRecord, entityType: 'herb' | 'compound') => {
    const itemSlug = resolveStackItemSlug(item)
    const record = (allRecords as any[]).find(r => r.slug === itemSlug)
    if (!record) return {}
    const shopLinks = getAffiliateShopLinks(record, (record as any).name || itemSlug, entityType)
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
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <div className="space-y-5">
          <p className="eyebrow-label">Semantic Stack</p>
          <h1 className="heading-premium text-ink">Best Supplements for {goal}</h1>
          <p className="detail-reading max-w-3xl text-base text-[#46574d] sm:text-lg">
            {stack.summary || 'Stack designed from available human evidence and mechanism support.'}
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
    </div>
  )
}
