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
  title: 'Vitamin D + K2: What the Evidence Shows (2026)',
  description:
    'Evidence-first guide to vitamin D and vitamin K2: dietary reference intakes, blood-level uncertainty, arterial-calcification claims, warfarin safety, and when individualized care matters.',
  path: '/guides/other/vitamin-d-k2-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Should everyone take vitamin D and K2 together?',
    answer:
      'No. Vitamin D and vitamin K have related roles in bone and calcium biology, but that does not establish a universal need for a combined D3 + K2 supplement. For generally healthy adults younger than 75, the 2024 Endocrine Society guideline suggests against routinely taking vitamin D above the dietary reference intake solely to prevent disease. Vitamin K supplementation has not been proven necessary whenever vitamin D is used.',
  },
  {
    question: 'How much vitamin D should a healthy adult take?',
    answer:
      'For generally healthy adults, use age-appropriate dietary reference intakes as the default context rather than treating a high supplemental dose as a universal protocol. NIH lists 600 IU (15 mcg) per day for adults through age 70 and 800 IU (20 mcg) after age 70. The adult tolerable upper intake level is 4,000 IU (100 mcg) per day; an upper limit is not a recommended target. Treatment of an established deficiency is a different clinical question.',
  },
  {
    question: 'What vitamin D blood level is optimal?',
    answer:
      'There is no universal “optimal” 25(OH)D target established for disease prevention. NIH notes that 20 ng/mL (50 nmol/L) or more is generally adequate for most healthy people, while the Endocrine Society no longer defines a single sufficiency target and suggests against routine testing in generally healthy people without a specific indication.',
  },
  {
    question: 'Does K2 keep calcium out of the arteries when taking vitamin D?',
    answer:
      'Vitamin K-dependent proteins are involved in vascular calcification biology, which makes the hypothesis plausible. But mechanistic plausibility does not prove that adding K2 to vitamin D prevents arterial calcification or cardiovascular events. NIH states that the cardiovascular role of different vitamin K forms remains unclear and more research is needed.',
  },
  {
    question: 'Who needs extra caution with vitamin K supplements?',
    answer:
      'Warfarin and similar anticoagulants can interact seriously with vitamin K. People using these medicines generally need consistent vitamin K intake and should not make supplement changes without the clinician managing anticoagulation. Malabsorption, kidney disease, pregnancy, osteoporosis treatment, and known vitamin deficiencies can also change the decision.',
  },
]

const VITAMIN_D_K_REFS = [
  {
    n: 1,
    text: 'NIH Office of Dietary Supplements. Vitamin D — Health Professional Fact Sheet.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
  },
  {
    n: 2,
    text: 'Demay MB, et al. (2024). Vitamin D for the Prevention of Disease: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab. doi:10.1210/clinem/dgae290.',
    url: 'https://doi.org/10.1210/clinem/dgae290',
  },
  {
    n: 3,
    text: 'NIH Office of Dietary Supplements. Vitamin K — Health Professional Fact Sheet.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/',
  },
]

const decisionRows = [
  {
    context: 'Generally healthy adult under 75',
    vitaminD: 'Start with the dietary reference intake, food, and fortified-food context rather than assuming more is better.',
    vitaminK: 'Routine K2 supplementation is not established as necessary just because vitamin D is used.',
  },
  {
    context: 'Known deficiency or a condition affecting absorption',
    vitaminD: 'This is individualized treatment territory; dose and follow-up can differ substantially from population guidance.',
    vitaminK: 'Malabsorption can also affect vitamin K status, so the broader clinical context matters.',
  },
  {
    context: 'Considering K2 for cardiovascular protection',
    vitaminD: 'Vitamin D itself has not consistently reduced cardiovascular events in randomized trials.',
    vitaminK: 'Mechanistic and observational signals exist, but clinical evidence is not strong enough to promise arterial protection.',
  },
  {
    context: 'Taking warfarin or a similar anticoagulant',
    vitaminD: 'Review the full medication and supplement list before changing doses.',
    vitaminK: 'Do not casually add, remove, or sharply change vitamin K intake; consistency is important for anticoagulation control.',
  },
]

const evidenceBoundaries = [
  {
    title: 'Vitamin D has a clear nutritional role',
    shows:
      'Vitamin D supports calcium absorption and bone/mineral physiology. Severe deficiency can cause rickets or osteomalacia, and some people have established indications for testing or treatment.',
    doesNotShow:
      'That every healthy adult benefits from routine doses above the dietary reference intake, or that one serum target optimizes every health outcome.',
  },
  {
    title: 'K2 biology is interesting, but biology is not an outcome trial',
    shows:
      'Vitamin K is required for carboxylation of proteins involved in blood clotting and bone metabolism; vitamin K-dependent matrix Gla protein is relevant to vascular-calcification research.',
    doesNotShow:
      'That taking K2 with vitamin D reliably prevents calcium from entering arteries or lowers cardiovascular-event risk.',
  },
  {
    title: 'A supplement upper limit is not a goal',
    shows:
      'NIH lists 4,000 IU (100 mcg) per day as the adult tolerable upper intake level for vitamin D.',
    doesNotShow:
      'That 4,000 IU is the ideal daily dose. 4,000 IU is an upper intake limit for adults, not a routine target.',
  },
]

export default function VitaminDK2Page() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Vitamin D + K2: What the Evidence Shows"
        description="Evidence-first review of vitamin D and K2, including dosing context, blood-level uncertainty, cardiovascular claims, and medication safety."
        url="https://thehippiescientist.net/guides/other/vitamin-d-k2-guide"
        type="Article"
        citationUrls={VITAMIN_D_K_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Vitamin D + K2' },
        ]}
      />
      <FAQSchema pagePath="/guides/other/vitamin-d-k2-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Official guidance updated</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Vitamin D + K2: What the Evidence Actually Supports</h1>
        <p className="text-lg leading-8 text-muted">
          Vitamin D and vitamin K participate in related bone and calcium biology, which is why D3 + K2 products are easy to market as an inseparable pair. The evidence is more nuanced. Vitamin D has established nutritional and deficiency-treatment roles, but current guidance does not support a universal high-dose protocol or a single “optimal” blood level for healthy adults. K2 has plausible bone and vascular mechanisms, but the claim that everyone taking vitamin D needs K2 to keep calcium out of the arteries goes beyond current clinical evidence.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/vitamin-d-k2-guide.jpg"
              alt="Vitamin D3 and K2 supplements beside a neutral evidence-review workspace"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Vitamin D and K2 are biologically related, but a combined supplement is not automatically necessary for everyone.
          </figcaption>
        </figure>
      </section>

      <section className="card-premium p-6 space-y-4 border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Quick answer</p>
        <h2 className="text-2xl font-semibold text-ink">Do not treat D3 + K2 as a universal protocol</h2>
        <p className="text-sm leading-7 text-muted">
          For generally healthy adults under 75, the 2024 Endocrine Society guideline suggests against routine vitamin D supplementation above the dietary reference intake solely for disease prevention [2]. NIH lists 600 IU daily for adults through age 70 and 800 IU after age 70 as the vitamin D RDA, while 4,000 IU is an upper intake limit for adults, not a routine target [1]. There is also no universal “optimal” 25(OH)D target: NIH considers 20 ng/mL or more generally adequate for most healthy people, and current Endocrine Society guidance does not define a single target for disease prevention [1,2].
        </p>
        <p className="text-sm leading-7 text-muted">
          K2 is a separate question. Vitamin K-dependent proteins are relevant to bone and vascular biology, but that does not prove that adding K2 to vitamin D prevents arterial calcification. NIH says the cardiovascular role of vitamin K supplementation remains unclear [3].
        </p>
      </section>

      <section className="space-y-4 max-w-5xl">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Choose the question before choosing the supplement</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th className="p-4">Context</th>
                <th className="p-4">Vitamin D decision</th>
                <th className="p-4">Vitamin K / K2 decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {decisionRows.map((row) => (
                <tr key={row.context}>
                  <td className="p-4 font-semibold text-ink">{row.context}</td>
                  <td className="p-4 leading-6">{row.vitaminD}</td>
                  <td className="p-4 leading-6">{row.vitaminK}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {evidenceBoundaries.map((item) => (
          <article key={item.title} className="card-premium p-6 space-y-4">
            <h2 className="text-xl font-semibold text-ink">{item.title}</h2>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">What it shows</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.shows}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">What it does not show</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.doesNotShow}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dose and blood-level context</h2>
        <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-muted">
          <li><strong className="text-ink">RDA context:</strong> NIH lists 600 IU (15 mcg) vitamin D daily for adults through age 70 and 800 IU (20 mcg) after age 70 [1]. These are population reference intakes, not treatment doses for a diagnosed deficiency.</li>
          <li><strong className="text-ink">Upper-limit context:</strong> the adult tolerable upper intake level is 4,000 IU (100 mcg) per day [1]. An upper limit is a safety boundary, not a dose recommendation.</li>
          <li><strong className="text-ink">Blood-level context:</strong> NIH notes that 20 ng/mL (50 nmol/L) or more is generally adequate for most healthy people, but optimal concentrations for every health outcome have not been established [1].</li>
          <li><strong className="text-ink">Testing context:</strong> the Endocrine Society suggests against routine 25(OH)D testing in generally healthy people without an established indication [2].</li>
          <li><strong className="text-ink">Vitamin K context:</strong> adult adequate intakes are based mainly on total vitamin K intake, not a proven universal MK-7 supplement target. The evidence does not establish that every vitamin D user should add K2 [3].</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Safety boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Medication and medical context can change the answer</h2>
        <p className="mt-3 text-sm leading-7">
          Warfarin and similar anticoagulants can interact seriously with vitamin K; sudden changes in vitamin K intake can change anticoagulant effect [3]. High vitamin D intake can cause hypercalcemia and other toxicity, and vitamin D can interact with some medications [1]. Known deficiency, malabsorption, kidney disease, pregnancy, osteoporosis treatment, abnormal calcium, or clinician-directed vitamin D therapy should be handled as individualized medical decisions rather than by copying a general internet dose.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
            Check supplement interactions
          </Link>
          <Link href="/learn/evidence-literacy/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
            Read the evidence guide
          </Link>
        </div>
      </section>

      <References refs={VITAMIN_D_K_REFS} />
      <EmailCapture
        headline="Get evidence reviews like this"
        description="Supplement evidence, dosing boundaries, and safety — without marketing shortcuts."
        ctaLabel="Get the evidence"
        location="guide-vitamin-d-k2"
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
