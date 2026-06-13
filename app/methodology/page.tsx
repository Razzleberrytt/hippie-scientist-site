import type { Metadata } from 'next'
import Link from 'next/link'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { TrustMethodologyCallout } from '@/components/monetization/TrustMethodologyCallout'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import { SEO_YEAR } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'How We Grade Evidence — Methodology',
  description:
    'How The Hippie Scientist weighs human evidence, safety, practical usefulness, and uncertainty for supplement decision support. See the exact grade definitions.',
  alternates: { canonical: '/methodology' },
}

const GRADE_ROWS: { grade: string; meaning: string; evidence: string; treatment: string; cls: string }[] = [
  {
    grade: 'Strong evidence',
    meaning: 'Consistent benefit for a defined use.',
    evidence: 'Multiple well-designed RCTs and/or meta-analyses that broadly agree.',
    treatment: 'Stated confidently, with dose, timing, and safety boundaries.',
    cls: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    grade: 'Moderate evidence',
    meaning: 'Real but qualified support.',
    evidence: 'Several RCTs with smaller samples, some heterogeneity, or short duration.',
    treatment: 'Presented as reasonable to try, with the qualifiers made explicit.',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    grade: 'Limited evidence',
    meaning: 'Promising but unsettled.',
    evidence: 'Few or small human trials, mixed results, or strong dependence on baseline status.',
    treatment: 'Framed as "may help some people," never as a recommendation.',
    cls: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    grade: 'Preliminary evidence',
    meaning: 'Mechanism-led, not yet human-proven.',
    evidence: 'Mostly preclinical, animal, in-vitro, or mechanistic plausibility.',
    treatment: 'Clearly labeled as early; interesting does not mean effective.',
    cls: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  {
    grade: 'Insufficient evidence',
    meaning: 'Not established.',
    evidence: 'No credible human data, or evidence too weak to interpret.',
    treatment: 'No efficacy claims are made; safety context only.',
    cls: 'bg-rose-50 text-rose-800 border-rose-200',
  },
]

export default function MethodologyPage() {
  return (
    <div className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Methodology</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>How The Hippie Scientist Ranks Supplements</h1>
        <p className='mt-4 max-w-3xl text-muted'>
          Rankings are designed as transparent decision support. They are not medical advice and do not guarantee that a supplement is right for a specific person.
        </p>
        <div className='mt-5'>
          <LastUpdatedBadge date={`${SEO_YEAR}-06-01`} />
        </div>
      </section>

      <TrustMethodologyCallout />

      <section className='card-premium p-6 sm:p-8'>
        <h2 className='text-xl font-semibold text-ink'>How we grade the evidence</h2>
        <p className='mt-2 max-w-3xl text-sm leading-7 text-muted'>
          Every profile and digest entry is graded against the same five-level scale. The grade reflects
          the strength and consistency of <strong>controlled human research</strong>, not popularity,
          tradition, or marketing. Grades can change as new trials are published.
        </p>
        <div className='mt-6 overflow-x-auto'>
          <table className='min-w-full border-collapse text-left text-sm'>
            <thead>
              <tr className='border-b border-brand-900/10'>
                <th className='py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink'>Grade</th>
                <th className='py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink'>What it means</th>
                <th className='py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink'>Typical evidence behind it</th>
                <th className='py-3 text-xs font-bold uppercase tracking-wider text-ink'>How we treat it</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_ROWS.map((row) => (
                <tr key={row.grade} className='border-b border-brand-900/5 align-top last:border-0'>
                  <td className='py-3 pr-4'>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${row.cls}`}>
                      {row.grade}
                    </span>
                  </td>
                  <td className='py-3 pr-4 font-medium text-ink'>{row.meaning}</td>
                  <td className='py-3 pr-4 text-muted'>{row.evidence}</td>
                  <td className='py-3 text-muted'>{row.treatment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className='mt-5 text-sm text-muted'>
          See the grades applied in practice in the{' '}
          <Link href='/evidence-digest' className='font-medium text-emerald-700 hover:underline'>Evidence Digest</Link>, or read
          the deeper{' '}
          <Link href='/education/research-methodology' className='font-medium text-emerald-700 hover:underline'>research methodology</Link> and{' '}
          <Link href='/education/evidence-hierarchy' className='font-medium text-emerald-700 hover:underline'>evidence hierarchy</Link>.
        </p>
      </section>

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
