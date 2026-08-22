import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'
import EmailCapture from '@/components/EmailCapture'
import { buildTwitterMetadata } from '@/src/lib/seo'

const PAGE_URL = `${SITE_URL}/guides/adhd/melatonin-for-adhd-sleep`

export const metadata: Metadata = {
  title: 'Melatonin for ADHD: Sleep Evidence, Safety & Timing',
  description:
    'Evidence-first review of melatonin for ADHD-related sleep problems, including the 2026 RCT meta-analysis, pediatric and adult trials, circadian timing, stimulant-treated data, long-term safety and label accuracy.',
  alternates: { canonical: '/guides/adhd/melatonin-for-adhd-sleep/' },
  openGraph: {
    title: 'Melatonin for ADHD: Sleep Evidence, Safety & Timing',
    description:
      'Melatonin can help selected ADHD-related sleep-onset and circadian problems, but that is not the same as treating ADHD itself.',
    url: '/guides/adhd/melatonin-for-adhd-sleep/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Melatonin for ADHD: Sleep Evidence, Safety & Timing',
    description: 'Separate ADHD sleep evidence from direct ADHD-treatment claims, with pediatric, adult, safety and product-quality data.',
  }),
}

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 align-super text-[0.7em] font-semibold text-brand-700">
      <a href={`#ref-${n}`} aria-label={`Reference ${n}`} className="hover:underline">[{n}]</a>
    </sup>
  )
}

const FAQS = [
  {
    question: 'Does melatonin help people with ADHD sleep?',
    answer:
      'It can help selected sleep problems, especially sleep-onset delay and circadian delay. Pediatric randomized trials show earlier sleep onset, and adult ADHD data show circadian phase shifting in people with delayed sleep phase syndrome. That does not mean melatonin works for every sleep problem in ADHD.',
  },
  {
    question: 'Does melatonin treat ADHD symptoms?',
    answer:
      'The strongest pediatric ADHD trials do not establish a direct ADHD treatment effect. Sleep improved without significant improvement in behavior, cognition, quality of life, attention-deficit scores, or hyperactivity scores. A small adult circadian trial found a temporary self-reported symptom reduction after melatonin alone, but the effect disappeared after treatment ended and was not reproduced in the melatonin-plus-bright-light arm.',
  },
  {
    question: 'Can melatonin be used with stimulant medication?',
    answer:
      'Melatonin has been studied in stimulant-treated children with ADHD, including randomized trials. That provides direct evidence that co-use has occurred under study conditions, but it is not a blanket interaction-safety guarantee for every stimulant, dose, child, medication schedule, or coexisting condition.',
  },
  {
    question: 'What melatonin dose is best for ADHD?',
    answer:
      'There is no universal evidence-based ADHD dose. Different trials used different regimens for different sleep and circadian targets. Study doses are evidence about those interventions, not a personalized consumer protocol, and U.S. supplement content can differ substantially from the label.',
  },
  {
    question: 'When should melatonin be taken for ADHD sleep problems?',
    answer:
      'There is no one clock-time rule. Sleep-promotion and circadian phase-shifting are different targets. Adult chronotherapy research timed melatonin relative to each participant’s measured dim-light melatonin onset, while pediatric sleep-onset studies used other schedules. Timing should match the actual sleep problem rather than be copied from a generic bedtime rule.',
  },
  {
    question: 'Is long-term melatonin safe for children with ADHD?',
    answer:
      'Long-term follow-up in an ADHD cohort was reassuring for serious treatment-related events, but it was observational rather than a long-duration randomized safety trial. A broader pediatric systematic review found no serious-adverse-event signal in randomized studies but more non-serious adverse events and substantial uncertainty about very long-term developmental effects. Long-term safety is therefore not fully characterized.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'meta-analysis', text: 'What the 2026 meta-analysis changes', level: 2 },
  { id: 'pediatric', text: 'Pediatric ADHD evidence', level: 2 },
  { id: 'stimulants', text: 'Stimulant-treated children', level: 2 },
  { id: 'adults', text: 'Adult ADHD and circadian delay', level: 2 },
  { id: 'phenotype', text: 'Match the sleep phenotype', level: 2 },
  { id: 'timing', text: 'Dose and timing boundaries', level: 2 },
  { id: 'safety', text: 'Safety and long-term uncertainty', level: 2 },
  { id: 'quality', text: 'Product quality and label accuracy', level: 2 },
  { id: 'evidence-ledger', text: 'What the evidence supports', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const REFS = [
  { n: 1, title: 'The influence of existing interventions on sleep of youth with ADHD: a meta-analysis of randomized controlled trials', text: 'Fang Y, Wang Z, Zhang M, Sun F. Sleep Med Rev. 2026;88:102303.', year: 2026, pmid: '42096966', doi: '10.1016/j.smrv.2026.102303', url: 'https://pubmed.ncbi.nlm.nih.gov/42096966/' },
  { n: 2, title: 'Effect of melatonin on sleep, behavior, and cognition in ADHD and chronic sleep-onset insomnia', text: 'Van der Heijden KB, et al. J Am Acad Child Adolesc Psychiatry. 2007;46(2):233-241.', year: 2007, pmid: '17242627', url: 'https://pubmed.ncbi.nlm.nih.gov/17242627/' },
  { n: 3, title: 'Sleep hygiene and melatonin treatment for children and adolescents with ADHD and initial insomnia', text: 'Weiss MD, et al. J Am Acad Child Adolesc Psychiatry. 2006;45(5):512-519.', year: 2006, pmid: '16670647', url: 'https://pubmed.ncbi.nlm.nih.gov/16670647/' },
  { n: 4, title: 'Melatonin effects in methylphenidate treated children with attention deficit hyperactivity disorder: a randomized double blind clinical trial', text: 'Mohammadi MR, et al. Iran J Psychiatry. 2012;7(2):87-92.', year: 2012, pmid: '22952551', url: 'https://pubmed.ncbi.nlm.nih.gov/22952551/' },
  { n: 5, title: 'Effects of chronotherapy on circadian rhythm and ADHD symptoms in adults with ADHD and delayed sleep phase syndrome', text: 'van Andel E, et al. Chronobiol Int. 2021;38(2):260-269.', year: 2021, pmid: '33121289', doi: '10.1080/07420528.2020.1835943', url: 'https://pubmed.ncbi.nlm.nih.gov/33121289/' },
  { n: 6, title: 'ADHD and delayed sleep phase syndrome in adults: randomized chronotherapy trial on sleep', text: 'van Andel E, et al. J Biol Rhythms. 2022;37(6):673-689.', year: 2022, pmid: '36181304', doi: '10.1177/07487304221124659', url: 'https://pubmed.ncbi.nlm.nih.gov/36181304/' },
  { n: 7, title: 'Sleep interventions for children with ADHD: a systematic literature review', text: 'Larsson I, et al. Sleep Med. 2023;102:64-75.', year: 2023, pmid: '36603513', doi: '10.1016/j.sleep.2022.12.021', url: 'https://pubmed.ncbi.nlm.nih.gov/36603513/' },
  { n: 8, title: 'Behavioral sleep interventions for children with ADHD: a systematic review and meta-analysis', text: 'Systematic review/meta-analysis of behavioral sleep treatment in school-aged children with ADHD.', year: 2022, pmid: '35758199', url: 'https://pubmed.ncbi.nlm.nih.gov/35758199/' },
  { n: 9, title: 'Long-term follow-up of melatonin treatment in children with ADHD and chronic sleep onset insomnia', text: 'Hoebert M, et al. J Pineal Res. 2009.', year: 2009, pmid: '19486273', doi: '10.1111/j.1600-079X.2009.00681.x', url: 'https://pubmed.ncbi.nlm.nih.gov/19486273/' },
  { n: 10, title: 'Short-term and long-term adverse effects of melatonin treatment in children and adolescents: systematic review and GRADE assessment', text: 'Händel MN, et al. EClinicalMedicine. 2023;61:102083.', year: 2023, pmid: '37483551', doi: '10.1016/j.eclinm.2023.102083', url: 'https://pubmed.ncbi.nlm.nih.gov/37483551/' },
  { n: 11, title: 'A Survey of Melatonin in Dietary Supplement Products Sold in the United States', text: 'Pawar RS, et al. Drug Test Anal. 2025;17(8):1176-1185.', year: 2025, pmid: '39482109', doi: '10.1002/dta.3823', url: 'https://pubmed.ncbi.nlm.nih.gov/39482109/' },
  { n: 12, title: 'Quantity of Melatonin and CBD in Melatonin Gummies Sold in the United States', text: 'Cohen PA, et al. JAMA. 2023.', year: 2023, pmid: '37097362', doi: '10.1001/jama.2023.2296', url: 'https://pubmed.ncbi.nlm.nih.gov/37097362/' },
  { n: 13, title: 'Health Advisory: Melatonin Use in Children and Adolescents', text: 'American Academy of Sleep Medicine. Pediatric melatonin safety advisory.', year: 2022, url: 'https://aasm.org/wp-content/uploads/2022/09/melatonin-children-adolescents-health-advisory.pdf' },
  { n: 14, title: 'Melatonin for chronic sleep onset insomnia in children: a randomized placebo-controlled trial', text: 'Smits MG, et al. J Child Neurol. 2001.', year: 2001, pmid: '11292231', url: 'https://pubmed.ncbi.nlm.nih.gov/11292231/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Melatonin for ADHD: Sleep Evidence, Safety & Timing"
        description="Evidence-first review of melatonin for ADHD-related sleep problems, separating sleep and circadian outcomes from direct ADHD treatment claims."
        datePublished="2026-06-10"
        dateModified="2026-08-22"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'ADHD', href: '/guides/adhd/' },
          { label: 'Melatonin for ADHD Sleep', href: '/guides/adhd/melatonin-for-adhd-sleep/' },
        ]}
      />

      <div className="space-y-12">
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">ADHD sleep evidence guide · 14-source ledger</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Melatonin for ADHD: What It Helps, What It Does Not, and Why Timing Matters</h1>
          <p className="mt-2 text-xs text-muted">Last evidence review August 22, 2026</p>
          <p className="detail-reading mt-4 max-w-3xl text-muted">
            Melatonin has one of the clearer supplement evidence bases for <strong>selected sleep-onset and circadian problems in ADHD</strong>, especially in children. But a sleep benefit is not the same as a treatment for ADHD itself. The strongest pediatric randomized trial improved sleep timing and total sleep without significantly improving behavior, cognition, or quality of life.<Cite n={2} /> A new 2026 meta-analysis also reinforces that sleep-onset latency and broader sleep disturbance are different outcomes that may respond to different interventions.<Cite n={1} />
          </p>
        </section>

        <section id="quick-answer" className="card-premium scroll-mt-20 border-brand-700/30 bg-brand-50/60 p-6">
          <p className="eyebrow-label">Direct answer</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Does melatonin help ADHD?</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p><strong className="text-ink">For sleep onset/circadian timing: yes, in selected populations.</strong> Randomized pediatric ADHD studies show earlier sleep onset, and the adult ADHD literature includes a small trial in delayed sleep phase syndrome showing a substantial shift in dim-light melatonin onset.<Cite n={2} /><Cite n={5} /></p>
            <p><strong className="text-ink">For core ADHD symptoms: not established.</strong> Key pediatric trials improved sleep without statistically significant ADHD, behavior, or cognition benefits.<Cite n={2} /><Cite n={3} /><Cite n={4} /></p>
            <p><strong className="text-ink">For every kind of insomnia: no.</strong> The evidence is concentrated around sleep-onset difficulty and circadian delay, not all-cause nighttime waking, sleep apnea, restless legs, anxiety-driven insomnia, insufficient sleep opportunity, or every medication-related sleep complaint.<Cite n={1} /><Cite n={7} /></p>
          </div>
        </section>

        <section id="meta-analysis" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Newest evidence</p>
          <h2 className="text-2xl font-semibold text-ink">The 2026 meta-analysis separates “fall asleep faster” from “sleep better overall”</h2>
          <p className="text-sm leading-7 text-muted">
            The August 2026 Sleep Medicine Reviews meta-analysis included <strong>40 randomized trials and 4,361 children/adolescents with ADHD</strong>; 28 trials entered a Bayesian network meta-analysis and 75% were judged low risk of bias.<Cite n={1} /> Across interventions, effects on sleep disturbance and sleep-onset latency were small but statistically significant.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-brand-50/70"><tr><th className="p-3 font-semibold text-ink">Outcome</th><th className="p-3 font-semibold text-ink">2026 synthesis</th><th className="p-3 font-semibold text-ink">Interpretation</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3 font-semibold text-ink">Overall sleep disturbance</td><td className="p-3">Behavioral sleep interventions showed a significant pooled benefit; the “sleeping pills” subgroup did not.<Cite n={1} /></td><td className="p-3">A pill that shortens sleep onset is not automatically the best intervention for the whole sleep problem.</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Sleep-onset latency</td><td className="p-3">The “sleeping pills” subgroup significantly shortened latency in the pooled analysis.<Cite n={1} /></td><td className="p-3">This is the outcome most aligned with the classic ADHD/melatonin evidence base.</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Sleep duration / efficiency / daytime sleepiness</td><td className="p-3">No significant overall effects were established in the 2026 synthesis.<Cite n={1} /></td><td className="p-3">Do not turn a latency effect into a universal “better sleep” claim.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-7 text-muted">The authors concluded that tailored, multicomponent strategies are important and that more rigorous evidence is still needed.<Cite n={1} /> That fits the earlier ADHD sleep literature, where behavioral interventions also showed meaningful effects on broader sleep disturbance.<Cite n={7} /><Cite n={8} /></p>
        </section>

        <section id="pediatric" className="card-premium scroll-mt-20 p-6">
          <p className="eyebrow-label">Best direct trial</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">The 105-child trial supports sleep timing—not an ADHD-treatment claim</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            In the landmark randomized double-blind placebo-controlled trial, 105 medication-free children ages 6–12 with rigorously diagnosed ADHD and chronic sleep-onset insomnia received melatonin or placebo for four weeks.<Cite n={2} /> Sleep onset advanced by about 27 minutes in the melatonin group while becoming later in the placebo group; dim-light melatonin onset shifted earlier and total time asleep increased relative to placebo.<Cite n={2} />
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            The same trial found <strong className="text-ink">no significant improvement in behavior, cognition, or quality of life</strong> and no significant adverse events during the short study.<Cite n={2} /> That negative result belongs in the headline interpretation, not buried after the sleep benefit.
          </p>
        </section>

        <section id="stimulants" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Medication context</p>
          <h2 className="text-2xl font-semibold text-ink">Melatonin has been studied with stimulants—but that is not blanket interaction clearance</h2>
          <p className="text-sm leading-7 text-muted">
            A 2006 study enrolled 27 stimulant-treated children with ADHD and substantial initial insomnia. Sleep hygiene came first; some children improved before medication was added. Nonresponders then entered a placebo-controlled crossover melatonin trial, where initial insomnia was reduced by about 16 minutes relative to placebo.<Cite n={3} /> Improved sleep did not produce a demonstrable ADHD-symptom benefit.<Cite n={3} />
          </p>
          <p className="text-sm leading-7 text-muted">
            A separate randomized double-blind trial added melatonin to methylphenidate and found partial improvement in sleep measures without a statistically significant difference in ADHD scores.<Cite n={4} /> These studies show that stimulant-treated cohorts have been researched; they do not prove that every stimulant schedule, dose, non-stimulant medicine, or polypharmacy combination is equivalent.
          </p>
          <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-sm leading-6 text-muted"><strong className="text-ink">Clinical edge:</strong> when sleep worsens after an ADHD medication change, medication timing, duration of action, dose, rebound, caffeine and the underlying sleep disorder are part of the causal question. Adding melatonin without reviewing those variables can obscure the driver.</div>
        </section>

        <section id="adults" className="card-premium scroll-mt-20 p-6">
          <p className="eyebrow-label">Adult evidence</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Adult ADHD data are smaller and more circadian-specific</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            A randomized trial in 51 adults with ADHD and delayed sleep phase syndrome used individually timed melatonin, placebo, or melatonin plus morning bright light therapy. Melatonin advanced dim-light melatonin onset by about 1 hour 28 minutes, while melatonin plus bright light advanced it by about 1 hour 58 minutes.<Cite n={5} />
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Self-reported ADHD symptoms fell 14% immediately after melatonin alone, but not in the placebo or combination arm, and both circadian timing and symptoms returned to baseline two weeks after treatment ended.<Cite n={5} /> A later analysis found that advancing the circadian marker did not automatically advance actual sleep times or broadly improve sleep, supporting the need for behavioral coaching around chronotherapy.<Cite n={6} />
          </p>
          <p className="mt-3 text-sm leading-7 text-muted"><strong className="text-ink">Interpretation:</strong> the reproducible signal is circadian phase shifting in a selected delayed-phase population—not evidence that melatonin is a durable adult ADHD medication.</p>
        </section>

        <section id="phenotype" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Diagnostic directness</p>
          <h2 className="text-2xl font-semibold text-ink">“ADHD + can’t sleep” is not one sleep diagnosis</h2>
          <p className="text-sm leading-7 text-muted">The best melatonin evidence on this page is concentrated in <strong className="text-ink">sleep-onset insomnia and delayed circadian timing</strong>.<Cite n={2} /><Cite n={5} /> Persistent sleep difficulty in ADHD can also reflect stimulant timing, behavioral insomnia, anxiety, inconsistent sleep opportunity, restless legs/periodic limb movement, sleep-disordered breathing, another circadian disorder, or a separate medical/psychiatric problem.</p>
          <p className="text-sm leading-7 text-muted">That is why the 2026 meta-analysis matters: different intervention classes performed differently depending on the sleep endpoint.<Cite n={1} /> Matching the intervention to the phenotype is more evidence-based than treating “insomnia” as one interchangeable problem.</p>
        </section>

        <section id="timing" className="card-premium scroll-mt-20 p-6">
          <p className="eyebrow-label">Dose and timing boundary</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Trial regimens are not a universal ADHD bedtime protocol</h2>
          <p className="mt-3 text-sm leading-7 text-muted">Pediatric ADHD trials used study-specific regimens, while the adult delayed-phase trial used a much lower amount timed relative to each participant’s measured circadian phase and adjusted that schedule during treatment.<Cite n={2} /><Cite n={3} /><Cite n={5} /></p>
          <p className="mt-3 text-sm leading-7 text-muted">That heterogeneity is scientifically important. It means the literature does <strong className="text-ink">not</strong> establish one optimal ADHD dose, one “30–60 minutes before bed” rule, a universal extended-release preference, or a dose-escalation ladder. Timing for sleep promotion and timing for circadian phase shifting are not necessarily the same intervention.</p>
          <p className="mt-3 text-sm leading-7 text-muted">A non-ADHD pediatric randomized trial also demonstrates why timing belongs to the intervention itself: melatonin shifted both sleep and endogenous circadian timing in chronic sleep-onset insomnia.<Cite n={14} /> It should be used as mechanistic/context evidence, not copied into an ADHD protocol.</p>
        </section>

        <section id="safety" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Safety hierarchy</p>
          <h2 className="text-2xl font-semibold text-ink">Short-term tolerability is better characterized than years of pediatric exposure</h2>
          <p className="text-sm leading-7 text-muted">The original pediatric ADHD randomized trial did not identify significant adverse events during four weeks.<Cite n={2} /> A later questionnaire follow-up of 94 former trial participants, an average of 3.7 years later, found no reported serious treatment-related events and many families still using melatonin.<Cite n={9} /> That is reassuring, but an uncontrolled follow-up cannot establish long-term safety with the certainty of a multi-year randomized trial.</p>
          <p className="text-sm leading-7 text-muted">A broader 2023 pediatric systematic review/GRADE assessment included 22 randomized studies with 1,350 participants for adverse-event outcomes. It found no serious-adverse-event signal, but <strong className="text-ink">non-serious adverse events were more common with melatonin</strong> (RR 1.56, 95% CI 1.01–2.43). Long-term pubertal-development evidence came from only four observational studies and remained uncertain, particularly at very long durations.<Cite n={10} /></p>
          <p className="text-sm leading-7 text-muted">The American Academy of Sleep Medicine advises treating melatonin like medication, keeping it out of children’s reach, discussing pediatric use with a health professional, and addressing schedules/habits when those may solve the sleep problem without a supplement.<Cite n={13} /></p>
        </section>

        <section id="quality" className="card-premium scroll-mt-20 p-6">
          <p className="eyebrow-label">Real-world dose uncertainty</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">The number on a U.S. melatonin label may not equal the amount swallowed</h2>
          <p className="mt-3 text-sm leading-7 text-muted">An FDA-associated laboratory survey analyzed 110 U.S. melatonin supplements marketed toward children. Melatonin was detected in 108 products, but measured content ranged from <strong className="text-ink">0% to 667% of the label declaration</strong>.<Cite n={11} /> That makes product identity and quality part of the dose question.</p>
          <p className="mt-3 text-sm leading-7 text-muted">A separate JAMA analysis of melatonin gummies also found large label discrepancies.<Cite n={12} /> AASM therefore recommends choosing products with the USP Verified Mark when melatonin is used, while noting that verification is voluntary and available on relatively few products.<Cite n={13} /></p>
          <p className="mt-3 text-sm leading-7 text-muted">These assays do not prove every melatonin product is inaccurate. They do show why precise milligram advice based only on a retail label can create false confidence.</p>
        </section>

        <section id="evidence-ledger" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Evidence applicability</p>
          <h2 className="text-2xl font-semibold text-ink">What the evidence supports—and what it does not</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white">
            <table className="min-w-[780px] w-full text-left text-sm">
              <thead className="bg-brand-50/70"><tr><th className="p-3 font-semibold text-ink">Claim</th><th className="p-3 font-semibold text-ink">Status</th><th className="p-3 font-semibold text-ink">Why</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3">Melatonin can help sleep onset in selected children with ADHD</td><td className="p-3 font-semibold text-ink">Supported</td><td className="p-3">Direct randomized ADHD trials.<Cite n={2} /><Cite n={3} /></td></tr>
                <tr><td className="p-3">Melatonin can shift circadian phase in ADHD with delayed timing</td><td className="p-3 font-semibold text-ink">Supported in studied populations</td><td className="p-3">Pediatric DLMO data and adult ADHD/DSPS RCT.<Cite n={2} /><Cite n={5} /></td></tr>
                <tr><td className="p-3">Melatonin directly treats core ADHD symptoms</td><td className="p-3 font-semibold text-ink">Not established</td><td className="p-3">Key pediatric trials are negative for direct ADHD/behavior/cognition outcomes.<Cite n={2} /><Cite n={3} /><Cite n={4} /></td></tr>
                <tr><td className="p-3">Melatonin improves every dimension of sleep in ADHD</td><td className="p-3 font-semibold text-ink">No</td><td className="p-3">2026 synthesis shows endpoint-specific effects.<Cite n={1} /></td></tr>
                <tr><td className="p-3">There is one best ADHD melatonin dose/timing schedule</td><td className="p-3 font-semibold text-ink">No</td><td className="p-3">Trials used different regimens and targets.<Cite n={2} /><Cite n={3} /><Cite n={5} /></td></tr>
                <tr><td className="p-3">Years of pediatric safety are fully established</td><td className="p-3 font-semibold text-ink">No</td><td className="p-3">Follow-up is reassuring but long-term developmental certainty remains limited.<Cite n={9} /><Cite n={10} /></td></tr>
                <tr><td className="p-3">Retail melatonin labels are precise dose measurements</td><td className="p-3 font-semibold text-ink">No</td><td className="p-3">Large U.S. analytical surveys found substantial label variability.<Cite n={11} /><Cite n={12} /></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <References refs={REFS} />

        <section id="faq" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">{FAQS.map((faq) => (<details key={faq.question} className="card-premium p-5"><summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary><p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p></details>))}</div>
        </section>

        <EmailCapture location="adhd-melatonin-sleep" className="mt-6" />

        <nav className="grid gap-3 sm:grid-cols-2">
          <Link href="/guides/adhd/sleep-and-adhd/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Sleep and ADHD →</Link>
          <Link href="/guides/adhd/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">ADHD evidence hub →</Link>
          <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Natural sleep aids evidence →</Link>
          <Link href="/guides/sleep/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Sleep evidence hub →</Link>
        </nav>
      </div>
    </ArticleLayout>
  )
}
