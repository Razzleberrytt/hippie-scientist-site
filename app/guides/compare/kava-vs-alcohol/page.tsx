import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kava vs Alcohol',
  description: 'Educational comparison of kava and alcohol, calming neuropharmacology, stress-response systems, and safety considerations.',
  path: '/compare/kava-vs-alcohol/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

export default function KavaVsAlcoholPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Kava vs Alcohol"
        description="Educational comparison of kava and alcohol, calming neuropharmacology, stress-response systems, and safety considerations."
        url="https://thehippiescientist.net/compare/kava-vs-alcohol"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Kava vs Alcohol' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Kava vs Alcohol
        </h1>

        <p className="text-lg leading-8 text-muted">
          Educational comparison of kava and alcohol through the lens of neuropharmacology, inhibitory signaling, stress-response systems, sedation, and harm reduction.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Kava</h2>
          <p className="text-sm leading-7 text-muted">
            Traditionally used calming ethnobotanical associated with stress modulation, relaxation, and inhibitory signaling systems.
          </p>
          <Link href="/compounds/kava" className="chip-readable">
            Explore Kava
          </Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Alcohol</h2>
          <p className="text-sm leading-7 text-muted">
            Widely consumed psychoactive substance associated with sedation, disinhibition, impaired cognition, dependence risk, and broad systemic effects.
          </p>
        </div>
      </section>

      <section className="surface-subtle rounded-3xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Harm reduction considerations
        </h2>

        <p className="text-sm leading-7 text-muted">
          Psychoactive substances may affect coordination, cognition, sedation levels, medication interactions, sleep architecture, and behavioral risk. Educational comparison should prioritize conservative interpretation and safety awareness.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/psychoactive/harm-reduction" className="chip-readable">
            Harm Reduction
          </Link>

          <Link href="/learn/gaba" className="chip-readable">
            GABA Pathway
          </Link>
        </div>
      </section>
    </div>
  )
}
