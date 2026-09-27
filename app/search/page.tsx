import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Script from 'next/script'
import LookupFamilyNav from '@/components/navigation/LookupFamilyNav'
import { SearchSkeleton } from '@/components/skeletons'

const GlobalSearch = dynamic(() => import('@/components/search/GlobalSearch'), {
  loading: () => <SearchSkeleton />,
})

export const metadata: Metadata = {
  title: 'Search The Hippie Scientist',
  description:
    'Search herb and compound profiles, guides, and educational content by name, goal, mechanism, evidence, or safety context.',
  alternates: {
    canonical: '/search/',
  },
  robots: {
    index: false,
    follow: true,
  },
}

const popularSearches = [
  { name: 'Ashwagandha', href: '/herbs/ashwagandha/' },
  { name: 'Magnesium Glycinate', href: '/compounds/magnesium-glycinate/' },
  { name: 'Creatine', href: '/compounds/creatine/' },
  { name: 'Melatonin', href: '/compounds/melatonin/' },
  { name: 'L-Theanine', href: '/compounds/l-theanine/' },
  { name: 'Bacopa', href: '/herbs/bacopa/' },
  { name: 'Berberine', href: '/compounds/berberine/' },
  { name: 'Caffeine', href: '/compounds/caffeine/' },
] as const

export default function SearchPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-6 px-4 py-4 sm:py-6'>
      <Script src='/pagefind/pagefind-ui.js' strategy='afterInteractive' />

      <header className='hero-shell rounded-[2rem] border px-5 py-6 sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Lookup utility</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>Search the site</h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Search across herb and compound profiles, guides, and educational pages. Use the dedicated Herb or Compound indexes when you want structured filters; use Evidence strength when the research tier is the question.
        </p>
      </header>

      <LookupFamilyNav active='search' />

      <Suspense fallback={<SearchSkeleton />}>
        <GlobalSearch />
      </Suspense>

      <section className='section-frame p-5 sm:p-6' aria-labelledby='popular-profile-shortcuts'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Popular profiles</p>
          <h2 id='popular-profile-shortcuts' className='compact-heading mt-3'>Quick profile shortcuts</h2>
          <p className='mt-3 text-sm leading-6 text-muted'>
            These are shortcuts, not recommendations. If your question is goal-based rather than name-based, use <Link href='/guides/' className='font-semibold text-brand-700 hover:underline'>Guides</Link>.
          </p>
        </div>
        <div className='mt-4 flex flex-wrap gap-2'>
          {popularSearches.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className='rounded-full border border-brand-900/10 bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-brand-700/20 hover:bg-brand-50/40'
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
