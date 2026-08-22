import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Sleep Supplements for Insomnia: What Works, What Does Not',
  description:
    'Evidence-ranked sleep supplements for insomnia: melatonin, magnesium, L-theanine, glycine, valerian, passionflower, ashwagandha, chamomile, tryptophan and tart cherry, with 25 clinical sources.',
  path: '/guides/other/sleep-supplements-guide/',
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
    question: 'What are the best supplements for insomnia?',
    answer:
      'No supplement is a first-line treatment for chronic insomnia. CBT-I has stronger guideline support. Among supplements, melatonin has the clearest role when circadian timing is involved; L-theanine has promising recent evidence for subjective sleep outcomes; magnesium, glycine, valerian, passionflower, ashwagandha, chamomile, tryptophan and tart cherry have more limited, heterogeneous or population-specific evidence.',
  },
  {
    question: 'Which sleep supplement has the strongest evidence?',
    answer:
      'That depends on the target. Melatonin has the most clearly defined role for circadian timing problems and modest average effects in some primary sleep disorders. For chronic insomnia itself, CBT-I is better supported than any supplement. Newer evidence for L-theanine is encouraging but not yet strong enough to call it a proven insomnia treatment.',
  },
  {
    question: 'Does magnesium help insomnia?',
    answer:
      'Possibly for some people, but the evidence is weak. A systematic review found only three randomized trials in 151 older adults, with low to very-low certainty. That evidence does not establish magnesium glycinate as a universal insomnia treatment or prove that one magnesium form is best for sleep.',
  },
  {
    question: 'Does glycine powder help sleep?',
    answer:
      'Small human studies suggest bedtime glycine may improve subjective sleep quality and some next-day fatigue measures, but the evidence base is much smaller than for established insomnia treatments. It is best described as promising and preliminary.',
  },
  {
    question: 'Is valerian a natural sleeping pill?',
    answer:
      'Valerian is widely marketed for sleep, but a 2024 umbrella review found no demonstrated efficacy for treating insomnia, despite some subjective sleep-quality signals. Calling it a proven natural sleeping pill would overstate the evidence.',
  },
  {
    question: 'Can sleep supplements be combined?',
    answer:
      'Do not assume a stack is more effective because each ingredient has a plausible mechanism. Multi-ingredient trials test specific formulas and cannot prove that every pair is synergistic. Combining sedating products can also increase impairment and make side effects harder to identify.',
  },
  {
    question: 'Are sleep supplements safe every night?',
    answer:
      'Nightly safety varies by ingredient, dose, duration, medications, kidney function, pregnancy status and product quality. Short-term tolerability in a trial is not proof of indefinite use. Persistent insomnia should trigger cause-focused evaluation rather than an ever-larger supplement stack.',
  },
  {
    question: 'When should insomnia be evaluated instead of treated with supplements?',
    answer:
      'Evaluation is important when insomnia is persistent, causes daytime impairment, or occurs with loud snoring or breathing pauses, restless legs, severe sleepiness, mood deterioration, pain, medication changes, or safety problems such as drowsy driving.',
  },
]

const SLEEP_REFS = [
  { n: 1, title: 'Management of Chronic Insomnia Disorder in Adults: A Clinical Practice Guideline From the American College of Physicians', text: 'Qaseem A, et al. Ann Intern Med. 2016;165(2):125-133.', year: 2016, pmid: '27136449', doi: '10.7326/M15-2175', url: 'https://pubmed.ncbi.nlm.nih.gov/27136449/' },
  { n: 2, title: 'Behavioral and psychological treatments for chronic insomnia disorder in adults: an AASM clinical practice guideline', text: 'Edinger JD, et al. J Clin Sleep Med. 2021.', year: 2021, pmid: '33164742', doi: '10.5664/jcsm.8986', url: 'https://pubmed.ncbi.nlm.nih.gov/33164742/' },
  { n: 3, title: 'Combination treatment for chronic insomnia disorder in adults: an AASM clinical practice guideline', text: 'AASM guideline. 2026.', year: 2026, pmid: '41975142', url: 'https://pubmed.ncbi.nlm.nih.gov/41975142/' },
  { n: 4, title: 'Initial treatment choices for long-term remission of chronic insomnia disorder in adults', text: 'Systematic review and network meta-analysis of CBT-I, pharmacotherapy and combination treatment.', year: 2024, pmid: '39188094', url: 'https://pubmed.ncbi.nlm.nih.gov/39188094/' },
  { n: 5, title: 'Clinical Practice Guideline for the Pharmacologic Treatment of Chronic Insomnia in Adults', text: 'Sateia MJ, et al. J Clin Sleep Med. 2017.', year: 2017, pmid: '27998379', url: 'https://pubmed.ncbi.nlm.nih.gov/27998379/' },
  { n: 6, title: 'Identifying complementary and alternative medicine recommendations for insomnia treatment and care', text: 'Systematic review of clinical practice guidelines.', year: 2023, pmid: '37397764', url: 'https://pubmed.ncbi.nlm.nih.gov/37397764/' },
  { n: 7, title: 'Over-the-counter products for insomnia in adults: A scoping review of randomised controlled trials', text: 'Review of 51 randomized controlled trials.', year: 2025, pmid: '40054227', url: 'https://pubmed.ncbi.nlm.nih.gov/40054227/' },
  { n: 8, title: 'Dietary Supplement Interventions and Sleep Quality Improvement: A Systematic Review and Meta-Analysis', text: 'Meta-analysis of 28 randomized trials.', year: 2025, pmid: '41470897', url: 'https://pubmed.ncbi.nlm.nih.gov/41470897/' },
  { n: 9, title: 'Meta-analysis: melatonin for the treatment of primary sleep disorders', text: 'Ferracioli-Oda E, Qawasmi A, Bloch MH. PLoS One. 2013.', year: 2013, pmid: '23691095', doi: '10.1371/journal.pone.0063773', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
  { n: 10, title: 'Evidence for the efficacy of melatonin in the treatment of primary adult sleep disorders', text: 'Systematic review and meta-analysis.', year: 2017, pmid: '28648359', url: 'https://pubmed.ncbi.nlm.nih.gov/28648359/' },
  { n: 11, title: 'The effects of L-theanine consumption on sleep outcomes: A systematic review and meta-analysis', text: 'Bulman A, et al. Sleep Med Rev. 2025;81:102076.', year: 2025, pmid: '40056718', doi: '10.1016/j.smrv.2025.102076', url: 'https://pubmed.ncbi.nlm.nih.gov/40056718/' },
  { n: 12, title: 'Examining the effect of L-theanine on sleep: a systematic review of dietary supplementation trials', text: 'Systematic review of 13 standalone L-theanine trials.', year: 2026, pmid: '41176609', url: 'https://pubmed.ncbi.nlm.nih.gov/41176609/' },
  { n: 13, title: 'Oral magnesium supplementation for insomnia in older adults: a Systematic Review & Meta-Analysis', text: 'Mah J, Pitre T. BMC Complement Med Ther. 2021.', year: 2021, pmid: '33865376', doi: '10.1186/s12906-021-03297-z', url: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
  { n: 14, title: 'Magnesium Fact Sheet for Consumers', text: 'NIH Office of Dietary Supplements.', year: 2024, url: 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/' },
  { n: 15, title: 'Effect of Ashwagandha (Withania somnifera) extract on sleep: A systematic review and meta-analysis', text: 'Cheah KL, et al. PLoS One. 2021.', year: 2021, pmid: '34559859', doi: '10.1371/journal.pone.0257843', url: 'https://pubmed.ncbi.nlm.nih.gov/34559859/' },
  { n: 16, title: 'Does valerian work for insomnia? An umbrella review of the evidence', text: 'Valente V, et al. Eur Neuropsychopharmacol. 2024.', year: 2024, pmid: '38359657', doi: '10.1016/j.euroneuro.2024.01.008', url: 'https://pubmed.ncbi.nlm.nih.gov/38359657/' },
  { n: 17, title: 'Effects of Passiflora incarnata on polysomnographic sleep parameters in subjects with insomnia disorder', text: 'Double-blind randomized placebo-controlled study.', year: 2020, pmid: '31714321', doi: '10.1097/YIC.0000000000000291', url: 'https://pubmed.ncbi.nlm.nih.gov/31714321/' },
  { n: 18, title: 'A double-blind, placebo-controlled investigation of Passiflora incarnata herbal tea on subjective sleep quality', text: 'Ngan A, Conduit R. Phytother Res. 2011.', year: 2011, pmid: '21294203', doi: '10.1002/ptr.3400', url: 'https://pubmed.ncbi.nlm.nih.gov/21294203/' },
  { n: 19, title: 'Passionflower: Usefulness and Safety', text: 'National Center for Complementary and Integrative Health.', year: 2026, url: 'https://www.nccih.nih.gov/health/passionflower' },
  { n: 20, title: 'The effect of glycine administration on physiological systems in human adults: a systematic review', text: 'Systematic review including sleep outcomes.', year: 2023, pmid: '37851316', url: 'https://pubmed.ncbi.nlm.nih.gov/37851316/' },
  { n: 21, title: 'The effects of glycine on subjective daytime performance in partially sleep-restricted healthy volunteers', text: 'Bannai M, et al. Front Neurol. 2012.', year: 2012, pmid: '22529837', doi: '10.3389/fneur.2012.00061', url: 'https://pubmed.ncbi.nlm.nih.gov/22529837/' },
  { n: 22, title: 'Effects of chamomile on sleep: A systematic review and meta-analysis of clinical trials', text: 'Kazemi A, et al. Complement Ther Med. 2024.', year: 2024, pmid: '39106912', doi: '10.1016/j.ctim.2024.103071', url: 'https://pubmed.ncbi.nlm.nih.gov/39106912/' },
  { n: 23, title: 'The impact of tryptophan supplementation on sleep quality: a systematic review, meta-analysis, and meta-regression', text: 'Sutanto CN, Loh WW, Kim JE. Nutr Rev. 2022.', year: 2022, pmid: '33942088', doi: '10.1093/nutrit/nuab027', url: 'https://pubmed.ncbi.nlm.nih.gov/33942088/' },
  { n: 24, title: 'The Effect of Tart Cherry on Sleep Quality and Sleep Disorders: A Systematic Review', text: 'Systematic review of seven interventional studies.', year: 2025, pmid: '40964149', doi: '10.1002/fsn3.70923', url: 'https://pubmed.ncbi.nlm.nih.gov/40964149/' },
  { n: 25, title: 'Effects of sleep hygiene education for insomnia: A systematic review and meta-analysis', text: 'Systematic review of 42 randomized trials.', year: 2025, pmid: '40449065', doi: '10.1016/j.smrv.2025.102109', url: 'https://pubmed.ncbi.nlm.nih.gov/40449065/' },
]

const rows = [
  ['Melatonin', 'Moderate / context-specific', 'Circadian timing; modest average sleep-onset effects', 'Not a universal sedative; timing and disorder matter'],
  ['L-theanine', 'Low-to-moderate', 'Subjective sleep quality; emerging evidence', 'Clinical-insomnia and dose-duration evidence remain limited'],
  ['Magnesium', 'Low / very low', 'Possible benefit in some older adults or low-status contexts', 'Small, low-quality insomnia trial base'],
  ['Ashwagandha', 'Low-to-moderate', 'Sleep complaints where stress may coexist', 'Small heterogeneous trial base; extracts vary'],
  ['Valerian', 'Low / inconclusive', 'Possible subjective sleep-quality improvement', '2024 umbrella review found no demonstrated insomnia efficacy'],
  ['Passionflower', 'Low / preliminary', 'Short-term sleep-quality or total-sleep-time signal', 'Small evidence base; pregnancy warning'],
  ['Glycine', 'Low / preliminary', 'Subjective sleep quality and next-day fatigue signals', 'Small studies; not established for insomnia'],
  ['Chamomile', 'Low-to-moderate', 'Sleep-quality signal in heterogeneous trials', 'Objective outcomes and product standardization remain weak'],
  ['Tryptophan', 'Low-to-moderate', 'May reduce wake after sleep onset in some studies', 'Effects not consistent across all sleep outcomes'],
  ['Tart cherry', 'Low / preliminary', 'Possible sleep-duration or efficiency signal', 'Only seven interventional studies in 2025 review; heterogeneous'],
]

export default function SleepSupplementsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Sleep Supplements for Insomnia: What Works, What Does Not"
        description="Evidence-ranked comparison of common sleep supplements with 25 clinical sources and chronic-insomnia guideline context."
        url="https://thehippiescientist.net/guides/other/sleep-supplements-guide"
        type="Article"
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Sleep Supplements' }]} />
      <FAQSchema pagePath="/guides/other/sleep-supplements-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 25 Clinical Sources</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink">Sleep Supplements for Insomnia: What Works, What Does Not</h1>
        <p className="text-lg leading-8 text-muted">
          “Sleep supplement” is not one treatment category. Melatonin, minerals, amino acids, herbs and food-derived products
          target different pathways and have very different human evidence. This page is the comparison hub: it tells you
          which supplement claims are reasonably supported, which are preliminary, and which are mostly marketing.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image src="/images/guides/sleep-supplements-guide.jpg" alt="Sleep supplements beside chamomile tea and lavender" width={1536} height={1024} priority className="w-full h-auto" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">A supplement label tells you what is in the bottle; clinical evidence tells you whether that ingredient has actually improved sleep in humans.</figcaption>
        </figure>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Direct answer</p>
        <h2 className="text-2xl font-semibold">What are the best supplements for insomnia?</h2>
        <p className="text-sm leading-7 text-muted">
          <strong className="text-ink">For chronic insomnia, no supplement has the evidence base of CBT-I.</strong> Major
          clinical guidelines recommend CBT-I as initial treatment, and a 2024 network meta-analysis found it superior to
          pharmacotherapy for long-term remission.<Cite n={1} /><Cite n={2} /><Cite n={4} />
        </p>
        <p className="text-sm leading-7 text-muted">
          Among supplements, <strong className="text-ink">melatonin</strong> has the clearest role when circadian timing is
          involved;<Cite n={9} /><Cite n={10} /> <strong className="text-ink">L-theanine</strong> has promising recent
          meta-analytic evidence for subjective sleep outcomes;<Cite n={11} /><Cite n={12} /> and magnesium, ashwagandha,
          valerian, passionflower, glycine, chamomile, tryptophan and tart cherry have increasingly limited or heterogeneous
          evidence.<Cite n={13} /><Cite n={15} /><Cite n={16} /><Cite n={17} /><Cite n={20} /><Cite n={22} /><Cite n={23} /><Cite n={24} />
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-6xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Evidence matrix</p>
        <h2 className="text-2xl font-semibold text-ink">Sleep supplements ranked by strength of evidence</h2>
        <p className="text-sm leading-7 text-muted">
          The ranking reflects human sleep outcomes, not traditional use or mechanism. Reviews of complementary and OTC
          insomnia interventions consistently describe a mixed, heterogeneous evidence base.<Cite n={6} /><Cite n={7} /><Cite n={8} />
        </p>
        <div className="overflow-x-auto rounded-xl border border-brand-900/10 bg-white">
          <table className="min-w-[820px] w-full text-sm">
            <thead><tr className="border-b bg-brand-50/60"><th className="text-left p-3 font-semibold text-ink">Option</th><th className="text-left p-3 font-semibold text-ink">Evidence</th><th className="text-left p-3 font-semibold text-ink">Best-fit claim</th><th className="text-left p-3 font-semibold text-ink">Main limitation</th></tr></thead>
            <tbody className="text-muted divide-y divide-brand-900/10">
              {rows.map(([name, evidence, fit, limit]) => (
                <tr key={name}><td className="p-3 font-semibold text-ink">{name}</td><td className="p-3">{evidence}</td><td className="p-3">{fit}</td><td className="p-3">{limit}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-4xl space-y-8">
        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Melatonin: strongest when the problem is timing</h2>
          <p className="text-sm leading-7 text-muted">
            A meta-analysis of 19 placebo-controlled studies found modest improvements in sleep latency, total sleep time and
            sleep quality across primary sleep disorders.<Cite n={9} /> A separate adult review found especially convincing
            evidence around delayed sleep phase and other circadian-related problems.<Cite n={10} /> The AASM chronic-insomnia
            pharmacologic guideline, however, suggested against melatonin for adult sleep-onset or sleep-maintenance insomnia
            based on the evidence available for that indication.<Cite n={5} />
          </p>
          <p className="text-sm leading-7 text-muted"><strong className="text-ink">Best interpretation:</strong> melatonin is a circadian tool with modest sleep effects, not a universal natural sleeping pill.</p>
          <Link href="/compounds/melatonin/" className="font-semibold text-brand-700 hover:underline">Melatonin evidence profile →</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">L-theanine: promising, but not established for clinical insomnia</h2>
          <p className="text-sm leading-7 text-muted">
            A 2025 meta-analysis covering 19 articles and 897 participants found small improvements in subjective sleep-onset
            latency, daytime dysfunction and overall subjective sleep quality.<Cite n={11} /> A 2026 review of 13 standalone
            L-theanine trials also found beneficial signals, while emphasizing the need for more high-quality clinical-insomnia
            research.<Cite n={12} />
          </p>
          <p className="text-sm leading-7 text-muted"><strong className="text-ink">Best interpretation:</strong> a legitimate emerging sleep-support ingredient, but not a validated protocol for racing thoughts or insomnia disorder.</p>
          <Link href="/compounds/l-theanine/" className="font-semibold text-brand-700 hover:underline">L-theanine evidence profile →</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Magnesium: evidence is much weaker than the hype</h2>
          <p className="text-sm leading-7 text-muted">
            A 2021 systematic review identified only three randomized trials in 151 older adults. Sleep-onset latency improved
            in pooled analysis, but total sleep time did not significantly improve, and certainty was low to very low.<Cite n={13} />
            That does not establish magnesium glycinate, citrate or another form as a universal insomnia treatment.
          </p>
          <p className="text-sm leading-7 text-muted">
            NIH notes that supplemental magnesium can cause gastrointestinal adverse effects, and kidney function changes the
            risk from excess magnesium. The adult upper limit from supplements and medications is 350 mg/day unless a clinician
            recommends otherwise; food magnesium is not included in that limit.<Cite n={14} />
          </p>
          <Link href="/guides/sleep/magnesium-for-sleep/" className="font-semibold text-brand-700 hover:underline">Magnesium for sleep →</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Ashwagandha: small sleep benefit in a small evidence base</h2>
          <p className="text-sm leading-7 text-muted">
            A 2021 meta-analysis of five randomized trials (400 participants) found a small but significant overall sleep
            effect, with larger effects in some insomnia, higher-dose and longer-duration subgroups.<Cite n={15} /> Because the
            trials used particular extracts and the evidence base is small, this does not prove every ashwagandha powder or gummy works for sleep.
          </p>
          <Link href="/herbs/ashwagandha/" className="font-semibold text-brand-700 hover:underline">Ashwagandha evidence profile →</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Valerian: popular, but no demonstrated insomnia efficacy</h2>
          <p className="text-sm leading-7 text-muted">
            A 2024 umbrella review concluded that valerian had no demonstrated efficacy for insomnia, although some systematic
            reviews showed subjective sleep-quality improvement. Objective and quantitative results were inconsistent and the
            underlying literature was heterogeneous.<Cite n={16} />
          </p>
          <Link href="/herbs/valerian/" className="font-semibold text-brand-700 hover:underline">Valerian evidence profile →</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Passionflower: preliminary randomized evidence</h2>
          <p className="text-sm leading-7 text-muted">
            A 2020 placebo-controlled trial in adults with insomnia found an increase in total sleep time of about 23 minutes
            relative to placebo, while between-group differences in sleep efficiency and wake-after-sleep-onset were not
            significant.<Cite n={17} /> An earlier passionflower-tea study found a subjective sleep-quality signal in healthy
            adults.<Cite n={18} />
          </p>
          <p className="text-sm leading-7 text-muted"><strong className="text-ink">Safety:</strong> NCCIH advises against passionflower during pregnancy because it may induce uterine contractions.<Cite n={19} /></p>
          <Link href="/herbs/passionflower/" className="font-semibold text-brand-700 hover:underline">Passionflower evidence profile →</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Glycine: interesting, but still preliminary</h2>
          <p className="text-sm leading-7 text-muted">
            A 2023 systematic review concluded that glycine has been studied across several physiological outcomes, including
            sleep, but the human sleep evidence remains small.<Cite n={20} /> In partially sleep-restricted healthy adults,
            3 g at bedtime improved some next-day fatigue and sleepiness measures compared with placebo.<Cite n={21} />
          </p>
          <Link href="/guides/sleep/glycine-for-sleep/" className="font-semibold text-brand-700 hover:underline">Glycine for sleep →</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Chamomile: some sleep-quality benefit, limited objective evidence</h2>
          <p className="text-sm leading-7 text-muted">
            A 2024 systematic review and meta-analysis of ten studies (772 participants) found improved Pittsburgh Sleep
            Quality Index scores and some signals for sleep onset or nighttime awakenings, but no clear improvement in sleep
            duration, sleep efficiency or daytime functioning. Heterogeneity was high and product testing was uncommon.<Cite n={22} />
          </p>
          <p className="text-sm leading-7 text-muted"><strong className="text-ink">Best interpretation:</strong> chamomile may improve perceived sleep quality for some people, but it is not established as a treatment for insomnia disorder.</p>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Tryptophan: a narrower signal than “helps sleep” suggests</h2>
          <p className="text-sm leading-7 text-muted">
            A systematic review, meta-analysis and meta-regression found tryptophan supplementation was associated with less
            wake after sleep onset, while other sleep components were not consistently improved.<Cite n={23} /> That is a more
            precise claim than saying tryptophan broadly treats insomnia.
          </p>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Tart cherry: plausible, food-based, but still early</h2>
          <p className="text-sm leading-7 text-muted">
            A 2025 systematic review identified seven interventional studies. Three reported improvements in outcomes such as
            sleep duration, efficiency or onset, but the review emphasized large differences in dose, duration and study
            populations and concluded that the evidence remained limited and heterogeneous.<Cite n={24} />
          </p>
        </article>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why sleep hygiene is not a substitute for insomnia treatment</h2>
        <p className="text-sm leading-7 text-muted">
          Better sleep habits can help, but a 2025 meta-analysis of 42 randomized trials found sleep-hygiene education was
          inferior to CBT-I and partial CBT-I approaches for insomnia severity.<Cite n={25} /> This matters because supplement
          content often frames the choice as “fix your bedtime routine or buy a capsule,” when chronic insomnia usually needs a more structured approach.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A safer decision sequence</h2>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-muted">
          <li><strong className="text-ink">Identify the target:</strong> sleep timing, falling asleep, repeated waking, early waking or chronic insomnia.</li>
          <li><strong className="text-ink">Rule out the obvious mismatch:</strong> a circadian problem is different from sleep apnea, restless legs, pain, medication effects or anxiety-driven arousal.</li>
          <li><strong className="text-ink">Match the exact product to the evidence:</strong> species, extract, form and amount should resemble what was actually studied.</li>
          <li><strong className="text-ink">Avoid proprietary stacks when possible:</strong> they make evidence matching and side-effect attribution difficult.</li>
          <li><strong className="text-ink">Escalate the evaluation, not the stack:</strong> persistent insomnia deserves cause-focused care and CBT-I rather than indefinite supplement accumulation.<Cite n={1} /><Cite n={2} /></li>
        </ol>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-7 text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-100 max-w-4xl">
        <h2 className="text-xl font-semibold">Safety checks that belong before a cart</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Do not combine several sedating supplements with alcohol, prescription sedatives or antihistamines and assume the effects will remain mild.</li>
          <li>Supplemental magnesium can cause GI effects and deserves extra caution with impaired kidney function.<Cite n={14} /></li>
          <li>Passionflower should not be used during pregnancy because of the uterine-contraction warning.<Cite n={19} /></li>
          <li>Product identity matters: evidence for one standardized extract does not automatically apply to every tea, gummy or proprietary blend.</li>
          <li>Persistent insomnia, breathing pauses, severe daytime sleepiness, restless legs or safety impairment need evaluation rather than stronger supplementation.</li>
        </ul>
        <Link href="/info/disclaimer/" className="mt-3 inline-flex font-semibold underline underline-offset-4">Read the health-information disclaimer</Link>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium p-6 space-y-3 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Related reading</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm font-semibold text-brand-800">
          <li><Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="hover:underline">Best natural sleep aids that work →</Link></li>
          <li><Link href="/guides/sleep/best-supplements-for-sleep/" className="hover:underline">Best supplements for sleep →</Link></li>
          <li><Link href="/guides/sleep/glycine-for-sleep/" className="hover:underline">Glycine for sleep →</Link></li>
          <li><Link href="/guides/sleep/magnesium-for-sleep/" className="hover:underline">Magnesium for sleep →</Link></li>
          <li><Link href="/compounds/l-theanine/" className="hover:underline">L-theanine profile →</Link></li>
          <li><Link href="/herbs/valerian/" className="hover:underline">Valerian profile →</Link></li>
        </ul>
      </section>

      <div className="max-w-4xl">
        <RecommendationSection
          title="Magnesium sourcing examples—only when magnesium fits"
          description="These are product-quality examples, not sleep-treatment rankings. Magnesium has low-certainty insomnia evidence. Check elemental magnesium, kidney function, medication interactions and the supplemental upper limit before buying."
          products={getRevenueProductSet('magnesium')?.products ?? []}
        />
      </div>

      <References refs={SLEEP_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Sleep supplements, melatonin, magnesium — evidence over marketing." ctaLabel="Get the evidence" location="guide-sleep" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/guides/sleep/" className="text-sm font-bold text-brand-800 hover:underline">Sleep hub →</Link></div>
    </div>
  )
}
