import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

export const metadata: Metadata = buildPageMetadata({
  title: 'Magnesium Types Compared: Absorption & Evidence (2026 Guide)',
  description: 'Citrate, oxide, bisglycinate, L-threonate and other magnesium forms compared by direct absorption evidence, human outcome trials, elemental dose, and limitations.',
  path: '/guides/other/magnesium-types-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which type of magnesium is best absorbed?', answer: 'There is no well-established single “best absorbed” form. A 2017 review concluded that dose and magnesium status are major determinants and that the form with the highest bioavailability remains unclear [1]. Direct human comparisons do show that citrate and several other soluble preparations are absorbed better than magnesium oxide [2]. Evidence for bisglycinate is much thinner than marketing language often implies.' },
  { question: 'Which magnesium is best for sleep?', answer: 'No magnesium form is established as universally best for sleep. A 2025 randomized placebo-controlled trial of magnesium bisglycinate found a small improvement in insomnia severity after four weeks [4]. Broader magnesium sleep evidence is heterogeneous, so the result should be treated as modest form-specific evidence rather than proof that glycinate is a sleep treatment for everyone.' },
  { question: 'Which magnesium is best for anxiety?', answer: 'The evidence does not establish glycinate, taurate, or another specific form as best for anxiety. A systematic review found suggestive benefits of magnesium supplementation in anxiety-vulnerable samples, but judged the existing evidence poor quality and called for better trials [6]. Form-specific anxiety claims are therefore premature.' },
  { question: 'Why can magnesium supplements cause diarrhea?', answer: 'Poorly absorbed magnesium remaining in the gut can exert an osmotic effect, and gastrointestinal tolerance varies with form and dose. Magnesium oxide had low fractional absorption in one small human comparison [2]. Citrate is more soluble and better absorbed than oxide, but magnesium salts can still loosen stools at higher doses. Tolerance matters as much as a marketing label.' },
  { question: 'How much magnesium should I take?', answer: 'Think in elemental magnesium, not the total weight of the compound. Adult recommended total intakes vary by age and sex, generally 310-420 mg/day, while the US tolerable upper intake level is 350 mg/day from supplements and medications only, not food [7]. Clinical studies sometimes use other amounts for specific populations. A 2,000 mg magnesium-L-threonate product dose, for example, is not 2,000 mg of elemental magnesium.' },
]

const MAGNESIUM_TYPES_REFS = [
  { n: 1, text: 'Schuchardt JP, Hahn A. (2017). Intestinal Absorption and Factors Influencing Bioavailability of Magnesium-An Update. Curr Nutr Food Sci, 13(4):260-278.', url: 'https://pubmed.ncbi.nlm.nih.gov/29123461/' },
  { n: 2, text: 'Firoz M, Graber M. (2001). Bioavailability of US commercial magnesium preparations. Magnes Res, 14(4):257-262.', url: 'https://pubmed.ncbi.nlm.nih.gov/11794633/' },
  { n: 3, text: 'Slutsky I, et al. (2010). Enhancement of learning and memory by elevating brain magnesium. Neuron, 65(2):165-177. Preclinical rat study.', url: 'https://pubmed.ncbi.nlm.nih.gov/20152124/' },
  { n: 4, text: 'Schuster J, et al. (2025). Magnesium Bisglycinate Supplementation in Healthy Adults Reporting Poor Sleep: A Randomized, Placebo-Controlled Trial. Nat Sci Sleep, 17:2027-2040.', url: 'https://pubmed.ncbi.nlm.nih.gov/40918053/' },
  { n: 5, text: 'Lopresti AL, Smith SJ. (2026). The effects of magnesium L-threonate (Magtein) on cognitive performance and sleep quality in adults: a randomised, double-blind, placebo-controlled trial. Front Nutr, 12:1729164.', url: 'https://pubmed.ncbi.nlm.nih.gov/41601871/' },
  { n: 6, text: 'Boyle NB, Lawton C, Dye L. (2017). The Effects of Magnesium Supplementation on Subjective Anxiety and Stress-A Systematic Review. Nutrients, 9(5):429.', url: 'https://pubmed.ncbi.nlm.nih.gov/28445426/' },
  { n: 7, text: 'Institute of Medicine. (1997). Dietary Reference Intakes for Calcium, Phosphorus, Magnesium, Vitamin D, and Fluoride. National Academies Press.', url: 'https://pubmed.ncbi.nlm.nih.gov/23115811/' },
  { n: 8, text: 'Nielsen FH. (2018). Magnesium deficiency and increased inflammation: current perspectives. J Inflamm Res, 11:25-34.', url: 'https://pubmed.ncbi.nlm.nih.gov/29403302/' },
]

export default function MagnesiumTypesPage() {
  const magnesiumProducts = getRevenueProductSet('magnesium')
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Magnesium Types Compared" description="Direct absorption evidence and human outcome data for common magnesium forms." url="https://thehippiescientist.net/guides/other/magnesium-types-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Magnesium Types Guide' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 8 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Magnesium Types: What Form Comparisons Actually Show</h1>
        <p className="text-lg leading-8 text-muted">Magnesium labels imply that each salt or chelate has a specialized job: glycinate for sleep, taurate for anxiety, malate for pain, L-threonate for the brain. The research is much less tidy. Direct human studies support meaningful differences between some preparations — especially citrate versus oxide — but many form-specific benefit claims are extrapolated from the attached molecule, animal work, or general magnesium trials rather than clinical trials of that exact form.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/magnesium-types-guide.jpg" alt="Different magnesium supplement forms compared" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">The useful distinction is direct form evidence versus extrapolation — not a universal magnesium ranking.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>There is <strong>no proven universal “best” magnesium form</strong>. Direct human comparisons show magnesium oxide can be poorly absorbed and that more soluble preparations such as citrate perform better [1,2]. Magnesium bisglycinate now has a placebo-controlled sleep trial showing a small benefit [4], while magnesium L-threonate has emerging product-specific human cognition data alongside earlier animal work [3,5]. For most consumers, the practical priorities are adequate total magnesium, a tolerable form, transparent elemental-magnesium labeling, and an outcome that has actually been studied.</p>
      </LegacyGuideQuickAnswer>

      <section id="magnesium-form-evidence" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Magnesium forms: evidence at a glance</h2>
        <div className="overflow-x-auto"><table className="min-w-[820px] text-sm"><caption className="sr-only">Magnesium forms compared by direct evidence, evidence strength, and practical interpretation</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4">Form</th><th scope="col" className="text-left py-3 pr-4">Direct evidence represented here</th><th scope="col" className="text-left py-3 pr-4">Confidence</th><th scope="col" className="text-left py-3">Practical interpretation</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Citrate</th><td className="py-3 pr-4">Direct human comparisons show better bioavailability than oxide [1,2].</td><td className="py-3 pr-4">Moderate for relative absorption</td><td className="py-3">Reasonable oral option; can loosen stools depending on dose and person.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Oxide</th><td className="py-3 pr-4">Low fractional absorption in one commercial-preparation comparison [2].</td><td className="py-3 pr-4">Moderate that it is less bioavailable than several alternatives</td><td className="py-3">Not automatically useless, but a poor choice when efficient oral repletion is the goal.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Bisglycinate</th><td className="py-3 pr-4">A 2025 placebo-controlled trial found a small improvement in insomnia severity [4].</td><td className="py-3 pr-4">Early form-specific outcome evidence</td><td className="py-3">Reasonable if tolerated, but not proven universally superior for absorption, sleep, or anxiety.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">L-threonate</th><td className="py-3 pr-4">Brain-magnesium rationale began in rats [3]; a 2026 industry-funded RCT reported selected cognitive benefits in adults [5].</td><td className="py-3 pr-4">Emerging / product-specific</td><td className="py-3">Promising for cognition, but evidence is not yet broad enough for a general brain-health recommendation.</td></tr>
          <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Malate / taurate / other specialty forms</th><td className="py-3 pr-4">Not established by the retained evidence as uniquely effective for fibromyalgia, anxiety, or cardiovascular outcomes.</td><td className="py-3 pr-4">Insufficient for form-specific rankings</td><td className="py-3">Do not infer a clinical effect simply from the molecule magnesium is bound to.</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">What the evidence supports</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Absorption — Form matters, but less neatly than marketing suggests</h3><p className="mt-2 text-sm leading-7 text-muted">Schuchardt and Hahn reviewed magnesium absorption studies and concluded that dose, food matrix, and baseline status strongly influence uptake; the literature does not establish one binding form as universally most bioavailable [1]. In Firoz and Graber&rsquo;s small human comparison, magnesium oxide had approximately 4% fractional absorption, while chloride, lactate, and aspartate were significantly higher [2]. Other direct trials have also favored citrate over oxide. That supports avoiding simplistic “all forms are equal” claims — but it does not prove glycinate is the absorption champion.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Sleep — Modest evidence, not a form coronation</h3><p className="mt-2 text-sm leading-7 text-muted">A 2025 randomized placebo-controlled trial in adults reporting poor sleep found magnesium bisglycinate produced a statistically greater reduction in insomnia-severity scores than placebo after four weeks, but the effect size was small (Cohen&rsquo;s d = 0.2) [4]. That is useful form-specific evidence. It does not show that bisglycinate is superior to citrate, oxide, or other magnesium forms for sleep because those forms were not compared head-to-head in that trial.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Anxiety — Suggestive overall, weak form-specific evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The 2017 systematic review found suggestive evidence that magnesium may help subjective anxiety in vulnerable populations, but the studies were heterogeneous and the authors judged the overall evidence poor quality [6]. The review does not establish glycinate or taurate as preferred anxiety forms. Claims that the attached amino acid automatically adds a clinically meaningful anxiolytic effect require direct testing.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Cognition — L-threonate is promising but still product-specific</h3><p className="mt-2 text-sm leading-7 text-muted">The original magnesium-L-threonate brain-magnesium work was performed in rats [3]. A 2026 randomized double-blind placebo-controlled trial in 100 adults with dissatisfied sleep reported improvements in an NIH cognition composite, working and episodic memory, and reaction time after 2 g/day of a branded magnesium-L-threonate product for six weeks [5]. Several sleep outcomes did not differ from placebo, and the study was funded by the product&rsquo;s company. This is promising human evidence, but it is not equivalent to proving disease prevention or universal cognitive enhancement.</p></div>
        </div>
      </section>

      {magnesiumProducts && (
        <RecommendationSection
          title="Magnesium supplement starting points"
          description="Use product listings as sourcing starting points. Compare elemental magnesium per serving, form, tolerability, testing, and price rather than assuming one form is universally superior."
          products={magnesiumProducts.products}
        />
      )}

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Elemental magnesium matters more than bottle-front milligrams</h2><p className="text-sm leading-7 text-muted">The milligram number attached to a compound name may describe the whole compound rather than the magnesium ion it contains. For interpreting intake, use the label&rsquo;s <strong>elemental magnesium</strong> amount. The US Dietary Reference Intakes set adult total-intake recommendations that vary by age and sex, generally from 310 to 420 mg/day, and a tolerable upper intake level of 350 mg/day for magnesium specifically from supplements and medications; magnesium naturally present in food is excluded from that UL [7]. Studies may deliberately use other doses under defined protocols, so a trial dose should not automatically become a universal self-supplementation target.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Who is more likely to benefit?</h2><p className="text-sm leading-7 text-muted">Low magnesium intake or status is more relevant than supplement branding. Magnesium inadequacy is associated with inflammatory and chronic-disease risk patterns, but associations do not mean everyone benefits from taking a pill [8]. Food sources such as legumes, nuts, seeds, whole grains, and leafy greens contribute meaningful magnesium. Supplementation is most defensible when dietary intake is inadequate, a clinician has identified a relevant need, or a specific evidence-based use justifies it.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Choose magnesium by <strong>goal, elemental dose, evidence, and tolerance</strong> — not by a universal form hierarchy. Citrate has direct evidence of better oral bioavailability than oxide [1,2]. Bisglycinate has one recent sleep trial showing a small benefit [4]. L-threonate has preclinical brain-magnesium evidence and emerging product-specific human cognition data [3,5]. Anxiety evidence applies to magnesium supplementation broadly and remains low quality [6]. If a label promises that malate, taurate, glycinate, or another chelate uniquely treats a condition, look for a human trial of that exact form before accepting the claim.</p></section>

      <References refs={MAGNESIUM_TYPES_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/magnesium-types-guide/" questions={FAQS} />
      <EmailCapture headline="Get evidence reviews like this" description="Form-by-form supplement evidence without marketing shortcuts." ctaLabel="Get the evidence" location="guide-magnesium-types" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
