import type { Metadata } from 'next'
import Link from 'next/link'
import { SEO_GUIDE_ROUTES } from '../../../src/lib/canonical-routes'
import AffiliateDisclosure from '../../../components/AffiliateDisclosure'
import NewsletterSignup from '../../../components/NewsletterSignup'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'

export const metadata: Metadata = {
  title: 'Free Supplement Decision Guide',
  description:
    'Get a free evidence-aware supplement decision guide for sleep, stress, focus, brain fog, fatigue, and calming support.',
  alternates: { canonical: '/info/info/free-guide/' },
}

export default function FreeGuidePage() {
  return (
    <div className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Free guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Supplement Decision Guide</h1>
        <p className='mt-4 max-w-3xl text-muted'>
          A practical framework for comparing supplements without turning limited evidence, product hype, or forum anecdotes into overconfident decisions.
        </p>
      </section>

      <NewsletterSignup location='free-guide' />

      <section className='grid gap-4 md:grid-cols-3'>
        {[
          {
            title: 'Sleep',
            body: 'Compare wind-down support, next-day grogginess risk, sedative combinations, timing, and product form.',
            href: SEO_GUIDE_ROUTES.sleep,
          },
          {
            title: 'Stress',
            body: 'Separate calming options from adaptogen-style options while keeping mental health care and medication context visible.',
            href: SEO_GUIDE_ROUTES.stress,
          },
          {
            title: 'Focus and brain fog',
            body: 'Sort stimulant-forward, non-stimulant, and deficiency-context options without ignoring possible root causes.',
            href: SEO_GUIDE_ROUTES.focus,
          },
        ].map((section) => (
          <article key={section.title} className='card-premium p-6'>
            <h2 className='text-xl font-semibold text-ink'>{section.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{section.body}</p>
            <Link href={section.href} className='mt-4 inline-flex text-sm font-medium text-emerald-700 hover:underline'>
              Read guide
            </Link>
          </article>
        ))}
      </section>

      <SafetyDisclaimerBox />
      <AffiliateDisclosure variant='full' />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>What you get</h2>
        <p className='mt-3 text-sm leading-7 text-muted'>
          The free checklist is a static, printable resource you can use immediately: medication review,
          dose and form checks, stacking risk prompts, and quality markers before buying.
        </p>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/info/methodology' className='text-sm font-medium text-emerald-700 hover:underline'>Methodology</Link>
          <Link href='/info/affiliate-disclosure' className='text-sm font-medium text-emerald-700 hover:underline'>Affiliate disclosure</Link>
        </div>
      </section>
    </div>
  )
}
