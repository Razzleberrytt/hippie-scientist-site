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
    <aside
      className={`rounded-2xl border border-emerald-900/10 bg-emerald-50/40 p-5 ${className}`}
    >
      <p className='text-xs font-bold uppercase tracking-[0.16em] text-emerald-800'>
        Why we recommend
      </p>
      <h3 className='mt-2 text-base font-semibold text-ink'>
        {productName
          ? `How we evaluate ${productName} products`
          : 'How we evaluate affiliate picks'}
      </h3>
      <ul className='mt-4 space-y-3 text-sm leading-6 text-muted'>
        {CRITERIA.map((item) => (
          <li key={item.title}>
            <strong className='font-semibold text-ink'>{item.title}:</strong> {item.body}
          </li>
        ))}
      </ul>
      <div className='mt-4 flex flex-wrap gap-3 text-xs font-semibold'>
        <Link href='/learn/product-quality' className='text-emerald-800 hover:underline'>
          Product quality guide →
        </Link>
        <Link href='/affiliate-disclosure' className='text-emerald-800 hover:underline'>
          Affiliate disclosure →
        </Link>
      </div>
    </aside>
  )
}