import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import { SITE_URL, faqPageJsonLd } from '@/src/lib/seo'

const path = '/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/'
const UPDATED_DATE = '2026-08-12'

export const metadata: Metadata = {
  title: 'Magnesium Glycinate vs L-Threonate for Sleep: Evidence in 2026',
  description:
    'Evidence-first comparison of magnesium bisglycinate/glycinate and magnesium L-threonate for sleep, including direct trials, funding context, safety, and why there is no proven form winner.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Magnesium Glycinate vs L-Threonate for Sleep: Evidence in 2026',
    description: 'Direct sleep trials exist for both formulation families, but there is no head-to-head trial proving one form is better.',
    url: `${SITE_URL}${path}`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const SOURCES = [
  {
    label: 'Magnesium bisglycinate randomized placebo-controlled trial (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40918053/',
    note: '155 adults ages 18–65 with self-reported poor sleep received 250 mg elemental magnesium as bisglycinate or placebo daily for four weeks. The insomnia-severity difference favored bisglycinate but was small (Cohen d=0.2). The study did not include an objective sleep measure.',
  },
  {
    label: 'Magnesium L-threonate randomized trial (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39252819/',
    note: '80 adults ages 35–55 with self-assessed sleep problems received 1 g/day branded Magtein or placebo for 21 days. Several subjective and Oura-derived outcomes favored L-threonate. A later corrigendum clarified important registration and sponsor disclosures.',
  },
  {
    label: 'Corrigendum to the 2024 magnesium L-threonate trial (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40567408/',
    note: 'The corrigendum states that the trial was retrospectively registered and clarifies that AIDP commissioned and funded the study, owns patents related to the product, and that three authors had paid, consulting, or company roles with AIDP. These disclosures are part of the trial’s interpretation context.',
  },
  {
    label: 'Magnesium L-threonate randomized trial (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41601871/',
    note: '100 adults ages 18–45 with dissatisfied sleep received 2 g/day branded Magtein or placebo for six weeks. Some cognitive and subjective sleep-related outcomes favored treatment, but sleep-disturbance/restorative-sleep measures and objective wearable sleep outcomes did not show a general between-group advantage. The study received funding from Threotech.',
  },
  {
    label: 'Oral magnesium supplementation for insomnia systematic review (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/',
    note: 'Only three randomized trials / 151 older adults were included. Evidence quality was low to very low, underscoring how thin the broader insomnia literature was before the newer formulation-specific trials.',
  },
  {
    label: 'NIH ODS: Magnesium health professional fact sheet',
    href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    note: 'Supplemental magnesium can cause gastrointestinal effects, toxicity risk rises with impaired kidney function, and magnesium can reduce absorption of oral bisphosphonates and tetracycline/quinolone antibiotics.',
  },
  {
    label: 'AASM: cognitive behavioral therapy for insomnia',
    href: 'https://aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia/',
    note: 'AASM describes CBT-I as the first-line, evidence-based treatment for chronic insomnia.',
  },
]

const FAQS = [
  {
    question: 'Is magnesium glycinate or L-threonate better for sleep?',
    answer:
      'No head-to-head sleep trial has established one as better. Magnesium bisglycinate has a 155-person four-week placebo-controlled trial with a small insomnia-severity effect. Magnesium L-threonate has placebo-controlled trials in 80 and 100 adults, but those studies used branded Magtein and had industry funding. These are separate evidence programs, not a direct comparison.',
  },
  {
    question: 'Does magnesium glycinate work the first night?',
    answer:
      'The direct 2025 bisglycinate trial studied daily supplementation for four weeks. It did not test an as-needed bedtime rescue dose, so it cannot establish a reliable first-night effect.',
  },
  {
    question: 'Does magnesium L-threonate cross the blood-brain barrier better?',
    answer:
      'Brain-bioavailability claims are part of the mechanistic rationale for L-threonate, but mechanism does not prove superior sleep outcomes. The clinically useful question is whether a formulation improves meaningful sleep outcomes in people, and there is still no head-to-head sleep trial against glycinate or bisglycinate.',
  },
  {
    question: 'What dose should I take for sleep?',
    answer:
      'This comparison does not prescribe a universal dose. Trial regimens describe what researchers tested, not what every reader should take. Elemental magnesium exposure also differs substantially across magnesium salts and commercial products.',
  },
  {
    question: 'Can I combine magnesium glycinate and L-threonate?',
    answer:
      'There is no sleep evidence showing that taking both forms together is more effective or safer. Combining them also increases total supplemental magnesium exposure and makes side effects or benefits harder to attribute.',
  },
  {
    question: 'What should I do if insomnia is chronic?',
    answer:
      'CBT-I is the first-line evidence-based treatment for chronic insomnia. Persistent sleep problems also warrant evaluation for causes such as sleep apnea, restless legs, circadian disorders, medication effects, mood disorders, substance use, pain, or insufficient sleep opportunity.',
  },
]

export default function Page() {
  const faqLd = faqPageJsonLd({ pagePath: path, questions: FAQS })

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <Link href="/guides/sleep/" className="hover:text-ink">Sleep</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Magnesium glycinate vs L-threonate</span>
      </nav>

      <article className="space-y-8">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-[var(--surface-card)]">
          <p className="eyebrow-label">Sleep formulation comparison</p>
          <h1 className="heading-premium mt-3 text-ink dark:text-[var(--text-primary)]">Magnesium Glycinate vs L-Threonate for Sleep: What the Evidence Supports</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted dark:text-[var(--text-secondary)]">
            Both formulation families now have direct human sleep trials. That makes the comparison more interesting—but it still does not create a proven winner, because the trials used different products, populations, durations, outcomes, and funding structures rather than comparing the forms head to head.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-brand-800 dark:text-[var(--text-primary)]">
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">Evidence review: August 12, 2026</span>
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">No head-to-head winner</span>
          </div>
        </header>

        <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
          <p className="eyebrow-label">Bottom line</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink dark:text-[var(--text-primary)]">Two direct evidence programs, zero direct form-vs-form trials</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            <p>
              <strong>Magnesium bisglycinate:</strong> a 2025 randomized trial enrolled <strong>155 adults</strong> with self-reported poor sleep and studied <strong>250 mg elemental magnesium daily for four weeks</strong>. Insomnia Severity Index scores improved slightly more than placebo, but the effect was small (<strong>Cohen d=0.2</strong>) and objective sleep was not measured.
            </p>
            <p>
              <strong>Magnesium L-threonate:</strong> placebo-controlled trials in <strong>80 adults for 21 days</strong> and <strong>100 adults for six weeks</strong> studied branded Magtein. The 2024 trial’s later corrigendum clarified retrospective registration and substantial AIDP sponsor/author ties; the 2026 trial found some subjective and cognitive signals without a general objective sleep-outcome advantage. Neither trial compared L-threonate directly with glycinate or bisglycinate.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <EvidenceSummaryCard
            title="Magnesium bisglycinate / glycinate"
            evidenceLevel="Limited"
            humanEvidence="The most direct recent trial randomized 155 adults ages 18–65 with self-reported poor sleep to 250 mg elemental magnesium as bisglycinate or placebo daily for four weeks. The insomnia-severity difference was statistically significant but small (d=0.2), and objective sleep was not measured."
            mechanisticEvidence="Glycine-related calming claims and general magnesium physiology are plausible hypotheses, but they do not prove that glycinate is the best sleep form or that one bedtime dose works acutely."
            safetyProfile="Supplemental magnesium can cause diarrhea, nausea, and cramping. Toxicity risk rises with impaired kidney function, and magnesium can interfere with absorption of oral bisphosphonates and tetracycline/quinolone antibiotics."
          />
          <EvidenceSummaryCard
            title="Magnesium L-threonate"
            evidenceLevel="Limited"
            humanEvidence="A 2024 trial studied 80 adults ages 35–55 with self-assessed sleep problems for 21 days using 1 g/day branded Magtein; a newer trial studied 100 adults ages 18–45 with dissatisfied sleep for six weeks using 2 g/day Magtein. These are separate branded-product trials rather than head-to-head evidence against glycinate, and the 2026 study did not show a general objective sleep-outcome advantage."
            mechanisticEvidence="Claims about brain magnesium and blood-brain-barrier delivery are mechanistic rationale, not proof that L-threonate produces superior sleep outcomes."
            safetyProfile="A 2025 corrigendum clarified that the 2024 trial was retrospectively registered; AIDP commissioned and funded it, owns relevant patents, and three authors had paid, consulting, or company roles. The newer trial received funding from Threotech. These conflicts do not automatically invalidate results, but they materially affect how branded-product evidence should be generalized."
          />
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink dark:text-[var(--text-primary)]">What the direct trials actually compared</h2>
          <ResponsiveTable label="Magnesium sleep formulation evidence table" className="mt-5">
            <table className="min-w-[900px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/10 dark:border-white/10">
                  <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Evidence</th>
                  <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Population / regimen</th>
                  <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Signal</th>
                  <th scope="col" className="py-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Main limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5 dark:divide-white/10">
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink dark:text-[var(--text-primary)]">Bisglycinate RCT, 2025</td>
                  <td className="py-4 pr-4 text-muted dark:text-[var(--text-secondary)]">155 adults, ages 18–65, poor self-reported sleep; 250 mg elemental magnesium daily vs placebo for 4 weeks.</td>
                  <td className="py-4 pr-4 text-muted dark:text-[var(--text-secondary)]">Greater ISI reduction than placebo; small effect, d=0.2.</td>
                  <td className="py-4 text-muted dark:text-[var(--text-secondary)]">No objective sleep measure; does not establish superiority over other magnesium forms or an acute bedtime effect.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink dark:text-[var(--text-primary)]">L-threonate RCT, 2024</td>
                  <td className="py-4 pr-4 text-muted dark:text-[var(--text-secondary)]">80 adults, ages 35–55, self-assessed sleep problems; 1 g/day Magtein vs placebo for 21 days.</td>
                  <td className="py-4 pr-4 text-muted dark:text-[var(--text-secondary)]">Several subjective and Oura-derived sleep/daytime outcomes favored Magtein.</td>
                  <td className="py-4 text-muted dark:text-[var(--text-secondary)]">Short branded-product study. The 2025 corrigendum reports retrospective registration, AIDP commissioning/funding and patent ownership, and three authors with paid, consulting, or company roles.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-4 pr-4 font-semibold text-ink dark:text-[var(--text-primary)]">L-threonate RCT, 2026</td>
                  <td className="py-4 pr-4 text-muted dark:text-[var(--text-secondary)]">100 adults, ages 18–45, dissatisfied sleep; 2 g/day Magtein vs placebo for 6 weeks.</td>
                  <td className="py-4 pr-4 text-muted dark:text-[var(--text-secondary)]">Some cognitive and subjective sleep-related outcomes favored Magtein; objective wearable sleep outcomes did not show a general between-group advantage.</td>
                  <td className="py-4 text-muted dark:text-[var(--text-secondary)]">Branded Magtein evidence; study received funding from Threotech and does not establish overall sleep superiority over other forms.</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
          <h2 className="text-xl font-semibold text-amber-950 dark:text-[var(--text-primary)]">Why “glycinate wins” is not evidence-based</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950 dark:text-[var(--text-secondary)]">
            <p>
              There is no randomized sleep trial assigning people to magnesium glycinate or bisglycinate versus magnesium L-threonate. Cost, capsule burden, elemental-magnesium labeling, and personal tolerability may affect a purchase, but those are practical considerations—not evidence that one form treats sleep better.
            </p>
            <p>
              The same caution applies to trial dosing. A four-week bisglycinate regimen and 21-day or six-week L-threonate regimens describe what researchers tested. They do not create a universal evening dose, a first-night rescue instruction, or a reason to combine both forms.
            </p>
          </div>
        </section>

        <section>
          <SafetyNotice title="Magnesium safety and medication boundaries">
            <ul className="ml-5 list-disc space-y-2">
              <li><strong>Kidney function:</strong> magnesium toxicity risk rises when renal clearance is impaired; significant kidney disease deserves clinician review before supplementation.</li>
              <li><strong>GI effects:</strong> supplemental magnesium can cause diarrhea, nausea, and abdominal cramping.</li>
              <li><strong>Bisphosphonates:</strong> magnesium can reduce absorption of oral bisphosphonate medicines.</li>
              <li><strong>Antibiotics:</strong> magnesium can reduce absorption of tetracycline and quinolone antibiotics; medication spacing should follow pharmacist/prescriber instructions.</li>
              <li><strong>Total exposure:</strong> combining magnesium forms increases total supplemental magnesium. Do not treat two different salt names as two unrelated supplements.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink dark:text-[var(--text-primary)]">Chronic insomnia is a treatment question, not a magnesium-form contest</h2>
          <p className="mt-3 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            CBT-I is the first-line evidence-based treatment for chronic insomnia. Loud snoring or gasping, dangerous daytime sleepiness, restless-legs symptoms, persistent impairment, or severe mood symptoms are reasons to seek assessment rather than escalating magnesium forms.
          </p>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink dark:text-[var(--text-primary)]">Product sourcing note</h2>
          <p className="mt-3 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            This broad form comparison intentionally does not rank affiliate products. The strongest direct L-threonate evidence is tied to branded Magtein, while the bisglycinate trial studied a defined elemental-magnesium exposure. A retail label is not automatically equivalent to a study preparation, and a branded trial is not proof that a whole form wins.
          </p>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink dark:text-[var(--text-primary)]">Frequently asked questions</h2>
          <div className="mt-5 space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.question} className="border-l-4 border-brand-600 pl-4">
                <h3 className="font-semibold text-ink dark:text-[var(--text-primary)]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink dark:text-[var(--text-primary)]">Sources and directness notes</h2>
          <ol className="mt-4 space-y-4">
            {SOURCES.map((source, index) => (
              <li key={source.href} className="text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
                <span className="font-semibold text-ink dark:text-[var(--text-primary)]">{index + 1}. </span>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 hover:underline dark:text-[var(--text-primary)]">{source.label}</a>
                <span> — {source.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link href="/guides/sleep/magnesium-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-800 hover:underline dark:border-white/10 dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]">Magnesium for sleep →</Link>
          <Link href="/guides/sleep/best-magnesium-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-800 hover:underline dark:border-white/10 dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]">Magnesium evidence guide →</Link>
          <Link href="/guides/compare/sleep-herbs-vs-melatonin/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-800 hover:underline dark:border-white/10 dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]">Sleep supplements vs melatonin →</Link>
          <Link href="/guides/sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-800 hover:underline dark:border-white/10 dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]">Sleep goal hub →</Link>
        </section>

        <EmailCapture
          headline="Get future sleep evidence notes by email"
          description="New trials, safety context, and evidence-calibrated guide updates without universal winner or dosing claims."
          location="magnesium-glycinate-vs-l-threonate-sleep"
        />
        <NewsletterCtaBlock
          title="Continue with the newsletter archive"
          description="Short research notes for cautious supplement decisions."
          location="magnesium-glycinate-vs-l-threonate-sleep-newsletter"
        />

        <p className="text-xs leading-6 text-muted dark:text-[var(--text-secondary)]">Last evidence review: {UPDATED_DATE}</p>
      </article>
    </main>
  )
}
