import { SearchSkeleton } from '@/components/skeletons'

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchSkeleton />
    </div>
  )
}