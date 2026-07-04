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

const SLUG = 'turmeric-curcumin'
const PAGE_URL = 'https://thehippiescientist.net/guides/turmeric-curcumin'
const TITLE = 'Turmeric & Curcumin: Evidence, Dose, Bioavailability'
const DESCRIPTION =
  'A science-backed breakdown of curcumin bioavailability, anti-inflammatory evidence, dosage ranges, form comparison, and safety context — including what the research actually shows versus the hype.'
const DATE_PUBLISHED = '2025-01-15'
const DATE_MODIFIED = '2026-06-14'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the difference between turmeric and curcumin?',
    answer:
      'Turmeric is the whole root of Curcuma longa, which contains only 2–5% curcuminoids by dry weight. Curcumin is the primary active curcuminoid — the compound studied most extensively for therapeutic effects. Supplement labels saying "95% curcuminoids" are providing a concentrated extract rather than whole turmeric spice, which delivers much higher per-dose amounts.',
  },
  {
    question: 'Do I need black pepper (piperine) with curcumin supplements?',
    answer:
      'Standard curcumin extract has very poor oral bioavailability — most is rapidly metabolized before reaching systemic circulation. Piperine (BioPerine) increases absorption roughly 20-fold by inhibiting CYP3A4 and P-glycoprotein in the gut and liver. However, piperine can interact with medications cleared by these same pathways (including many prescription drugs). The alternatives — phospholipid-bound Meriva, BCM-95, or SLCP Longvida — achieve comparable or better bioavailability without piperine, making them preferable for anyone on medication.',
  },
  {
    question: 'How long does curcumin take to work for inflammation or joint pain?',
    answer:
      'Most clinical trials that show benefit measure outcomes at 8–12 weeks of consistent daily use. Curcumin works through transcriptional pathways (primarily NF-κB inhibition) rather than acute prostaglandin blockade like NSAIDs, so effects are gradual and cumulative rather than fast-acting. Subjective improvements in joint stiffness and morning pain are typically reported at 6–8 weeks; peak anti-inflammatory benefit in trial data appears around 12 weeks.',
  },
  {
    question: 'Is curcumin safe to take long-term?',
    answer:
      'Curcumin at standard doses (500–1500 mg curcuminoids/day) has a well-characterized safety profile in healthy adults across trials up to 8 months. Higher doses may cause GI upset (nausea, diarrhea) in sensitive individuals, particularly without food. The most clinically important concern is interaction with anticoagulants (warfarin, clopidogrel, aspirin) due to mild platelet-inhibiting and warfarin-potentiating effects. Individuals with known gallstone disease or bile duct obstruction should avoid high-dose curcumin.',
  },
  {
    question: "What's the most bioavailable curcumin supplement form?",
    answer:
      'The three best-validated bioavailability-enhanced forms are: (1) Meriva — a phospholipid complex with consistent RCT data for osteoarthritis at 400–500 mg/day; (2) BCM-95 (also called Biocurcumax) — a curcuminoid + essential oil complex with 7x better absorption than plain curcumin; (3) SLCP (Longvida) — a solid lipid particle form designed to cross the blood-brain barrier, studied in cognitive contexts. Look for these specific trademarked names rather than "enhanced bioavailability" claims without a named delivery system.',
  },
]

const DOSAGE_ROWS = [
  {
    form: 'Standard 95% curcuminoid extract',
    range: '500–1500 mg/day',
    notes: 'Take with piperine (BioPerine) or fat; poor standalone bioavailability',
  },
  {
    form: 'Meriva (phospholipid complex)',
    range: '200–500 mg/day',
    notes: 'Clinically validated for OA; superior absorption without piperine',
  },
  {
    form: 'BCM-95 / Biocurcumax',
    range: '500–1000 mg/day',
    notes: '7x better bioavailability than plain; no piperine needed',
  },
  {
    form: 'SLCP / Longvida',
    range: '400–800 mg/day',
    notes: 'Brain-penetrant form; used in cognitive studies',
  },
  {
    form: 'Whole turmeric root powder',
    range: '1500–3000 mg/day',
    notes: 'Low curcumin content; suitable as culinary supplement, not therapeutic',
  },
]

const SAFETY_NOTES = [
  {
    severity: 'caution' as const,
    text: 'Curcumin potentiates the anticoagulant effect of warfarin and may increase bleeding risk when combined with aspirin, clopidogrel, or other blood thinners. Consult your prescriber before use if you take any antiplatelet or anticoagulant medication.',
  },
  {
    severity: 'caution' as const,
    text: 'Piperine (the absorption enhancer in many curcumin products) inhibits CYP3A4, a major drug-metabolizing enzyme. This can increase blood levels of many prescription medications to potentially unsafe levels. Use a piperine-free bioavailability form if you take regular prescription medications.',
  },
  {
    severity: 'info' as const,
    text: 'Take curcumin supplements with food and water to minimize GI irritation. Starting at a lower dose for the first 1–2 weeks reduces the likelihood of nausea or loose stool.',
  },
  {
    severity: 'warning' as const,
    text: 'Avoid high-dose curcumin if you have active gallstone disease or bile duct obstruction. Curcumin stimulates bile contraction and may worsen these conditions.',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'NF-κB Inhibition',
    description:
      'Curcumin suppresses nuclear factor-kappa B, a master regulator of inflammatory gene expression. This reduces production of COX-2, iNOS, and cytokines like IL-6 and TNF-α.',
  },
  {
    label: 'Antioxidant Activity',
    description:
      'Curcumin directly scavenges reactive oxygen species and upregulates Nrf2, the transcription factor that activates endogenous antioxidant defenses including glutathione synthesis.',
  },
  {
    label: 'COX & LOX Modulation',
    description:
      'Unlike NSAIDs (which directly block COX enzymes), curcumin modulates their gene expression upstream — producing a gentler anti-inflammatory effect without gastrointestinal COX-1 inhibition.',
  },
  {
    label: 'BDNF & Neuroprotection',
    description:
      'Emerging preclinical evidence shows curcumin may increase brain-derived neurotrophic factor (BDNF) and inhibit amyloid-beta aggregation, though human cognitive data remain preliminary.',
  },
]

const RELATED_GUIDES = [
  {
    href: '/guides/ashwagandha',
    label: 'Ashwagandha Guide',
    description: 'Adaptogenic stress reduction, cortisol modulation, and sleep quality — with dosage and safety context.',
    type: 'guide' as const,
  },
  {
    href: '/guides/lions-mane',
    label: "Lion's Mane Guide",
    description: 'NGF synthesis, cognitive support, and neuroregeneration — evidence review for the culinary-medicinal mushroom.',
    type: 'guide' as const,
  },
  {
    href: '/guides/sleep/magnesium-for-sleep/',
    label: 'Magnesium for Sleep Guide',
    description: 'Form comparison, dosage, and evidence review for magnesium as a sleep and anxiety support supplement.',
    type: 'guide' as const,
  },
]

const HEADINGS: Heading[] = [
  { id: 'evidence', text: 'Evidence Overview', level: 2 },
  { id: 'mechanism', text: 'How Curcumin Works', level: 2 },
  { id: 'bioavailability', text: 'The Bioavailability Problem', level: 2 },
  { id: 'dosage', text: 'Dosage & Forms', level: 2 },
  { id: 'safety', text: 'Safety & Precautions', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

const TURMERIC_CURCUMIN_REFS = [
  { n: 1, text: 'Hewlings SJ, Kalman DS. (2017). Curcumin: a review of its effects on human health. Foods, 6(10): 92.', url: 'https://pubmed.ncbi.nlm.nih.gov/29065496/' },
  { n: 2, text: 'Gupta SC, et al. (2013). Therapeutic roles of curcumin: lessons from clinical trials. AAPS J, 15(1): 195-218.', url: 'https://pubmed.ncbi.nlm.nih.gov/23143785/' },
  { n: 3, text: 'Belcaro G, et al. (2014). Meriva curcumin in osteoarthritis. Panminerva Med, 56(2): 143-151.', url: 'https://pubmed.ncbi.nlm.nih.gov/24861886/' },
  { n: 4, text: 'Anand P, et al. (2007). Bioavailability of curcumin: problems and promises. Mol Pharm, 4(6): 807-818.', url: 'https://pubmed.ncbi.nlm.nih.gov/17999464/' },
  { n: 5, text: 'Daily JW, et al. (2016). Efficacy of turmeric extracts and curcumin for arthritis. J Med Food, 19(8): 717-729.', url: 'https://pubmed.ncbi.nlm.nih.gov/27533649/' },
]

export default function TurmericCurcuminGuidePage() {
  const turmericProducts = getRevenueProductSet('turmeric')
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
          { label: 'Turmeric & Curcumin', href: '/guides/turmeric-curcumin' },
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
          Turmeric &amp; Curcumin
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          Bioavailability, Anti-Inflammatory Evidence, and What the Research Actually Shows
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Curcumin is one of the most researched phytonutrients in the world — and also one of the most
          over-hyped. The key limitation is bioavailability: standard curcumin extract is poorly absorbed,
          which means most cheap supplements are largely inactive. This guide covers what the evidence says
          for specific outcomes, which forms actually work, dosage ranges, and the safety context you need
          before choosing a product.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link
            href="/herbs/turmeric"
            className="text-brand-700 hover:text-brand-800 hover:underline"
          >
            Turmeric Herb Profile →
          </Link>
          <Link
            href="/compounds/curcumin"
            className="text-brand-700 hover:text-brand-800 hover:underline"
          >
            Curcumin Compound Profile →
          </Link>
        </div>

        <figure className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/turmeric-curcumin.jpg"
              alt="Fresh turmeric root and golden turmeric powder, the source of the active compound curcumin"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Turmeric and its active compound curcumin — studied for inflammation and joint support.
          </figcaption>
        </figure>
      </section>

      {/* Evidence Overview */}
      <section id="evidence" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence Overview</h2>
        <p className="text-sm text-muted leading-6">
          The evidence for curcumin varies significantly by outcome. Anti-inflammatory effects and
          osteoarthritis pain relief have the strongest clinical trial support. Cognitive and mood
          outcomes remain early-stage. All human evidence comes with the bioavailability caveat — trials
          using enhanced forms (Meriva, BCM-95) are not directly comparable to trials using standard extract.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="moderate"
            outcome="Osteoarthritis joint pain"
            takeaway="Multiple RCTs using Meriva and BCM-95 show significant reduction in WOMAC pain scores at 8–12 weeks, with effect sizes comparable to low-dose NSAIDs."
            citationCount={12}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Systemic inflammatory markers (CRP, IL-6)"
            takeaway="Curcumin consistently reduces CRP and IL-6 in trials across healthy subjects and patients with metabolic conditions, though effect sizes are modest."
            citationCount={18}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Depressive symptoms (adjunctive)"
            takeaway="Small RCTs suggest curcumin as an adjunct to antidepressants may reduce depressive symptoms, but sample sizes are small and comparison arms are inconsistent."
            citationCount={5}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Cognitive function and memory"
            takeaway="Preliminary human data (Longvida form) show modest improvements in working memory in older adults. Evidence is too limited to draw conclusions for younger populations."
            citationCount={4}
          />
        </div>
      </section>

      {/* How it Works */}
      <section id="mechanism" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How Curcumin Works</h2>
        <p className="text-sm leading-6 text-muted">
          Curcumin is a pleiotropic compound — it modulates multiple biological targets simultaneously
          rather than acting through a single clean mechanism. This is both its therapeutic strength
          and the reason for its complexity in research.
        </p>
        <MechanismBox
          summary="The primary mechanism is NF-κB inhibition. NF-κB is a transcription factor that controls the expression of over 200 genes related to inflammation, immunity, and cell survival. By blocking NF-κB activation, curcumin reduces downstream production of pro-inflammatory mediators. This mechanism is well-validated in cell and animal models, and increasingly supported in human inflammatory marker data."
          points={MECHANISM_POINTS}
        />
      </section>

      {/* Bioavailability */}
      <section id="bioavailability" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          The Bioavailability Problem
        </h2>
        <p className="text-sm leading-6 text-muted">
          Standard curcumin extract (95% curcuminoids) has extremely poor oral bioavailability due to rapid
          metabolism in the gut wall and liver (first-pass effect) and low aqueous solubility. Studies
          suggest less than 1% of an oral dose reaches systemic circulation unchanged. This is why form
          selection matters enormously — a "500 mg curcumin" label means very different things depending
          on which delivery system is used.
        </p>
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
          <strong className="font-semibold">Key point: </strong>
          When comparing curcumin studies or products, always check whether the trial used a
          bioavailability-enhanced form (Meriva, BCM-95, Longvida) and match your product choice
          accordingly. Results from Meriva trials do not extrapolate to plain curcumin powder.
        </div>
      </section>

      {/* Dosage */}
      <section className="scroll-mt-20 space-y-4" id="dosage">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosage &amp; Forms</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="Always start at the lower end. Take with food. Consult a healthcare provider before combining with prescription medications."
        />
      </section>

      {/* Safety */}
      <section className="scroll-mt-20 space-y-4" id="safety">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety &amp; Precautions</h2>
        <SafetyBox notes={SAFETY_NOTES} />
      </section>

      {/* Products */}
      {turmericProducts && (
        <AffiliateProductBox
          slug="turmeric"
          products={turmericProducts.products}
          heading="Turmeric & Curcumin Product Picks"
        />
      )}

      {turmericProducts && (
      <>
        <References refs={TURMERIC_CURCUMIN_REFS} />
          <RecommendationSection products={turmericProducts.products} />
      </>
      )}

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About Turmeric &amp; Curcumin" />
      </div>

      <EmailCapture location="guides-turmeric-curcumin" className="mt-6" />

      {/* Internal links to related herb/compound pages */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Referenced Profiles</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/herbs/turmeric"
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Herb Profile
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">Turmeric (Curcuma longa)</p>
            <p className="mt-1 text-xs text-muted">Full herb profile with mechanism map and safety data</p>
          </Link>
          <Link
            href="/compounds/curcumin"
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Compound Profile
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">Curcumin</p>
            <p className="mt-1 text-xs text-muted">Molecular mechanism, evidence grading, and interaction data</p>
          </Link>
          <Link
            href="/compounds/piperine"
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Compound Profile
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">Piperine (BioPerine)</p>
            <p className="mt-1 text-xs text-muted">Bioavailability enhancer mechanism and drug interaction profile</p>
          </Link>
        </div>
      </section>

      {/* Related Guides */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Related Guides</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {RELATED_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                Guide
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">{guide.label}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom nav */}
      <div className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm">
        <Link
          href="/guides/"
          className="font-medium text-brand-700 hover:text-brand-800 hover:underline"
        >
          ← All Guides
        </Link>
        <Link
          href="/herbs/"
          className="font-medium text-brand-700 hover:text-brand-800 hover:underline"
        >
          Herb Library →
        </Link>
      </div>
      </div>
    </ArticleLayout>
  )
}
