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
    <aside className="fixed inset-x-3 bottom-[calc(0.35rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-brand-900/10 bg-[#fffdf7]/95 p-2 shadow-[0_8px_22px_rgba(25,48,35,0.12)] backdrop-blur-xl sm:bottom-[calc(0.75rem+env(safe-area-inset-bottom))] sm:max-w-md sm:p-3 lg:left-auto lg:right-5 lg:mx-0 lg:w-[22rem]">
      <div className="flex min-h-0 items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="eyebrow-label text-[0.58rem] leading-none">Compare</p>
          <p className="mt-0.5 truncate text-xs font-semibold leading-5 text-ink sm:text-sm">
            {compareItems.map((item: any) => item.name).join(' vs ')}
          </p>
        </div>

        <Link
          href={href}
          className="flex-none rounded-full bg-brand-800 px-3 py-1.5 text-[11px] font-bold text-[#fffdf7] shadow-sm transition hover:bg-brand-700 sm:px-4 sm:py-2 sm:text-xs"
        >
          Open
        </Link>
      </div>
    </aside>
  )
}
