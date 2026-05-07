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
    <aside className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-[1.25rem] border border-brand-900/10 bg-[#fffdf7]/95 p-3 shadow-[0_14px_40px_rgba(25,48,35,0.16)] backdrop-blur-xl sm:bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:p-3.5 lg:left-auto lg:right-5 lg:mx-0 lg:w-[22rem]">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow-label text-[0.62rem]">Compare</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">
            {compareItems.map((item: any) => item.name).join(' vs ')}
          </p>
        </div>

        <Link
          href={href}
          className="flex-none rounded-full bg-brand-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          Open
        </Link>
      </div>
    </aside>
  )
}
