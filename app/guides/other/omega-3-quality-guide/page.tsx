import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Omega-3 Quality Guide: EPA, DHA, Forms & Testing (2026)',
  description: 'Evidence-based omega-3 quality guide separating dietary intake, prescription triglyceride treatment, cardiovascular outcomes, molecular form, oxidation testing, and algae vs fish sources.',
  path: '/guides/other/omega-3-quality-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'How much EPA and DHA should I take?', answer: 'There is no universal omega-3 supplement dose for every goal. For general nutrition, major guidance emphasizes eating seafood rather than automatically taking a supplement [1]. For severe or persistent hypertriglyceridemia, 4 g/day prescription omega-3 products have evidence for triglyceride lowering under medical care [4]. Cardiovascular event reduction is formulation- and population-specific: REDUCE-IT found benefit with 4 g/day prescription icosapent ethyl in selected statin-treated high-risk patients [5], while STRENGTH found no event reduction with a different 4 g/day EPA+DHA formulation [6].' },
  { question: 'Triglyceride vs ethyl ester — which is better?', answer: 'Triglyceride and re-esterified triglyceride forms often show higher short-term bioavailability than ethyl esters under some study conditions, but the size of the difference depends on formulation, dose, and whether the supplement is taken with food [2,3]. Ethyl ester is not inherently an inferior clinical form: icosapent ethyl, an EPA ethyl ester, reduced cardiovascular events in REDUCE-IT [5]. Choose based on the product and purpose rather than a universal form ranking.' },
  { question: 'How do I know if my fish oil is oxidized?', answer: 'Smell is not a reliable analytical test. Oxidation is assessed with measures such as peroxide value, anisidine value, and total oxidation (TOTOX), and voluntary industry limits commonly use all of these rather than peroxide value alone [7,8]. Market surveys have found some products above voluntary limits, but the human clinical significance of consuming oxidized fish oil is still uncertain [7]. Independent testing and sensible storage are more informative than a capsule smell test.' },
  { question: 'Is algae oil as good as fish oil?', answer: 'Algae-derived EPA and DHA can be effective alternatives to fish-derived omega-3s. A recent randomized comparison found microalgal DHA+EPA non-inferior to fish oil for plasma bioavailability [9]. Actual EPA and DHA amounts still vary by product, so compare the label to your goal rather than assuming all algae oils are DHA-only.' },
  { question: 'What matters most when choosing an omega-3 supplement?', answer: 'Start with the intended use. Check the actual EPA+DHA amount per serving, the molecular form and meal instructions, independent testing for identity/contaminants/oxidation where available, and whether the source is fish or algae. There is no evidence-based rule that every product under 60% EPA+DHA is poor quality or that every ethyl-ester product should be avoided.' },
]

const OMEGA3_REFS = [
  { n: 1, text: 'NIH Office of Dietary Supplements. Omega-3 Fatty Acids: Fact Sheet for Health Professionals.', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/' },
  { n: 2, text: 'Dyerberg J, et al. (2010). Bioavailability of marine n-3 fatty acid formulations. Prostaglandins Leukot Essent Fatty Acids, 83(3):137-141.', url: 'https://pubmed.ncbi.nlm.nih.gov/20638827/' },
  { n: 3, text: 'Alijani A, et al. (2025). Bioavailability of eicosapentaenoic acid and docosahexaenoic acid in humans: A comprehensive review. Prog Lipid Res, 97:101318.', url: 'https://pubmed.ncbi.nlm.nih.gov/39736417/' },
  { n: 4, text: 'Skulas-Ray AC, et al. (2019). Omega-3 Fatty Acids for the Management of Hypertriglyceridemia: A Science Advisory From the American Heart Association. Circulation, 140(12):e673-e691.', url: 'https://pubmed.ncbi.nlm.nih.gov/31422671/' },
  { n: 5, text: 'Bhatt DL, et al. (2019). Cardiovascular Risk Reduction with Icosapent Ethyl for Hypertriglyceridemia (REDUCE-IT). N Engl J Med, 380(1):11-22.', url: 'https://pubmed.ncbi.nlm.nih.gov/30415628/' },
  { n: 6, text: 'Nicholls SJ, et al. (2020). Effect of High-Dose Omega-3 Fatty Acids vs Corn Oil on Major Adverse Cardiovascular Events (STRENGTH). JAMA, 324(22):2268-2280.', url: 'https://pubmed.ncbi.nlm.nih.gov/33190147/' },
  { n: 7, text: 'Albert BB, et al. (2013). Fish oil supplements in New Zealand are highly oxidised and do not meet label content of n-3 PUFA. Sci Rep / review context on oxidation and uncertain clinical consequences.', url: 'https://pubmed.ncbi.nlm.nih.gov/23738326/' },
  { n: 8, text: 'Jackowski SA, et al. (2015). Oxidation levels of North American over-the-counter n-3 (omega-3) supplements and the influence of supplement formulation and delivery form. J Nutr Sci, 4:e30.', url: 'https://pubmed.ncbi.nlm.nih.gov/26688721/' },
  { n: 9, text: 'Comparative human trial of microalgal versus fish-derived EPA+DHA bioavailability (2025).', url: 'https://pubmed.ncbi.nlm.nih.gov/41096614/' },
]

export default function Omega3QualityPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Omega-3 Quality Guide"
        description="EPA/DHA amount, indication, molecular form, oxidation testing, and fish versus algae sources."
        url="https://thehippiescientist.net/guides/other/omega-3-quality-guide"
        type="Article"
        citationUrls={OMEGA3_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Omega-3 Quality' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 9 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Omega-3 Quality: Match the Product to the Goal</h1>
        <p className="text-lg leading-8 text-muted">Omega-3 advice gets confusing when dietary nutrition, over-the-counter supplements, prescription triglyceride therapy, and cardiovascular-outcome drugs are treated as the same thing. They are not. EPA and DHA amount matters, but so do the intended use, formulation, meal context, oxidation control, and whether the evidence comes from fish, algae, or a prescription product.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/omega-3-quality-guide.jpg" alt="Fish oil capsules and salmon sashimi" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">EPA+DHA per serving is useful — but quality and clinical relevance cannot be reduced to one concentration percentage.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>Start with <strong>why you want omega-3s</strong>. For general nutrition, major guidance emphasizes seafood intake rather than assuming everyone needs a capsule [1]. For triglyceride lowering, 4 g/day prescription omega-3 products have a defined clinical evidence base [4]. For cardiovascular event reduction, formulation and population matter: REDUCE-IT was positive with prescription EPA-only icosapent ethyl, while STRENGTH was neutral with a high-dose EPA+DHA formulation [5,6]. For an OTC supplement, compare actual EPA+DHA per serving, testing, storage, tolerability, and source; do not use a universal 60% concentration cutoff or automatically reject ethyl esters.</p>
      </LegacyGuideQuickAnswer>

      <section id="omega3-quality-decisions" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · What Actually Changes the Decision</p>
        <div className="overflow-x-auto"><table className="min-w-[900px] text-sm"><caption className="sr-only">Omega-3 purchase and treatment factors compared by evidence and practical interpretation</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Factor</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">What the evidence says</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">What not to assume</th><th scope="col" className="text-left py-3 font-semibold text-ink">Practical use</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">EPA+DHA amount</th><td className="py-3 pr-4">Use the actual EPA and DHA amounts, not “total fish oil,” to understand what a serving supplies.</td><td className="py-3 pr-4">A higher concentration percentage is not automatically a higher-quality or clinically superior product.</td><td className="py-3">Compare EPA+DHA per serving to the goal being discussed.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Clinical indication</th><td className="py-3 pr-4">Prescription 4 g/day omega-3 therapy can lower high triglycerides [4]; cardiovascular outcomes differ by product and population [5,6].</td><td className="py-3 pr-4">OTC fish oil is not interchangeable with a prescription cardiovascular-outcome regimen.</td><td className="py-3">Separate nutrition, triglyceride treatment, and event-reduction decisions.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Molecular form</th><td className="py-3 pr-4">TG/rTG forms often show greater bioavailability than EE under some conditions, but food and formulation influence the gap [2,3].</td><td className="py-3 pr-4">Ethyl ester is not inherently “bad”; REDUCE-IT used an EPA ethyl ester [5].</td><td className="py-3">Follow product meal instructions and judge form in context.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Oxidation</th><td className="py-3 pr-4">Peroxide, anisidine, and TOTOX values are used together to characterize oxidation; market surveys have found variable compliance with voluntary limits [7,8].</td><td className="py-3 pr-4">Smell or peroxide value alone is not a complete analytical quality test; human harm from oxidized supplements is not well quantified.</td><td className="py-3">Prefer transparent, recent independent testing and sensible storage.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Fish vs algae</th><td className="py-3 pr-4">Microalgal EPA+DHA can achieve plasma bioavailability comparable with fish-derived oil [9].</td><td className="py-3 pr-4">Algae oil is not necessarily DHA-only, and fish oil is not inherently more bioavailable.</td><td className="py-3">Choose based on EPA/DHA content, preference, testing, and sustainability goals.</td></tr>
          <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Quality verification</th><td className="py-3 pr-4">Third-party testing can add information about identity, contaminants, and oxidation.</td><td className="py-3 pr-4">A certification logo does not prove a cardiovascular benefit or make one dose appropriate for everyone.</td><td className="py-3">Use testing as a quality-control signal, not a therapeutic-efficacy badge.</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Three different omega-3 questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">1. General nutrition</h3><p className="mt-2 text-sm leading-7 text-muted">For people without a specific clinical indication, food-based guidance emphasizes eating seafood, especially fatty fish, rather than automatically prescribing a supplement dose [1]. A capsule can be a practical alternative when dietary intake is low or fish is not acceptable, but the evidence does not support one universal OTC EPA+DHA dose for every healthy adult.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">2. High triglycerides</h3><p className="mt-2 text-sm leading-7 text-muted">This is a treatment question, not a supplement-shopping question. The American Heart Association science advisory supports prescription omega-3 fatty acids at 4 g/day for triglyceride lowering in appropriate patients [4]. Prescription products are standardized and used in a clinical context; that evidence should not be converted into “take four grams of any fish oil.”</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">3. Cardiovascular event reduction</h3><p className="mt-2 text-sm leading-7 text-muted">The trial record is formulation- and population-specific. REDUCE-IT enrolled statin-treated high-risk patients with elevated triglycerides and found fewer ischemic events with 4 g/day icosapent ethyl, an EPA-only ethyl ester [5]. STRENGTH enrolled a different high-risk population and found no cardiovascular event reduction with 4 g/day of an EPA+DHA carboxylic-acid formulation [6]. These trials are a warning against treating “omega-3” as one interchangeable intervention.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Molecular form affects absorption — but it is not a quality score</h2>
        <p className="text-sm leading-7 text-muted">In Dyerberg&rsquo;s short-term human comparison, re-esterified triglycerides produced higher measured bioavailability than ethyl esters, while natural triglycerides and free fatty acids fell between those preparations [2]. Broader reviews show that chemical form, emulsification, dose, meal fat, and formulation can all influence absorption [3]. That is useful pharmacokinetic information. It does not establish a universal rule that rTG products produce better long-term clinical outcomes, nor does it make ethyl ester products therapeutically inferior.</p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Oxidation: test it, don’t sniff-test it</h2>
        <p className="text-sm leading-7 text-muted">Long-chain omega-3 fats are chemically susceptible to oxidation. Quality programs commonly assess primary oxidation with peroxide value and secondary oxidation with anisidine value, then combine them into a TOTOX measure [7,8]. Surveys have found substantial variability across retail products, although flavored products and analytical methods can complicate interpretation. Importantly, evidence that oxidation degrades product chemistry is stronger than evidence that typical oxidized supplement exposure causes a defined human clinical harm [7].</p>
        <p className="text-sm leading-7 text-muted">A strong fishy odor can tell you a product is unpleasant, but it is not a substitute for analytical testing. Prefer products that publish meaningful quality data, follow storage instructions, and avoid prolonged heat/light exposure.</p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">There is no evidence-based “premium fish oil formula” defined by 60%+ EPA+DHA, rTG form, and a particular brand list. For an OTC product, verify the actual EPA+DHA amount, quality testing, source, storage, and meal instructions. For high triglycerides or cardiovascular risk reduction, stop treating the choice as a retail supplement decision: the evidence comes from specific prescription doses, formulations, and patient populations [4-6]. Algae-derived omega-3s are a legitimate alternative when their EPA/DHA content matches the intended use [9].</p>
      </section>

      <References refs={OMEGA3_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/omega-3-quality-guide/" questions={FAQS} />
      <div className="max-w-4xl">
        <RecommendationSection
          title="Omega-3 sourcing starting points"
          description="Compare products by actual EPA+DHA per serving, source, testing transparency, meal instructions, and price per gram of the omega-3s you actually want. Product listings are sourcing starting points, not clinical endorsements."
          products={getRevenueProductSet('omega-3')?.products ?? []}
        />
      </div>
      <EmailCapture headline="Get evidence reviews like this" description="Omega-3 decisions separated by goal, formulation, and evidence." ctaLabel="Get the evidence" location="guide-omega3" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
