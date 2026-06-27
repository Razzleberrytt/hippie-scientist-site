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

function stackMetadataDescription(slug: string, stack?: Record<string, unknown>, namedStack?: NamedStackDefinition) {
  if (namedStack?.summary) return namedStack.summary
  const summary = String(stack?.summary || '').trim()
  if (summary && summary !== 'Evidence-based supplement stack.') return summary
  const goal = formatGoal(String(stackGoal(stack || { slug }) || slug))
  return `Evidence-based ${goal.toLowerCase()} supplement stack with role-based anchors, amplifiers, safety notes, and practical pairing logic.`
}

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
    description: stackMetadataDescription(slug, stack, namedStack),
    alternates: { canonical: `/stacks/${slug}` },
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

  const rawItems = Array.isArray(stack.items) ? (stack.items as StackItemRecord[]) : []
  const records = await getUnifiedRuntimeRecords()
  const herbSlugs = new Set(records.herbs.map(herb => herb.slug))
  const roles = groupByRole(rawItems)
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://thehippiescientist.net/' },
      { name: 'Stacks', url: 'https://thehippiescientist.net/stacks' },
      { name: displayTitle, url: `https://thehippiescientist.net/stacks/${slug}` },
    ]),
    itemListJsonLd(
      displayTitle,
      rawItems.map((item, index) => ({
        name: String(item.compound || item.name || `Stack item ${index + 1}`),
        url: `https://thehippiescientist.net/${herbSlugs.has(resolveStackItemSlug(item)) ? 'herbs' : 'compounds'}/${resolveStackItemSlug(item)}`,
      }))
    ),
  ]
  const affiliateLinks = getAffiliateShopLinks()

  return (
    <main className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Stacks', href: '/stacks' },
              { label: displayTitle, href: `/stacks/${slug}` },
            ]}
          />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Evidence-based stack</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{displayTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700">{displaySummary}</p>
          <AuthorCredentials className="mt-6" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/stacks" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500">
              Browse all stacks
            </Link>
            <Link href="/compare" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Compare stack items
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <RoleColumn title="Anchor" items={roles.anchor} herbSlugs={herbSlugs} />
          <RoleColumn title="Amplifier" items={roles.amplifier} herbSlugs={herbSlugs} />
          <RoleColumn title="Support" items={roles.support} herbSlugs={herbSlugs} />
        </div>
        {categoryStackLinks[slug]?.length ? (
          <section className="mt-10 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Named protocols</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Specific {formatGoal(slug)} stack templates</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryStackLinks[slug].map(link => (
                <Link key={link.slug} href={`/stacks/${link.slug}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-emerald-300 hover:bg-emerald-50">
                  <h3 className="font-semibold text-slate-950">{link.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{link.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">How this stack is organized</h2>
          <p className="mt-3 text-slate-700">Anchors are the main intervention, amplifiers are conditional add-ons, and support items cover gaps, tolerance, or timing. Always check interactions before combining supplements.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/safety-checker" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Check safety</Link>
            <Link href="/dosing" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500">Review dosing</Link>
          </div>
        </section>
        {affiliateLinks.length ? (
          <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Quality sourcing</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Shop cautiously</h2>
            <p className="mt-2 text-slate-700">Prefer third-party testing, transparent labels, and single-ingredient products when building stacks.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {affiliateLinks.slice(0, 4).map(link => (
                <a key={link.href} href={link.href} rel="nofollow sponsored" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-amber-100">
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  )
}

function RoleColumn({ title, items, herbSlugs }: { title: string; items: StackItemRecord[]; herbSlugs: Set<string> }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-4">
        {items.length ? items.map((item, index) => {
          const record = stackItemToRecord(item, herbSlugs)
          return (
            <div key={`${record.slug}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{record.displayName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{String(item.rationale || 'Mechanism-informed support item.')}</p>
                </div>
                <PathwayVisualChip record={record} />
              </div>
              <Link href={`/${record.entityType === 'herb' ? 'herbs' : 'compounds'}/${record.slug}`} className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                View profile →
              </Link>
            </div>
          )
        }) : <p className="text-sm text-slate-600">No items currently assigned to this role.</p>}
      </div>
    </section>
  )
}
