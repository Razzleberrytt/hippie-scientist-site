import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { SearchSkeleton } from '@/components/skeletons'

const SearchClient = dynamic(() => import('./SearchClient'), {
  loading: () => <SearchSkeleton />,
})

export const metadata: Metadata = {
  title: 'Search Herbs & Supplements',
  description: 'Search 500+ herb and supplement profiles by name, compound, mechanism, or use case. Evidence-first research database with fast filtering.',
  alternates: {
    canonical: '/search',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-6 space-y-2">
        <p className="eyebrow-label">Evidence discovery</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
          Search herbs and compounds
        </h1>
        <p className="text-sm text-muted">
          {/* Count shown inside SearchClient — this is research support, not medical advice. */}
          Scan by name, goal, mechanism, or safety context. Evidence-weighted, conservative labels.
        </p>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchClient />
      </Suspense>
    </div>
  )
}
