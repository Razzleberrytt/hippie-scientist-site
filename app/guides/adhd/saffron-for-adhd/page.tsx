import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import StructuredData from '@/components/StructuredData'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { SITE_URL } from '@/lib/navigation-config'
import { buildTwitterMetadata } from '@/lib/seo'

const PATH = '/guides/adhd/saffron-for-adhd'
const PAGE_URL = `${SITE_URL}${PATH}`
const TITLE = 'Saffron for ADHD: What the Human Trials Actually Show'
const DESCRIPTION =
  'Evidence-first review of saffron for ADHD: the small direct trial base, methylphenidate comparisons, sleep signals, study-dose context, safety, and why the evidence is still preliminary.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${PATH}/` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${PATH}/`,
    type: 'article',
  },
  twitter: buildTwitterMetadata({ title: TITLE, description: DESCRIPTION }),
}

const HEADINGS: Heading[] = [
  { id: 'verdict', text: 'Quick verdict', level: 2 },
  { id: 'direct-evidence', text: 'Direct ADHD evidence', level: 2 },
  { id: 'methylphenidate', text: 'Saffron vs methylphenidate', level: 2 },
  { id: 'sleep', text: 'Sleep and ADHD', level: 2 },
  { id: 'dose-form', text: 'Dose and extract context', level: 2 },
  { id: 'claim-check', text: 'Claim check', level: 2 },
  { id: 'safety', text: 'Safety and practical limits', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const EVIDENCE_ROWS = [
  [
    'Baziar et al., 2019',
    'Randomized, double-blind pilot',
    '54 randomized; 50 completed, ages 6–17',
    'Saffron 20–30 mg/day vs methylphenidate 20–30 mg/day for 6 weeks',
    'Both groups improved; between-group differences on parent and teacher ADHD-RS-IV were not significant',
    'Small pilot, short duration, no placebo arm; lack of a detected difference does not prove therapeutic equivalence',
  ],
  [
    'Blasco-Fontecilla et al., 2022',
    'Prospective naturalistic, non-randomized, non-blind study',
    '63 enrolled: saffron n=36, methylphenidate n=27; ages 7–17',
    'Saffr’Activ 30 mg/day vs extended-release methylphenidate plus psychoeducation',
    'Both groups improved on several symptom/executive measures; no significant treatment-by-time differences on many outcomes',
    'Non-randomized treatment assignment, small sample, multiple outcomes, product-related conflict-of-interest disclosures',
  ],
  [
    'Seyedi-Sahebari et al., 2024',
    'Systematic review',
    '4 ADHD studies; 118 total patients',
    'Saffron alone or as an adjunct to methylphenidate',
    'Overall signal described as promising with no major safety signal in the included studies',
    'Tiny evidence base, heterogeneous designs, mostly pediatric data, no large multicenter replication',
  ],
] as const

const FAQS = [
  {
    question: 'Does saffron treat ADHD?',
    answer:
      'Saffron has a small direct ADHD research base, but it is not established as a standard ADHD treatment. A 2024 systematic review found only four eligible ADHD studies with 118 total patients, so the evidence remains preliminary.',
  },
  {
    question: 'Is saffron as effective as methylphenidate for ADHD?',
    answer:
      'A small six-week randomized pilot did not find a statistically significant difference between saffron and methylphenidate on parent- or teacher-rated ADHD symptoms. That is interesting, but a small pilot that fails to detect a difference is not enough to prove equivalence or non-inferiority.',
  },
  {
    question: 'Can saffron replace stimulant medication?',
    answer:
      'The current evidence does not justify presenting saffron as a replacement for established ADHD treatment. Anyone considering changes to prescribed ADHD medication should discuss them with the prescribing clinician rather than substituting a supplement independently.',
  },
  {
    question: 'Does saffron help ADHD-related sleep problems?',
    answer:
      'One non-randomized pediatric ADHD study reported a directional improvement in time to fall asleep in the saffron group, but the between-group difference was not statistically significant. Broader saffron sleep research exists, but it should not be treated as direct ADHD-sleep evidence.',
  },
  {
    question: 'What saffron dose was studied for ADHD?',
    answer:
      'Direct pediatric ADHD studies commonly used roughly 20–30 mg/day depending on the study and product. Those numbers describe research protocols, not a universal personalized dose, because saffron extracts and standardization can differ.',
  },
  {
    question: 'Is saffron safe with ADHD medication?',
    answer:
      'Direct combination evidence is limited to small studies. Product quality, other medications, age, pregnancy status, mood history, and medical conditions all matter, so combination use should not be assumed safe simply because a small trial reported acceptable short-term tolerability.',
  },
]

const REFERENCES = [
  {
    label: 'Baziar S, et al. Crocus sativus L. Versus Methylphenidate in Treatment of Children with ADHD. J Child Adolesc Psychopharmacol. 2019;29(3):205-212. PMID: 30741567.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/30741567/',
  },
  {
    label: 'Blasco-Fontecilla H, et al. Effectivity of Saffron Extract (Saffr’Activ) on Treatment for Children and Adolescents with ADHD. Nutrients. 2022;14(19):4046. PMID: 36235697.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/36235697/',
  },
  {
    label: 'Seyedi-Sahebari S, et al. The Effects of Crocus sativus (Saffron) on ADHD: A Systematic Review. J Atten Disord. 2024;28(1):14-24. PMID: 37864351.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/37864351/',
  },
] as const

export default function SaffronForAdhdPage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished="2026-09-14"
        dateModified="2026-09-14"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'ADHD Guides', href: '/guides/adhd/' },
          { label: 'Saffron for ADHD', href: PATH },
        ]}
        zone="monetized"
      />

      <div className="space-y-12">
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">ADHD evidence dossier</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Saffron for ADHD: What the Human Trials Actually Show
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            Saffron has something many popular “focus supplements” do not: direct human ADHD trials. But the
            evidence base is still tiny. The useful question is not whether saffron is “natural Adderall.” It is
            how much confidence a handful of small pediatric studies actually deserve—and what they do and do not
            establish about symptoms, sleep, dose, and safety.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/guides/adhd/best-supplements-for-adhd/" className="text-brand-700 hover:underline">
              ADHD supplements evidence →
            </Link>
            <Link href="/guides/other/saffron-supplement/" className="text-brand-700 hover:underline">
              Saffron evidence hub →
            </Link>
            <Link href="/articles/saffron-for-sleep/" className="text-brand-700 hover:underline">
              Saffron sleep evidence →
            </Link>
          </div>
        </section>

        <section id="verdict" className="scroll-mt-20 rounded-[1.65rem] border border-brand-200 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Quick verdict</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Interesting enough to research; not established enough to substitute for ADHD treatment
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            The 2024 ADHD-specific systematic review found only four eligible studies and 118 total patients.
            A randomized six-week pilot found no statistically significant symptom difference between saffron
            and methylphenidate, while a later naturalistic study also reported improvements in both groups.
            Those findings create a real signal—but not proof of equivalence, long-term efficacy, or a reliable
            medication-replacement strategy.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ['Direct ADHD evidence', 'Yes—but only a handful of small studies'],
              ['Best current label', 'Promising / preliminary'],
              ['Medication replacement', 'Not established'],
              ['Adult ADHD evidence', 'Major gap'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{label}</p>
                <p className="mt-2 text-sm leading-6 text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="direct-evidence" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Study-level evidence</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              The direct ADHD literature is small enough to inspect study by study
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
              That is an advantage for interpretation. Instead of hiding behind a broad “studies show” claim,
              each major piece of direct evidence can be evaluated by design, sample, comparator, outcome, and
              its biggest limitation.
            </p>
          </div>
          <ResponsiveTable label="Direct saffron ADHD evidence by study design, population, intervention, finding, and limitation">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <caption className="sr-only">
                Direct saffron ADHD evidence by study design, population, intervention, main finding, and limitation
              </caption>
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Study', 'Design', 'Population', 'Intervention', 'Main signal', 'Why confidence stays limited'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {EVIDENCE_ROWS.map((row) => (
                  <tr key={row[0]} className="align-top">
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${index}`}
                        className={`px-4 py-4 leading-6 ${index === 0 ? 'font-semibold text-ink' : 'text-muted'}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section id="methylphenidate" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">The headline that needs calibration</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              “No significant difference” does not mean “proven equally effective”
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">What happened</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                In the 2019 double-blind pilot, 54 children and adolescents were randomized to saffron or
                methylphenidate for six weeks; 50 completed the trial. Parent and teacher rating scales improved,
                and the study did not detect a statistically significant between-group difference in change.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">What it cannot prove</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                A small exploratory study can miss clinically meaningful differences because it lacks power.
                Unless a trial is designed and powered as a formal non-inferiority or equivalence study, failing
                to find a difference should not be translated into “saffron works just as well as methylphenidate.”
              </p>
            </div>
          </div>
          <p className="text-sm leading-7 text-muted sm:text-base">
            The 2022 naturalistic study is useful supporting context but weaker for causal comparison because
            treatment assignment was not randomized or blinded. It also disclosed commercial relationships
            relevant to the saffron product. That does not invalidate the study; it is simply part of the evidence
            provenance readers deserve to see.
          </p>
        </section>

        <section id="sleep" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">ADHD × sleep overlap</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            The sleep angle is plausible, but direct ADHD-sleep evidence is thin
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            The 2022 naturalistic ADHD study reported a pronounced within-group decrease in time to fall asleep
            in the saffron arm, but the between-group comparison was not statistically significant. That is a
            hypothesis-generating signal—not proof that saffron reliably treats ADHD-related insomnia.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            Broader saffron sleep trials can answer a different question: whether standardized saffron extracts
            influence sleep outcomes in non-ADHD populations. Keep that evidence separate rather than importing
            it into an ADHD claim. See the{' '}
            <Link href="/articles/saffron-for-sleep/" className="font-semibold text-brand-700 hover:underline">
              saffron sleep evidence review
            </Link>{' '}
            and the{' '}
            <Link href="/guides/adhd/sleep-and-adhd/" className="font-semibold text-brand-700 hover:underline">
              sleep and ADHD guide
            </Link>{' '}
            for those two evidence streams.
          </p>
        </section>

        <section id="dose-form" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Formulation matters</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              A milligram number is not a universal saffron prescription
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              The 2019 pilot used weight-based saffron dosing of 20 or 30 mg/day. The 2022 naturalistic study
              used 30 mg/day of a specific commercial extract. These are study exposures—not a validated ADHD
              dose for every age, product, extract, or medical situation.
            </p>
            <p>
              Saffron supplements can differ in extraction, constituent standardization, capsule content, and
              quality control. A positive result from one named extract does not automatically validate every
              generic “saffron 30 mg” product. This is the same formulation problem seen with ashwagandha, where
              the extract is part of the intervention rather than a trivial label detail.
            </p>
          </div>
        </section>

        <section id="claim-check" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Claim check</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Five saffron-for-ADHD claims graded against the evidence
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              [
                '“Saffron has direct ADHD research.”',
                'Supported',
                'Yes. Unlike many nootropics, saffron has direct pediatric ADHD studies. The problem is quantity and replication, not complete absence of evidence.',
              ],
              [
                '“Saffron is proven equal to methylphenidate.”',
                'Overstated',
                'The small 2019 pilot did not detect a difference. That is weaker than a properly powered equivalence or non-inferiority demonstration.',
              ],
              [
                '“Saffron treats ADHD-related insomnia.”',
                'Unproven',
                'A sleep signal appeared in one non-randomized ADHD study, but the between-group result was not significant and broader sleep trials are not ADHD-specific.',
              ],
              [
                '“30 mg is the correct ADHD dose.”',
                'Unsupported as a universal rule',
                'Thirty milligrams appears in study protocols, but extract identity, age, body size, standardization, and safety context matter.',
              ],
              [
                '“Natural means it is safer than medication.”',
                'Unsupported shortcut',
                'Small trials reported acceptable short-term tolerability, but the database is far too small to compare uncommon or long-term harms confidently.',
              ],
            ].map(([claim, verdict, explanation]) => (
              <div key={claim} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{verdict}</p>
                <h3 className="mt-2 text-base font-semibold text-ink">{claim}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="safety" className="scroll-mt-20 rounded-[1.65rem] border border-amber-200 bg-amber-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Safety boundary</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Small short trials cannot establish long-term pediatric safety
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-muted sm:text-base">
            <p>
              The ADHD trials did not reveal a major short-term safety signal, but their samples and durations
              are much too small to rule out uncommon adverse effects or define long-term safety in children and adolescents.
            </p>
            <p>
              Do not use the ADHD pilot data as evidence that saffron can be freely combined with stimulant or
              non-stimulant prescriptions, antidepressants, or other serotonergic products. Direct interaction
              evidence in ADHD populations is limited. Children, pregnancy, complex medication lists,
              bipolar-spectrum histories, and significant medical conditions deserve individualized review.
            </p>
            <p>
              The evidence hierarchy remains important: established ADHD treatments have much larger efficacy
              and safety databases. Saffron is an interesting research candidate and possible adjunct—not a reason
              to stop prescribed treatment independently.
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">FAQ</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                <summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-brand-900/10 pt-8">
          <div>
            <p className="eyebrow-label">Primary evidence</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">References</h2>
          </div>
          <ol className="space-y-3 text-sm leading-7 text-muted">
            {REFERENCES.map((reference, index) => (
              <li key={reference.href}>
                <span className="mr-2 font-semibold text-ink">{index + 1}.</span>
                <a href={reference.href} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                  {reference.label}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </ArticleLayout>
  )
}
