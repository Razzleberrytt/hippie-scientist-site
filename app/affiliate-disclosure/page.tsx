import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | The Hippie Scientist',
  description:
    'How The Hippie Scientist uses affiliate links while keeping editorial independence, safety context, and evidence uncertainty visible.',
  alternates: { canonical: '/affiliate-disclosure' },
}

export default function AffiliateDisclosurePage() {
  return (
    <div className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Transparency</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Affiliate Disclosure</h1>
        <p className='mt-4 max-w-3xl text-muted'>
          The Hippie Scientist may earn commissions from qualifying product links. Those relationships do not determine rankings, safety language, or editorial conclusions.
        </p>
      </section>

      <AffiliateDisclosure variant='full' />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How affiliate links are handled</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li>Affiliate links are labeled near recommendation sections or monetized links.</li>
          <li>External affiliate links should use sponsored and nofollow attributes.</li>
          <li>Product links are sourcing starting points, not medical recommendations.</li>
          <li>Evidence level, safety context, and uncertainty stay visible even when a page includes monetized links.</li>
        </ul>
      </section>

      <SafetyDisclaimerBox />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related trust pages</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/methodology' className='text-sm font-medium text-emerald-700 hover:underline'>Methodology</Link>
          <Link href='/free-guide' className='text-sm font-medium text-emerald-700 hover:underline'>Free guide</Link>
          <Link href='/about' className='text-sm font-medium text-emerald-700 hover:underline'>About</Link>
        </div>
      </section>
    </div>
  )
}
