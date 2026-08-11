import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import {
  buildPageMetadata,
  blogJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  compactMetaTitle,
} from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'sleep-stack-guide'
const TITLE = 'Sleep Stack Guide: Magnesium, L-Theanine, Ashwagandha, and What to Combine'
const DESCRIPTION =
  'An evidence-first sleep stack guide that separates single-ingredient research from combination claims, with practical safety checks for magnesium, L-theanine, ashwagandha, and melatonin.'
const DATE = '2026-08-02'
const UPDATED_DATE = '2026-08-11'
const AUTHOR = 'Will'
const READING_TIME = '12 min read'
const TAGS = ['sleep', 'magnesium', 'l-theanine', 'ashwagandha', 'supplement-stack']
const CATEGORY = 'sleep-stacks'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best natural sleep stack?',
    answer:
      'No supplement combination has been established as the best natural sleep stack. Persistent sleep problems can have causes that supplements do not address, and CBT-I is the best-supported first-line behavioral treatment for chronic insomnia. If a supplement trial is appropriate, a single-ingredient product is easier to evaluate than a multi-ingredient blend.',
  },
  {
    question: 'Can I take magnesium, L-theanine, and ashwagandha together?',
    answer:
      'No magnesium + L-theanine + ashwagandha sleep trial was identified for this review, so effectiveness and safety of the three-ingredient combination should not be inferred from separate ingredient studies. Medication use, kidney function, thyroid or autoimmune disease, pregnancy status, and other supplements can materially change the safety picture.',
  },
  {
    question: 'Should I start several sleep supplements at the same time?',
    answer:
      'Starting several products together makes it difficult to tell which ingredient caused a benefit or side effect. If a clinician agrees that supplementation is reasonable, one ingredient at a time keeps the trial more interpretable and reduces unnecessary exposure to ingredients that may not help.',
  },
  {
    question: 'What time should I take sleep supplements?',
    answer:
      'Timing is study and product specific. There is no validated universal timing rule for a magnesium, L-theanine, and ashwagandha stack. Follow the product label and medication-specific guidance, and do not convert an individual study schedule into a universal bedtime protocol.',
  },
  {
    question: 'Is a natural sleep stack safer than melatonin?',
    answer:
      'Natural does not mean safer, and these options answer different questions. Melatonin is a circadian signal with evidence for some timing-related sleep problems; magnesium, L-theanine, and ashwagandha have different and generally less direct roles in insomnia care. Each product has its own adverse effects, interactions, and evidence limits.',
  },
  {
    question: 'What should I avoid combining with sleep supplements?',
    answer:
      'Do not assume a supplement combination is safe because no interaction is prominent on a product label. Alcohol, prescription sedatives, thyroid medicines, blood-pressure or diabetes medicines, immunosuppressants, and other supplements can create ingredient-specific concerns. A pharmacist or clinician can check the exact products and medications you use.',
  },
]

export default function SleepStackGuidePage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/sleep/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
    `/guides/sleep/${SLUG}/`,
  )
  const faqLd = faqPageJsonLd({ pagePath: `/guides/sleep/${SLUG}/`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      {faqLd && <JsonLd schema={faqLd} />}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">Evidence Guide</span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">{CATEGORY}</span>
          {TAGS.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">{tag}</span>
          ))}
          <span className="text-muted">August 2, 2026</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">{TITLE}</h1>
        <p className="mt-2 text-sm text-muted">
          By <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">{AUTHOR}</Link>
        </p>
        <div className="mt-3"><LastUpdatedBadge date={UPDATED_DATE} label="Last updated" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/sleep-stack-guide.jpg"
              alt="Sleep supplements arranged for an evidence and safety review"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            A combination can look logical on paper without having combination-specific clinical evidence.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article may contain affiliate links in the curated recommendation section. If you purchase through them, we may earn a commission at no additional cost to you. Commercial placement does not change the evidence or safety assessment.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick read</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">A Stack Is Not the Same Thing as Evidence</h2>
            <div className="mt-4 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                <strong>No magnesium + L-theanine + ashwagandha sleep trial was identified for this review.</strong>{' '}
                Each ingredient has a different evidence base, but separate studies do not prove that combining them works better, works faster, or is safe for every person.
              </p>
              <p>
                Magnesium research for insomnia remains limited and inconsistent. L-theanine has small human studies suggesting possible sleep or relaxation effects, but optimal use and its role in clinical insomnia remain uncertain. Some ashwagandha preparations may improve stress or sleep measures in small trials, while important safety and interaction questions remain.
              </p>
              <p>
                <strong>Mechanistic plausibility is not combination evidence.</strong> Different biological pathways can justify a research hypothesis; they do not justify calling a three-product protocol “complementary,” “synergistic,” or superior without outcome data.
              </p>
            </div>
          </section>

          <section className="space-y-8 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <div id="what-stack-means">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">What “Sleep Stack” Should Mean Here</h2>
              <div className="space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  “Stack” is useful as a shopping term because many products combine multiple ingredients. It is less useful as a clinical conclusion. A blend may contain plausible ingredients at unknown, tiny, or unnecessarily high amounts, and adding ingredients increases the number of possible side effects and interactions.
                </p>
                <p>
                  For chronic insomnia, supplement shopping should not replace evaluation of sleep schedule, caffeine and alcohol, pain, medications, restless legs, sleep apnea symptoms, mood conditions, or other drivers. Cognitive behavioral therapy for insomnia (CBT-I) has much stronger support than supplement stacking for chronic insomnia.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="ingredient-evidence">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Ingredient Evidence Before Combination Claims</h2>
              <ResponsiveTable label="Sleep supplement evidence boundaries">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Ingredient</th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">What human evidence suggests</th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">What it does not establish</th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Key practical caution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium</td>
                      <td className="py-3 pr-4 text-muted">Small trials and reviews have examined insomnia and sleep quality; certainty remains low and findings are inconsistent.</td>
                      <td className="py-3 pr-4 text-muted">That glycinate is a proven best sleep form, or that magnesium is an established insomnia treatment.</td>
                      <td className="py-3 text-muted">Supplemental magnesium can cause GI effects and can be hazardous with impaired kidney function.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">L-Theanine</td>
                      <td className="py-3 pr-4 text-muted">Small human studies and recent reviews report possible improvements in some subjective sleep or stress outcomes.</td>
                      <td className="py-3 pr-4 text-muted">A validated insomnia treatment, a guaranteed rapid effect, or added benefit when paired with magnesium.</td>
                      <td className="py-3 text-muted">Check the complete product: some “focus” formulas pair L-theanine with caffeine.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td>
                      <td className="py-3 pr-4 text-muted">Some preparations have improved stress or sleep measures in small, heterogeneous trials.</td>
                      <td className="py-3 pr-4 text-muted">A universal onset timeline, guaranteed cortisol normalization, or safety of a multi-supplement sleep combination.</td>
                      <td className="py-3 text-muted">Pregnancy, thyroid and autoimmune conditions, liver concerns, surgery, and several medication classes require extra caution.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Melatonin</td>
                      <td className="py-3 pr-4 text-muted">It acts as a circadian timing signal and has evidence for some circadian-rhythm problems and jet lag.</td>
                      <td className="py-3 pr-4 text-muted">That it is a generic sedative add-on or that adding it improves an herbal/mineral stack.</td>
                      <td className="py-3 text-muted">Product content can vary; timing depends on the goal and is not interchangeable across sleep problems.</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            <div id="combination-evidence">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">What We Know About Combining Them</h2>
              <EvidenceSummaryCard
                title="Magnesium + L-Theanine + Ashwagandha"
                evidenceLevel="Insufficient combination evidence"
                humanEvidence="No direct magnesium + L-theanine + ashwagandha sleep trial was identified for this review. Studies of individual ingredients or other multi-ingredient products cannot establish the benefit of this exact combination."
                mechanisticEvidence="The ingredients affect different biological systems, but mechanistic differences are hypothesis-generating. They do not demonstrate synergy, a preferred sequence, or superior sleep outcomes."
                safetyProfile="Combination-specific safety is not established. Individual risks can overlap with medication use and health conditions, and adding products increases exposure to excipients and other active ingredients."
              />
              <div className="mt-5 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  A common reasoning error is: “ingredient A has no famous interaction with ingredient B, therefore the combination is safe.” Supplement interaction datasets are incomplete, products vary, and the relevant question may be an interaction with a medication or health condition rather than with the other supplement.
                </p>
                <p>
                  Another error is turning different mechanisms into a personalized protocol. “Physical tension = magnesium” or “racing thoughts = L-theanine” sounds intuitive, but symptom matching at that level is not validated by the evidence reviewed here.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="single-vs-blend">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Single Ingredient vs Multi-Ingredient Blend</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-5">
                  <h3 className="font-semibold text-ink">Single-ingredient product</h3>
                  <ul className="mt-3 ml-5 list-disc space-y-2 text-sm leading-7 text-muted">
                    <li>Easier to identify the ingredient, amount, benefit, or side effect.</li>
                    <li>Easier to stop one ingredient without changing everything else.</li>
                    <li>Easier to compare the dose with a study or product label.</li>
                  </ul>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white p-5">
                  <h3 className="font-semibold text-ink">Multi-ingredient blend</h3>
                  <ul className="mt-3 ml-5 list-disc space-y-2 text-sm leading-7 text-muted">
                    <li>Convenient, but benefit and side effects are harder to attribute.</li>
                    <li>May contain proprietary blends, duplicate ingredients, or added sedatives.</li>
                    <li>The blend itself may never have been tested even when individual ingredients have.</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-[1.01rem] leading-[1.85] text-muted">
                If supplementation is reasonable for you, <strong>one ingredient at a time</strong> is an interpretability principle, not a prescription for which ingredient to choose first or how long to take it.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            <div id="dose-timing">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Dose and Timing: Why This Guide Does Not Give a Stack Protocol</h2>
              <div className="space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  Dose and timing are <strong>study and product specific</strong>. Trials use different populations, formulations, ingredient amounts, schedules, and outcome measures. A dose used in one study is not automatically the best dose for another person or another product.
                </p>
                <p>
                  Magnesium labels should be compared using elemental magnesium. For adults, the U.S. tolerable upper intake level for magnesium from supplements and medications is 350 mg/day unless a healthcare professional recommends otherwise; food magnesium is not included in that limit.
                </p>
                <p>
                  Ashwagandha trials often evaluate repeated use, but study duration is not the same thing as a guaranteed onset time. L-theanine studies also vary in dose, formulation, and timing. This page therefore does not prescribe a fixed sequence or bedtime window for combining them.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Safety Before Combination</h2>
              <SafetyNotice title="Check the Exact Products, Medications, and Conditions">
                <ul className="ml-5 list-disc space-y-1.5">
                  <li><strong>Kidney impairment:</strong> magnesium accumulation and toxicity risk increase when kidney function is impaired.</li>
                  <li><strong>Ashwagandha:</strong> avoid during pregnancy; use extra caution with thyroid or autoimmune disease, before surgery, and with medications including thyroid hormone, sedatives, anticonvulsants, immunosuppressants, and some blood-pressure or diabetes drugs.</li>
                  <li><strong>Liver concerns:</strong> rare cases of liver injury have been associated with ashwagandha products. Stop and seek medical advice for symptoms such as jaundice or dark urine.</li>
                  <li><strong>Alcohol and sedatives:</strong> do not assume supplement combinations are harmless alongside prescription sleep medicines, anti-anxiety medicines, or alcohol.</li>
                  <li><strong>Duplicate ingredients:</strong> check multivitamins, powders, gummies, nighttime blends, and medications so you do not unknowingly duplicate magnesium, melatonin, or sedating ingredients.</li>
                  <li><strong>Possible sleep apnea:</strong> loud snoring, witnessed breathing pauses, gasping, or excessive daytime sleepiness warrant clinical evaluation rather than a larger supplement stack.</li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            <div id="buyer-guide">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Buyer Checklist</h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                The goal is not to find the product with the most ingredients. It is to understand exactly what you are buying and avoid marketing shortcuts that outrun the evidence.
              </p>
              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-5">
                <ul className="ml-5 list-disc space-y-2 text-sm leading-7 text-muted">
                  <li>Prefer a transparent Supplement Facts panel over a proprietary “sleep matrix.”</li>
                  <li>For magnesium, compare elemental magnesium rather than the front-label compound weight.</li>
                  <li>Check whether an L-theanine product also contains caffeine.</li>
                  <li>Check whether a sleep blend quietly adds melatonin, valerian, antihistamine-like ingredients, or multiple sedating herbs.</li>
                  <li>Look for clear extract identity and standardization when a botanical product makes extract-specific claims.</li>
                  <li>Use independent quality testing where available; marketing terms such as “clinical strength” are not evidence grades.</li>
                  <li>Do not interpret a higher ingredient count or higher price as a stronger clinical effect.</li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="decision-framework">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Decision Framework</h2>
              <ResponsiveTable label="Evidence-first sleep supplement decision framework">
                <table className="min-w-[700px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Question</th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Why it matters</th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Safer next step</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Could this be chronic insomnia or a sleep disorder?</td>
                      <td className="py-3 pr-4 text-muted">Supplements do not diagnose or treat sleep apnea and are not a substitute for CBT-I.</td>
                      <td className="py-3 text-muted">Prioritize appropriate clinical evaluation and evidence-based sleep care.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Do I take medications or have relevant health conditions?</td>
                      <td className="py-3 pr-4 text-muted">Ingredient-specific interactions may matter more than the supposed “stack synergy.”</td>
                      <td className="py-3 text-muted">Have a pharmacist or clinician check the exact ingredient list.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Am I considering several new ingredients at once?</td>
                      <td className="py-3 pr-4 text-muted">Benefits and side effects become difficult to attribute.</td>
                      <td className="py-3 text-muted">If a trial is appropriate, keep it simple and interpretable.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Is the claim based on a mechanism or an outcome trial?</td>
                      <td className="py-3 pr-4 text-muted">Mechanisms often sound more certain than clinical evidence actually is.</td>
                      <td className="py-3 text-muted">Prefer human outcome evidence and explicit uncertainty.</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            <div id="faq">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {FAQS.map((faq) => (
                  <div key={faq.question} className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4">
                    <h3 className="font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="related">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Read the Ingredient Evidence Separately</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['/guides/sleep/magnesium-for-sleep/', 'Magnesium for Sleep', 'Overall magnesium sleep evidence and safety.'],
                  ['/guides/sleep/magnesium-types-for-sleep/', 'Magnesium Types for Sleep', 'Form differences without a fake sleep ranking.'],
                  ['/guides/sleep/l-theanine-for-sleep/', 'L-Theanine for Sleep', 'Human evidence, uncertainty, and product context.'],
                  ['/guides/sleep/ashwagandha-for-sleep/', 'Ashwagandha for Sleep', 'Trial evidence plus thyroid, pregnancy, liver, and medication cautions.'],
                  ['/guides/sleep/sleep-herbs-vs-melatonin/', 'Sleep Herbs vs Melatonin', 'Why circadian timing and sedative-style claims are not interchangeable.'],
                  ['/guides/sleep/best-herbs-for-sleep/', 'Sleep Evidence Hub', 'Compare sleep options across the broader evidence cluster.'],
                ].map(([href, label, text]) => (
                  <Link key={href} href={href} className="group rounded-[0.75rem] border border-brand-900/10 bg-white p-4 shadow-sm transition hover:border-brand-700/30">
                    <p className="font-semibold text-ink transition group-hover:text-brand-700">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
                  </Link>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="sources">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Sources</h2>
              <ResponsiveTable label="Sleep stack evidence references">
                <table className="min-w-[720px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Area</th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Source</th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Use in this guide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Insomnia / magnesium / melatonin</td>
                      <td className="py-3 pr-4 text-muted"><a href="https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">NCCIH sleep disorders overview</a></td>
                      <td className="py-3 text-muted">CBT-I context, limited magnesium evidence, melatonin/circadian context, supplement safety framing.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium safety</td>
                      <td className="py-3 pr-4 text-muted"><a href="https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">NIH Office of Dietary Supplements</a></td>
                      <td className="py-3 text-muted">Elemental magnesium, adult supplemental UL, kidney risk, adverse effects, and medication interactions.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium insomnia trials</td>
                      <td className="py-3 pr-4 text-muted"><a href="https://pubmed.ncbi.nlm.nih.gov/33865376/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Mah &amp; Pitre (2021)</a></td>
                      <td className="py-3 text-muted">Systematic review and meta-analysis showing a small, low-certainty evidence base in older adults.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">L-Theanine</td>
                      <td className="py-3 pr-4 text-muted"><a href="https://pubmed.ncbi.nlm.nih.gov/40056718/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Bulman et al. (2025) systematic review and meta-analysis</a></td>
                      <td className="py-3 text-muted">Small human sleep effects with uncertainty about pure L-theanine, optimal dose, and duration.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td>
                      <td className="py-3 pr-4 text-muted"><a href="https://www.nccih.nih.gov/health/ashwagandha" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">NCCIH ashwagandha overview</a></td>
                      <td className="py-3 text-muted">Evidence limits, short-term safety, pregnancy, thyroid, autoimmune, liver, and medication interaction cautions.</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>
          </section>

          <RecommendationSection products={getRevenueProductSet('magnesium')?.products ?? []} />

          <EmailCapture
            headline="Get future research notes by email"
            description="Evidence-first supplement updates, safety context, and new guide announcements. No diagnosis, treatment, or personal medical advice."
            location={`article-${SLUG}`}
          />

          <NewsletterCtaBlock
            title="Continue with the newsletter archive"
            description="Short notes built for cautious supplement decisions."
            location={`article-${SLUG}-newsletter`}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">In this article</p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#what-stack-means', 'What “Stack” Means'],
                ['#ingredient-evidence', 'Ingredient Evidence'],
                ['#combination-evidence', 'Combination Evidence'],
                ['#single-vs-blend', 'Single vs Blend'],
                ['#dose-timing', 'Dose & Timing'],
                ['#safety', 'Safety'],
                ['#buyer-guide', 'Buyer Checklist'],
                ['#decision-framework', 'Decision Framework'],
                ['#faq', 'FAQ'],
                ['#sources', 'Sources'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="block text-sm text-brand-700 hover:text-brand-800 hover:underline">{label}</a>
              ))}
            </nav>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/50 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Evidence checkpoint</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              A plausible mechanism is a reason to study a combination, not proof that the combination improves sleep.
            </p>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Sleep cluster</p>
            <div className="mt-3 space-y-2">
              <Link href="/guides/sleep/best-herbs-for-sleep/" className="block text-sm font-medium text-brand-700 hover:underline">Sleep evidence hub →</Link>
              <Link href="/guides/sleep/magnesium-types-for-sleep/" className="block text-sm font-medium text-brand-700 hover:underline">Magnesium types →</Link>
              <Link href="/guides/sleep/l-theanine-for-sleep/" className="block text-sm font-medium text-brand-700 hover:underline">L-Theanine →</Link>
              <Link href="/guides/sleep/ashwagandha-for-sleep/" className="block text-sm font-medium text-brand-700 hover:underline">Ashwagandha →</Link>
              <Link href="/guides/" className="block text-sm font-medium text-brand-700 hover:underline">All guides →</Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/guides/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">← Back to Guides</Link>
      </div>
    </article>
  )
}
