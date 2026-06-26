import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
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

const SLUG = 'rhodiola-complete-guide'
const PAGE_URL = 'https://thehippiescientist.net/guides/rhodiola-complete-guide'
const TITLE = 'Rhodiola: Forms, Benefits & Dosing Guide'
const DESCRIPTION =
  'Evidence-based guide to Rhodiola rosea: forms compared, what the research shows for fatigue and stress, correct dosing, safety, and how to choose a product.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-06-14'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Which form of rhodiola should I start with?',
    answer:
      'A standardized extract capsule (SHR-5) is the best starting point — it is the most studied form, the most convenient, and has consistent potency. Switch to root powder only if cost is a barrier, understanding that powder has minimal direct clinical evidence and variable potency.',
  },
  {
    question: 'When should I take rhodiola?',
    answer:
      'Morning or early afternoon — not before bed. Rhodiola has mild stimulating properties and can interfere with sleep in sensitive individuals when taken late in the day.',
  },
  {
    question: 'How long until I notice effects?',
    answer:
      'Typically 2–3 weeks of consistent use. Rhodiola is not an acute remedy like caffeine; benefits accumulate gradually. A realistic outcome is a 20–30% reduction in fatigue symptoms — meaningful but not a dramatic transformation.',
  },
  {
    question: 'Can I take rhodiola long term?',
    answer:
      'Yes. No tolerance is consistently documented in the literature, and studies have used doses up to 1,500 mg/day without serious toxicity. No long-term harm has been established in the available research.',
  },
  {
    question: 'Can I take rhodiola with antidepressants?',
    answer:
      'Probably safe, but ask your doctor first. There is a theoretical (not documented) serotonin-related interaction with SSRIs/SNRIs. People with bipolar disorder, active psychosis, or severe anxiety disorders should also consult a clinician, as rhodiola may worsen these conditions in some cases.',
  },
  {
    question: 'Will I build tolerance?',
    answer:
      'Tolerance is not documented in the available research. Most people can use rhodiola continuously, though it is sensible to periodically reassess whether it is still providing benefit.',
  },
]

const QUICK_HEADERS = ['Goal', 'Best Form', 'Dose', 'Timeline']
const QUICK_ROWS = [
  { attribute: 'Mental fatigue / burnout', values: ['SHR-5 extract', '300–400 mg/day', '2–3 weeks'] },
  { attribute: 'Budget / whole herb', values: ['Root powder', '1–2 g/day', '2–3 weeks'] },
  { attribute: 'Fast absorption needed', values: ['Tincture', '1–2 mL/day', '2–3 weeks'] },
  { attribute: 'General use', values: ['Standardized capsule', '300 mg/day', '2–3 weeks'] },
]

const DOSAGE_ROWS = [
  { form: 'Starting dose', range: '200 mg/day', notes: 'Standardized extract, morning' },
  { form: 'Standard maintenance', range: '300–400 mg/day', notes: 'Morning; most common effective range' },
  { form: 'High-stress periods', range: 'up to 600 mg/day', notes: 'Morning / early afternoon' },
  { form: 'Studied upper range', range: 'up to 1,500 mg/day', notes: 'No serious toxicity reported; no established upper limit' },
]

const SAFETY_NOTES = [
  {
    severity: 'info' as const,
    text: 'Rhodiola has an excellent safety record in clinical trials. Side effects are rare (<3%) and mild — occasional headache, dry mouth, or agitation in sensitive individuals.',
  },
  {
    severity: 'caution' as const,
    text: 'Theoretical serotonin-related interaction with SSRIs/SNRIs (no documented cases). Additive effects possible with stimulants — reduce caffeine if combining. Consult a clinician about anticoagulants, where interaction data is absent.',
  },
  {
    severity: 'warning' as const,
    text: 'Avoid if pregnant or nursing (insufficient safety data). Use caution with active psychosis (may worsen), bipolar disorder (theoretical mania risk), and severe anxiety disorder (may worsen in some).',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'HPA Axis Modulation',
    description:
      'Rhodiola appears to modulate the hypothalamic-pituitary-adrenal axis — the system governing cortisol release and stress response — acting like a thermostat for the stress system rather than a gas pedal.',
  },
  {
    label: 'Rosavins & Salidroside',
    description:
      'The primary active markers are rosavins (1–3%) and salidroside (0.5–1%), alongside various flavonoids and organic acids. Standardization to these compounds is what distinguishes a verifiable product.',
  },
  {
    label: 'Not Stimulation',
    description:
      'Unlike caffeine, which blocks adenosine receptors to mask fatigue, rhodiola appears to work on the underlying stress physiology — which is why effects are gradual rather than acute.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'summary', text: 'Quick Summary', level: 2 },
  { id: 'evidence', text: 'The Evidence by Outcome', level: 2 },
  { id: 'mechanism', text: 'What Is Rhodiola & How It Works', level: 2 },
  { id: 'forms', text: 'Forms of Rhodiola', level: 2 },
  { id: 'dosage', text: 'Dosage & Timing', level: 2 },
  { id: 'safety', text: 'Safety & Who Should Avoid It', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

export default function RhodiolaCompleteGuidePage() {
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
          { label: 'Complete Rhodiola Guide', href: `/guides/${SLUG}` },
        ]}
      />
      <div className="space-y-8">
      <AffiliateDisclosure variant="compact" className="mb-6" />

      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
          Pillar Guide · Rhodiola Hub
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
          Rhodiola: The Complete Guide
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          Forms, Benefits, Dosing &amp; What the Research Actually Shows
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          72% of American adults report experiencing fatigue regularly, and most reach for stimulants. Rhodiola
          offers a fundamentally different approach: as an adaptogen, it helps the body adapt to stress rather
          than simply stimulating or sedating. This guide covers what rhodiola is, why form matters more than for
          most herbs, what the evidence supports, and how to dose it correctly — no hype, no filler.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/herbs/rhodiola" className="text-brand-700 hover:text-brand-800 hover:underline">
            Rhodiola Herb Profile →
          </Link>
          <Link href="/compounds/salidroside" className="text-brand-700 hover:text-brand-800 hover:underline">
            Salidroside Compound →
          </Link>
        </div>
      </section>

      {/* Quick summary */}
      <section id="summary" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Quick Summary</h2>
        <ComparisonTable headers={QUICK_HEADERS} rows={QUICK_ROWS} caption="Match the form and dose to your goal. All timelines assume consistent daily use." />
      </section>

      {/* Evidence */}
      <section id="evidence" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The Evidence by Outcome</h2>
        <p className="text-sm leading-6 text-muted">
          Evidence quality varies by outcome. The strongest support is for stress-related fatigue; benefits are
          real but modest, and they accumulate over 2–3 weeks rather than acting acutely.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="strong"
            outcome="Stress-related fatigue"
            takeaway="3+ RCTs with consistent findings (Darbinyan 2000, Spasov 2000, Sharpley 2000). Significant reductions in fatigue and improved work/exam performance versus placebo."
            citationCount={3}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Burnout symptoms"
            takeaway="Olsson (2009): SHR-5 at 576 mg/day for 12 weeks improved fatigue, concentration, and burnout symptoms in stress-related exhaustion. Benefits accumulated gradually."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Anxiety in stressed populations"
            takeaway="Kasper (2010) found reduced cortisol response to stress and improved self-reported anxiety. Best for chronic stress rather than as a replacement for anxiety-disorder treatment."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Athletic performance"
            takeaway="Mixed results: some studies show 3–5% endurance improvement, others none. Effect sizes are small and may reflect recovery rather than direct performance enhancement."
            citationCount={2}
          />
        </div>
      </section>

      {/* What it is / mechanism */}
      <section id="mechanism" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What Is Rhodiola &amp; How It Works</h2>
        <p className="text-sm leading-6 text-muted">
          Rhodiola rosea is a perennial plant native to Siberia and Scandinavia, used in traditional medicine for
          over 1,300 years and studied extensively by Soviet researchers from the 1950s–1990s. It is classified as
          an adaptogen — a substance believed to help the body adapt to stress.
        </p>
        <MechanismBox
          summary="Rhodiola's effects are attributed to rosavins and salidroside acting on stress physiology rather than on alertness pathways. This is the key difference from stimulants and the reason its benefits are cumulative."
          points={MECHANISM_POINTS}
        />
      </section>

      {/* Forms summary + satellite links */}
      <section id="forms" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Forms of Rhodiola</h2>
        <p className="text-sm leading-6 text-muted">
          Form matters significantly for rhodiola — more than for many herbs. The <strong>SHR-5 standardized
          extract</strong> (min 1% salidroside, 3% rosavins) is the form used in most clinical trials and the best
          default. <strong>Root powder</strong> is cheaper but has variable potency and minimal direct research.
          <strong> Tinctures</strong> absorb fastest (15–30 min) but often contain alcohol. <strong>Generic
          standardized capsules</strong> are convenient but vary widely by brand.
        </p>
        <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 px-4 py-3 text-sm text-muted">
          <strong className="font-semibold text-ink">Go deeper: </strong>
          the full extract-vs-powder breakdown — absorption, cost, and how to verify standardization — is in the
          dedicated satellite guide linked below.
        </div>
      </section>

      {/* Dosage */}
      <section className="scroll-mt-20 space-y-4" id="dosage">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosage &amp; Timing</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="Take in the morning or early afternoon. No loading phase is needed — benefits accumulate gradually. General ranges, not medical advice."
        />
      </section>

      {/* Safety */}
      <section className="scroll-mt-20 space-y-4" id="safety">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety &amp; Who Should Avoid It</h2>
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
        <RecommendationSection products={rhodiolaProducts.products} />
      )}

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About Rhodiola" />
      </div>

      <EmailCapture location="guides-rhodiola-complete-guide" className="mt-6" />

      {/* Hub: links to all 3 satellites */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Explore the Rhodiola Hub</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/rhodiola-energy" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Rhodiola for Energy</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Sustained energy without the stimulant crash — and how it compares to caffeine.</p>
          </Link>
          <Link href="/guides/rhodiola-extract-vs-powder" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Extract vs Powder</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Which form actually works — absorption, cost, and evidence compared.</p>
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
        <Link href="/guides" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">← All Guides</Link>
        <Link href="/herbs" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">Herb Library →</Link>
      </div>
      </div>
    </ArticleLayout>
  )
}
