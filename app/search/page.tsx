import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Script from 'next/script'
import { SearchSkeleton } from '@/components/skeletons'
import { HERB_COUNT, COMPOUND_COUNT } from '@/lib/profile-counts'

const GlobalSearch = dynamic(() => import('@/components/search/GlobalSearch'), {
  loading: () => <SearchSkeleton />,
})

export const metadata: Metadata = {
  title: 'Search Herbs & Supplements',
  description: `Search the herb and compound research index by name, goal, mechanism, or safety context. Evidence-weighted results with conservative safety labels.`,
  alternates: {
    canonical: '/search/',
  },
  // Intentionally noindex: the page is a client-side search shell whose useful
  // content is the profile pages it links to, and its `?q=` result URLs are
  // unbounded thin duplicates. `follow` is kept so the curated links below still
  // pass discovery to the profiles.
  robots: {
    index: false,
    follow: true,
  },
}

export default function SearchPage() {
  const popularSearches = [
    { name: 'Ashwagandha', href: '/herbs/ashwagandha/' },
    { name: 'Magnesium Glycinate', href: '/compounds/magnesium-glycinate/' },
    { name: 'Creatine', href: '/compounds/creatine/' },
    { name: 'Melatonin', href: '/compounds/melatonin/' },
    { name: 'L-Theanine', href: '/compounds/l-theanine/' },
    { name: 'Bacopa', href: '/herbs/bacopa/' },
    { name: 'Berberine', href: '/compounds/berberine/' },
    { name: 'Black Seed Oil', href: '/compounds/black-seed-oil/' },
    { name: 'Caffeine', href: '/compounds/caffeine/' },
    { name: 'Alpha-GPC', href: '/compounds/alpha-gpc/' },
    { name: 'Omega-3', href: '/compounds/omega-3/' },
    { name: 'Quercetin Phytosome', href: '/compounds/quercetin-phytosome/' },
    { name: 'Panax Ginseng', href: '/herbs/panax-ginseng/' },
  ]

  const popularGoals = [
    { name: 'Sleep Support', href: '/guides/sleep/' },
    { name: 'Stress Resilience', href: '/guides/anxiety/' },
    { name: 'Anxiety Support', href: '/guides/anxiety/' },
    { name: 'Focus & Cognition', href: '/guides/focus/' },
    { name: 'Fat Loss', href: '/guides/best/supplements-for-fat-loss/' },
    { name: 'Gut Health', href: '/guides/best/supplements-for-gut-health/' },
    { name: 'Joint Support', href: '/guides/best/supplements-for-joint-support/' },
  ]

  const researchTools = [
    { name: 'Safety Checker', href: '/safety-checker/' },
    { name: 'Compare Supplements', href: '/guides/compare/' },
    { name: 'Evidence Checker', href: '/evidence/evidence-checker/' },
    { name: 'Citation Explorer', href: '/learn/citation-explorer/' },
    { name: 'Dosing Calculator', href: '/info/dosing/' },
    { name: 'Stack Builder', href: '/guides/' },
  ]

  const searchMetrics = [
    { value: HERB_COUNT, label: 'herb records' },
    { value: COMPOUND_COUNT, label: 'compound records' },
    { value: 4, label: 'search lenses' },
  ]

  const directoryLinkClass =
    'text-sm font-semibold text-[color:var(--hs-gold-ink)] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
      <Script
        src='/pagefind/pagefind-ui.js'
        strategy='afterInteractive'
      />

      <section className="hero-shell mb-6 rounded-[2rem] border px-5 py-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Evidence Discovery</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Search herbs and compounds</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Scan by name, goal, mechanism, or safety context. Evidence-weighted results, conservative labels, and direct paths into the research library.
        </p>

        <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_76%,transparent)] backdrop-blur-sm">
          {searchMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`px-3 py-3.5 text-center sm:px-5 sm:py-4 ${index > 0 ? 'border-l border-[color:var(--hs-hairline)]' : ''}`}
            >
              <dt className="sr-only">{metric.label}</dt>
              <dd>
                <span className="block font-display text-2xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)] sm:text-[1.7rem]">
                  {metric.value}
                </span>
                <span className="mt-1 block text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[color:var(--hs-body)] sm:text-[0.7rem] sm:tracking-[0.12em]">
                  {metric.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Suspense fallback={<SearchSkeleton />}>
        <GlobalSearch />
      </Suspense>

      {/* Static search directory for no-JS users and quick navigation. The
          interactive search remains the primary task above. */}
      <section className="section-frame mt-8 space-y-6 p-5 sm:p-6" aria-labelledby="search-browse-directory">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Browse instead</p>
          <h2 id="search-browse-directory" className="compact-heading mt-3">Use a curated shortcut when you already know the direction.</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--hs-body)]">
            Jump directly into popular profiles, goal-based decision guides, research collections, and safety tools.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Popular searches</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-full border border-[color:var(--hs-hairline)] bg-[color:var(--surface-card)] px-3 py-1.5 text-[0.8rem] font-semibold text-[color:var(--hs-ink)] transition hover:border-[color:var(--hs-gold)] hover:text-[color:var(--hs-gold-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 border-t border-[color:var(--hs-hairline)] pt-5 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Browse by goal</h3>
            <ul className="space-y-2">
              {popularGoals.map(item => (
                <li key={item.name}>
                  <Link href={item.href} className={directoryLinkClass}>
                    {item.name} Decision Guide
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Browse by category</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/herbs/" className={directoryLinkClass}>
                  Herb & Botanical Library
                </Link>
              </li>
              <li>
                <Link href="/compounds/" className={directoryLinkClass}>
                  Compound & Nootropic Library
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Research tools</h3>
            <ul className="space-y-2">
              {researchTools.map(item => (
                <li key={item.name}>
                  <Link href={item.href} className={directoryLinkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
