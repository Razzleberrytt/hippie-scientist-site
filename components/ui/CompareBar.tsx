import Link from 'next/link'
import { isSafeInternalHref } from '@/lib/display-utils'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'

const knownComparisonSlugs = new Set([
  ...generatedComparisons,
  ...supplementComparisons.map((comparison) => comparison.slug),
])

export default function CompareBar({ items = [] }: any) {
  const compareItems = items
    .filter((item: any) => item?.slug && item?.name)
    .slice(0, 2)

  if (compareItems.length < 2) return null

  const slug = `${compareItems[0].slug}-vs-${compareItems[1].slug}`
  const reverseSlug = `${compareItems[1].slug}-vs-${compareItems[0].slug}`
  const comparisonSlug = knownComparisonSlugs.has(slug) ? slug : knownComparisonSlugs.has(reverseSlug) ? reverseSlug : ''
  const href = comparisonSlug ? `/compare/${comparisonSlug}` : ''

  if (!isSafeInternalHref(href)) return null

  return (
    <aside className="fixed inset-x-4 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-sm rounded-2xl border border-brand-900/10 bg-[#fffdf7]/95 p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_10px_28px_rgba(25,48,35,0.14)] backdrop-blur-xl sm:bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:max-w-md sm:p-3.5 lg:left-auto lg:right-5 lg:mx-0 lg:w-[22rem]">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow-label text-[0.62rem]">Compare</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">
            {compareItems.map((item: any) => item.name).join(' vs ')}
          </p>
        </div>

        <Link
          href={href}
          className="flex-none rounded-full bg-brand-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 sm:px-4"
        >
          Open
        </Link>
      </div>
    </aside>
  )
}
