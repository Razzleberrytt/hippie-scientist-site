import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import DosageBox from '@/components/DosageBox'
import SafetyBox from '@/components/SafetyBox'
import MechanismBox from '@/components/MechanismBox'
import AffiliateProductBox from '@/components/AffiliateProductBox'
import { getRevenueProductSet, revenueProductSets } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'

const SLUG = 'rhodiola-sleep-stack'
const PAGE_URL = 'https://thehippiescientist.net/guides/rhodiola-sleep-stack'
const TITLE = 'Rhodiola + Magnesium for Sleep: Adaptogen Stack'
const DESCRIPTION =
  'The rhodiola-magnesium sleep stack explained: complementary mechanisms, dosing and timing protocols, realistic expectations, and who should avoid it.'
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
    question: 'Can I take rhodiola and magnesium together?',
    answer:
      'Yes — but split the timing rather than taking them at the same moment. Rhodiola goes in the morning because it can cause alertness; magnesium goes 1–3 hours before bed. They target different problems (daytime stress resilience vs nighttime relaxation), which is what makes the pairing rational.',
  },
  {
    question: 'Can rhodiola cause insomnia?',
    answer:
      'In some people, yes. Rhodiola has mild alerting properties, so taking it late in the day can interfere with sleep. Always take it in the morning. If you still notice evening alertness, lower the dose.',
  },
  {
    question: 'Which magnesium is best for sleep?',
    answer:
      'Magnesium glycinate is the safest starting point for sleep — it is well absorbed and well tolerated. Threonate adds cognitive positioning at higher cost, citrate is fine for general use but can loosen stools at higher doses, and oxide is best avoided due to poor absorption.',
  },
  {
    question: 'Can I add melatonin to this stack?',
    answer:
      'Possibly, but evaluate the rhodiola-magnesium stack on its own first so you know what is actually helping. Melatonin influences sleep timing rather than relaxation, so it addresses a different problem; layering everything at once makes it hard to attribute effects.',
  },
  {
    question: 'Is this stack safe long term?',
    answer:
      'Both rhodiola and magnesium are generally well tolerated in healthy adults for long-term use. There is no strong evidence the combination is superior to either alone, and no RCT has studied the pair directly — so treat synergy claims as theoretical, not proven.',
  },
]

const DOSAGE_ROWS = [
  { form: 'Beginner — Rhodiola (AM)', range: '200–300 mg', notes: 'Standardized extract, morning only' },
  { form: 'Beginner — Magnesium (PM)', range: '200 mg glycinate', notes: '1–3 hours before bed' },
  { form: 'Standard — Rhodiola (AM)', range: '300–400 mg', notes: 'Morning only' },
  { form: 'Standard — Magnesium (PM)', range: '300–400 mg glycinate', notes: '1–3 hours before bed' },
]

const SAFETY_NOTES = [
  {
    severity: 'info' as const,
    text: 'Timing is the whole point: rhodiola in the morning (it can cause alertness), magnesium 1–3 hours before bed. Give the stack a minimum of 3–4 weeks before judging it.',
  },
  {
    severity: 'caution' as const,
    text: 'This is not a sleeping pill. Do not expect instant sedation or overnight transformation — think of it as a recovery-support system that works alongside consistent sleep habits.',
  },
  {
    severity: 'caution' as const,
    text: 'Magnesium can cause loose stools at higher doses (especially citrate/oxide). Glycinate is the gentlest. People with impaired kidney function should consult a clinician before supplementing magnesium.',
  },
  {
    severity: 'warning' as const,
    text: 'Consult a healthcare professional first if you are pregnant or nursing, have bipolar disorder or active psychosis, or take psychiatric, sleep, or mood medications.',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'Rhodiola → Resilience',
    description:
      'Rhodiola is not a sedative. It may improve resilience to the chronic stress that disrupts sleep — under chronic stress, cortisol does not drop normally through the evening, leaving people "wired but tired."',
  },
  {
    label: 'Magnesium → Relaxation',
    description:
      'Magnesium has the stronger direct sleep evidence. It supports nerve signaling, muscle relaxation, and neurotransmitter function; low intake may contribute to tension, restlessness, and poor sleep quality.',
  },
  {
    label: 'Non-Overlapping Pathways',
    description:
      'Most stacks fail because they target identical pathways. Here, rhodiola reduces daytime stress loading while magnesium helps the body wind down at night — complementary rather than redundant.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'problem', text: 'The Root Problem: Wired But Tired', level: 2 },
  { id: 'evidence', text: 'What the Evidence Supports', level: 2 },
  { id: 'combination', text: 'Why the Combination Makes Sense', level: 2 },
  { id: 'dosage', text: 'Dosing & Timing Protocol', level: 2 },
  { id: 'safety', text: 'Safety & Who Should Avoid It', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

export default function RhodiolaSleepStackGuidePage() {
  const rhodiolaProducts = getRevenueProductSet('rhodiola')
  const magnesiumProducts = revenueProductSets['magnesium']
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <div className="space-y-8">
      <AffiliateDisclosure variant="compact" className="mb-6" />
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
          { label: 'Rhodiola + Magnesium for Sleep', href: `/guides/${SLUG}` },
        ]}
      />

      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
          Stack Guide · Rhodiola Hub
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
          Rhodiola + Magnesium for Sleep
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          The Adaptogen Stack for the &quot;Wired But Tired&quot; Cycle
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Most sleep supplements force sedation — melatonin shifts timing, antihistamines create drowsiness,
          prescriptions suppress wakefulness. Rhodiola and magnesium take a different approach: addressing the
          underlying contributors to poor sleep rather than forcing unconsciousness. The goal is better sleep
          quality, better recovery, and improved stress resilience.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/guides/rhodiola-complete-guide" className="text-brand-700 hover:text-brand-800 hover:underline">
            Complete Rhodiola Guide →
          </Link>
          <Link href="/guides/magnesium-for-sleep" className="text-brand-700 hover:text-brand-800 hover:underline">
            Magnesium for Sleep Guide →
          </Link>
        </div>
      </section>

      {/* The problem */}
      <section id="problem" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The Root Problem: Wired But Tired</h2>
        <p className="text-sm leading-6 text-muted">
          The most common complaint is &quot;I&apos;m exhausted but can&apos;t fall asleep&quot; — racing thoughts,
          elevated stress, mental hyperactivity, physical tension. The body is fatigued but the nervous system is
          still activated. Under chronic stress, cortisol doesn&apos;t drop normally through the evening, producing
          difficulty winding down and restless sleep. Traditional sleep aids mask this without fixing it.
        </p>
      </section>

      {/* Evidence */}
      <section id="evidence" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Evidence Supports</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="moderate"
            outcome="Magnesium for sleep quality"
            takeaway="Magnesium has the stronger direct sleep evidence of the two — involved in nerve signaling, muscle relaxation, and stress regulation, with trials linking adequate intake to better subjective sleep."
            citationCount={4}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Rhodiola for stress resilience"
            takeaway="Olsson (2009) and related burnout trials show improved fatigue and stress tolerance. Better daytime resilience may translate to better nighttime recovery — an indirect, secondary sleep benefit."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Rhodiola for sleep (direct)"
            takeaway="Direct evidence that rhodiola itself improves sleep is limited. Sleep benefits should be considered secondary to its stress-resilience effects, not a primary indication."
            citationCount={1}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="The combination specifically"
            takeaway="No randomized controlled trial has directly studied the rhodiola + magnesium pairing. Synergy is theoretical — what we can say is that both mechanisms are real, complementary, and generally safe."
            citationCount={0}
          />
        </div>
      </section>

      {/* Mechanism */}
      <section id="combination" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why the Combination Makes Sense</h2>
        <MechanismBox
          summary="These two supplements target different problems. Rhodiola reduces the stress loading your system during the day; magnesium helps your nervous system relax at night. Because the mechanisms do not overlap, the pairing is more rational than stacks that double up on the same pathway."
          points={MECHANISM_POINTS}
        />
      </section>

      {/* Dosage */}
      <section id="dosage" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosing &amp; Timing Protocol</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="Run the protocol for a minimum of 3–4 weeks. Rhodiola = morning only (can cause alertness); magnesium = 1–3 hours before bed. General ranges, not medical advice."
        />
        <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 px-4 py-3 text-sm text-muted">
          <strong className="font-semibold text-ink">What to expect: </strong>
          Week 1 usually no change (some report reduced tension); weeks 2–3 easier recovery and better evening
          wind-down; week 4+ better sleep quality and more stable energy. This is a recovery-support system, not a
          sleeping pill.
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="scroll-mt-20 space-y-4">
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
      {magnesiumProducts && (
        <AffiliateProductBox
          slug="magnesium"
          products={magnesiumProducts.products}
          heading="Magnesium Product Picks"
        />
      )}

      {rhodiolaProducts && (
        <RecommendationSection products={rhodiolaProducts.products} />
      )}

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About the Rhodiola + Magnesium Stack" />
      </div>

      <EmailCapture location="guides-rhodiola-sleep-stack" className="mt-6" />

      {/* Related */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Related Reading</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/rhodiola-complete-guide" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Pillar Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Complete Rhodiola Guide</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Forms, benefits, dosing, and the full evidence base in one place.</p>
          </Link>
          <Link href="/guides/magnesium-for-sleep" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Magnesium for Sleep</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Forms, dosage, and evidence for magnesium as a sleep and anxiety support.</p>
          </Link>
          <Link href="/articles/best-herbs-for-sleep" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Pillar</p>
            <p className="mt-1 text-sm font-semibold text-ink">Best Herbs for Sleep</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Evidence-ranked guide to the most-studied natural sleep options.</p>
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
