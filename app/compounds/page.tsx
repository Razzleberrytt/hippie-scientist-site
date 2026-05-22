import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Compound & Nootropic Profiles',
  description:
    'Browse evidence-aware compound profiles with mechanisms, effects, safety considerations, and practical supplement context.',
  alternates: { canonical: '/compounds' },
  openGraph: {
    title: 'Compound Profiles and Mechanism Guides',
    description:
      'Browse evidence-aware compound profiles with mechanisms, effects, safety considerations, and practical supplement context.',
    url: '/compounds',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compound Profiles and Mechanism Guides',
    description:
      'Browse evidence-aware compound profiles with mechanisms, effects, safety considerations, and practical supplement context.',
  },
}
import { getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import CompoundsIndexClient from './CompoundsIndexClient'

export default async function CompoundsPage() {
  const runtimeCompounds = await getCompounds()
  const compounds = runtimeCompounds.filter((compound: any) => {
    try {
      return getRuntimeVisibility(compound).canRender
    } catch {
      return true
    }
  })

  const quickLinks = compounds
    .filter((compound: any) => compound?.slug && (compound?.displayName || compound?.name))
    .slice(0, 8)
    .map((compound: any) => ({
      href: `/compounds/${compound.slug}`,
      label: (compound.displayName || compound.name) as string,
    }))

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">Compound profiles and mechanism guides</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          Browse evidence-aware compound pages with mechanism notes, safety framing, and practical context before refining with interactive filters.
        </p>
      </section>

      {quickLinks.length > 0 ? (
        <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Popular compound profiles</h2>
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
        <CompoundsIndexClient compounds={compounds} />
      </Suspense>
    </main>
  )
}
