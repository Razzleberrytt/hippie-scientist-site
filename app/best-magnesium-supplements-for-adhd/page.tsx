import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import NewsletterSignup from '../../components/NewsletterSignup'
import RecommendedProduct from '@/components/RecommendedProduct'
import { getRevenueProductSet } from '@/config/revenue-products'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Best Magnesium Supplements for ADHD: Forms, Dose, and Buying Guide',
  description:
    'Compare magnesium glycinate, threonate, citrate, and other forms for ADHD-adjacent focus and sleep support. Includes safety notes and affiliate product picks.',
  path: '/best-magnesium-supplements-for-adhd',
  openGraphType: 'article',
})

const magnesiumForms = [
  {
    rank: 1,
    form: 'Magnesium glycinate',
    fit: 'Best first look for sensitive users comparing calm, sleep quality, and general magnesium repletion.',
    dose: '100-200 mg elemental magnesium to start',
    evidence: 'Strong for correcting low magnesium; ADHD-specific evidence is indirect.',
    caution: 'Use clinician guidance with kidney disease or magnesium-containing medications.',
  },
  {
    rank: 2,
    form: 'Magnesium L-threonate',
    fit: 'Interesting for brain-focused shoppers, but usually more expensive and not clearly superior for ADHD.',
    dose: 'Follow label; elemental magnesium is often lower than the compound weight suggests.',
    evidence: 'Mechanistic and cognitive marketing is stronger than ADHD-specific trial evidence.',
    caution: 'Check total elemental magnesium before stacking with other products.',
  },
  {
    rank: 3,
    form: 'Magnesium citrate',
    fit: 'Useful when constipation is also part of the picture; less ideal if loose stools are a problem.',
    dose: '100-200 mg elemental magnesium to assess tolerance',
    evidence: 'Good absorption; ADHD-specific evidence remains indirect.',
    caution: 'GI effects are the limiting factor for many users.',
  },
  {
    rank: 4,
    form: 'Magnesium oxide',
    fit: 'Usually not the best pick for focus shoppers unless cost or constipation is the main driver.',
    dose: 'Label-dependent',
    evidence: 'Lower absorption than glycinate or citrate in many contexts.',
    caution: 'More likely to cause GI upset at higher doses.',
  },
]

const productSet = getRevenueProductSet('magnesium')
const products = productSet?.products ?? []

export default function BestMagnesiumSupplementsForAdhdPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Buying guide</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Which magnesium should you buy for ADHD?
        </h1>
        <p className='mt-5 max-w-3xl text-base leading-8 text-muted'>
          Magnesium is not an ADHD treatment. The practical question is narrower: if you are already comparing
          magnesium for sleep, tension, or possible deficiency context, which form is least likely to waste money?
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/goals/focus/' className='rounded-full bg-brand-950 px-5 py-3 text-sm font-bold text-white hover:bg-brand-900'>
            Compare focus options
          </Link>
          <Link href='/supplement-safety-checklist/' className='rounded-full border border-brand-900/10 bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-brand-50'>
            Get the safety checklist
          </Link>
        </div>
      </section>

      <section className='rounded-2xl border border-emerald-800/15 bg-emerald-50/70 p-5 shadow-sm sm:p-6'>
        <h2 className='text-2xl font-semibold text-ink'>Quick answer</h2>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
          Start the comparison with magnesium glycinate if your goal is tolerability, sleep quality, and a simple
          elemental magnesium label. Consider citrate when constipation matters. Treat threonate as a premium,
          brain-marketed option with a weaker value case.
        </p>
      </section>

      <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm sm:p-6'>
        <h2 className='text-2xl font-semibold text-ink'>Decision table</h2>
        <div className='mt-5 overflow-x-auto rounded-2xl border border-brand-900/10 bg-white'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-brand-50/70 text-xs font-bold uppercase tracking-[0.14em] text-muted'>
              <tr>
                <th className='px-4 py-3'>Rank</th>
                <th className='px-4 py-3'>Form</th>
                <th className='px-4 py-3'>Best fit</th>
                <th className='px-4 py-3'>Dose note</th>
                <th className='px-4 py-3'>Evidence</th>
                <th className='px-4 py-3'>Safety</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-brand-900/5'>
              {magnesiumForms.map((row) => (
                <tr key={row.form} className='align-top'>
                  <td className='px-4 py-4 font-bold text-ink'>{row.rank}</td>
                  <td className='px-4 py-4 font-semibold text-ink'>{row.form}</td>
                  <td className='max-w-[18rem] px-4 py-4 text-muted'>{row.fit}</td>
                  <td className='px-4 py-4 text-muted'>{row.dose}</td>
                  <td className='px-4 py-4 text-muted'>{row.evidence}</td>
                  <td className='px-4 py-4 text-amber-900'>{row.caution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm sm:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Product comparison</p>
            <h2 className='mt-2 text-2xl font-semibold text-ink'>Top magnesium products to compare</h2>
          </div>
          <AffiliateDisclosure variant='compact' />
        </div>
        <div className='mt-5 overflow-x-auto rounded-2xl border border-brand-900/10 bg-white'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-brand-50/70 text-xs font-bold uppercase tracking-[0.14em] text-muted'>
              <tr>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Form</th>
                <th className='px-4 py-3'>Why it made the list</th>
                <th className='px-4 py-3'>Price</th>
                <th className='px-4 py-3 text-right'>Amazon</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-brand-900/5'>
              {products.map((product) => (
                <tr key={product.title} className='align-top'>
                  <td className='px-4 py-4 font-semibold text-ink'>
                    {[product.brand, product.title].filter(Boolean).join(' - ')}
                  </td>
                  <td className='px-4 py-4 text-muted'>
                    {product.title?.toLowerCase().includes('glycinate') ? 'Glycinate / chelated' : 'Magnesium supplement'}
                  </td>
                  <td className='max-w-[22rem] px-4 py-4 text-muted'>{product.rationale}</td>
                  <td className='px-4 py-4 text-muted'>{product.price || 'Check current price'}</td>
                  <td className='px-4 py-4 text-right'>
                    <a
                      href={product.affiliateUrl}
                      target='_blank'
                      rel='nofollow sponsored noopener noreferrer'
                      className='inline-flex rounded-full bg-brand-950 px-4 py-2 text-xs font-bold text-white hover:bg-brand-900'
                    >
                      Check price
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <RecommendedProduct slug='magnesium' title='Best first product to compare' limit={3} />

      <section className='grid gap-4 md:grid-cols-2'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
          <h2 className='text-xl font-semibold text-ink'>Buying guide</h2>
          <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted'>
            <li>Look for elemental magnesium per serving, not only compound weight.</li>
            <li>Prefer third-party testing, transparent excipients, and a single-ingredient label.</li>
            <li>Avoid proprietary blends that hide the amount of magnesium per dose.</li>
          </ul>
        </article>
        <article className='rounded-2xl border border-amber-300/50 bg-amber-50/80 p-5 shadow-sm'>
          <h2 className='text-xl font-semibold text-amber-950'>Safety</h2>
          <p className='mt-3 text-sm leading-6 text-amber-900'>
            Ask a clinician first if you have kidney disease, heart-rhythm concerns, pregnancy, chronic GI disease,
            or take antibiotics, thyroid medication, bisphosphonates, diuretics, or other mineral-containing products.
          </p>
        </article>
      </section>

      <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm sm:p-6'>
        <h2 className='text-2xl font-semibold text-ink'>Related reading</h2>
        <div className='mt-4 grid gap-3 sm:grid-cols-3'>
          {[
            ['/compounds/magnesium-glycinate/', 'Magnesium glycinate profile'],
            ['/compounds/l-theanine/', 'L-theanine for calm focus'],
            ['/goals/focus/', 'Focus supplement decision guide'],
          ].map(([href, label]) => (
            <Link key={href} href={href} className='rounded-2xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-800 hover:bg-brand-50'>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <NewsletterSignup
        title='Get the full safety checklist before you buy'
        description='Five questions for medications, dose, form, stack risk, and product quality - plus occasional supplement evidence updates.'
        ctaLabel='Get the checklist'
        location='best-magnesium-supplements-for-adhd'
      />
    </div>
  )
}
