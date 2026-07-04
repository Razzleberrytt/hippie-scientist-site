import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import DosageBox from '@/components/DosageBox'
import SafetyBox from '@/components/SafetyBox'
import MechanismBox from '@/components/MechanismBox'
import ComparisonTable from '@/components/ComparisonTable'
import AffiliateProductBox from '@/components/AffiliateProductBox'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

const SLUG = 'rhodiola-energy'
const PAGE_URL = 'https://thehippiescientist.net/guides/rhodiola-energy'
const TITLE = 'Rhodiola for Energy: Science-Backed Energy Without the Crash'
const DESCRIPTION =
  'How rhodiola supports sustained energy without a stimulant crash. Research, dosing, and a comparison to caffeine, ginseng, and ashwagandha.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-06-14'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does rhodiola work immediately for energy?',
    answer:
      'Usually not. Unlike caffeine, rhodiola is not an acute stimulant. Benefits emerge gradually — most responders notice improvements in stress-related fatigue after 2–3 weeks of consistent daily use. Week 1 typically produces no noticeable change.',
  },
  {
    question: 'Can rhodiola replace coffee?',
    answer:
      'No — they serve different purposes. Coffee wins for immediate alertness by blocking adenosine receptors. Rhodiola does not provide that acute boost; instead it may help address the chronic, stress-related fatigue patterns that drive the caffeine-crash cycle in the first place. Many people reduce (rather than eliminate) caffeine when starting rhodiola.',
  },
  {
    question: 'Is rhodiola good for burnout?',
    answer:
      'The evidence is most supportive here. Trials in people with stress-related exhaustion (e.g., Olsson et al. 2009) show gradual improvements in fatigue, concentration, and burnout symptoms. It is best viewed as resilience support rather than a cure for burnout, and it does not replace addressing workload, sleep, and recovery.',
  },
  {
    question: 'Can rhodiola cause anxiety or overstimulation?',
    answer:
      'Rarely. Some people report mild agitation or alertness, particularly at higher doses or when taken late in the day. Taking it in the morning and starting at 200 mg minimizes this. People with severe anxiety disorders, bipolar disorder, or active psychosis should consult a clinician first.',
  },
  {
    question: 'Will I build tolerance to rhodiola?',
    answer:
      'Tolerance is not consistently documented in the available literature, and no long-term toxicity has been established in clinical trials. It can generally be used continuously, though periodic reassessment of whether it is still helping is sensible.',
  },
]

const DOSAGE_ROWS = [
  { form: 'Starting dose', range: '200 mg/day', notes: 'Standardized extract, taken in the morning' },
  { form: 'Standard maintenance', range: '300–400 mg/day', notes: 'Morning; most common effective range' },
  { form: 'Higher-stress periods', range: 'up to 600 mg/day', notes: 'Morning or early afternoon; avoid late evening' },
]

const SAFETY_NOTES = [
  {
    severity: 'info' as const,
    text: 'Take rhodiola in the morning. Some users report alertness that interferes with sleep when it is taken late in the day.',
  },
  {
    severity: 'caution' as const,
    text: 'Higher doses do not reliably produce better results and may increase the chance of overstimulation or mild agitation in sensitive individuals. Start at 200 mg and increase only if needed.',
  },
  {
    severity: 'caution' as const,
    text: 'If you take SSRIs/SNRIs, stimulants, or other psychiatric medication, consult a clinician first. A theoretical serotonin-related interaction with antidepressants exists, though documented cases are absent.',
  },
  {
    severity: 'warning' as const,
    text: 'Avoid during pregnancy or breastfeeding (insufficient safety data), and use caution with bipolar disorder or active psychosis, where overstimulation could be harmful.',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'HPA Axis Modulation',
    description:
      'Rhodiola appears to support the hypothalamic-pituitary-adrenal axis, which governs cortisol release and energy allocation under stress — acting more like a thermostat than a gas pedal.',
  },
  {
    label: 'Mental Fatigue, Not Sedation',
    description:
      'Most positive studies measure mental fatigue and concentration rather than physical exhaustion. Reported benefits include better focus and stress tolerance, especially under chronic stress.',
  },
  {
    label: 'Not Adenosine Blockade',
    description:
      'Unlike caffeine, rhodiola does not mask fatigue by blocking adenosine receptors. This is why it lacks an acute "hit" but also why it avoids the rebound crash and tolerance spiral.',
  },
]

const COMPARISON_HEADERS = ['Feature', 'Rhodiola', 'Caffeine', 'Ginseng', 'Ashwagandha']
const COMPARISON_ROWS = [
  { attribute: 'Immediate boost', values: ['Low', 'High', 'Moderate', 'Low'] },
  { attribute: 'Crash potential', values: ['Low', 'High', 'Low–Moderate', 'Very low'] },
  { attribute: 'Stress resilience', values: ['High', 'Low', 'Moderate', 'High'] },
  { attribute: 'Mental fatigue support', values: ['Moderate–High', 'Moderate', 'Moderate', 'Moderate'] },
  { attribute: 'Sleep disruption risk', values: ['Low–Moderate', 'High', 'Moderate', 'Low'] },
]

const HEADINGS: Heading[] = [
  { id: 'research', text: 'What the Research Shows', level: 2 },
  { id: 'mechanism', text: 'How Rhodiola Supports Energy', level: 2 },
  { id: 'comparison', text: 'Rhodiola vs Other Options', level: 2 },
  { id: 'dosage', text: 'Dosing Protocol', level: 2 },
  { id: 'safety', text: 'Safety & Precautions', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

const RHODIOLA_ENERGY_REFS = [
  { n: 1, text: 'Olsson EM, et al. (2009). Rhodiola rosea for stress-related fatigue. Planta Med, 75(2): 105-112.', url: 'https://pubmed.ncbi.nlm.nih.gov/19016404/' },
  { n: 2, text: 'Darbinyan V, et al. (2000). Rhodiola rosea in fatigue. Phytomedicine, 7(5): 365-371.', url: 'https://pubmed.ncbi.nlm.nih.gov/11081987/' },
  { n: 3, text: 'Ishaque S, et al. (2012). Rhodiola for physical and mental fatigue. BMC Complement Altern Med, 12: 70.', url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/' },
  { n: 4, text: 'Panossian A, et al. (2010). Rosenroot traditional use and clinical trials. Phytomedicine, 17(7): 481-493.', url: 'https://pubmed.ncbi.nlm.nih.gov/20378318/' },
]

export default function RhodiolaEnergyGuidePage() {
  const rhodiolaProducts = getRevenueProductSet('rhodiola')
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished={DATE_PUBLISHED}
        dateModified={DATE_MODIFIED}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Rhodiola for Energy', href: `/guides/${SLUG}` },
        ]}
      />
      <div className="space-y-8">
      <AffiliateDisclosure variant="compact" className="mb-6" />

      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
          Evidence Guide · Rhodiola Hub
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
          Rhodiola for Energy
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          Sustained Energy Without the Stimulant Crash
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Americans spend billions on energy drinks and stimulants that mostly override fatigue signals rather
          than fixing what causes low energy: morning caffeine → midday crash → more caffeine → poor sleep →
          repeat. Rhodiola is an adaptogen — it helps you tolerate stress-related fatigue rather than masking it.
          This is not an acute stimulant, and that is the point.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/guides/rhodiola-complete-guide/" className="text-brand-700 hover:text-brand-800 hover:underline">
            Complete Rhodiola Guide →
          </Link>
          <Link href="/herbs/rhodiola" className="text-brand-700 hover:text-brand-800 hover:underline">
            Rhodiola Herb Profile →
          </Link>
        </div>

        <figure className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/rhodiola-energy.jpg"
              alt="Golden Rhodiola rosea root, powder, and flowers — an adaptogen used for stress-related fatigue and energy"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Rhodiola rosea — an adaptogen that helps the body tolerate stress-related fatigue rather than masking it.
          </figcaption>
        </figure>
      </section>

      {/* Evidence */}
      <section id="research" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Research Shows</h2>
        <p className="text-sm leading-6 text-muted">
          The strongest signal is for stress-related (mental) fatigue. Benefits are modest — roughly a 20–30%
          improvement in fatigue measures — accumulate over weeks, and not everyone responds.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="strong"
            outcome="Stress-related mental fatigue"
            takeaway="Darbinyan (2000) and Spasov (2000) found significant reductions in fatigue and improved work/exam performance versus placebo with standardized extract. Consistent across multiple RCTs."
            citationCount={3}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Burnout / stress-related exhaustion"
            takeaway="Olsson (2009) showed gradual improvements in fatigue, concentration, and burnout symptoms over several weeks of SHR-5 use. Effects were cumulative, not immediate."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Concentration under stress"
            takeaway="Modest but consistent improvements in focus and stress tolerance, most relevant for high-demand work where cognition under sustained stress matters."
            citationCount={3}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Physical / athletic energy"
            takeaway="Mixed results. Some studies show 3–5% endurance improvement; others none. Benefits may reflect recovery and fatigue resistance rather than direct performance enhancement."
            citationCount={2}
          />
        </div>
      </section>

      {/* Mechanism */}
      <section id="mechanism" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How Rhodiola Supports Energy</h2>
        <MechanismBox
          summary="Many forms of fatigue are stress-driven — burnout, overtraining, chronic stress, poor recovery. When fatigue is stress-driven, more stimulation masks symptoms while worsening the root cause. Rhodiola operates through a different mechanism: supporting the body's stress-response physiology rather than blocking fatigue signals."
          points={MECHANISM_POINTS}
        />
      </section>

      {/* Comparison */}
      <section id="comparison" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Rhodiola vs Other Options</h2>
        <p className="text-sm leading-6 text-muted">
          Coffee wins for immediate energy; rhodiola wins for addressing chronic fatigue patterns. Ginseng feels
          more stimulating, while rhodiola is preferred for mental fatigue and burnout. Ashwagandha excels for
          anxiety and sleep; rhodiola performs better for mental fatigue and productivity — many people use both.
        </p>
        <ComparisonTable headers={COMPARISON_HEADERS} rows={COMPARISON_ROWS} />
      </section>

      {/* Dosage */}
      <section className="scroll-mt-20 space-y-4" id="dosage">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosing Protocol</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="No loading phase is needed — benefits accumulate gradually with consistent use. Use a standardized extract listing rosavin and salidroside content."
        />
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
          <strong className="font-semibold">Common mistakes: </strong>
          taking too much (higher doses don&apos;t produce better outcomes), expecting immediate results,
          ignoring sleep, and buying unstandardized products without rosavin/salidroside content listed.
        </div>
      </section>

      {/* Safety */}
      <section className="scroll-mt-20 space-y-4" id="safety">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety &amp; Precautions</h2>
        <SafetyBox notes={SAFETY_NOTES} />
      </section>

      {/* Products */}
      {rhodiolaProducts && (
        <AffiliateProductBox
          slug="rhodiola"
          products={rhodiolaProducts.products}
          heading="Rhodiola Product Picks"
        />
      )}

      {rhodiolaProducts && (
      <>
        <References refs={RHODIOLA_ENERGY_REFS} />
          <RecommendationSection products={rhodiolaProducts.products} />
      </>
      )}

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About Rhodiola for Energy" />
      </div>

      <EmailCapture location="guides-rhodiola-energy" className="mt-6" />

      {/* Related (hub) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">More in the Rhodiola Hub</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/rhodiola-complete-guide/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Pillar Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Complete Rhodiola Guide</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Forms, benefits, dosing, and the full evidence base in one place.</p>
          </Link>
          <Link href="/guides/rhodiola-extract-vs-powder" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Extract vs Powder</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Which form actually works — absorption, dosing, and evidence compared.</p>
          </Link>
          <Link href="/guides/rhodiola-sleep-stack" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Stack Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Rhodiola + Magnesium for Sleep</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">The adaptogen stack for the &quot;wired but tired&quot; cycle.</p>
          </Link>
        </div>
      </section>

      {/* Bottom nav */}
      <div className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm">
        <Link href="/guides/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">← All Guides</Link>
        <Link href="/herbs/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">Herb Library →</Link>
      </div>
      </div>
    </ArticleLayout>
  )
}
