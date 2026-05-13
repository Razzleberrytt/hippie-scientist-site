import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks } from '@/lib/runtime-data'
import { mergeStackEcosystems } from '@/lib/stack-ecosystems'
import { buildSemanticAssistantSummary, buildSemanticNavigationSuggestions } from '@/lib/ai-semantic-navigation'
import { buildSemanticGraphVisual } from '@/lib/semantic-graph-visuals'
import StackCard from '@/components/StackCard'
import SemanticAssistantPanel from '@/components/semantic-assistant-panel'
import SemanticArtworkPanel from '@/components/semantic-artwork-panel'
import SemanticGraphMap from '@/components/semantic-graph-map'
import SemanticVisibilityGate from '@/components/semantic-visibility-gate'
import PathwayVisualChip from '@/components/pathway-visual-chip'

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

function stackItemToRecord(item: StackItemRecord) {
  const slug = item.compound_slug || item.compound || item.slug
  return {
    slug,
    name: item.compound || item.name || slug,
    displayName: item.compound || item.name || slug,
    entityType: 'compound',
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
  const goal = formatGoal(stackGoal(stack))

  return {
    title: stack ? `${stack.title} | Best Supplements for ${goal}` : 'Stack',
    description: stack?.summary || 'Evidence-based supplement stack.',
  }
}

export default async function StackPage({ params }: Params) {
  const { slug } = await params
  const stacks = mergeStackEcosystems(await getStacks())
  const stack = stacks.find(s => s.slug === slug)
  if (!stack) return notFound()

  const items: StackItemRecord[] = [...(stack.compounds || stack.stack || [])]
  const groups = groupByRole(items)
  const goal = formatGoal(stackGoal(stack))
  const relatedRecords = items.map(stackItemToRecord).filter((record) => record.slug)
  const stackRecord = {
    slug: stack.slug,
    name: stack.title,
    displayName: stack.title,
    entityType: 'stack',
    summary: stack.summary,
    effects: [stack.primary_effect, stack.goal, stack.goal_slug].filter(Boolean),
    mechanisms: items.map((item) => item.rationale).filter(Boolean),
    pathways: [stack.goal_slug, stack.primary_effect, stack.evidence_level].filter(Boolean),
  }
  const assistant = buildSemanticAssistantSummary(stackRecord, relatedRecords)
  const assistantSuggestions = buildSemanticNavigationSuggestions(stackRecord, relatedRecords, 5)
  const graph = buildSemanticGraphVisual(stackRecord, relatedRecords, 14)

  return (
    <div className="space-y-12">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-stretch">
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

          <SemanticArtworkPanel
            slug={stack.goal_slug || stack.slug}
            kind="pathway"
            title={stack.title || `Best Supplements for ${goal}`}
            subtitle="Stack ecosystem artwork for routine-level semantic exploration."
            height={300}
          />
        </div>
      </section>

      <SemanticAssistantPanel
        headline={assistant.headline}
        body={assistant.body}
        signals={assistant.signals}
        suggestions={assistantSuggestions}
      />

      <SemanticVisibilityGate minHeight={420}>
        <SemanticGraphMap
          title="Stack relationship map"
          description="A lightweight map of stack components, roles, and routine-level semantic continuity."
          nodes={graph.nodes}
          edges={graph.edges}
        />
      </SemanticVisibilityGate>

      <section id="stack" className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Anchor</h2>
          {groups.anchor.map((item, i) => (
            <StackCard key={i} item={item} />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Amplifier</h2>
          {groups.amplifier.map((item, i) => (
            <StackCard key={i} item={item} />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Support</h2>
          {groups.support.map((item, i) => (
            <StackCard key={i} item={item} />
          ))}
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
