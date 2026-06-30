import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import DosageBox from '@/components/DosageBox'
import ComparisonTable from '@/components/ComparisonTable'
import AffiliateProductBox from '@/components/AffiliateProductBox'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'

const SLUG = 'rhodiola-extract-vs-powder'
const PAGE_URL = 'https://thehippiescientist.net/guides/rhodiola-extract-vs-powder'
const TITLE = 'Rhodiola Extract vs Powder: Which Form Actually Works?'
const DESCRIPTION =
  'Compare rhodiola extract vs powder: absorption rates, dosing, cost, and which form performs better for energy, stress, and fatigue based on the clinical evidence.'
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
    question: 'Can I mix rhodiola extract and powder?',
    answer:
      'Technically yes, but there is no real advantage. You would simply add a variable-potency dose (powder) on top of a consistent one (extract), which makes it harder to evaluate what is actually working.',
  },
  {
    question: 'Is a generic rhodiola capsule the same as SHR-5?',
    answer:
      'Not necessarily. SHR-5 is a specific standardized extract used in most clinical trials. Generic capsules may or may not meet the same specifications. Check the label for "standardized to 3% rosavins, 1% salidroside" — if those numbers are absent, you cannot assume equivalence.',
  },
  {
    question: 'Why does powder have so little research?',
    answer:
      'Clinical trials require consistency to produce meaningful results. Raw root powder varies batch to batch depending on harvest location, season, altitude, and storage, which makes controlled studies impractical. Researchers therefore use standardized extracts almost exclusively.',
  },
  {
    question: 'Can I trust cheap extracts?',
    answer:
      'Not all cheap extracts are bad, but many are diluted or not genuinely standardized. Third-party testing (NSF, USP, Informed Sport) is the only reliable verification. Treat "rhodiola extract 500 mg" with no standardization percentages as effectively unverified.',
  },
  {
    question: 'Does the whole herb have benefits that extracts miss?',
    answer:
      'It is theoretically possible — root powder retains minor plant compounds that may have synergistic effects. But there is currently no clinical evidence that this matters for outcomes, so it remains a philosophical rather than evidence-based reason to choose powder.',
  },
]

const COMPARISON_HEADERS = ['Feature', 'Standardized Extract', 'Root Powder']
const COMPARISON_ROWS = [
  { attribute: 'Potency consistency', values: ['High', 'Low / variable'] },
  { attribute: 'Absorption speed', values: ['30–90 min', '1–3 hours'] },
  { attribute: 'Dose required', values: ['200–400 mg', '1–2 g'] },
  { attribute: 'Clinical evidence', values: ['Strong (10+ trials)', 'Minimal / essentially absent'] },
  { attribute: 'Approx. cost / month', values: ['$15–25', '$8–12'] },
  { attribute: 'Best for', values: ['Efficacy & reliability', 'Budget / whole-herb preference'] },
]

const DOSAGE_ROWS = [
  { form: 'SHR-5 standardized extract', range: '200–400 mg/day', notes: 'Min 3% rosavins / 1% salidroside; form used in the trials' },
  { form: 'Standardized capsule (generic)', range: '300–600 mg/day', notes: 'Verify standardization percentages on the label' },
  { form: 'Root powder', range: '1–2 g/day', notes: '3–5× more by weight; potency varies by batch' },
]

const HEADINGS: Heading[] = [
  { id: 'comparison', text: 'Quick Comparison', level: 2 },
  { id: 'research', text: 'What the Research Actually Used', level: 2 },
  { id: 'dosage', text: 'Dosing by Form', level: 2 },
  { id: 'quality', text: 'How to Verify Extract Quality', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

export default function RhodiolaExtractVsPowderGuidePage() {
  const rhodiolaProducts = getRevenueProductSet('rhodiola')
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
          { label: 'Rhodiola Extract vs Powder', href: `/guides/${SLUG}` },
        ]}
      />

      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
          Evidence Guide · Rhodiola Hub
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
          Rhodiola Extract vs Powder
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          Which Form Actually Works — and Why Form Matters More Here
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Walk into any supplement store and you&apos;ll find rhodiola in a dozen forms — standardized extracts,
          root powders, tinctures, generic capsules — with no explanation of the difference. The form matters
          more with rhodiola than most herbs. Here is why, and which one to buy.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/guides/rhodiola-complete-guide" className="text-brand-700 hover:text-brand-800 hover:underline">
            Complete Rhodiola Guide →
          </Link>
          <Link href="/herbs/rhodiola" className="text-brand-700 hover:text-brand-800 hover:underline">
            Rhodiola Herb Profile →
          </Link>
        </div>
      </section>

      {/* Quick comparison */}
      <section id="comparison" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Quick Comparison</h2>
        <ComparisonTable headers={COMPARISON_HEADERS} rows={COMPARISON_ROWS} />
      </section>

      {/* Evidence */}
      <section id="research" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Research Actually Used</h2>
        <p className="text-sm leading-6 text-muted">
          This is the critical point most buying guides miss. Every major positive trial used SHR-5 or a similar
          standardized extract — not generic root powder. If you take powder and see no result, you cannot tell
          whether rhodiola &quot;doesn&apos;t work for you&quot; or whether you simply got a weak batch.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="strong"
            outcome="Standardized extract (SHR-5)"
            takeaway="Darbinyan (2000) used 200 mg SHR-5; Spasov (2000) used 150 mg three times daily; Olsson (2009) used 576 mg/day. All showed positive results with characterized, predictable absorption."
            citationCount={10}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Raw root powder"
            takeaway="Direct clinical evidence for whole rhodiola powder is essentially absent in the peer-reviewed literature. No published bioavailability studies exist for raw powder."
            citationCount={0}
          />
        </div>
      </section>

      {/* Dosage */}
      <section id="dosage" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosing by Form</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="Because powder is far less concentrated than extract, typical doses are 3–5× higher by weight. All doses are general ranges, not medical advice."
        />
      </section>

      {/* How to verify */}
      <section id="quality" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How to Verify Extract Quality</h2>
        <ul className="space-y-2 text-sm leading-6 text-muted">
          <li><strong className="text-ink">Check the label</strong> — it should list &quot;standardized to 3% rosavins, 1% salidroside.&quot;</li>
          <li><strong className="text-ink">Look for third-party testing</strong> — NSF, USP, or Informed Sport certification.</li>
          <li><strong className="text-ink">Avoid proprietary blends</strong> — if the rosavin percentage isn&apos;t listed, assume it is low.</li>
          <li><strong className="text-ink">Check the form description</strong> — &quot;rhodiola extract 500 mg&quot; without standardization specs is effectively meaningless.</li>
        </ul>
        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
          <strong className="font-semibold">Verdict: </strong>
          For most people, start with standardized extract — the evidence base exists for it, potency is
          consistent, and you can actually evaluate whether it works for you. Choose powder only if cost is the
          primary constraint or you specifically prefer whole herbs, accepting more variability in results.
        </div>
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
        <FAQAccordion faqs={FAQS} heading="Common Questions About Rhodiola Forms" />
      </div>

      <EmailCapture location="guides-rhodiola-extract-vs-powder" className="mt-6" />

      {/* Related (hub) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">More in the Rhodiola Hub</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/rhodiola-complete-guide" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Pillar Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Complete Rhodiola Guide</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Forms, benefits, dosing, and the full evidence base in one place.</p>
          </Link>
          <Link href="/guides/rhodiola-energy" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Rhodiola for Energy</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Sustained energy without the stimulant crash — research and dosing.</p>
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
