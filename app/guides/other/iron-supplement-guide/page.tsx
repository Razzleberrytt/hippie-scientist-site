import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Iron Supplements: Testing, Forms & Safety (2026)',
  description:
    'Evidence-first iron supplement guide: why diagnosis matters, how ferritin is interpreted in context, oral iron formulation tradeoffs, dosing boundaries, interactions, and iron-overload risk.',
  path: '/guides/other/iron-supplement-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Which form of oral iron is best?',
    answer:
      'No single oral iron formulation has a proven overall advantage. The American Gastroenterological Association advises that ferrous sulfate is generally preferred because it is the least expensive, not because it is universally more effective. Tolerability, elemental iron content, cost, adherence, and the clinical reason for treatment all matter.',
  },
  {
    question: 'What ferritin level means iron deficiency?',
    answer:
      'There is no single ferritin cutoff that diagnoses iron deficiency in every clinical context. In people who already have anemia, the AGA recommends a ferritin cutoff of 45 ng/mL rather than 15 ng/mL for diagnosing iron deficiency. Inflammation, chronic kidney disease, heart failure, pregnancy, and other conditions can change how ferritin is interpreted. A low ferritin can support iron deficiency, but the result belongs with the complete blood count, transferrin saturation, symptoms, and clinical context.',
  },
  {
    question: 'Should I take iron for fatigue without blood work?',
    answer:
      'Fatigue alone is not enough to establish iron deficiency. Iron can be harmful when taken unnecessarily, and iron-deficiency anemia can signal blood loss, malabsorption, gastrointestinal disease, pregnancy-related needs, or another underlying cause that deserves evaluation. Testing and cause-finding are more important than guessing from symptoms.',
  },
  {
    question: 'Is every-other-day iron better than daily iron?',
    answer:
      'AGA guidance says oral iron should be given once daily at most and that every-other-day dosing may be better tolerated for some people with similar or equal absorption. That is treatment context, not a universal self-dosing rule. The schedule should follow the diagnosis, formulation, severity, side effects, and response.',
  },
  {
    question: 'What medicines can interact with iron?',
    answer:
      'Iron can reduce absorption of levothyroxine and levodopa, and proton pump inhibitors can reduce non-heme iron absorption. Calcium can also interfere with iron absorption in some circumstances. People taking regular medications should review timing and compatibility with a pharmacist or clinician rather than assuming a supplement can be added freely.',
  },
]

const IRON_REFS = [
  {
    n: 1,
    text: 'NIH Office of Dietary Supplements. Iron — Health Professional Fact Sheet.',
    url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/',
  },
  {
    n: 2,
    text: 'American Gastroenterological Association. Management of Iron Deficiency Anemia. Clinical Practice Update, 2024.',
    url: 'https://gastro.org/clinical-guidance/management-of-iron-deficiency-anemia/',
  },
  {
    n: 3,
    text: 'American Gastroenterological Association. Gastrointestinal Evaluation of Iron Deficiency Anemia. Clinical Guideline.',
    url: 'https://gastro.org/clinical-guidance/gastrointestinal-evaluation-of-iron-deficiency-anemia/',
  },
  {
    n: 4,
    text: 'World Health Organization. Guideline on use of ferritin concentrations to assess iron status in individuals and populations.',
    url: 'https://www.who.int/publications/i/item/9789240000124',
  },
]

const decisionRows = [
  {
    situation: 'Fatigue, brain fog, shortness of breath, or restless legs without recent iron studies',
    nextStep:
      'Confirm whether iron deficiency is actually present. These symptoms are nonspecific and can come from many other conditions.',
  },
  {
    situation: 'Anemia plus a low or borderline ferritin',
    nextStep:
      'Interpret ferritin with the CBC and clinical context. AGA uses a 45 ng/mL cutoff in patients with anemia, while inflammation and chronic disease can shift ferritin interpretation.',
  },
  {
    situation: 'Confirmed iron-deficiency anemia',
    nextStep:
      'Treat the deficiency and investigate the cause. Men, postmenopausal women, and some premenopausal patients may need evaluation for gastrointestinal blood loss rather than iron replacement alone.',
  },
  {
    situation: 'Oral iron causes constipation, nausea, or abdominal pain',
    nextStep:
      'Do not assume a premium formulation is automatically superior. Dose frequency, food timing, formulation, and whether intravenous iron is appropriate can be discussed with the treating clinician.',
  },
]

const evidenceBoundaries = [
  {
    title: 'Ferritin is useful, but context changes the cutoff',
    shows:
      'Ferritin reflects iron stores and is central to diagnosing iron deficiency. AGA recommends a 45 ng/mL cutoff in patients with anemia, and WHO emphasizes adjustment when inflammation is present.',
    doesNotShow:
      'That one number such as 30 ng/mL diagnoses iron deficiency in every adult regardless of anemia, inflammation, pregnancy, kidney disease, or other clinical context.',
  },
  {
    title: 'Formulation is mainly a tolerability and practicality decision',
    shows:
      'Common oral forms contain different amounts of elemental iron and can differ in gastrointestinal tolerability. Ferrous sulfate is inexpensive and well established.',
    doesNotShow:
      'That iron bisglycinate is universally the best-absorbed or best choice. AGA states that no single oral formulation has a proven overall advantage.',
  },
  {
    title: 'Treatment dosing is not a wellness protocol',
    shows:
      'People with confirmed iron deficiency may need doses above normal dietary requirements under clinical supervision, with monitoring of blood counts and iron parameters.',
    doesNotShow:
      'That anyone with fatigue should start a fixed milligram dose. The treatment dose should follow the diagnosis, cause, severity, and response.',
  },
]

export default function IronSupplementPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Iron Supplements: Testing, Forms and Safety"
        description="Evidence-first review of iron testing, ferritin interpretation, oral formulations, treatment boundaries, interactions, and overload risk."
        url="https://thehippiescientist.net/guides/other/iron-supplement-guide"
        type="Article"
        citationUrls={IRON_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Iron Supplements' },
        ]}
      />
      <FAQSchema pagePath="/guides/other/iron-supplement-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Diagnosis before dosing</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Iron Supplements: Test the Problem Before Treating the Number</h1>
        <p className="text-lg leading-8 text-muted">
          Iron is essential, but it is not a general energy supplement. Fatigue, low exercise tolerance, pallor, restless legs, and brain fog can occur with iron deficiency, but they are not specific enough to diagnose it. The safer sequence is to confirm the deficiency, understand why it happened, and then choose a treatment plan that matches the laboratory and clinical picture.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/iron-supplement-guide.jpg"
              alt="Iron supplement beside iron-rich foods and laboratory paperwork"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Iron decisions are strongest when they start with laboratory context and the cause of deficiency.
          </figcaption>
        </figure>
      </section>

      <section className="card-premium p-6 space-y-4 border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Quick answer</p>
        <h2 className="text-2xl font-semibold text-ink">Do not turn fatigue or one ferritin number into a self-treatment protocol</h2>
        <p className="text-sm leading-7 text-muted">
          There is no single ferritin cutoff that diagnoses iron deficiency in every clinical context. In patients with anemia, AGA recommends using 45 ng/mL rather than 15 ng/mL as the ferritin cutoff for iron deficiency [3]. WHO guidance emphasizes that infection and inflammation can raise ferritin and change how results should be interpreted [4]. Once iron deficiency is confirmed, the treatment dose should follow the diagnosis, cause, severity, and response rather than a universal internet dose.
        </p>
        <p className="text-sm leading-7 text-muted">
          The same caution applies to formulation. AGA states that no single oral iron formulation has a proven overall advantage and prefers ferrous sulfate mainly because it is inexpensive [2]. Every-other-day dosing may be better tolerated for some people, but that is treatment context—not a one-size-fits-all regimen [2].
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {evidenceBoundaries.map((card) => (
          <article key={card.title} className="card-premium p-6 space-y-4">
            <h2 className="text-xl font-semibold text-ink">{card.title}</h2>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">What it supports</p>
              <p className="mt-2 text-sm leading-6 text-muted">{card.shows}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">What it does not support</p>
              <p className="mt-2 text-sm leading-6 text-muted">{card.doesNotShow}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-4 max-w-5xl">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Choose the clinical question before choosing iron</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th className="p-4">Situation</th>
                <th className="p-4">Better next step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {decisionRows.map((row) => (
                <tr key={row.situation}>
                  <td className="p-4 font-semibold text-ink">{row.situation}</td>
                  <td className="p-4 leading-6">{row.nextStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dose and safety boundaries</h2>
        <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-muted">
          <li><strong className="text-ink">Upper-limit context:</strong> NIH lists 45 mg per day as the adult tolerable upper intake level for iron from food and supplements [1]. 45 mg per day is the adult tolerable upper intake level, not a treatment ceiling; clinicians sometimes prescribe more for confirmed iron-deficiency anemia.</li>
          <li><strong className="text-ink">Side effects:</strong> supplemental iron can cause nausea, constipation, abdominal pain, vomiting, and diarrhea, especially at higher doses [1].</li>
          <li><strong className="text-ink">Iron overload:</strong> hereditary hemochromatosis can cause toxic iron accumulation and organ damage. People with known hemochromatosis should avoid iron supplements unless specifically directed [1].</li>
          <li><strong className="text-ink">Children:</strong> accidental iron poisoning can be severe or fatal. Iron products need secure storage away from children [1].</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Medication and cause-finding boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Iron deficiency can be a clue, not just a nutrient gap</h2>
        <p className="mt-3 text-sm leading-7">
          Iron can interfere with levothyroxine and levodopa, while proton pump inhibitors can reduce non-heme iron absorption [1]. More importantly, confirmed iron-deficiency anemia can reflect menstrual blood loss, gastrointestinal bleeding, malabsorption, pregnancy-related needs, dietary insufficiency, inflammatory disease, or other causes. AGA guidance recommends gastrointestinal evaluation in several adult groups rather than simply replacing iron indefinitely [3].
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
            Check supplement interactions
          </Link>
          <Link href="/info/supplement-safety-checklist/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
            Supplement safety checklist
          </Link>
        </div>
      </section>

      <References refs={IRON_REFS} />
      <EmailCapture
        headline="Get evidence reviews like this"
        description="Testing, deficiency, and supplement safety — without self-treatment shortcuts."
        ctaLabel="Get the evidence"
        location="guide-iron"
      />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">
          ← Back to guides
        </Link>
        <Link href="/info/supplement-safety-checklist/" className="text-sm font-bold text-brand-800 hover:underline">
          Safety checklist →
        </Link>
      </div>
    </div>
  )
}
