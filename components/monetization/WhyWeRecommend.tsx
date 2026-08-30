import Link from 'next/link'

type WhyWeRecommendProps = {
  productName?: string
  className?: string
}

const CRITERIA = [
  {
    title: 'Standardization',
    body: 'We prefer labels that state active marker percentages (withanolides, bacosides, curcuminoids, etc.) rather than raw herb weight alone.',
  },
  {
    title: 'Third-party testing',
    body: 'USP, NSF, ConsumerLab, or independent COA verification reduces contamination and dose mismatch risk.',
  },
  {
    title: 'Dose transparency',
    body: 'Elemental mineral dose, extract ratio, and serving size should be visible — not hidden in proprietary blends.',
  },
]

export default function WhyWeRecommend({
  productName,
  className = '',
}: WhyWeRecommendProps) {
  return (
    <aside className={`rounded-2xl border border-emerald-900/10 bg-emerald-50/40 p-4 ${className}`}>
      <details className='group'>
        <summary className='flex cursor-pointer items-center justify-between gap-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:rounded'>
          <span className='text-xs font-bold uppercase tracking-[0.16em] text-emerald-800'>
            {productName ? `How we evaluate ${productName} products` : 'How we evaluate affiliate picks'}
          </span>
          <span aria-hidden='true' className='shrink-0 text-emerald-700 transition-transform group-open:rotate-180'>v</span>
        </summary>
        <ul className='mt-3 space-y-2 border-t border-emerald-900/10 pt-3 text-sm leading-6 text-muted'>
          {CRITERIA.map((item) => (
            <li key={item.title}>
              <strong className='font-semibold text-ink'>{item.title}:</strong> {item.body}
            </li>
          ))}
        </ul>
        <div className='mt-3 flex flex-wrap gap-3 text-xs font-semibold'>
          <Link href='/learn/product-quality/' className='text-emerald-800 hover:underline'>
            Product quality guide →
          </Link>
          <Link href='/info/affiliate-disclosure/' className='text-emerald-800 hover:underline'>
            Affiliate disclosure →
          </Link>
        </div>
      </details>
    </aside>
  )
}