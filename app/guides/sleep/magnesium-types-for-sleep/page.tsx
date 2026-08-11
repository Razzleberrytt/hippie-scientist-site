import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'magnesium-types-for-sleep'
const TITLE = 'Magnesium Types for Sleep: Glycinate vs Threonate vs Citrate'
const DESCRIPTION =
  'An evidence-first comparison of magnesium glycinate, threonate, citrate, oxide, malate, and taurate for sleep — separating absorption and tolerability from what sleep trials actually show.'
const DATE = '2026-06-09'
const UPDATED_DATE = '2026-08-11'
const AUTHOR = 'Will'
const READING_TIME = '11 min read'
const TAGS = ['magnesium', 'sleep', 'glycinate', 'threonate', 'citrate']
const CATEGORY = 'minerals'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best magnesium for sleep?',
    answer:
      'No magnesium form has been shown in reliable head-to-head sleep trials to be best. The overall evidence for magnesium supplements and insomnia is limited and conflicting. If you are considering a supplement, compare elemental magnesium, GI tolerability, price, other ingredients, and your reason for using magnesium rather than treating one form as a proven sleep winner.',
  },
  {
    question: 'Is magnesium glycinate better than citrate for sleep?',
    answer:
      'There is not good direct evidence showing that glycinate improves sleep more than citrate. Citrate has evidence of better absorption than oxide, but absorption studies do not establish better sleep outcomes. Citrate can have a laxative effect, while some people choose glycinate for tolerability; individual response varies.',
  },
  {
    question: 'Is magnesium threonate worth it for sleep?',
    answer:
      'Higher price does not mean stronger sleep evidence. Magnesium L-threonate has form-specific research and is marketed heavily for brain-related effects, but current evidence does not establish that it produces better insomnia or sleep outcomes than less expensive forms. Treat the premium price as a product feature, not an evidence grade.',
  },
  {
    question: 'Why can magnesium upset my stomach?',
    answer:
      'Unabsorbed magnesium can draw water into the intestine, so diarrhea, loose stools, nausea, and cramping become more likely as supplemental intake rises. The effect varies by dose, formulation, and person. Lowering the supplemental amount or changing formulations may help; persistent symptoms are a reason to stop and discuss the product with a clinician.',
  },
  {
    question: 'How much magnesium should I take for sleep?',
    answer:
      'There is no well-established universal magnesium dose for insomnia, and study doses have varied. Check the Supplement Facts panel for elemental magnesium rather than the total weight of the magnesium compound. For adults, the U.S. tolerable upper intake level for magnesium from supplements and medications is 350 mg/day unless a healthcare professional recommends otherwise; magnesium naturally present in food is not counted toward that supplemental limit.',
  },
  {
    question: 'Can I combine magnesium with ashwagandha?',
    answer:
      'The absence of a well-known interaction is not enough to call a combination universally safe. Interaction data for supplement combinations can be incomplete, and safety depends on medications, health conditions, pregnancy status, dose, and the specific products used. A pharmacist or clinician can check your individual situation before you combine them.',
  },
]

export default function MagnesiumTypesForSleepPage() {
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
        <Link href="/guides/" className="transition hover:text-ink">
          Guides
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Buyer&apos;s Guide
          </span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize"
            >
              {tag}
            </span>
          ))}
          <span className="text-muted">June 9, 2026</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </Link>
        </p>

        <div className="mt-3">
          <LastUpdatedBadge date={UPDATED_DATE} label="Last updated" />
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/magnesium-types-for-sleep.jpg"
              alt="Different types of magnesium supplements compared for sleep"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Magnesium forms differ in formulation, absorption, price, and GI effects. Sleep superiority is not established.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article may contain affiliate
        links in the curated recommendation section. If you purchase through them, we may earn a
        commission at no additional cost to you. Commercial links do not change the evidence rating
        or safety discussion on this page.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick read</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              What Can We Actually Say About Magnesium Forms and Sleep?
            </h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                <strong>No magnesium form has been shown in reliable head-to-head sleep trials to be best.</strong>{' '}
                Research on magnesium supplements for insomnia is small and inconsistent overall,
                and most form-comparison studies answer a different question: how well a form is
                absorbed or tolerated.
              </p>
              <p>
                That distinction matters. A form can be better absorbed than another without being
                proven to improve sleep more. For a buyer, the defensible comparison is therefore
                <strong> elemental magnesium + tolerability + price + formulation</strong>, not a
                five-star sleep ranking.
              </p>
              <p className="rounded-lg bg-muted/50 p-4 text-sm">
                <strong>Evidence boundary:</strong> a 2021 systematic review found only three
                randomized trials in 151 older adults with insomnia. The authors rated the evidence
                low to very low quality. NCCIH also describes the broader magnesium-and-sleep
                literature as too limited and conflicting for confident conclusions.
              </p>
            </div>
          </section>

          <section className="space-y-8 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <div id="comparison-table">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Magnesium Forms Compared Without a Fake Sleep Ranking
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                This table separates what is reasonably supported from what remains uncertain.
                Absorption and GI behavior can differ by formulation; those differences should not
                be converted into claims that one form is a superior insomnia treatment.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <ResponsiveTable label="Evidence-first comparison of magnesium forms for sleep">
                  <table className="min-w-[760px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Form</th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">What is reasonably supported</th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Practical consideration</th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Sleep evidence gap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Glycinate</td>
                        <td className="py-3 pr-4 text-muted">A magnesium chelate commonly sold for evening use.</td>
                        <td className="py-3 pr-4 text-muted">Compare elemental magnesium, added ingredients, price, and personal GI tolerance.</td>
                        <td className="py-3 text-muted">Direct evidence that glycinate improves sleep more than citrate, oxide, or other forms is insufficient.</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">L-threonate</td>
                        <td className="py-3 pr-4 text-muted">A specialty formulation with form-specific research and premium pricing.</td>
                        <td className="py-3 pr-4 text-muted">Usually provides less elemental magnesium per labeled serving than many other products; check the panel.</td>
                        <td className="py-3 text-muted">Evidence does not establish superior insomnia outcomes versus less expensive forms.</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Citrate</td>
                        <td className="py-3 pr-4 text-muted">Small bioavailability studies support better absorption than magnesium oxide.</td>
                        <td className="py-3 pr-4 text-muted">Can loosen stools because magnesium salts can have an osmotic effect.</td>
                        <td className="py-3 text-muted">Better absorption than oxide does not prove better sleep outcomes.</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Oxide</td>
                        <td className="py-3 pr-4 text-muted">Inexpensive, high elemental-magnesium percentage by compound weight, and commonly used in laxative products.</td>
                        <td className="py-3 pr-4 text-muted">Less completely absorbed than several more soluble forms in small studies and may cause GI effects.</td>
                        <td className="py-3 text-muted">There is no basis to convert its lower absorption into a precise sleep-effect rating.</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Malate</td>
                        <td className="py-3 pr-4 text-muted">Magnesium bound to malate; sold mainly on formulation and non-sleep positioning.</td>
                        <td className="py-3 pr-4 text-muted">Use label quality, elemental amount, cost, and tolerability as the practical filters.</td>
                        <td className="py-3 text-muted">Direct sleep-specific human evidence is sparse.</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Taurate</td>
                        <td className="py-3 pr-4 text-muted">Magnesium bound to taurine; often marketed around taurine-related mechanisms.</td>
                        <td className="py-3 pr-4 text-muted">Mechanistic marketing should not substitute for clinical outcome data.</td>
                        <td className="py-3 text-muted">Direct human sleep evidence for the combined form is very limited.</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="why-form-matters">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Why Form Still Matters</h2>
              <div className="space-y-5 text-[1.01rem] leading-[1.85] text-muted">
                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">1. The label reports elemental magnesium</h3>
                  <p>
                    The Supplement Facts panel reports the amount of elemental magnesium supplied by
                    the product. That is the useful number for comparing products. Do not assume the
                    large milligram number in a product name or front-label callout represents elemental magnesium.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">2. Absorption can differ by salt</h3>
                  <p>
                    NIH Office of Dietary Supplements notes that forms that dissolve well in liquid
                    tend to be absorbed more completely. Small studies found aspartate, citrate,
                    lactate, and chloride more bioavailable than oxide and sulfate. That is useful
                    formulation evidence, but it is not a sleep-treatment ranking.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">3. GI tolerance can determine whether a product is usable</h3>
                  <p>
                    Supplemental magnesium can cause diarrhea, nausea, and abdominal cramping,
                    especially as intake rises. Formulation matters, but so do dose, other ingredients,
                    meals, and individual response. A tolerable product is more practical than one that
                    repeatedly causes symptoms, regardless of its marketing category.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">4. Carrier mechanisms are not clinical outcomes</h3>
                  <p>
                    Glycine, taurine, malate, and threonate each have biological stories attached to
                    them. Those stories can justify research questions; they do not by themselves show
                    that the corresponding magnesium form improves insomnia. Keep mechanistic plausibility
                    separate from demonstrated sleep benefit.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="glycinate">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Magnesium Glycinate</h2>
              <EvidenceSummaryCard
                title="Magnesium Glycinate for Sleep"
                evidenceLevel="Limited"
                humanEvidence="Oral magnesium sleep studies are limited overall, and glycinate-specific head-to-head sleep trials are insufficient to establish superiority over other forms."
                mechanisticEvidence="Magnesium has plausible neurophysiologic roles, and glycine has its own biology, but combining those mechanisms does not establish a larger clinical sleep effect."
                safetyProfile="Supplemental magnesium can cause GI effects. Product dose, formulation, kidney function, medications, and individual tolerance matter more than marketing claims about a universally gentle form."
              />
              <div className="mt-5 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  Glycinate is popular in sleep products because it is a chelated formulation and
                  because glycine is easy to build a calming mechanism story around. The evidence
                  boundary is important: popularity and mechanistic plausibility are not direct proof
                  that magnesium glycinate improves sleep more than other magnesium forms.
                </p>
                <p>
                  If you are comparing glycinate products, prioritize the declared elemental magnesium,
                  ingredient list, serving size, independent quality testing where available, price per
                  serving, and your own GI tolerance. Avoid choosing a product solely because the front
                  label uses a larger compound-weight number.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="threonate">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Magnesium L-Threonate</h2>
              <EvidenceSummaryCard
                title="Magnesium L-Threonate for Sleep"
                evidenceLevel="Limited"
                humanEvidence="Form-specific human research exists, but current sleep evidence does not establish that L-threonate is superior to other magnesium forms for insomnia."
                mechanisticEvidence="Preclinical work has motivated brain-magnesium hypotheses, but those hypotheses should not be translated into a claim of superior human sleep outcomes."
                safetyProfile="Treat it as a magnesium supplement with product-specific dosing and standard magnesium safety considerations. Premium price is not a safety or efficacy signal."
              />
              <div className="mt-5 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  L-threonate is a premium formulation commonly marketed around cognitive and central
                  nervous system claims. It may be a reasonable product to study, but a higher price and
                  a more specialized carrier do not establish better sleep efficacy.
                </p>
                <p>
                  Check the elemental magnesium on the label rather than comparing the total compound
                  weight with glycinate or citrate products. If sleep is the purchasing reason, the key
                  question is whether the added cost is justified by evidence you actually care about;
                  current evidence does not show a clear sleep advantage.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="citrate-oxide">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Citrate and Oxide</h2>
              <div className="space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  <strong>Citrate:</strong> small comparative studies support better absorption than
                  oxide. It is also used for its osmotic GI effect, so loose stools can become a practical
                  limitation. Neither point proves a superior sleep effect.
                </p>
                <p>
                  <strong>Oxide:</strong> it is inexpensive and contains a high proportion of elemental
                  magnesium by compound weight, but NIH ODS summarizes evidence that several other forms
                  are absorbed more completely. It is also common in laxative products. That makes it a
                  different practical tradeoff, not a form that deserves a one-star sleep score.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="malate-taurate">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Malate and Taurate</h2>
              <div className="space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  <strong>Malate:</strong> the carrier participates in normal energy metabolism, but
                  that biochemical fact does not demonstrate a sleep benefit for magnesium malate.
                  Direct sleep-specific human evidence is sparse.
                </p>
                <p>
                  <strong>Taurate:</strong> taurine-related mechanisms are often used to market the
                  combined form. Direct human sleep evidence for magnesium taurate remains very limited,
                  so cardiometabolic or calming mechanism claims should not be used as a substitute for
                  sleep outcomes.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="dosage-label-reading">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Dose, Timing, and Label Reading</h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <ResponsiveTable label="Magnesium label and evidence notes by form">
                  <table className="min-w-[680px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Form</th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Check on label</th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Timing evidence</th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Key caution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      {[
                        ['Glycinate', 'Elemental magnesium and serving size', 'No universally established bedtime timing', 'Do not infer sleep superiority from the carrier'],
                        ['L-threonate', 'Elemental magnesium per product dose', 'Follow product/clinician instructions', 'Premium positioning is not stronger evidence'],
                        ['Citrate', 'Elemental magnesium and total daily intake', 'No established sleep-specific timing advantage', 'May loosen stools'],
                        ['Oxide', 'Elemental magnesium and intended use', 'No established sleep-specific timing advantage', 'Lower absorption than several other forms; GI effects'],
                        ['Malate / Taurate', 'Elemental magnesium and added ingredients', 'No established sleep-specific timing advantage', 'Direct sleep evidence is sparse'],
                      ].map(([form, label, timing, caution]) => (
                        <tr key={form} className="align-top">
                          <td className="py-3 pr-4 font-medium text-ink">{form}</td>
                          <td className="py-3 pr-4 text-muted">{label}</td>
                          <td className="py-3 pr-4 text-muted">{timing}</td>
                          <td className="py-3 text-muted">{caution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>

              <div className="mt-5 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                <p>
                  There is no well-established universal supplemental magnesium dose or bedtime
                  schedule for insomnia. Published studies have used different preparations,
                  populations, and dosing regimens, which is one reason the evidence does not support
                  a single protocol for everyone.
                </p>
                <p>
                  For adults, the U.S. tolerable upper intake level for magnesium from
                  <strong> supplements and medications is 350 mg/day</strong> unless a healthcare
                  professional recommends a higher amount. That limit does not include magnesium
                  naturally present in food. Check all supplements and magnesium-containing medicines
                  when estimating the supplemental total.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Safety and Interactions</h2>
              <SafetyNotice title="Safety Summary — Magnesium Supplements">
                <ul className="ml-5 list-disc space-y-1.5">
                  <li>
                    <strong>GI effects:</strong> supplemental magnesium can cause diarrhea, nausea,
                    and abdominal cramping. Risk generally rises with supplemental intake.
                  </li>
                  <li>
                    <strong>Kidney impairment:</strong> reduced kidney function increases the risk
                    of magnesium accumulation and toxicity. Discuss supplementation with a clinician
                    if you have kidney disease.
                  </li>
                  <li>
                    <strong>Medication absorption:</strong> magnesium can interfere with absorption
                    of some antibiotics and bisphosphonates. Medication-specific spacing instructions
                    differ, so use the prescription label or ask a pharmacist rather than applying one
                    universal spacing rule.
                  </li>
                  <li>
                    <strong>Total supplemental intake:</strong> the adult UL is 350 mg/day from
                    supplements and medications unless a healthcare professional recommends otherwise.
                  </li>
                  <li>
                    <strong>Pregnancy, lactation, or complex medical care:</strong> discuss supplemental
                    dosing and product combinations with a qualified healthcare professional.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            <div id="which-type">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">How to Choose Without Overreading the Evidence</h2>
              <div className="space-y-3 rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-5 text-[1.01rem] leading-[1.85] text-muted">
                <p><strong>If GI tolerance is your main concern:</strong> compare smaller servings and formulations you personally tolerate rather than assuming one carrier is universally gentler.</p>
                <p><strong>If price matters:</strong> compare cost per declared elemental-magnesium amount, not just bottle price or front-label milligrams.</p>
                <p><strong>If constipation is also a goal:</strong> citrate and some other magnesium salts can have laxative effects; that can be useful or unwanted depending on the person.</p>
                <p><strong>If a premium brain-focused product interests you:</strong> L-threonate is a distinct formulation, but do not treat the premium price as proof of better sleep.</p>
                <p><strong>If the goal is chronic insomnia:</strong> magnesium should not displace evaluation of causes and evidence-based insomnia care. CBT-I remains the strongest-supported non-drug treatment approach for chronic insomnia.</p>
              </div>
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

            <div id="sources">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Sources</h2>
              <p className="mb-4 text-sm text-muted">
                These sources answer different questions: overall sleep evidence, form absorption,
                and safety. Better absorption should not be silently converted into a claim of better sleep.
              </p>
              <ResponsiveTable label="Article references">
                <table className="min-w-[640px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Topic</th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Source</th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">What it supports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Overall sleep evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        <a href="https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">NCCIH: Sleep Disorders and Complementary Health Approaches</a>
                      </td>
                      <td className="py-3 text-xs text-muted">Very little magnesium-insomnia research; reviews are low quality or conflicting.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Sleep trials</td>
                      <td className="py-3 pr-4 text-muted">
                        <a href="https://pubmed.ncbi.nlm.nih.gov/33865376/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Mah &amp; Pitre (2021), systematic review and meta-analysis</a>
                      </td>
                      <td className="py-3 text-xs text-muted">Three randomized trials in 151 older adults; low-to-very-low certainty.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Representative trial</td>
                      <td className="py-3 pr-4 text-muted">
                        <a href="https://pubmed.ncbi.nlm.nih.gov/23853635/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Abbasi et al., double-blind placebo-controlled trial</a>
                      </td>
                      <td className="py-3 text-xs text-muted">Older adults with primary insomnia; not a head-to-head comparison of commercial magnesium forms.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Form bioavailability</td>
                      <td className="py-3 pr-4 text-muted">
                        <a href="https://pubmed.ncbi.nlm.nih.gov/14596323/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Walker et al. (2003), randomized double-blind comparison</a>
                      </td>
                      <td className="py-3 text-xs text-muted">Compared absorption of magnesium preparations; sleep was not an endpoint.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Safety and absorption</td>
                      <td className="py-3 pr-4 text-muted">
                        <a href="https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">NIH Office of Dietary Supplements: Magnesium fact sheet</a>
                      </td>
                      <td className="py-3 text-xs text-muted">Elemental-magnesium labeling, form absorption, adult supplemental UL, adverse effects, kidney risk, and medication interactions.</td>
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
                ['#comparison-table', 'Forms Compared'],
                ['#why-form-matters', 'Why Form Matters'],
                ['#glycinate', 'Glycinate'],
                ['#threonate', 'L-Threonate'],
                ['#citrate-oxide', 'Citrate & Oxide'],
                ['#malate-taurate', 'Malate & Taurate'],
                ['#dosage-label-reading', 'Dose & Labels'],
                ['#safety', 'Safety'],
                ['#which-type', 'How to Choose'],
                ['#faq', 'FAQ'],
                ['#sources', 'Sources'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="block text-sm text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Sleep cluster</p>
            <div className="mt-3 space-y-2">
              <Link href="/guides/sleep/magnesium-for-sleep/" className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">Magnesium for sleep →</Link>
              <Link href="/guides/sleep/best-herbs-for-sleep/" className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">Best herbs for sleep →</Link>
              <Link href="/guides/sleep/ashwagandha-for-sleep/" className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">Ashwagandha for sleep →</Link>
              <Link href="/guides/sleep/sleep-stack-guide/" className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">Sleep stack guide →</Link>
              <Link href="/guides/sleep/l-theanine-for-sleep/" className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">L-theanine for sleep →</Link>
              <Link href="/guides/" className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">All guides →</Link>
            </div>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/50 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Buyer checkpoint</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Compare elemental magnesium, serving size, other ingredients, quality testing, price,
              and your own tolerance. Do not use a sleep-star rating as a substitute for clinical evidence.
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/guides/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Guides
        </Link>
      </div>
    </article>
  )
}
