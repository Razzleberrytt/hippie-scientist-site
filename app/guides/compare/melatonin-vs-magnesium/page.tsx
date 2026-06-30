import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Melatonin vs Magnesium for Sleep: Which Works Better?',
  description: 'Melatonin vs Magnesium for sleep — which works better, which is safer long-term, and how to take them together. Evidence-based comparison with dosing and timing guide.',
  path: '/compare/melatonin-vs-magnesium/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

export default function MelatoninVsMagnesiumPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Melatonin vs Magnesium for Sleep: Which Works Better?"
        description="Melatonin vs Magnesium for sleep — which works better, which is safer long-term, and how to take them together. Evidence-based comparison with dosing and timing guide."
        url="https://thehippiescientist.net/compare/melatonin-vs-magnesium"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Melatonin vs Magnesium' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Evidence-Based Comparison · Sleep</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Melatonin vs Magnesium for Sleep: Which Works Better?
        </h1>

        <p className="text-lg leading-8 text-muted">
          Melatonin and magnesium are two of the most commonly used sleep supplements, but they work through completely different mechanisms. This guide compares the evidence, practical dosing, and safety trade-offs.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Melatonin</h2>
          <p className="text-sm leading-7 text-muted">
            Melatonin helps you fall asleep faster. Best for short-term use, jet lag, and circadian rhythm shifts. Typical dose: 0.5-5 mg, 30 min before bed.
          </p>
          <Link href="/compounds/melatonin" className="chip-readable">
            Explore Melatonin
          </Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Magnesium (Glycinate)</h2>
          <p className="text-sm leading-7 text-muted">
            Magnesium glycinate helps you stay asleep and supports deeper rest. Safer for long-term nightly use. Typical dose: 200-400 mg, 1-2 hours before bed.
          </p>
          <Link href="/compounds/magnesium-glycinate" className="chip-readable">
            Explore Magnesium
          </Link>
        </div>
      </section>

      <section className="surface-subtle rounded-3xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          When to choose which
        </h2>

        <p className="text-sm leading-7 text-muted">
          Choose melatonin for sleep-onset issues and jet lag. Choose magnesium for sleep maintenance, restless legs, and long-term nightly use. Both can be taken together with staggered timing.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/goals/sleep/" className="chip-readable">
            Sleep Goal Hub
          </Link>
          <Link href="/compare/" className="chip-readable">
            All Comparisons
          </Link>
        </div>
      </section>
    </div>
  )
}
