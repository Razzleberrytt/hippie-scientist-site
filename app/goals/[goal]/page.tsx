import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'

type StackItem = { compound: string; dosage?: string; timing?: string; role?: string }
type Stack = { slug: string; title: string; goal: string; short_description?: string; stack?: StackItem[]; avoid_if?: string }
type Compound = {
  slug?: string
  name?: string
  displayName?: string
  primary_effect?: string
  primary_effects?: string[] | string
  summary?: string
  description?: string
  mechanism_summary?: string
  safety_notes?: string
}

const supportedGoals = ['sleep', 'stress', 'fat-loss', 'cognition', 'performance']
const stacks = stacksData as Stack[]
const compounds = Array.isArray(compoundsData) ? (compoundsData as Compound[]) : []

const goalLabel = (goal: string) => goal.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
const goalKey = (goal: string) => goal.replace(/-/g, '_')
const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const asList = (value: unknown): string[] => Array.isArray(value) ? value.filter(Boolean).map(String) : text(value) ? [text(value)] : []
const unique = (items: string[]) => [...new Set(items.map(item => item.trim()).filter(Boolean))]

const compoundName = (compound: Compound) => compound.displayName || compound.name || goalLabel(compound.slug || 'compound')

const compoundsForGoal = (goal: string) => {
  const normalized = goal.toLowerCase().replace(/-/g, ' ')
  return compounds
    .filter(compound => {
      const effects = asList(compound.primary_effects).join(' ').toLowerCase()
      const effect = text(compound.primary_effect).toLowerCase()
      return effects.includes(normalized) || effect.includes(normalized)
    })
    .slice(0, 6)
}

const mechanismsForGoal = (goal: string) => unique(compoundsForGoal(goal).map(c => text(c.mechanism_summary))).slice(0, 5)
const safetyForGoal = (goal: string) => unique(compoundsForGoal(goal).map(c => text(c.safety_notes))).slice(0, 5)

export function generateStaticParams() {
  return supportedGoals.map(goal => ({ goal }))
}

export function generateMetadata({ params }: { params: { goal: string } }): Metadata {
  const label = goalLabel(params.goal)
  return {
    title: `Best Supplements for ${label} | The Hippie Scientist`,
    description: `Science-backed supplements for ${params.goal}. Learn dosage, effects, and safety.`,
  }
}

export default function GoalPage({ params }: { params: { goal: string } }) {
  if (!supportedGoals.includes(params.goal)) return notFound()

  const label = goalLabel(params.goal)
  const stack = stacks.find(item => item.slug === params.goal || item.goal === goalKey(params.goal))
  const topCompounds = compoundsForGoal(params.goal)
  const mechanisms = mechanismsForGoal(params.goal)
  const safety = safetyForGoal(params.goal)

  return (
    <div className='space-y-8'>
      <section className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8'>
        <h1 className='text-4xl font-black text-white sm:text-5xl'>Best Supplements for {label}</h1>
        <p className='mt-4 max-w-2xl text-white/80'>Science-backed compounds, dosage guidance, and safety insights.</p>
      </section>

      {stack ? (
        <section className='rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 sm:p-6'>
          <h2 className='text-2xl font-bold text-white'>Top Stack</h2>
          <p className='mt-2 text-white/80'>{stack.short_description}</p>
          <Link href={`/stacks/${stack.slug}`} className='mt-4 inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>
            View {label} Stack
          </Link>
        </section>
      ) : null}

      {topCompounds.length ? (
        <section className='space-y-4'>
          <h2 className='text-2xl font-bold text-white'>Top Compounds</h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {topCompounds.map(compound => compound.slug ? (
              <Link key={compound.slug} href={`/compounds/${compound.slug}`} className='block rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-emerald-300/30 hover:bg-white/[0.06]'>
                <h3 className='font-bold text-white'>{compoundName(compound)}</h3>
                {compound.primary_effect ? <p className='mt-2 text-sm text-emerald-100'>{compound.primary_effect}</p> : null}
                {(compound.summary || compound.description) ? <p className='mt-2 text-sm leading-6 text-white/75'>{compound.summary || compound.description}</p> : null}
              </Link>
            ) : null)}
          </div>
        </section>
      ) : null}

      {mechanisms.length ? (
        <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
          <h2 className='text-2xl font-bold text-white'>How It Works</h2>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-white/80'>
            {mechanisms.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ) : null}

      {safety.length ? (
        <section className='rounded-3xl border border-white/10 bg-red-500/10 p-5 sm:p-6'>
          <h2 className='text-2xl font-bold text-white'>Safety</h2>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-white/80'>
            {safety.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ) : null}

      {stack ? (
        <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-center sm:p-6'>
          <Link href={`/stacks/${stack.slug}`} className='inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>
            Explore the full {label} stack
          </Link>
        </section>
      ) : null}
    </div>
  )
}
