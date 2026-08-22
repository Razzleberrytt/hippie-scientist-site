import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../../src/lib/seo'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'magnesium-types-for-sleep'
const TITLE = 'Magnesium Types for Sleep: Glycinate vs Threonate vs Citrate'
const DESCRIPTION =
  'Evidence-first 2026 comparison of magnesium glycinate, L-threonate, citrate, oxide and other forms for sleep, including new form-specific RCTs, bioavailability, safety, funding and the head-to-head evidence gap.'
const DATE = '2026-06-09'
const UPDATED_DATE = '2026-08-22'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 align-super text-[0.7em] font-semibold text-brand-700">
      <a href={`#ref-${n}`} aria-label={`Reference ${n}`} className="hover:underline">[{n}]</a>
    </sup>
  )
}

const FAQS = [
  {
    question: 'What is the best magnesium type for sleep?',
    answer:
      'No form has been proven best in reliable head-to-head sleep trials. Magnesium bisglycinate and L-threonate now have form-specific randomized trials, but those studies compared each product with placebo rather than directly with citrate, oxide, or each other. Overall magnesium-and-insomnia evidence remains heterogeneous and lower certainty than marketing implies.',
  },
  {
    question: 'Is magnesium glycinate better than citrate for sleep?',
    answer:
      'There is no direct sleep trial establishing glycinate or bisglycinate as superior to citrate. A 2025 bisglycinate placebo-controlled trial found a small improvement in insomnia severity, while citrate has stronger evidence than oxide for bioavailability. Those answer different questions: placebo efficacy versus absorption.',
  },
  {
    question: 'Is magnesium L-threonate better than glycinate for sleep?',
    answer:
      'Not established. L-threonate has two recent product-specific randomized trials with some positive sleep-related findings, but the studies were industry funded and did not compare L-threonate with glycinate. One newer trial found improvement in sleep-related impairment but no group difference in wearable-measured sleep outcomes.',
  },
  {
    question: 'Does better magnesium absorption mean better sleep?',
    answer:
      'No. Citrate is generally more bioavailable than oxide in small human studies, but bioavailability is an intermediate pharmacokinetic outcome. It does not prove that citrate improves insomnia more than oxide or any other form.',
  },
  {
    question: 'How much magnesium should I take for sleep?',
    answer:
      'There is no universal evidence-based insomnia dose. Trials used different forms, elemental amounts, populations, and durations. The U.S. adult tolerable upper intake level is 350 mg per day from magnesium in supplements and medications unless a healthcare professional recommends otherwise; magnesium from food is not counted toward that supplemental limit.',
  },
  {
    question: 'Why does magnesium cause diarrhea?',
    answer:
      'Unabsorbed magnesium salts can have an osmotic effect in the intestine. The likelihood varies with dose, formulation, and individual tolerance. Kidney impairment also changes the safety calculation because magnesium clearance can be reduced.',
  },
]

const SOURCES = [
  { n: 1, label: 'Mah & Pitre (2021): Oral magnesium supplementation for insomnia in older adults — systematic review and meta-analysis', href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/', note: 'Three RCTs / 151 older adults; latency signal but low-to-very-low certainty and moderate-to-high risk of bias.' },
  { n: 2, label: 'Rawji et al. (2024): Supplemental magnesium for self-reported anxiety and sleep — systematic review', href: 'https://pubmed.ncbi.nlm.nih.gov/38817505/', note: 'Fifteen intervention studies overall; eight measured sleep. Forms, populations, doses and co-ingredients varied; the review could not identify an optimal form.' },
  { n: 3, label: 'Schuster et al. (2025): Magnesium bisglycinate in adults reporting poor sleep — randomized placebo-controlled trial', href: 'https://pubmed.ncbi.nlm.nih.gov/40918053/', note: '155 adults; small ISI benefit at 4 weeks (Cohen d about 0.2), no objective sleep assessment, exploratory stronger signal with lower baseline dietary magnesium.' },
  { n: 4, label: 'Hausenblas et al. (2024): Magnesium L-threonate and sleep/daytime functioning — randomized trial', href: 'https://pubmed.ncbi.nlm.nih.gov/39252819/', note: '80 adults with self-reported sleep problems; 21-day branded-product trial with subjective and wearable outcomes; funded by AIDP and included AIDP-affiliated authors.' },
  { n: 5, label: 'Hausenblas et al. (2025): Corrigendum to the 2024 L-threonate sleep trial', href: 'https://pubmed.ncbi.nlm.nih.gov/40567408/', note: 'Published correction linked to the 2024 Sleep Medicine X trial.' },
  { n: 6, label: 'Lopresti & Smith (2026): Magnesium L-threonate cognition and sleep trial', href: 'https://pubmed.ncbi.nlm.nih.gov/41601871/', note: '100 adults; improved sleep-related impairment but not sleep disturbance, restorative sleep, or wearable-measured sleep outcomes; funded by Threotech, which provided study IP/product and participated in study conceptualization.' },
  { n: 7, label: 'Abbasi et al. (2012): Magnesium supplementation in older adults with primary insomnia', href: 'https://pubmed.ncbi.nlm.nih.gov/23853635/', note: 'Small double-blind placebo-controlled study in 46 older adults; used magnesium oxide and reported several positive subjective/biochemical outcomes.' },
  { n: 8, label: 'Rondanelli et al. (2011): Melatonin + magnesium + zinc in long-term-care residents', href: 'https://pubmed.ncbi.nlm.nih.gov/21226679/', note: 'Positive multi-ingredient trial; cannot isolate magnesium as the causal ingredient.' },
  { n: 9, label: 'NIH Office of Dietary Supplements: Magnesium — Health Professional Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/', note: 'Elemental-magnesium labeling, absorption, adult supplemental UL, GI effects, kidney-risk context, and medication interactions.' },
  { n: 10, label: 'Lindberg et al. (1990): Magnesium citrate vs oxide bioavailability', href: 'https://pubmed.ncbi.nlm.nih.gov/2407766/', note: 'Citrate was more soluble/bioavailable than oxide; sleep was not an endpoint.' },
  { n: 11, label: 'Walker et al. (2003): Citrate, amino-acid chelate and oxide bioavailability', href: 'https://pubmed.ncbi.nlm.nih.gov/14596323/', note: 'Randomized double-blind comparison; citrate/chelate showed greater absorption than oxide. Again, not a sleep trial.' },
  { n: 12, label: 'Schuchardt & Hahn (2017): Intestinal absorption and magnesium bioavailability review', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5652077/', note: 'Human form-comparison literature is limited/mixed; some studies favor organic salts while others find smaller differences.' },
]

export default function MagnesiumTypesForSleepPage() {
  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
    `/guides/sleep/${SLUG}/`,
  )
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: 'Sleep', url: 'https://thehippiescientist.net/guides/sleep/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/sleep/${SLUG}/` },
  ])
  const faqLd = faqPageJsonLd({ pagePath: `/guides/sleep/${SLUG}/`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumbLd} />
      {faqLd && <JsonLd schema={faqLd} />}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/guides/" className="hover:text-ink">Guides</Link><span>/</span>
        <Link href="/guides/sleep/" className="hover:text-ink">Sleep</Link><span>/</span>
        <span className="text-ink">Magnesium Types</span>
      </nav>

      <div className="space-y-8">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Sleep-form evidence guide · 12-source ledger</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">{TITLE}</h1>
          <p className="mt-2 text-xs text-muted">Last evidence review August 22, 2026</p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
            Magnesium forms now have more sleep research than they did even two years ago. That is useful—but it still does <strong className="text-ink">not</strong> justify the internet’s usual ranking of “glycinate first, threonate second, citrate third.” A 2025 bisglycinate trial found a small placebo-adjusted insomnia benefit, and two recent L-threonate trials reported some form-specific sleep signals.<Cite n={3} /><Cite n={4} /><Cite n={6} /> None of those trials directly compared glycinate with threonate, citrate, or oxide.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image src="/images/guides/magnesium-types-for-sleep.jpg" alt="Magnesium glycinate, threonate, citrate and oxide supplements compared for sleep evidence" width={1536} height={1024} priority className="h-auto w-full" />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">Placebo efficacy, bioavailability and head-to-head superiority are three different evidence questions.</figcaption>
          </figure>
        </header>

        <section className="rounded-[1.5rem] border border-brand-700/25 bg-brand-50/60 p-6 shadow-sm">
          <p className="eyebrow-label">Bottom line</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">There is still no proven “best magnesium form for sleep”</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-muted sm:text-base">
            <p><strong className="text-ink">Bisglycinate:</strong> now has direct placebo-controlled sleep evidence. In 155 adults reporting poor sleep, four weeks produced a statistically greater ISI reduction than placebo, but the effect was small (Cohen’s d ≈ 0.2) and the trial lacked objective sleep measurement.<Cite n={3} /></p>
            <p><strong className="text-ink">L-threonate:</strong> has two recent branded-product RCTs. One reported favorable subjective and wearable outcomes; another found improved sleep-related impairment but <strong>no group difference in sleep disturbance, restorative sleep, or wearable-measured sleep outcomes</strong>.<Cite n={4} /><Cite n={6} /></p>
            <p><strong className="text-ink">Citrate:</strong> has better human bioavailability evidence than oxide, but that is not evidence of superior insomnia treatment.<Cite n={10} /><Cite n={11} /></p>
            <p><strong className="text-ink">Oxide:</strong> should not be dismissed as “useless for sleep” solely because absorption is lower; an older insomnia RCT using oxide reported positive outcomes, though the broader evidence is low certainty.<Cite n={7} /><Cite n={1} /></p>
          </div>
        </section>

        <section className="space-y-4">
          <p className="eyebrow-label">The evidence hierarchy</p>
          <h2 className="text-2xl font-semibold text-ink">What each kind of study can—and cannot—tell you</h2>
          <ResponsiveTable label="Magnesium evidence hierarchy for sleep">
            <table className="min-w-[860px] w-full text-sm">
              <thead className="border-b border-brand-900/10 bg-brand-50/50"><tr><th className="p-4 text-left font-semibold text-ink">Question</th><th className="p-4 text-left font-semibold text-ink">Best evidence</th><th className="p-4 text-left font-semibold text-ink">What it does not prove</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-4 font-semibold text-ink">Does magnesium help insomnia at all?</td><td className="p-4">2021 and 2024 systematic reviews + individual RCTs.<Cite n={1} /><Cite n={2} /></td><td className="p-4">That every form works, or that effects apply equally to all ages and baseline magnesium states.</td></tr>
                <tr><td className="p-4 font-semibold text-ink">Does bisglycinate beat placebo?</td><td className="p-4">2025 RCT, 155 adults, small ISI effect.<Cite n={3} /></td><td className="p-4">That bisglycinate beats citrate, threonate, oxide, CBT-I, or another active treatment.</td></tr>
                <tr><td className="p-4 font-semibold text-ink">Does L-threonate beat placebo?</td><td className="p-4">2024 and 2026 branded-product RCTs.<Cite n={4} /><Cite n={6} /></td><td className="p-4">That it is the best sleep form, or that every subjective/wearable endpoint improves consistently.</td></tr>
                <tr><td className="p-4 font-semibold text-ink">Is citrate absorbed better than oxide?</td><td className="p-4">Human pharmacokinetic/bioavailability comparisons.<Cite n={10} /><Cite n={11} /></td><td className="p-4">That citrate produces better sleep than oxide.</td></tr>
                <tr><td className="p-4 font-semibold text-ink">Which form is best head-to-head for sleep?</td><td className="p-4"><strong className="text-ink">No adequate direct superiority trial located.</strong></td><td className="p-4">Marketing rankings cannot fill the missing comparison.</td></tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <p className="eyebrow-label">Overall magnesium evidence</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">The older systematic evidence is still low certainty</h2>
          <p className="mt-3 text-sm leading-7 text-muted">A 2021 systematic review/meta-analysis identified only three randomized trials involving 151 older adults with insomnia. Pooled sleep-onset latency favored magnesium by about 17 minutes, while total sleep time did not improve significantly; all trials had moderate-to-high risk of bias and the certainty was low to very low.<Cite n={1} /></p>
          <p className="mt-3 text-sm leading-7 text-muted">A broader 2024 systematic review found eight magnesium intervention studies with sleep outcomes. Five reported improvement in at least one sleep parameter, two were negative and one was mixed—but forms, doses, populations, durations and co-ingredients varied substantially. The authors explicitly concluded that an optimal magnesium form could not be determined.<Cite n={2} /></p>
          <p className="mt-3 text-sm leading-7 text-muted">That means the newer form-specific RCTs should update confidence, not erase the heterogeneity problem.</p>
        </section>

        <section className="space-y-5">
          <p className="eyebrow-label">Form-specific evidence</p>
          <h2 className="text-2xl font-semibold text-ink">Glycinate / bisglycinate: finally a direct trial, but a modest signal</h2>
          <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="text-sm leading-7 text-muted">The 2025 double-blind placebo-controlled trial randomized 155 adults with self-reported poor sleep to magnesium bisglycinate or placebo for four weeks. ISI improved more with bisglycinate (−3.9 vs −2.3), with a borderline-significant between-group test (p=0.049) and a <strong className="text-ink">small effect size of d=0.2</strong>.<Cite n={3} /></p>
            <p className="mt-3 text-sm leading-7 text-muted">The trial did not include objective sleep measurements, and exploratory analyses suggested larger benefit among participants with lower baseline dietary magnesium intake. That is hypothesis-generating subgroup evidence, not proof that “magnesium glycinate works best if you are deficient.”<Cite n={3} /></p>
            <p className="mt-3 text-sm leading-7 text-muted">One author disclosed leadership of a contract research organization funded by nutraceutical companies and presentation honoraria from nutraceutical companies; the other authors reported no conflicts.<Cite n={3} /> Conflict disclosure does not invalidate the result, but it belongs in a premium evidence review.</p>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-ink">L-threonate: more studies, more endpoints—and more reason to read carefully</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-ink">2024 trial: positive branded-product signal</h3>
              <p className="mt-3 text-sm leading-7 text-muted">An 80-person, 21-day randomized trial reported favorable changes in several subjective and Oura Ring-derived measures with magnesium L-threonate versus placebo.<Cite n={4} /> The paper later received a corrigendum.<Cite n={5} /></p>
              <p className="mt-3 text-sm leading-7 text-muted">The study was funded by <strong className="text-ink">AIDP</strong>, and several authors were AIDP employees/affiliates.<Cite n={4} /> That is material because the intervention was a branded ingredient.</p>
            </article>
            <article className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-ink">2026 publication: mixed sleep findings</h3>
              <p className="mt-3 text-sm leading-7 text-muted">A separate six-week trial in 100 adults found greater improvement in sleep-related impairment, but <strong className="text-ink">no group differences</strong> in sleep disturbance, restorative sleep, or Oura Ring sleep outcomes.<Cite n={6} /></p>
              <p className="mt-3 text-sm leading-7 text-muted">It was funded by Threotech, which supplied the intellectual property/product and participated in study conceptualization; both authors had ties to the contract research organization conducting the trial.<Cite n={6} /></p>
            </article>
          </div>
          <p className="text-sm leading-7 text-muted">Together these studies support “L-threonate is worth further study,” not “L-threonate is clinically proven to cross the brain and therefore beats glycinate for sleep.” Neither trial directly compared forms.</p>
        </section>

        <section className="rounded-[1.5rem] border border-brand-900/10 bg-brand-50/40 p-6 shadow-sm">
          <p className="eyebrow-label">Citrate vs oxide</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Bioavailability is useful purchasing evidence, not a sleep ranking</h2>
          <p className="mt-3 text-sm leading-7 text-muted">Human studies dating back to 1990 found magnesium citrate more soluble and/or bioavailable than magnesium oxide.<Cite n={10} /> A 2003 randomized double-blind study also found greater absorption for citrate and an amino-acid chelate than oxide over 60 days.<Cite n={11} /></p>
          <p className="mt-3 text-sm leading-7 text-muted">NIH ODS summarizes the broader pattern similarly: forms that dissolve well tend to be absorbed more completely, with citrate, aspartate, lactate and chloride generally showing higher bioavailability than oxide/sulfate in small studies.<Cite n={9} /></p>
          <p className="mt-3 text-sm leading-7 text-muted"><strong className="text-ink">But:</strong> the 2012 older-adult insomnia RCT that reported positive outcomes used magnesium oxide.<Cite n={7} /> That alone should stop anyone from converting “citrate absorbs better” into “oxide cannot help sleep.”</p>
        </section>

        <section className="space-y-4">
          <p className="eyebrow-label">Attribution problem</p>
          <h2 className="text-2xl font-semibold text-ink">Combination studies cannot identify the winning ingredient</h2>
          <p className="text-sm leading-7 text-muted">A well-known 2011 trial in long-term-care residents found substantial sleep improvement with a combination of <strong className="text-ink">melatonin + magnesium + zinc</strong> versus placebo.<Cite n={8} /> It is evidence for that combination—not clean evidence that magnesium alone caused the effect or that any specific magnesium form is superior.</p>
          <p className="text-sm leading-7 text-muted">This matters because many commercial sleep products contain magnesium plus glycine, L-theanine, melatonin, herbs, or B vitamins. A positive blend trial cannot be silently assigned to the magnesium carrier.</p>
        </section>

        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
          <p className="eyebrow-label text-amber-900">Safety and label reality</p>
          <h2 className="mt-2 text-2xl font-semibold text-amber-950">Elemental magnesium matters more than the giant compound-weight number</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-amber-950">
            <p>NIH ODS notes that the Supplement Facts panel declares <strong>elemental magnesium</strong>, not the total weight of magnesium glycinate, citrate, threonate, or another compound.<Cite n={9} /></p>
            <p>For adults, the U.S. tolerable upper intake level is <strong>350 mg/day from supplements and medications</strong> unless a health professional recommends otherwise; magnesium naturally present in food is excluded from that UL.<Cite n={9} /></p>
            <p>Higher supplemental intakes can cause diarrhea, nausea and cramping. Kidney impairment increases toxicity risk because magnesium clearance is reduced. Magnesium can also interfere with absorption of some antibiotics and bisphosphonates, so medication-specific instructions matter.<Cite n={9} /></p>
          </div>
        </section>

        <section className="space-y-4">
          <p className="eyebrow-label">Decision table</p>
          <h2 className="text-2xl font-semibold text-ink">How the forms compare in 2026</h2>
          <ResponsiveTable label="Magnesium forms for sleep evidence comparison">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="border-b border-brand-900/10 bg-brand-50/50"><tr><th className="p-4 text-left font-semibold text-ink">Form</th><th className="p-4 text-left font-semibold text-ink">Direct sleep evidence</th><th className="p-4 text-left font-semibold text-ink">Other useful evidence</th><th className="p-4 text-left font-semibold text-ink">Verdict</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-4 font-semibold text-ink">Bisglycinate / glycinate</td><td className="p-4">One 155-person placebo RCT; small ISI effect.<Cite n={3} /></td><td className="p-4">Popularity/tolerability claims exceed direct comparative evidence.</td><td className="p-4"><strong className="text-ink">Promising, not proven best.</strong></td></tr>
                <tr><td className="p-4 font-semibold text-ink">L-threonate</td><td className="p-4">Two recent branded-product RCTs with mixed endpoint patterns.<Cite n={4} /><Cite n={6} /></td><td className="p-4">Industry funding/product specificity matters.</td><td className="p-4"><strong className="text-ink">Interesting, premium price not evidence of superiority.</strong></td></tr>
                <tr><td className="p-4 font-semibold text-ink">Citrate</td><td className="p-4">Sparse form-specific sleep data.</td><td className="p-4">Better bioavailability than oxide in small studies.<Cite n={10} /><Cite n={11} /></td><td className="p-4"><strong className="text-ink">Good absorption ≠ proven better sleep.</strong></td></tr>
                <tr><td className="p-4 font-semibold text-ink">Oxide</td><td className="p-4">Older positive insomnia RCT exists.<Cite n={7} /></td><td className="p-4">Lower bioavailability than several soluble forms.<Cite n={9} /></td><td className="p-4"><strong className="text-ink">Not a winner; not evidence-free either.</strong></td></tr>
                <tr><td className="p-4 font-semibold text-ink">Malate / taurate</td><td className="p-4">Very sparse direct sleep evidence.</td><td className="p-4">Mechanistic/carrier stories dominate marketing.</td><td className="p-4"><strong className="text-ink">Insufficient evidence for a sleep ranking.</strong></td></tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-ink">What would actually prove one form is better?</h2>
          <p className="mt-3 text-sm leading-7 text-muted">A strong answer would require a sufficiently large, blinded, <strong className="text-ink">head-to-head randomized trial</strong> comparing forms at appropriately matched elemental magnesium exposure, with prespecified insomnia outcomes, objective sleep measures, baseline magnesium status, adherence, side effects, and clinically meaningful effect thresholds.</p>
          <p className="mt-3 text-sm leading-7 text-muted">Until then, product choice is a tradeoff among evidence, elemental amount, tolerability, price, added ingredients, kidney/medication context, and personal response—not a scientifically established podium.</p>
        </section>

        <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-ink">Sources</h2>
          <ol className="mt-4 space-y-4">
            {SOURCES.map((source) => (
              <li id={`ref-${source.n}`} key={source.n} className="scroll-mt-24 text-sm leading-7 text-muted">
                <span className="font-semibold text-ink">{source.n}. </span>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">{source.label}</a>
                <span> — {source.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">{FAQS.map((faq) => (<details key={faq.question} className="rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm"><summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary><p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p></details>))}</div>
        </section>

        <RecommendationSection products={getRevenueProductSet('magnesium')?.products ?? []} />

        <EmailCapture headline="Get future research notes by email" description="Evidence-first supplement updates, safety context, and new guide announcements." location={`article-${SLUG}`} />
        <NewsletterCtaBlock title="Continue with the newsletter archive" description="Short notes built for cautious supplement decisions." location={`article-${SLUG}-newsletter`} />

        <nav className="grid gap-3 sm:grid-cols-2">
          <Link href="/guides/sleep/magnesium-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Magnesium for Sleep →</Link>
          <Link href="/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Glycinate vs L-Threonate →</Link>
          <Link href="/guides/sleep/best-supplements-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Sleep Supplements →</Link>
          <Link href="/guides/sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Sleep Evidence Hub →</Link>
        </nav>
      </div>
    </article>
  )
}
