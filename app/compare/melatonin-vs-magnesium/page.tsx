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
import AffiliateDisclosure from '../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'

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

      {/* TL;DR Hero */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence-Based Comparison · Sleep</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Melatonin vs Magnesium for Sleep: Which Works Better?
        </h1>

        {/* TL;DR Box */}
        <div className="rounded-2xl border border-brand-300 bg-brand-50/60 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">TL;DR</p>
          <p className="text-base leading-7 text-ink">
            <strong>Melatonin</strong> helps you <em>fall</em> asleep faster and works best for short-term use, jet lag, and circadian rhythm shifts.{' '}
            <strong>Magnesium glycinate</strong> helps you <em>stay</em> asleep, supports deeper rest, and is safer for long-term nightly use.{' '}
            They can be taken together — melatonin 30 minutes before bed, magnesium 1–2 hours before.{' '}
            For most people, start with magnesium first.
          </p>
        </div>

        <p className="text-lg leading-8 text-[#46574d]">
          Melatonin and magnesium are two of the most commonly used sleep supplements, but they work through completely different mechanisms. This guide compares the evidence, practical dosing, safety trade-offs, and helps you decide which one — or whether a combination — is right for your sleep goals.
        </p>
      </section>

      {/* Quick comparison summary */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-900/10 bg-white/80 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-ink">Melatonin</h2>
          <div className="space-y-2 text-sm leading-6 text-[#46574d]">
            <p><strong>Best for:</strong> Falling asleep faster, jet lag, delayed sleep phase, shift work</p>
            <p><strong>How it works:</strong> Signals your brain's circadian clock that it's time to sleep</p>
            <p><strong>Typical dose:</strong> 0.5–5 mg, 30 min before bed</p>
            <p><strong>Onset:</strong> 30–60 minutes</p>
            <p><strong>Long-term safety:</strong> Generally well-tolerated; long-term effects less studied, especially at higher doses</p>
            <p><strong>Evidence grade:</strong> Strong for sleep onset; moderate for sleep maintenance</p>
          </div>
        </div>
        <div className="rounded-2xl border border-brand-900/10 bg-white/80 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-ink">Magnesium (Glycinate)</h2>
          <div className="space-y-2 text-sm leading-6 text-[#46574d]">
            <p><strong>Best for:</strong> Staying asleep, sleep quality, restless legs, nightly relaxation</p>
            <p><strong>How it works:</strong> Supports GABA receptors, reduces cortisol, relaxes muscles</p>
            <p><strong>Typical dose:</strong> 200–400 mg elemental magnesium, 1–2 hours before bed</p>
            <p><strong>Onset:</strong> Cumulative — benefits build over days to weeks</p>
            <p><strong>Long-term safety:</strong> Excellent safety profile; well-studied for chronic use</p>
            <p><strong>Evidence grade:</strong> Moderate for sleep quality; strong for deficiency-related sleep issues</p>
          </div>
        </div>
      </section>

      {/* When to use each */}
      <section className="max-w-4xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">When to choose which</h2>
        <div className="space-y-4 text-[#46574d] leading-7">
          <p><strong>Choose melatonin if:</strong> you have trouble falling asleep, you're dealing with jet lag or shift work, you have delayed sleep phase syndrome, or you need occasional help resetting your sleep schedule.</p>
          <p><strong>Choose magnesium if:</strong> you wake up during the night, you have restless legs, you may be magnesium-deficient (common with stress, exercise, caffeine, alcohol), you want a long-term nightly option without tolerance concerns.</p>
          <p><strong>Try both together if:</strong> you have both sleep-onset and sleep-maintenance issues, and you've already tried each one individually to confirm tolerance. Take melatonin 30 min before bed and magnesium 1–2 hours before bed.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 text-center space-y-3">
        <p className="text-sm font-semibold text-ink">Still not sure? Compare by goal instead.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/goals/sleep/" className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
            Browse Sleep Goal Hub →
          </Link>
          <Link href="/compare/" className="rounded-full border border-brand-900/10 bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-brand-50">
            All Comparisons →
          </Link>
        </div>
      </section>

      <AffiliateDisclosure />
      <EnhancedEmailCapture />
      <RelatedDiscoveryWidget />
    </div>
  )
}
