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
import AffiliateProductBox from '@/components/AffiliateProductBox'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

const SLUG = 'passionflower'
const PAGE_URL = 'https://thehippiescientist.net/guides/passionflower'
const TITLE = 'Passionflower for Anxiety & Sleep: Evidence Guide'
const DESCRIPTION =
  'Evidence-based review of passionflower (Passiflora incarnata) for anxiety and sleep: GABA mechanism, clinical trials, safety, drug interactions, and dosing.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-06-14'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

const HEADINGS: Heading[] = [
  { id: 'research', text: 'What the Research Shows', level: 2 },
  { id: 'mechanism', text: 'How It Works', level: 2 },
  { id: 'dosage', text: 'Dosage & Forms', level: 2 },
  { id: 'safety', text: 'Safety & Precautions', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

const FAQS = [
  {
    question: 'Does passionflower help with anxiety?',
    answer:
      'Moderate evidence supports modest reductions in anxiety symptoms. A 2020 systematic review (Janda et al.) found most studies reported reduced anxiety, though overall quality was rated moderate due to methodological limitations. Effects are milder than pharmaceutical anxiolytics but with a better short-term side-effect profile, and results are more consistent with standardized extracts.',
  },
  {
    question: 'Is passionflower effective for sleep?',
    answer:
      'The evidence for sleep is weaker and less consistent than for anxiety. Some studies show improvements in subjective sleep quality and time to fall asleep, but objective measures (polysomnography) often show little difference from placebo. It may help most when anxiety is contributing to poor sleep.',
  },
  {
    question: 'How much passionflower should I take?',
    answer:
      'Clinical studies typically used roughly 0.5–2 grams of dried herb prepared as tea, or equivalent amounts in extract form — often around 200–500 mg of a standardized extract. Always follow the specific dosing on your product label, and because it can cause drowsiness, take it in the evening.',
  },
  {
    question: 'Can I combine passionflower with other sedatives?',
    answer:
      'Not without medical supervision. Passionflower may increase the sedative effects of CNS depressants including benzodiazepines, opioids, alcohol, and certain antihistamines. Combining sedating herbs (valerian, hops, lemon balm) also raises the risk of excessive sedation, so start with lower doses.',
  },
  {
    question: 'Who should avoid passionflower?',
    answer:
      'Avoid during pregnancy, as it may stimulate uterine contractions. There is insufficient data for breastfeeding, and limited data for children. Older adults may be more sensitive to sedation. Discontinue at least two weeks before scheduled surgery, since it can enhance anesthesia and sedatives.',
  },
]

const DOSAGE_ROWS = [
  { form: 'Dried herb (tea)', range: '~0.5–2 g', notes: 'Brewed as tea; traditional preparation' },
  { form: 'Standardized extract', range: '~200–500 mg', notes: 'More consistent than non-standardized forms' },
  { form: 'Tincture / liquid extract', range: 'Per label', notes: 'Allows flexible dose titration' },
  { form: 'Timing & duration', range: 'Evening; short-term', notes: 'Best for occasional use; most trials ran a few days to 8 weeks' },
]

const SAFETY_NOTES = [
  {
    severity: 'warning' as const,
    text: 'Avoid during pregnancy — passionflower may stimulate uterine contractions. Discontinue at least two weeks before scheduled surgery, as it can enhance the effects of anesthesia and sedatives.',
  },
  {
    severity: 'caution' as const,
    text: 'Passionflower can increase the sedative effects of CNS depressants (benzodiazepines, opioids, alcohol, some antihistamines) and may interact with drugs metabolized by CYP3A4 and CYP2C9. Consult a provider or pharmacist if you take prescription medication.',
  },
  {
    severity: 'caution' as const,
    text: 'Because it commonly causes drowsiness and dizziness, do not drive or operate machinery until you know how it affects you. Older adults may be more sensitive and often need lower doses.',
  },
  {
    severity: 'info' as const,
    text: 'Generally well tolerated at typical doses for short-term use. It is best used as a short-term supportive tool; if anxiety or sleep problems persist beyond a few weeks, consult a healthcare provider.',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'GABA Modulation',
    description:
      'Passionflower is thought to act primarily through the GABA system. Flavonoids such as chrysin have shown benzodiazepine-receptor binding in animal studies, though with far weaker affinity than pharmaceutical benzodiazepines.',
  },
  {
    label: 'Key Constituents',
    description:
      'The aerial parts contain flavonoids including vitexin, isovitexin, and chrysin, plus alkaloids and other phenolics believed to contribute to its calming effects.',
  },
  {
    label: 'Mild, Not Sedating',
    description:
      'Most clinical benefit is attributed to mild GABAergic activity and general calming rather than strong sedation — consistent with its modest effect sizes.',
  },
]

const PASSIONFLOWER_REFS = [
  { n: 1, text: 'Ngan A, Conduit R. (2011). Passionflower for sleep: double-blind RCT. Phytother Res, 25(8): 1153-1159.', url: 'https://pubmed.ncbi.nlm.nih.gov/21294203/' },
  { n: 2, text: 'Akhondzadeh S, et al. (2001). Passionflower in generalized anxiety. J Clin Pharm Ther, 26(5): 363-367.', url: 'https://pubmed.ncbi.nlm.nih.gov/11679026/' },
  { n: 3, text: 'Movafegh A, et al. (2008). Passionflower for preoperative anxiety. Anesth Analg, 106(6): 1728-1732.', url: 'https://pubmed.ncbi.nlm.nih.gov/18499599/' },
  { n: 4, text: 'Miroddi M, et al. (2013). Passiflora incarnata clinical indications. J Ethnopharmacol, 150(3): 791-804.', url: 'https://pubmed.ncbi.nlm.nih.gov/24012504/' },
]

export default function PassionflowerGuidePage() {
  const passionflowerProducts = getRevenueProductSet('passionflower')
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
          { label: 'Passionflower', href: `/guides/${SLUG}` },
        ]}
      />
      <div className="space-y-8">
      <AffiliateDisclosure variant="compact" className="mb-6" />

      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
          Evidence Guide
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
          Passionflower (<em>Passiflora incarnata</em>)
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          Clinical Evidence for Anxiety and Sleep, With Honest Limits
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Several clinical studies and systematic reviews suggest passionflower can provide modest reductions in
          anxiety symptoms. The evidence for improving sleep is weaker and less consistent. The plant is generally
          well tolerated at typical doses, with drowsiness and dizziness the most common side effects. This is not
          medical advice — use caution when driving or operating machinery.
        </p>

        <figure className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/passionflower.jpg"
              alt="Passionflower (Passiflora incarnata) bloom and dried passionflower herb used for anxiety and sleep"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Passionflower (Passiflora incarnata) — modest clinical evidence for easing anxiety, with weaker support for sleep.
          </figcaption>
        </figure>
      </section>

      {/* Evidence */}
      <section id="research" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Research Shows</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="moderate"
            outcome="Anxiety symptoms"
            takeaway="Janda et al. (2020) found most studies reported reduced anxiety with passionflower preparations; quality was rated moderate. Effects are milder than pharmaceutical anxiolytics but with a better short-term tolerability profile."
            citationCount={4}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Stress & sleep (recent RCT)"
            takeaway="A 2024 randomized, double-blind, placebo-controlled trial (Harit et al.) found passionflower extract improved stress and sleep quality in adults with stress-related complaints — one of the better-designed recent studies."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Objective sleep architecture"
            takeaway="Some trials show improved subjective sleep and reduced sleep latency, but objective measures (polysomnography) often show minimal difference from placebo. Benefit is clearest when anxiety drives poor sleep."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Older / lower-quality trials"
            takeaway="Miroddi et al. (2013) noted many human studies suffer from small samples, poor reporting, and inconsistent standardization — directionally positive but limited in power."
            citationCount={1}
          />
        </div>
      </section>

      {/* Mechanism */}
      <section id="mechanism" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How It Works</h2>
        <MechanismBox
          summary="Passionflower is thought to exert anxiolytic effects primarily through modulation of the GABA system, supported by mild anti-inflammatory and antioxidant actions and possible effects on serotonin and dopamine. Human mechanistic data remain limited."
          points={MECHANISM_POINTS}
        />
      </section>

      {/* Dosage */}
      <section id="dosage" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosage &amp; Forms</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="Take in the evening because of drowsiness, and follow your product label. Standardized extracts offer more consistency than teas or non-standardized tinctures. General guidance, not medical advice."
        />
      </section>

      {/* Safety */}
      <section id="safety" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety &amp; Precautions</h2>
        <SafetyBox notes={SAFETY_NOTES} />
      </section>

      {/* Products */}
      {passionflowerProducts && (
        <AffiliateProductBox
          slug="passionflower"
          products={passionflowerProducts.products}
          heading="Passionflower Product Picks"
        />
      )}

      {passionflowerProducts && (
      <References refs={PASSIONFLOWER_REFS} />
        <RecommendationSection products={passionflowerProducts.products} />
      )}

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About Passionflower" />
      </div>

      <EmailCapture location="guides-passionflower" className="mt-6" />

      {/* Related */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Related Guides</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/sleep/magnesium-for-sleep/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Magnesium for Sleep</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Forms, dosage, and evidence for magnesium as a sleep and anxiety support.</p>
          </Link>
          <Link href="/guides/anxiety/natural-anxiolytics-beyond-ashwagandha" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Natural Anxiolytics</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Evidence-ranked anxiolytic options beyond the usual picks.</p>
          </Link>
          <Link href="/guides/sleep/best-herbs-for-sleep" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
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

      </div>{/* end space-y-8 */}
    </ArticleLayout>
  )
}
