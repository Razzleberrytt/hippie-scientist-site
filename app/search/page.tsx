import type { Metadata } from 'next'
import Link from 'next/link'
import herbsSummaryData from '@/public/data/herbs-summary.json'
import compoundsSummaryData from '@/public/data/compounds-summary.json'
import SearchClient from './SearchClient'

export const metadata: Metadata = {
  title: 'Search Herbs and Compounds',
  description: 'Search the herb and compound library with evidence-aware context, safety framing, and mechanism-oriented discovery.',
}

function getTopLinks() {
  const herbs = (herbsSummaryData as any[])
    .filter(item => item?.slug && item?.name)
    .slice(0, 12)
    .map(item => ({ href: `/herbs/${item.slug}`, label: item.name as string }))

  const compounds = (compoundsSummaryData as any[])
    .filter(item => item?.slug && item?.name)
    .slice(0, 12)
    .map(item => ({ href: `/compounds/${item.slug}`, label: item.name as string }))

  return { herbs, compounds }
}

export default function SearchPage() {
  const { herbs, compounds } = getTopLinks()

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">Search Herbs, Compounds, and Research Topics</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          Explore the library by herb, compound, mechanism, evidence, or safety context. Start with this index, then use the interactive search tool below to refine your scan.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Herb index</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {herbs.map(item => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-800 hover:underline">{item.label}</Link>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Compound index</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {compounds.map(item => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-800 hover:underline">{item.label}</Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <SearchClient />
    </main>
  )
}
