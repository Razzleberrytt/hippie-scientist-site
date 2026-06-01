import type { Metadata } from 'next'

export const dynamic = 'force-static'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Compound & Nootropic Profiles',
  description:
    'Explore 500+ supplement and compound profiles with mechanisms, evidence strength, safety notes, and dosing context. Hype-free.',
  alternates: { canonical: '/compounds' },
  openGraph: {
    title: 'Compound Profiles and Mechanism Guides',
    description:
      'Browse compound profiles with effects, safety considerations, and practical supplement context.',
    url: '/compounds',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compound Profiles and Mechanism Guides',
    description:
      'Browse compound profiles with effects, safety considerations, and practical supplement context.',
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
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:py-6">
      {quickLinks.length > 0 ? (
        <section className="rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Popular compound profiles</h2>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-muted sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-800 hover:underline">{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Server-rendered link index for SEO crawlability — the interactive card grid is rendered by CompoundsIndexClient below */}
      <nav aria-label="Compound profiles index" className="sr-only">
        <ul>
          {compounds.map((compound: any) => (
            <li key={compound.slug}>
              <Link href={`/compounds/${compound.slug}`}>{compound.displayName || compound.name || compound.slug}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <Suspense fallback={
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm h-32" />
          ))}
        </div>
      }>
        <CompoundsIndexClient compounds={compounds} />
      </Suspense>
    </div>
  )
}
