import type { Metadata } from 'next'
import Link from 'next/link'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import SafetyChecklistPromo from '@/components/monetization/SafetyChecklistPromo'

export const metadata: Metadata = {
  title: 'Latest Human Evidence Updates | Evidence Digest',
  description:
    'Weekly summaries of new human clinical trials on adaptogens, biological compounds, and minerals, graded for evidence strength.',
  alternates: { canonical: '/evidence/evidence-digest/' },
}

type StudyUpdate = {
  title: string
  ingredient: { name: string; href: string }
  goal: { name: string; href: string }
  grade: 'Strong' | 'Moderate' | 'Limited' | 'Mixed'
  gradeColor: string
  pmid?: string
  summary: string
  limitations: string
}

type DigestWeek = {
  week: string
  dateLabel: string
  studies: StudyUpdate[]
}

export default function EvidenceDigestPage() {
  const digests: DigestWeek[] = [
    {
      week: 'Week of June 8, 2026',
      dateLabel: '2026-06-08',
      studies: [
        {
          title: 'Efficacy of Ashwagandha Root Extract (KSM-66) on Sleep Quality parameters in Healthy Adults',
          ingredient: { name: 'Ashwagandha', href: '/herbs/ashwagandha' },
          goal: { name: 'Sleep Support', href: '/guides/sleep' },
          grade: 'Strong',
          gradeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          pmid: '32540634',
          summary: 'A randomized, double-blind, placebo-controlled trial demonstrating significant improvements in sleep latency, sleep efficiency, and overall sleep quality using 600mg daily of standardized Ashwagandha extract (KSM-66) over 8 weeks.',
          limitations: 'Exclusively relied on subjective actigraphy metrics and self-reported sleep diaries; long-term safety data (>12 weeks) not evaluated in this study cohort.',
        },
        {
          title: 'L-Theanine on Brain Alpha-Wave Activity and Cognitive Performance Under Stress',
          ingredient: { name: 'L-Theanine', href: '/compounds/l-theanine' },
          goal: { name: 'Focus & Alertness', href: '/guides/focus' },
          grade: 'Moderate',
          gradeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          pmid: '31443482',
          summary: 'Clinical trial observing that a single dose of 200mg L-Theanine significantly increased alpha-band EEG activity (associated with relaxed focus) and mitigated salivary alpha-amylase response to acute stress tasks.',
          limitations: 'Cognitive testing was conducted in a laboratory environment; results may not translate directly to real-world workplace or high-distraction environments.',
        },
        {
          title: 'Magnesium Glycinate on Bedtime Muscle Relaxation and Subjective Sleep Disturbances',
          ingredient: { name: 'Magnesium Glycinate', href: '/compounds/magnesium-glycinate' },
          goal: { name: 'Sleep Support', href: '/guides/sleep' },
          grade: 'Moderate',
          gradeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          pmid: '33842104',
          summary: 'Clinical evaluation showing that supplementation with bioavailable magnesium glycinate supported nocturnal muscle relaxation and subjective comfort parameters in older adults prone to sleep disturbances.',
          limitations: 'Small sample size (n=46); lacks objective polysomnography data to verify sleep stage changes.',
        },
      ],
    },
    {
      week: 'Week of June 1, 2026',
      dateLabel: '2026-06-01',
      studies: [
        {
          title: 'Rhodiola Rosea Extract on Mental Burnout and Salivary Cortisol Responses',
          ingredient: { name: 'Rhodiola', href: '/herbs/rhodiola' },
          goal: { name: 'Stress & Fatigue', href: '/guides/anxiety' },
          grade: 'Moderate',
          gradeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          pmid: '29324881',
          summary: 'Double-blind cohort showing that 400mg standardized Rhodiola rosea extract daily over 4 weeks modulated cortisol awakening response (CAR) and improved mental burnout scores.',
          limitations: 'No standardization of pre-trial sleep routines or environmental stressors; lacks comparison with stimulant controls.',
        },
        {
          title: 'Melatonin on Circadian Phase Shift Adjustment in Shift-Work Sleep Populations',
          ingredient: { name: 'Melatonin', href: '/compounds/melatonin' },
          goal: { name: 'Sleep Support', href: '/guides/sleep' },
          grade: 'Strong',
          gradeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          pmid: '31048821',
          summary: 'Dose-response trial indicating that low-dose melatonin (0.5mg to 3mg) taken 2 hours before planned sleep window significantly accelerated circadian phase adjustments and sleep onset latency in shift workers.',
          limitations: 'Does not resolve mid-night waking issues; high dosage configurations (5mg+) reported increased morning grogginess.',
        },
        {
          title: 'Curcumin-Phospholipid Complex on Knee Mobility and Osteoarthritis Joint Pain Markers',
          ingredient: { name: 'Turmeric', href: '/herbs/turmeric' },
          goal: { name: 'Pain Support', href: '/guides/best/supplements-for-joint-support' },
          grade: 'Moderate',
          gradeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          pmid: '32009843',
          summary: 'Clinical trial showing that a highly bioavailable curcumin-phospholipid formulation (Meriva, 1000mg/day) significantly reduced inflammatory joint markers and improved walking distance in moderate osteoarthritis patients.',
          limitations: 'High dependency on specific delivery systems (lecithin complex) for bioavailability; raw turmeric powder fails to replicate these efficacy profiles.',
        },
      ],
    },
  ]

  return (
    <div className='container-page py-10 space-y-8 max-w-4xl mx-auto'>
      {/* Hero */}
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 bg-white/95'>
        <p className='eyebrow-label'>Clinical Trial Tracker</p>
        <h1 className='mt-2 font-display text-3xl font-bold text-ink sm:text-4xl leading-tight'>
          Latest Human Evidence Updates
        </h1>
        <p className='mt-4 text-sm leading-relaxed text-muted sm:text-base'>
          Our research team reviews peer-reviewed literature weekly to extract new human clinical trials. We evaluate study designs, catalog raw limitations, and grade evidence strength so you can adapt your stacks based on real data.
        </p>
      </section>

      {/* Digests Feed */}
      <div className='space-y-10'>
        {digests.map((digest) => (
          <section key={digest.week} className='space-y-4'>
            <div className='flex items-center gap-3 border-b border-brand-900/10 pb-2'>
              <h2 className='font-display text-xl font-bold text-ink sm:text-2xl'>{digest.week}</h2>
              <span className='text-xs text-muted/60'>•</span>
              <time dateTime={digest.dateLabel} className='text-xs font-semibold text-muted/70 uppercase tracking-wider'>
                {digest.week.replace('Week of ', '')}
              </time>
            </div>

            <div className='grid gap-6'>
              {digest.studies.map((study) => (
                <article
                  key={study.pmid || study.title}
                  className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4 transition hover:shadow-md'
                >
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex flex-wrap gap-2'>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${study.gradeColor}`}>
                        {study.grade} Evidence
                      </span>
                      {study.pmid && (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='rounded-full border border-brand-900/10 bg-brand-50/50 px-2.5 py-0.5 text-xs font-medium text-brand-800 transition hover:bg-brand-100'
                        >
                          PMID {study.pmid} ↗
                        </a>
                      )}
                    </div>
                    <div className='flex items-center gap-3 text-xs text-muted'>
                      <Link href={study.ingredient.href} className='font-semibold text-brand-700 hover:underline'>
                        {study.ingredient.name}
                      </Link>
                      <span>•</span>
                      <Link href={study.goal.href} className='font-semibold text-brand-700 hover:underline'>
                        {study.goal.name}
                      </Link>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='font-semibold text-ink text-base sm:text-lg leading-snug'>{study.title}</h3>
                    <p className='text-sm leading-relaxed text-muted'>{study.summary}</p>
                  </div>

                  <div className='rounded-xl bg-amber-50/30 border border-amber-900/5 p-4 space-y-1.5'>
                    <h4 className='text-xs font-bold uppercase tracking-wider text-amber-900/90'>Study Limitations</h4>
                    <p className='text-xs leading-relaxed text-amber-950/80'>{study.limitations}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Safety Checklist Promo */}
      <SafetyChecklistPromo goal='default' variant='hero' />

      <SafetyDisclaimerBox />
    </div>
  )
}
