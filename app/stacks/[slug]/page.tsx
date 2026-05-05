import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks } from '@/lib/runtime-data'
import StackCard from '@/components/StackCard'

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

export async function generateStaticParams() {
  const stacks = await getStacks()
  return stacks.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const stacks = await getStacks()
  const stack = stacks.find(s => s.slug === slug)
  const goal = formatGoal(stackGoal(stack))

  return {
    title: stack ? `${stack.title} | Best Supplements for ${goal}` : 'Stack',
    description: stack?.summary || 'Evidence-based supplement stack.',
  }
}

export default async function StackPage({ params }: Params) {
  const { slug } = await params
  const stacks = await getStacks()
  const stack = stacks.find(s => s.slug === slug)
  if (!stack) return notFound()

  const items: StackItemRecord[] = [...(stack.compounds || stack.stack || [])]
  const groups = groupByRole(items)
  const goal = formatGoal(stackGoal(stack))

  return (
    <div className="space-y-10">

      <section className="space-y-4">
        <p className="text-sm font-semibold text-teal-700">Best stack for {goal}</p>
        <h1 className="text-3xl font-bold text-neutral-950">{stack.title}</h1>
        <p className="text-neutral-600 max-w-2xl">{stack.summary}</p>

        <Link
          href="#stack"
          className="inline-block rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700"
        >
          Open full stack ↓
        </Link>
      </section>

      <section id="stack" className="grid gap-8 lg:grid-cols-3">

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-950">Anchor</h2>
          <p className="text-sm text-neutral-500">Core compounds that drive the main effect.</p>
          {groups.anchor.map((item, i) => (
            <StackCard key={i} item={item} />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-950">Amplifiers</h2>
          <p className="text-sm text-neutral-500">Enhance or extend the primary effect.</p>
          {groups.amplifier.map((item, i) => (
            <StackCard key={i} item={item} />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-950">Support</h2>
          <p className="text-sm text-neutral-500">Improve tolerability, safety, or balance.</p>
          {groups.support.map((item, i) => (
            <StackCard key={i} item={item} />
          ))}
        </div>

      </section>

    </div>
  )
}
