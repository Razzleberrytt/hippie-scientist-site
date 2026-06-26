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
  description: `Search ${HERB_COUNT} herb profiles and ${COMPOUND_COUNT} compound profiles by name, goal, mechanism, or safety context. Evidence-weighted results with conservative safety labels.`,
  alternates: {
    canonical: '/search/',
  },
  robots: {
    index: true,
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
    { name: 'Sleep Support', href: '/goals/sleep/' },
    { name: 'Stress Resilience', href: '/goals/stress/' },
    { name: 'Anxiety Support', href: '/goals/anxiety/' },
    { name: 'Focus & Cognition', href: '/goals/focus/' },
    { name: 'Fat Loss', href: '/goals/fat-loss/' },
    { name: 'Gut Health', href: '/goals/gut-health/' },
    { name: 'Joint Support', href: '/goals/joint-support/' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Script
        src='/pagefind/pagefind-ui.js'
        strategy='afterInteractive'
      />
      <div className="mb-6 space-y-2">
        <p className="eyebrow-label">Evidence discovery</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
          Search herbs and compounds
        </h1>
        <p className="text-sm text-muted">
          Scan by name, goal, mechanism, or safety context. Evidence-weighted, conservative labels.
        </p>
      </div>

      {/* Static search directory for SEO indexing, no-JS users, and quick navigation.
          Intentionally visible for all users (JS + no-JS) to provide accessible entry points
          and crawlable links without relying on client hydration. The interactive search UI below
          offers enhanced filtering and discovery. */}
      <div className="mb-8 space-y-6 rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <p className="text-sm leading-6 text-muted">
          Our search database indexes {HERB_COUNT} herb profiles and {COMPOUND_COUNT} compound profiles. Compare primary active constituents, traditional uses, clinical human evidence levels, safety warnings, and drug interactions across popular adaptogens, amino acids, and minerals.
        </p>
        
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted font-semibold">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map(item => (
              <Link key={item.name} href={item.href} className="rounded-full border border-brand-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand-700/20">
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted font-semibold">Browse by Goal</h2>
            <ul className="space-y-1">
              {popularGoals.map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm font-semibold text-brand-800 hover:underline">
                    {item.name} Decision Guide
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted font-semibold">Browse by Category</h2>
            <ul className="space-y-1">
              <li>
                <Link href="/herbs/" className="text-sm font-semibold text-brand-800 hover:underline">
                  Herb & Botanical Library ({HERB_COUNT} Profiles)
                </Link>
              </li>
              <li>
                <Link href="/compounds/" className="text-sm font-semibold text-brand-800 hover:underline">
                  Compound & Nootropic Library ({COMPOUND_COUNT} Profiles)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <GlobalSearch />
      </Suspense>
    </div>
  )
}
