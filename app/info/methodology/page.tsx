import type { Metadata } from 'next'
import Link from 'next/link'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { TrustMethodologyCallout } from '@/components/monetization/TrustMethodologyCallout'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildToolPageSchemaGraph } from '../../src/lib/schema-graph'
import { SITE_URL } from '../../src/lib/seo'

export const metadata: Metadata = {
  title: 'How We Grade Evidence & Methodology',
  description:
    'Detailed review of The Hippie Scientist evidence grading levels, Conflict of Interest policy, conservative framing rules, and editorial credentials.',
  alternates: { canonical: '/methodology/' },
}

export default function MethodologyPage() {
  const grades = [
    {
      level: 'Strong Evidence',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Multiple robust, randomized controlled trials (RCTs) in humans showing consistent, statistically significant positive outcomes. High confidence in reproducibility.',
    },
    {
      level: 'Moderate Evidence',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Supported by clinical cohort studies, well-conducted small-scale RCTs, or a single highly powered trial. Good evidence for efficacy, though further research is needed to resolve minor questions.',
    },
    {
      level: 'Limited Evidence',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Backed primarily by exploratory pilot trials, animal models, or in-vitro cell culture work establishing mechanistic plausibility. Should not be treated as clinically verified.',
    },
    {
      level: 'Mixed Evidence',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Contradictory findings in peer-reviewed clinical studies. Efficacy is highly variable depending on individual neurochemistry, dosage forms, or trial population configurations.',
    },
    {
      level: 'Traditional Only',
      badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      description: 'Based solely on historical botanical usage, ethnobotanical reports, or anecdotal case studies. Lacks modern validation via clinical double-blind protocols.',
    },
    {
      level: 'Insufficient / Risk-Heavy',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'No credible data to support efficacy, or carries significant toxicological and pharmaceutical interaction risks that outweigh potential benefits.',
    },
  ]

  const schemaGraph = buildToolPageSchemaGraph({
    path: '/methodology',
    title: 'How We Grade Evidence & Methodology',
    description:
      'Detailed review of The Hippie Scientist evidence grading levels, conflict-of-interest policy, conservative framing rules, and editorial credentials.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Methodology', url: `${SITE_URL}/methodology/` },
    ],
    faqQuestions: [
      {
        question: 'How does The Hippie Scientist grade evidence?',
        answer:
          'Evidence grades prioritize clinical human trials, consistency, study design, and reproducibility. Mechanistic, animal, and in-vitro findings are treated as limited or preliminary unless human outcome data support the claim.',
      },
      {
        question: 'Do affiliate links affect evidence grades?',
        answer:
          'No. Product placement and affiliate revenue do not affect evidence grades, safety warnings, or editorial conclusions. The site states risks plainly when an ingredient lacks support or carries meaningful interaction concerns.',
      },
      {
        question: 'Why are some supplement claims framed conservatively?',
        answer:
          'Supplement evidence often depends on population, dose, preparation, trial duration, and outcome measure. Conservative framing prevents preclinical mechanisms or small exploratory studies from being presented as settled clinical proof.',
      },
    ],
  })

  return (
    <div className='container-page py-10 space-y-8 max-w-4xl mx-auto'>
      <SchemaGraphScript graph={schemaGraph} />
      {/* Hero */}
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 bg-white/95'>
        <p className='eyebrow-label'>E-E-A-T Editorial Standard</p>
        <h1 className='mt-2 font-display text-3xl font-bold text-ink sm:text-4xl leading-tight'>
          Evidence Grading &amp; Research Methodology
        </h1>
        <p className='mt-4 text-sm leading-relaxed text-muted sm:text-base'>
          Supplement science is cluttered with hype. At <strong>The Hippie Scientist</strong>, we operate under a strict, conservative evidence-first framework. We separate preclinical mechanisms from actual human outcomes, ensuring you make choices rooted in clinical science.
        </p>
      </section>

      <TrustMethodologyCallout />

      {/* 1. Evidence Grading Levels */}
      <section className='card-premium p-6 sm:p-8 space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>How We Grade Evidence</h2>
          <p className='text-sm text-muted'>
            Every compound, herb, and stack recommendation is assigned an evidence tier to represent our confidence in clinical human trials.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {grades.map((item) => (
            <article key={item.level} className='rounded-2xl border border-brand-900/5 bg-white p-5 space-y-3 shadow-sm'>
              <div className='flex items-center gap-2'>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.badgeColor}`}>
                  {item.level}
                </span>
              </div>
              <p className='text-xs sm:text-sm leading-relaxed text-muted'>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Conservative Framing Policies */}
      <section className='card-premium p-6 sm:p-8 space-y-6'>
        <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>Conservative Framing Guidelines</h2>
        <div className='grid gap-6 sm:grid-cols-3 text-sm text-muted'>
          <div className='space-y-2'>
            <h3 className='font-bold text-ink'>Human Trials Prioritization</h3>
            <p className='text-xs leading-relaxed'>
              We do not extrapolate rodent or test-tube mechanisms into human dosing instructions. If an ingredient only has mechanistic or animal studies, it is marked as having "limited" evidence.
            </p>
          </div>
          <div className='space-y-2'>
            <h3 className='font-bold text-ink'>Emphasizing Limitations</h3>
            <p className='text-xs leading-relaxed'>
              We highlight clinical trials limitations, such as small sample sizes, brief study durations, self-reported metrics, and potential biases from industry sponsorships.
            </p>
          </div>
          <div className='space-y-2'>
            <h3 className='font-bold text-ink'>Dosage &amp; Bioavailability</h3>
            <p className='text-xs leading-relaxed'>
              Active constituents vary wildly across botanical products. We detail the exact standardized extracts (e.g. KSM-66 for ashwagandha) and bioavailable forms required to replicate clinical results.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Conflict of Interest */}
      <section className='card-premium p-6 sm:p-8 space-y-4 border-l-4 border-emerald-600 bg-emerald-50/10'>
        <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>Conflict of Interest &amp; Independence Statement</h2>
        <p className='text-sm leading-relaxed text-muted'>
          <strong>The Hippie Scientist</strong> is completely self-funded and editorially independent. We do not accept brand sponsorships, paid reviews, or direct compensation from supplement companies.
        </p>
        <p className='text-sm leading-relaxed text-muted'>
          Our editorial grades are set solely by our research team based on peer-reviewed literature. While we use affiliate links to support our hosting costs, product placement has zero impact on evidence grades, safety warnings, or brand reviews. If an ingredient carries risk or fails clinical standards, we state it plainly.
        </p>
        <div className='pt-2 flex flex-wrap gap-4'>
          <Link href='/affiliate-disclosure' className='text-sm font-semibold text-emerald-800 hover:underline'>
            Affiliate Disclosure →
          </Link>
          <Link href='/disclaimer' className='text-sm font-semibold text-emerald-800 hover:underline'>
            Medical Disclaimer →
          </Link>
        </div>
      </section>

      {/* 4. Credentials & Team */}
      <section className='card-premium p-6 sm:p-8 space-y-4 bg-white/95'>
        <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>Our Research &amp; Editorial Credentials</h2>
        <p className='text-sm leading-relaxed text-muted'>
          Our pages are authored, validated, and updated by <strong>The Hippie Scientist Research Team</strong> — a collective of neurochemistry researchers, toxicology reviewers, and evidence-based nutrition analysts.
        </p>
        <div className='grid gap-4 sm:grid-cols-2 text-xs text-muted leading-relaxed'>
          <div className='rounded-xl border border-brand-900/5 bg-brand-50/20 p-4'>
            <h4 className='font-bold text-ink text-sm'>Will R.</h4>
            <p className='text-brand-700 font-medium mb-1'>Chief Content Systems Architect</p>
            <p>Directs the content architecture and cross-references ingredient profiles against active clinical trial endpoints on ClinicalTrials.gov and PubMed.</p>
          </div>
          <div className='rounded-xl border border-brand-900/5 bg-brand-50/20 p-4'>
            <h4 className='font-bold text-ink text-sm'>Research Team</h4>
            <p className='text-brand-700 font-medium mb-1'>Medical Literature &amp; Toxicology Review</p>
            <p>Validates dosage limits, pregnancy cautions, drug-supplement interaction indices, and parses clinical abstracts for evidence grading verification.</p>
          </div>
        </div>
      </section>

      <SafetyDisclaimerBox />
    </div>
  )
}
