import type { Metadata } from 'next'
import Link from 'next/link'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { TrustMethodologyCallout } from '@/components/monetization/TrustMethodologyCallout'

export const metadata: Metadata = {
  title: 'Methodology',
  description:
    'How The Hippie Scientist weighs human evidence, safety, practical usefulness, and uncertainty for supplement decision support.',
  alternates: { canonical: '/methodology' },
}

export default function MethodologyPage() {
  return (
    <div className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Methodology</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>How The Hippie Scientist Ranks Supplements</h1>
        <p className='mt-4 max-w-3xl text-muted'>
          Rankings are designed as transparent decision support. They are not medical advice and do not guarantee that a supplement is right for a specific person.
        </p>
      </section>

      <TrustMethodologyCallout />

      <section className='grid gap-4 md:grid-cols-2'>
        {[
          {
            title: 'Human evidence',
            body: 'Human trials and clinically relevant evidence carry more weight than mechanism-only reasoning, traditional use, or marketing claims.',
          },
          {
            title: 'Safety context',
            body: 'Medication interactions, pregnancy and nursing context, health conditions, dose, sedation, stimulation, and uncertainty can change practical fit.',
          },
          {
            title: 'Practical usefulness',
            body: 'A useful recommendation has a clear use case, realistic availability, understandable tradeoffs, and a form people can compare responsibly.',
          },
          {
            title: 'Uncertainty',
            body: 'Limited, mixed, or indirect evidence is stated plainly. Interesting does not automatically mean recommended.',
          },
        ].map((item) => (
          <article key={item.title} className='card-premium p-6'>
            <h2 className='text-xl font-semibold text-ink'>{item.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{item.body}</p>
          </article>
        ))}
      </section>

      <SafetyDisclaimerBox />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Editorial independence</h2>
        <p className='mt-3 text-sm leading-7 text-muted'>
          Affiliate relationships may support the site, but they do not convert weak evidence into strong evidence or remove safety concerns. Product links are treated as sourcing paths, not prescriptions.
        </p>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/affiliate-disclosure' className='text-sm font-medium text-emerald-700 hover:underline'>Affiliate disclosure</Link>
          <Link href='/free-guide' className='text-sm font-medium text-emerald-700 hover:underline'>Free guide</Link>
        </div>
      </section>
    </div>
  )
}
