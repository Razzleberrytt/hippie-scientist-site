import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import compoundsData from '@/public/data/compounds.json'
import herbsData from '@/public/data/herbs.json'

const comparisons = [
  'creatine-vs-beta-alanine',
  'magnesium-vs-glycine',
  'caffeine-vs-l-theanine',
  'ashwagandha-vs-rhodiola-rosea',
  'cdp-choline-vs-alpha-gpc',
]

const compounds = Array.isArray(compoundsData) ? compoundsData : []
const herbs = Array.isArray(herbsData) ? herbsData : []

const format = (s: string) =>
  s.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join(' ')

const get = (slug: string) =>
  compounds.find((c: any) => c?.slug === slug) ||
  herbs.find((h: any) => h?.slug === slug)

export function generateStaticParams() {
  return comparisons.map(slug => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const [a, b] = params.slug.split('-vs-')
  return {
    title: `${format(a)} vs ${format(b)} — Which is better?`,
    description: `Compare ${format(a)} vs ${format(b)}: effects, mechanisms, and safety.`,
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!comparisons.includes(params.slug)) return notFound()

  const [aSlug, bSlug] = params.slug.split('-vs-')
  const a = get(aSlug)
  const b = get(bSlug)

  if (!a || !b) return notFound()

  return (
    <div className='space-y-8'>
      <h1 className='text-4xl font-black text-white'>
        {format(aSlug)} vs {format(bSlug)}
      </h1>

      <section className='grid gap-4 sm:grid-cols-2'>
        {[a, b].map((c: any, i) => (
          <div key={i} className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
            <h2 className='text-xl font-bold text-white'>{c.displayName || c.name || c.slug}</h2>
            {c.summary && <p className='mt-2 text-white/80'>{c.summary}</p>}
            {c.mechanism_summary && <p className='mt-2 text-white/70'>{c.mechanism_summary}</p>}
          </div>
        ))}
      </section>

      <section className='flex gap-3'>
        <Link href={`/compounds/${a.slug}`} className='rounded-2xl bg-emerald-300 px-4 py-2 font-bold text-black'>View {a.slug}</Link>
        <Link href={`/compounds/${b.slug}`} className='rounded-2xl bg-emerald-300 px-4 py-2 font-bold text-black'>View {b.slug}</Link>
      </section>

      <section className='rounded-3xl border border-white/10 p-5'>
        <h2 className='text-xl font-bold text-white'>Related Comparisons</h2>
        <div className='mt-3 flex flex-wrap gap-3'>
          {comparisons.filter(c => c !== params.slug).map(slug => (
            <Link key={slug} href={`/compare/${slug}`} className='text-sm text-white/70 hover:text-white'>
              {format(slug.replace('-vs-', ' vs '))}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
