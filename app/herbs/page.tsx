import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import HerbsIndexClient from './HerbsIndexClient'

export const metadata: Metadata = {
  title: 'Herb Profiles & Research Library',
  description: 'Browse evidence-aware profiles for 100+ herbs — mechanisms, safety notes, active compounds, and research context in plain language.',
}

export default async function HerbsPage() {
  const allHerbs = await getHerbSummaryIndex()
  const herbs = allHerbs.filter((herb: any) => getRuntimeVisibility(herb).canRender)

  const quickLinks = herbs
    .filter((herb: any) => herb?.slug && herb?.displayName)
    .slice(0, 8)
    .map((herb: any) => ({ href: `/herbs/${herb.slug}`, label: herb.displayName as string }))

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">Herb profiles and supplement research</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          Explore evidence-aware herb profiles with mechanisms, safety context, and practical research notes before moving into interactive filters.
        </p>
      </section>

      {quickLinks.length > 0 ? (
        <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Popular herb profiles</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-800 hover:underline">{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Suspense fallback={null}>
        <HerbsIndexClient herbs={herbs} />
      </Suspense>
    </main>
  )
}
