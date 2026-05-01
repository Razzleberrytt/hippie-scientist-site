import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import compoundsData from '@/public/data/compounds.json'

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

const comparisons = [
  'creatine-vs-beta-alanine',
  'magnesium-vs-glycine',
  'caffeine-vs-l-theanine',
  'ashwagandha-vs-rhodiola',
  'citicoline-vs-alpha-gpc',
]

const compounds = Array.isArray(compoundsData) ? (compoundsData as Compound[]) : []

const formatSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const compoundName = (compound: Compound | undefined, fallback: string) =>
  compound?.displayName || compound?.name || formatSlug(fallback)

const getCompound = (slug: string) =>
  compounds.find(compound => compound?.slug === slug)

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

const pairFromSlug = (slug: string) => {
  const [a, b] = slug.split('-vs-')
  return { a, b }
}

export function generateStaticParams() {
  return comparisons.map(slug => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const { a, b } = pairFromSlug(params.slug)
  const titleA = formatSlug(a || 'compound')
  const titleB = formatSlug(b || 'compound')

  return {
    title: `${titleA} vs ${titleB} — Which is better?`,
    description: `Compare ${titleA} vs ${titleB}: effects, mechanisms, and safety.`,
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!comparisons.includes(params.slug)) return notFound()

  const { a: aSlug, b: bSlug } = pairFromSlug(params.slug)
  const a = getCompound(aSlug)
  const b = getCompound(bSlug)

  if (!a || !b) return notFound()

  const titleA = compoundName(a, aSlug)
  const titleB = compoundName(b, bSlug)
  const safety = [a?.safety_notes, b?.safety_notes].filter(Boolean) as string[]

  return (
    <div className='space-y-8'>
      <section className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8'>
        <h1 className='text-4xl font-black text-white sm:text-5xl'>{titleA} vs {titleB}</h1>
        <p className='mt-4 max-w-2xl text-white/80'>Compare effects, mechanisms, use cases, and safety notes before choosing the better fit.</p>
      </section>

      <section className='space-y-4'>
        <h2 className='text-2xl font-bold text-white'>Key Differences</h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          {[{ compound: a, slug: aSlug, title: titleA }, { compound: b, slug: bSlug, title: titleB }].map(item => (
            <article key={item.slug} className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
              <h3 className='text-xl font-bold text-white'>{item.title}</h3>
              {item.compound?.primary_effect && <p className='mt-2 text-emerald-100'>{item.compound.primary_effect}</p>}
              {item.compound?.mechanism_summary && <p className='mt-3 text-sm leading-6 text-white/80'>{item.compound.mechanism_summary}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <h2 className='text-2xl font-bold text-white'>When to Use Each</h2>
        <div className='mt-4 grid gap-4 sm:grid-cols-2'>
          {[{ compound: a, slug: aSlug, title: titleA }, { compound: b, slug: bSlug, title: titleB }].map(item => {
            const uses = list(item.compound?.primary_effects)
            return uses.length ? (
              <div key={item.slug}>
                <h3 className='font-bold text-white'>{item.title}</h3>
                <ul className='mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-white/80'>
                  {uses.slice(0, 4).map(use => <li key={use}>{use}</li>)}
                </ul>
              </div>
            ) : null
          })}
        </div>
      </section>

      {safety.length ? (
        <section className='rounded-3xl border border-white/10 bg-red-500/10 p-5 sm:p-6'>
          <h2 className='text-2xl font-bold text-white'>Safety</h2>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/80'>
            {safety.slice(0, 4).map(note => <li key={note}>{note}</li>)}
          </ul>
        </section>
      ) : null}

      <section className='flex flex-wrap gap-3'>
        <Link href={`/compounds/${a.slug}`} className='inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>View {titleA}</Link>
        <Link href={`/compounds/${b.slug}`} className='inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>View {titleB}</Link>
      </section>
    </div>
  )
}
