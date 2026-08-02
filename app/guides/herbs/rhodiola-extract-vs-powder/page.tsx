import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import DosageBox from '@/components/DosageBox'
import ComparisonTable from '@/components/ComparisonTable'
import AffiliateProductBox from '@/components/AffiliateProductBox'
import { getRevenueProductSet } from '@/config/revenue-products'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

const SLUG = 'rhodiola-extract-vs-powder'
const PAGE_URL = 'https://thehippiescientist.net/guides/herbs/rhodiola-extract-vs-powder'
const TITLE = 'Rhodiola Extract vs Powder: Which Form Actually Works?'
const DESCRIPTION =
  'Compare standardized rhodiola extract with root powder: what human trials actually tested, how to read labels, safety, and where the evidence remains uncertain.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-08-02'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
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
      'No. SHR-5 is a specific proprietary extract used in some clinical trials. Other products may use different extraction methods and marker specifications, so a generic capsule cannot be assumed equivalent merely because it lists the same plant.',
  },
  {
    question: 'Why does powder have so little research?',
    answer:
      'Standardized extracts make the tested intervention easier to characterize and reproduce. The human research located for this review largely evaluated named or standardized extracts, leaving direct outcome evidence for retail root powder sparse.',
  },
  {
    question: 'Can I trust cheap extracts?',
    answer:
      'Price alone does not establish quality. Prefer labels that identify the botanical, plant part, extract ratio or marker compounds, and manufacturer lot information. Credible independent certification or a lot-specific certificate of analysis adds confidence, but no single seal proves clinical effectiveness.',
  },
  {
    question: 'Does the whole herb have benefits that extracts miss?',
    answer:
      'Root powder contains the whole ground plant material, but direct trials have not established that this produces better outcomes than an extract. A whole-herb preference is reasonable; it should not be presented as a proven efficacy advantage.',
  },
]

const COMPARISON_HEADERS = ['Feature', 'Standardized Extract', 'Root Powder']
const COMPARISON_ROWS = [
  { attribute: 'Label consistency', values: ['Can declare extract ratio or marker compounds', 'Naturally varies by source and batch'] },
  { attribute: 'Human evidence', values: ['Several named extracts studied; results are mixed', 'Little direct outcome evidence located'] },
  { attribute: 'Dose comparison', values: ['Use the exact product or extract studied as context', 'Cannot convert trial doses reliably by weight alone'] },
  { attribute: 'Main advantage', values: ['Better characterized and easier to compare with trials', 'Whole-root format with fewer processing steps'] },
  { attribute: 'Main limitation', values: ['Different extracts are not automatically equivalent', 'Potency and trial relevance are harder to judge'] },
  { attribute: 'Evidence-led choice', values: ['Prefer a clearly characterized extract', 'Choose for whole-herb preference, not proven superiority'] },
]

const DOSAGE_ROWS = [
  { form: 'SHR-5 extract', range: 'Study-specific', notes: 'Trials have used different daily amounts; results cannot be generalized to every extract' },
  { form: 'Other standardized extracts', range: 'Follow product-specific evidence', notes: 'Match the extract name, ratio, and markers before comparing doses' },
  { form: 'Root powder', range: 'No evidence-based equivalent', notes: 'Do not convert an extract trial dose to powder using capsule weight alone' },
]

const HEADINGS: Heading[] = [
  { id: 'comparison', text: 'Quick Comparison', level: 2 },
  { id: 'research', text: 'What the Research Actually Used', level: 2 },
  { id: 'dosage', text: 'Dosing by Form', level: 2 },
  { id: 'quality', text: 'How to Verify Extract Quality', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

const RHODIOLA_EXTRACT_VS_POWDER_REFS = [
  { n: 1, text: 'Panossian A, et al. (2010). Rhodiola rosea: traditional use, composition, and clinical trials. Phytomedicine, 17(7): 481-493.', url: 'https://pubmed.ncbi.nlm.nih.gov/20378318/' },
  { n: 2, text: 'Olsson EM, et al. (2009). Rhodiola rosea for stress-related fatigue. Planta Med, 75(2): 105-112.', url: 'https://pubmed.ncbi.nlm.nih.gov/19016404/' },
  { n: 3, text: 'Darbinyan V, et al. (2000). Rhodiola rosea in stress-induced fatigue. Phytomedicine, 7(5): 365-371.', url: 'https://pubmed.ncbi.nlm.nih.gov/11081987/' },
  { n: 4, text: 'Ishaque S, et al. (2012). Rhodiola rosea for physical and mental fatigue: a systematic review. BMC Complement Altern Med, 12:70.', url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/' },
  { n: 5, text: 'Duncan J, et al. (2014). Rhodiola rosea for mental and physical fatigue in nursing students: a randomized controlled trial. PLoS One, 9(9):e108416.', url: 'https://pubmed.ncbi.nlm.nih.gov/25268730/' },
  { n: 6, text: 'National Center for Complementary and Integrative Health. Rhodiola: usefulness and safety.', url: 'https://www.nccih.nih.gov/health/rhodiola' },
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
          { label: 'Rhodiola Extract vs Powder', href: `/guides/herbs/${SLUG}` },
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
          Human trials mostly evaluate named or standardized extracts, not retail root powder. That makes a
          clearly characterized extract the easier evidence-led choice—but the overall rhodiola evidence is
          mixed, and one extract cannot automatically stand in for another.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/guides/herbs/rhodiola-complete-guide/" className="text-brand-700 hover:text-brand-800 hover:underline">
            Complete Rhodiola Guide →
          </Link>
          <Link href="/herbs/rhodiola/" className="text-brand-700 hover:text-brand-800 hover:underline">
            Rhodiola Herb Profile →
          </Link>
        </div>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/rhodiola-extract-vs-powder.jpg"
              alt="Rhodiola extract capsules next to raw rhodiola root powder"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Rhodiola extract vs raw powder — what actually matters.
          </figcaption>
        </figure>
      </section>

      {/* Quick comparison */}
      <section id="comparison" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Quick Comparison</h2>
        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
          <strong className="font-semibold">Bottom line: </strong>
          Choose a clearly characterized extract if you want the closest match to human research. Choose
          powder for a whole-root preference, not because it has been shown to work better. Neither form has
          conclusive evidence for treating a health condition.
        </div>
        <ComparisonTable headers={COMPARISON_HEADERS} rows={COMPARISON_ROWS} />
      </section>

      {/* Evidence */}
      <section id="research" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Research Actually Used</h2>
        <p className="text-sm leading-6 text-muted">
          The most useful distinction is traceability. Clinical trials identify a specific extract and dose,
          while a retail powder may not report marker compounds. Reviews find contradictory results and
          important methodological limitations, so extract standardization improves comparability—not certainty.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="limited"
            outcome="Named or standardized extracts"
            takeaway="Several small trials report benefits, while systematic reviews flag mixed findings, reporting flaws, and limited independent replication. Results apply most directly to the extract tested."
            citationCount={5}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Raw root powder"
            takeaway="Direct human outcome evidence for retail whole-root powder was not identified in the sources reviewed for this page. That is an evidence gap, not proof that powder cannot work."
            citationCount={0}
          />
        </div>
      </section>

      {/* Dosage */}
      <section id="dosage" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosing by Form</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="Rhodiola products are not interchangeable by milligram weight. Use trial doses only as context for the exact extract studied, not as personal medical advice."
        />
      </section>

      {/* How to verify */}
      <section id="quality" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How to Verify Extract Quality</h2>
        <ul className="space-y-2 text-sm leading-6 text-muted">
          <li><strong className="text-ink">Confirm the botanical and plant part</strong> — look for <em>Rhodiola rosea</em> root/rhizome rather than an unspecified rhodiola species.</li>
          <li><strong className="text-ink">Read the extract details</strong> — the extract ratio, solvent, or declared rosavin and salidroside markers make comparison easier.</li>
          <li><strong className="text-ink">Prefer transparent testing</strong> — credible independent certification or a lot-specific certificate of analysis can support identity and contaminant checks.</li>
          <li><strong className="text-ink">Avoid hidden doses</strong> — proprietary blends prevent you from knowing how much rhodiola the serving contains.</li>
        </ul>
        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
          <strong className="font-semibold">Verdict: </strong>
          A characterized extract offers the clearest link to the research, but that does not make the research
          conclusive. Compare the exact extract rather than relying on capsule weight or a generic “standardized” claim.
        </div>
      </section>

      <div id="safety" className="scroll-mt-20">
        <SafetyNotice title="Rhodiola safety and interaction checks">
          <ul className="list-disc space-y-2 pl-5">
            <li>NCCIH describes rhodiola as possibly safe for up to 12 weeks; longer-term safety remains uncertain.</li>
            <li>Reported effects can include dizziness, headache, insomnia, and dry mouth or excess saliva.</li>
            <li>Ask a clinician or pharmacist before use with prescription medicines; an interaction with losartan has been reported.</li>
            <li>Pregnancy and breastfeeding safety data are insufficient. Avoid self-treating persistent fatigue, mood, or sleep symptoms.</li>
          </ul>
        </SafetyNotice>
      </div>

      {/* Products */}
      {rhodiolaProducts && (
        <AffiliateProductBox
          slug="rhodiola"
          products={rhodiolaProducts.products}
          heading="Rhodiola Product Picks"
        />
      )}

      <References refs={RHODIOLA_EXTRACT_VS_POWDER_REFS} />

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About Rhodiola Forms" />
      </div>

      <EmailCapture location="guides-rhodiola-extract-vs-powder" className="mt-6" />

      {/* Related (hub) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">More in the Rhodiola Hub</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/herbs/rhodiola-complete-guide/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Pillar Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Complete Rhodiola Guide</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Forms, benefits, dosing, and the full evidence base in one place.</p>
          </Link>
          <Link href="/guides/herbs/rhodiola-energy/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Rhodiola for Energy</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Sustained energy without the stimulant crash — research and dosing.</p>
          </Link>
          <Link href="/guides/sleep/rhodiola-sleep-stack/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
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
