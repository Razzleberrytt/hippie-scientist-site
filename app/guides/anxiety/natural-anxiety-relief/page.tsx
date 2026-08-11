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

const SLUG = 'natural-anxiety-relief'
const TITLE = 'Natural Anxiety Relief: What the Evidence Supports in 2026'
const DESCRIPTION =
  'An evidence-first guide to natural anxiety and stress supplements, including ashwagandha, L-theanine, magnesium, passionflower, and kava — with current evidence limits, safety context, and decision guidance.'
const DATE = '2026-08-11'
const AUTHOR = 'Will'
const READING_TIME = '13 min read'
const TAGS = ['anxiety', 'stress', 'supplements', 'herbs', 'evidence']
const CATEGORY = 'anxiety'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/anxiety/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best natural supplement for anxiety?',
    answer:
      'There is no evidence-based universal winner. Ashwagandha has repeated-dose human trials in stressed adults, but formulations, populations, and outcomes vary. L-theanine has short-term cognitive and stress data, while a 2026 meta-analysis found anxiety effects inconsistent overall. Magnesium evidence is suggestive but heterogeneous. Match the evidence to the outcome you care about and review safety and medication interactions before using a supplement.',
  },
  {
    question: 'What natural supplement works fastest for anxiety?',
    answer:
      'Current evidence does not establish a reliable fastest natural anxiolytic. Some supplements have been studied after single doses or over short windows, but an acute attention or stress response is not the same as demonstrated relief of anxiety. If you need rapid help for severe or escalating anxiety, supplements are not a dependable substitute for professional care.',
  },
  {
    question: 'Is L-theanine good for anxiety?',
    answer:
      'The evidence is mixed. A 2026 meta-analysis of 31 randomized trials found a short-term attention signal and a modest acute-stress effect, but anxiety effects were inconsistent and generally non-significant. That does not support calling L-theanine a reliable fast-acting anxiety treatment.',
  },
  {
    question: 'Is ashwagandha good for anxiety?',
    answer:
      'Recent meta-analyses report reductions in stress and anxiety measures across repeated-dose trials, but the studies vary in extract, dose, duration, population, and risk of bias. Ashwagandha is better treated as an option with a human evidence signal than as a guaranteed treatment, and its liver, thyroid, autoimmune, and pregnancy cautions matter.',
  },
  {
    question: 'Can I take anxiety supplements with antidepressants or other medications?',
    answer:
      'Do not assume a supplement is interaction-free. Interaction risk depends on the specific supplement, medication, dose, liver and kidney function, and other health factors. Kava has important liver and sedative cautions; magnesium can interfere with absorption of some medicines; and many herbs have incompletely characterized interaction data. Review the combination with a clinician or pharmacist before adding a supplement to psychiatric medication.',
  },
  {
    question: 'When should anxiety be treated professionally?',
    answer:
      'Seek professional evaluation when anxiety is persistent, worsening, causing panic, interfering with work or relationships, or significantly limiting daily life. Complementary approaches have not been proven to treat anxiety disorders and should not replace established care for a diagnosed or severe condition.',
  },
]

const SOURCES = [
  {
    label: 'Ashwagandha stress and anxiety systematic review and meta-analysis (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39348746/',
    note: 'Nine randomized trials and 558 participants; pooled signal with important differences in products, populations, and outcomes.',
  },
  {
    label: 'Ashwagandha extract randomized stress trial (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/32021735/',
    note: '60 otherwise healthy adults with elevated perceived stress; 125 mg or 300 mg root extract twice daily versus placebo for 8 weeks.',
  },
  {
    label: 'L-theanine randomized-trial systematic review and meta-analysis (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
    note: '31 randomized trials and 1,168 participants across healthy and clinical populations; task-specific cognitive findings, modest acute-stress signal, inconsistent anxiety findings.',
  },
  {
    label: 'Magnesium anxiety and sleep systematic review (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/38817505/',
    note: '15 interventional studies; conclusions limited by small samples, heterogeneous populations, formulations, doses, and durations.',
  },
  {
    label: 'Magnesium randomized crossover trial in premenstrual symptoms (1998)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/9861593/',
    note: '38 women; 200 mg magnesium as magnesium oxide versus placebo across two menstrual cycles; no improvement in the anxiety symptom category.',
  },
  {
    label: 'NCCIH: Passionflower usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/passionflower',
    note: 'Small amount of human research; conclusions about anxiety are not definite; pregnancy and sedation cautions.',
  },
  {
    label: 'Passionflower preoperative-anxiety randomized trial (2008)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/18499602/',
    note: '60 ambulatory-surgery patients; 500 mg oral Passiflora incarnata versus placebo 90 minutes before surgery.',
  },
  {
    label: 'NCCIH: Kava usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/kava',
    note: 'Possible anxiety benefit in some contexts, substantial uncertainty, and rare but potentially severe liver injury.',
  },
  {
    label: 'Kava for generalized anxiety disorder randomized trial (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31813230/',
    note: '171 currently non-medicated adults with generalized anxiety disorder; standardized aqueous dried-root extract delivering 120 mg kavalactones twice daily versus placebo for 16 weeks.',
  },
  {
    label: 'NIH Office of Dietary Supplements: Magnesium fact sheet',
    href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    note: 'Supplement safety, upper limits, kidney-risk context, and medication interactions.',
  },
]

export default function NaturalAnxietyReliefPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/anxiety/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/guides/anxiety/${SLUG}/`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/guides/anxiety/${SLUG}/`, questions: FAQS })
  const ashwagandhaProducts = getRevenueProductSet('ashwagandha')?.products ?? []
  const theanineProducts = getRevenueProductSet('l-theanine')?.products ?? []

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
        <Link href="/guides/anxiety/" className="transition hover:text-ink">
          Anxiety
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">Natural Anxiety Relief</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Evidence-first guide
          </span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold capitalize text-muted">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold capitalize text-muted"
            >
              {tag}
            </span>
          ))}
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
          <LastUpdatedBadge date={DATE} label="Last evidence review" />
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/natural-anxiety-relief.jpg"
              alt="Calming herbs including lavender, chamomile, and passionflower with supplements used for stress and anxiety support"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Human evidence differs sharply by ingredient, outcome, preparation, and study population.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. Product links are sourcing examples, not evidence that a product will treat anxiety.
        If you purchase through an affiliate link, we may earn a commission at no additional cost to you.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <section
            id="bottom-line"
            className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8"
          >
            <p className="eyebrow-label">Evidence bottom line</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              There is no evidence-based “fastest” or universally best anxiety supplement
            </h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                The biggest mistake in this category is treating <strong>stress, acute stress,
                racing thoughts, and an anxiety disorder as the same outcome.</strong> They are not.
                A supplement can change a laboratory stress measure or attention task without proving
                that it reliably relieves anxiety.
              </p>
              <p>
                Recent evidence gives <strong>ashwagandha a repeated-dose stress/anxiety signal</strong>,
                but trials vary substantially. The July 2026 L-theanine meta-analysis found a
                task-specific short-term cognitive signal and modest acute-stress effect while anxiety
                findings remained inconsistent. Magnesium evidence is suggestive but heterogeneous;
                passionflower evidence is small and uncertain; and kava carries enough liver and
                sedative risk that it should not be treated as a casual first-line option.
              </p>
            </div>
          </section>

          <section id="choose" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Start with the question</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Match the evidence to what you are actually trying to change
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">Ongoing stress with anxiety symptoms</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Ashwagandha has repeated-dose trial data, but the evidence is not a guarantee and
                  does not make every extract interchangeable.
                </p>
                <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Review ashwagandha evidence →
                </Link>
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">Situational stress or racing thoughts</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  L-theanine is studied in short-term cognitive and stress paradigms, but current
                  pooled evidence does not establish reliable acute anxiety relief.
                </p>
                <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Review L-theanine evidence →
                </Link>
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">Possible low magnesium status</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Magnesium is biologically important and some trials report anxiety improvements,
                  but formulation, baseline status, and study quality make a universal anxiety claim
                  inappropriate.
                </p>
                <Link href="/guides/other/magnesium-types-guide/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Compare magnesium forms →
                </Link>
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">You prefer an herbal option</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Passionflower has only a small amount of human research. Kava has more anxiety
                  research but substantially more safety baggage, including rare serious liver injury.
                </p>
                <Link href="/guides/anxiety/best-herbs-for-anxiety/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Compare anxiety herbs →
                </Link>
              </div>
            </div>
          </section>

          <section id="evidence" className="space-y-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <div>
              <p className="eyebrow-label">Human evidence</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                What the main options actually have behind them
              </h2>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                These summaries intentionally separate an evidence signal from a treatment claim.
                Study populations, preparations, durations, and outcome scales determine how far a
                result can reasonably be generalized.
              </p>
            </div>

            <div id="ashwagandha">
              <EvidenceSummaryCard
                title="Ashwagandha — repeated-dose stress/anxiety signal"
                evidenceLevel="Moderate"
                humanEvidence="The 2024 meta-analysis included nine randomized trials and 558 participants. A representative 8-week placebo-controlled trial enrolled 60 otherwise healthy adults with elevated perceived stress and compared 125 mg or 300 mg ashwagandha root extract twice daily with placebo. Those extract-specific stress and anxiety results should not be generalized to every ashwagandha product or to diagnosed anxiety disorders."
                mechanisticEvidence="Cortisol and HPA-axis findings are biologically interesting, but biomarker changes are not interchangeable with a clinically meaningful anxiety response."
                safetyProfile="Short-term trials often report tolerability, but rare liver injury has been reported. Pregnancy, thyroid disease or thyroid medication, autoimmune disease, and sedating medications deserve extra caution."
              />
              <p className="mt-3 text-sm leading-7 text-muted">
                <strong>Useful interpretation:</strong> ashwagandha is one of the more directly
                studied supplements for repeated stress/anxiety symptoms, but “strongest” or “best”
                labels hide the uncertainty between products and populations. Read the{' '}
                <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="font-semibold text-brand-700 hover:underline">
                  dedicated anxiety guide
                </Link>{' '}
                before treating a trial dose as a personal recommendation.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            <div id="l-theanine">
              <EvidenceSummaryCard
                title="L-Theanine — task-specific short-term evidence"
                evidenceLevel="Limited"
                humanEvidence="The 2026 meta-analysis included 31 randomized trials and 1,168 participants comparing oral L-theanine with placebo across healthy and clinical populations. Its primary acute-stress analysis focused on single doses in healthy adults; 200 mg given 30–60 minutes before cognitive testing improved choice reaction time, while the acute-stress effect was modest and sensitive to study bias. Anxiety findings were inconsistent overall; the clinical anxiety signal highlighted in the review used 400 mg/day for 8 weeks in people with psychotic disorders."
                mechanisticEvidence="Neurophysiology and neurotransmitter findings can support plausibility, but they do not establish a predictable onset or clinically meaningful anxiety benefit."
                safetyProfile="Trials generally report good short-term tolerability, but interaction and long-term data are less complete than marketing often implies."
              />
              <p className="mt-3 text-sm leading-7 text-muted">
                <strong>Useful interpretation:</strong> the evidence does not justify calling
                L-theanine the fastest natural anxiolytic, promising a 30–60 minute anxiety response,
                or treating combinations with other calming products as automatically low-risk. See the{' '}
                <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="font-semibold text-brand-700 hover:underline">
                  current L-theanine anxiety review
                </Link>{' '}
                for the population and outcome details.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            <div id="magnesium">
              <EvidenceSummaryCard
                title="Magnesium — suggestive, heterogeneous evidence"
                evidenceLevel="Limited"
                humanEvidence="The 2024 review included 15 interventional studies: seven measured anxiety and one measured both anxiety and sleep. Populations, formulations, doses, comparators, and durations varied, and some products contained additional active ingredients. A representative randomized double-blind crossover trial in 38 women compared 200 mg magnesium as magnesium oxide with placebo across two menstrual cycles and did not improve the anxiety symptom category."
                mechanisticEvidence="Magnesium is essential for normal nerve and muscle function. Biological necessity does not mean supplementation will improve anxiety in a person who is already magnesium-replete."
                safetyProfile="Supplemental magnesium can cause gastrointestinal effects and interacts with some medicines. Toxicity risk rises when kidney function is impaired."
              />
              <p className="mt-3 text-sm leading-7 text-muted">
                <strong>Useful interpretation:</strong> magnesium is not a universal “first-line”
                anxiety supplement. Baseline intake, medical conditions, medication timing, and the
                amount of <em>elemental</em> magnesium matter more than a trendy form name.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            <div id="passionflower">
              <EvidenceSummaryCard
                title="Passionflower — small and uncertain evidence base"
                evidenceLevel="Limited"
                humanEvidence="NCCIH characterizes the evidence as small and inconclusive. In one randomized double-blind trial, 60 ambulatory-surgery patients received 500 mg oral Passiflora incarnata or placebo 90 minutes before surgery; preoperative anxiety scores were lower with passionflower, but that procedural setting does not establish ongoing treatment of an anxiety disorder."
                mechanisticEvidence="Preclinical GABA-related hypotheses are not a substitute for adequately powered human trials."
                safetyProfile="Possible drowsiness, dizziness, and confusion. NCCIH advises against use during pregnancy and notes potential concerns around anesthesia and other medicines."
              />
              <p className="mt-3 text-sm leading-7 text-muted">
                <strong>Useful interpretation:</strong> passionflower is better described as an
                uncertain herbal option than a proven gentle anxiolytic. Product standardization and
                preparation also vary.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            <div id="kava">
              <EvidenceSummaryCard
                title="Kava — mixed efficacy with meaningful safety concerns"
                evidenceLevel="Limited"
                humanEvidence="A 2020 phase III trial enrolled 171 currently non-medicated adults with diagnosed generalized anxiety disorder and compared a standardized aqueous dried-root kava extract delivering 120 mg kavalactones twice daily with placebo for 16 weeks. Kava was not significantly better than placebo on the primary anxiety outcome, and liver-test abnormalities were more frequent in the kava group."
                mechanisticEvidence="Kavalactones have pharmacologic activity, but mechanism does not resolve the conflicting efficacy findings or safety concerns."
                safetyProfile="Kava products have been linked to rare cases of serious and sometimes fatal liver injury. Kava should not be combined with alcohol or other sedating substances."
              />
              <p className="mt-3 text-sm leading-7 text-muted">
                <strong>Useful interpretation:</strong> calling kava the “strongest acute herbal
                anxiolytic” overstates the current clinical picture. The benefit signal is mixed and
                the safety downside is large enough to change the decision.
              </p>
            </div>
          </section>

          <section id="what-not-to-conclude" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Evidence traps</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              What not to conclude from supplement research
            </h2>
            <ul className="mt-4 ml-5 list-disc space-y-3 text-[1.01rem] leading-[1.8] text-muted">
              <li>
                <strong>A cortisol change is not automatically anxiety relief.</strong> Biomarkers
                can move without a meaningful change in how a person feels or functions.
              </li>
              <li>
                <strong>An acute lab stress task is not an anxiety disorder.</strong> Evidence from
                healthy volunteers under short-term stress has limited directness for clinical anxiety.
              </li>
              <li>
                <strong>A branded extract is not interchangeable with every product bearing the same
                ingredient name.</strong> Extraction, standardization, dose, and contaminants matter.
              </li>
              <li>
                <strong>“Natural” does not mean interaction-free.</strong> Liver, kidney, sedation,
                pregnancy, and medication context can completely change the risk-benefit balance.
              </li>
              <li>
                <strong>More supplements are not automatically better.</strong> Combining several
                calming products makes side effects and attribution harder to interpret.
              </li>
            </ul>
          </section>

          <section id="care" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">When supplements are the wrong tool</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Persistent or impairing anxiety deserves established care
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              Complementary approaches can be discussed alongside conventional care, but they have
              not been proven to treat anxiety disorders. If anxiety is persistent, worsening,
              triggering panic, disrupting sleep for long periods, or interfering with work,
              relationships, or normal daily function, professional evaluation has much higher value
              than cycling through supplements.
            </p>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              Do not stop or replace prescribed psychiatric medication with a supplement without the
              clinician who manages that medication. Withdrawal, relapse, and drug-supplement
              interactions can create risks that are larger than the supplement question itself.
            </p>
          </section>

          <section id="safety" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Safety overview</h2>
            <SafetyNotice title="Before adding an anxiety or stress supplement">
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  Review supplements with a clinician or pharmacist when you take psychiatric,
                  sedating, blood-pressure, thyroid, immune, liver-active, or other prescription medicines.
                </li>
                <li>
                  Kava has rare serious liver-injury reports and should not be combined with alcohol
                  or other sedating substances.
                </li>
                <li>
                  Passionflower can cause drowsiness and should not be used during pregnancy; discuss
                  it before surgery because of possible interactions with anesthesia-related medicines.
                </li>
                <li>
                  Supplemental magnesium can cause gastrointestinal effects and can interfere with
                  absorption of some medicines. Impaired kidney function increases toxicity risk.
                </li>
                <li>
                  Ashwagandha deserves extra caution with pregnancy, liver disease, thyroid conditions
                  or thyroid medication, autoimmune disease, and sedating medicines.
                </li>
              </ul>
            </SafetyNotice>
          </section>

          <section id="sources" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Primary evidence trail</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Sources used for this update</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              These are the current reviews, randomized-trial records, and U.S. government safety
              resources that drive the claims above. They replace the old “references being compiled” placeholder.
            </p>
            <ol className="mt-5 space-y-4">
              {SOURCES.map((source, index) => (
                <li key={source.href} className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                  <div className="flex gap-3">
                    <span className="font-bold text-brand-700">{index + 1}.</span>
                    <div>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-800 hover:underline"
                      >
                        {source.label} ↗
                      </a>
                      <p className="mt-1 text-sm leading-6 text-muted">{source.note}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="faq" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
            <div className="mt-5 space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                  <h3 className="font-semibold text-ink">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {ashwagandhaProducts.length > 0 && (
            <RecommendationSection
              title="Ashwagandha sourcing examples"
              description="Optional product-format examples for readers who have already reviewed the evidence and safety context above. These are not treatment recommendations."
              products={ashwagandhaProducts}
              trackingProductSlug="ashwagandha"
              trackingLocation="natural-anxiety-relief-ashwagandha-sourcing"
            />
          )}

          {theanineProducts.length > 0 && (
            <RecommendationSection
              title="L-theanine sourcing examples"
              description="Optional sourcing examples only. The 2026 pooled evidence does not establish L-theanine as a reliable anxiety treatment."
              products={theanineProducts}
              trackingProductSlug="l-theanine"
              trackingLocation="natural-anxiety-relief-theanine-sourcing"
            />
          )}

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
                ['#bottom-line', 'Evidence bottom line'],
                ['#choose', 'Choose by question'],
                ['#evidence', 'Human evidence'],
                ['#ashwagandha', 'Ashwagandha'],
                ['#l-theanine', 'L-Theanine'],
                ['#magnesium', 'Magnesium'],
                ['#passionflower', 'Passionflower'],
                ['#kava', 'Kava'],
                ['#what-not-to-conclude', 'Evidence traps'],
                ['#care', 'When to seek care'],
                ['#safety', 'Safety'],
                ['#sources', 'Sources'],
                ['#faq', 'FAQ'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Anxiety cluster</p>
            <div className="mt-3 space-y-2">
              <Link href="/guides/anxiety/" className="block text-sm font-medium text-brand-700 hover:underline">
                Anxiety & stress hub →
              </Link>
              <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="block text-sm font-medium text-brand-700 hover:underline">
                Ashwagandha for anxiety →
              </Link>
              <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="block text-sm font-medium text-brand-700 hover:underline">
                L-theanine for anxiety →
              </Link>
              <Link href="/guides/anxiety/best-herbs-for-anxiety/" className="block text-sm font-medium text-brand-700 hover:underline">
                Compare anxiety herbs →
              </Link>
              <Link href="/guides/anxiety/anxiety-stack-guide/" className="block text-sm font-medium text-brand-700 hover:underline">
                Anxiety stack guide →
              </Link>
            </div>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Editorial rule</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              We do not turn an acute stress result, biomarker change, or mechanistic theory into an anxiety-treatment claim.
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
