import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Probiotic Strains Guide: Product- & Condition-Specific Evidence (2026)',
  description: 'Evidence review of probiotics that separates strain, formulation, condition, dose and safety instead of ranking products by CFU count.',
  path: '/guides/other/probiotic-strains-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Is there a best probiotic strain for everyone?', answer: 'No. Probiotic effects can be strain-, combination-, product- and condition-specific. Evidence for one preparation should not be transferred automatically to another strain of the same species or to a generic multi-strain blend.' },
  { question: 'Does Bifidobacterium infantis 35624 reliably treat IBS?', answer: 'The evidence is not strong enough for that claim. A 2017 meta-analysis found that single-strain B. infantis 35624 did not significantly improve abdominal pain, bloating/distention or bowel-habit satisfaction. AGA recommends probiotics for symptomatic IBS only in the context of a clinical trial.' },
  { question: 'Can probiotics prevent antibiotic-associated diarrhea?', answer: 'Pooled adult randomized trials show a reduced risk of antibiotic-associated diarrhea, but the effect varies with baseline risk, species or formulation, and dose within a studied product. This evidence should not be converted into one universal strain, CFU count, timing interval or treatment duration.' },
  { question: 'Does a higher CFU count mean a better probiotic?', answer: 'No universal CFU target works across conditions and products. Some trials show dose-response within a specific preparation, but CFU count by itself does not establish efficacy. The relevant question is whether the exact strain or combination, formulation and dose were studied for the intended outcome.' },
  { question: 'Are probiotics safe for everyone?', answer: 'Most studies in generally healthy participants report good tolerability, but risk is not identical across organisms and populations. Saccharomyces fungemia has been reported particularly in debilitated or critical-care patients and other high-risk settings. Serious illness, central lines, major immune compromise and complex medical care warrant clinician review rather than a blanket “probiotics are harmless” assumption.' },
]

const PROBIOTIC_REFS = [
  { n: 1, text: 'American Gastroenterological Association. Role of probiotics in the management of gastrointestinal disorders. Clinical guideline (2020; current AGA guidance page).', url: 'https://gastro.org/clinical-guidance/role-of-probiotics-in-the-management-of-gastrointestinal-disorders/' },
  { n: 2, text: 'Yuan F, et al. (2017). Efficacy of Bifidobacterium infantis 35624 in patients with irritable bowel syndrome: a meta-analysis. PMID 28166427.', url: 'https://pubmed.ncbi.nlm.nih.gov/28166427/' },
  { n: 3, text: 'Goodman C, et al. (2021). Probiotics for the prevention of antibiotic-associated diarrhoea: systematic review and meta-analysis of 42 randomized trials in adults. PMID 34385227.', url: 'https://pubmed.ncbi.nlm.nih.gov/34385227/' },
  { n: 4, text: 'McFarland LV, et al. (2018). Strain-Specificity and Disease-Specificity of Probiotic Efficacy: systematic review and meta-analysis. PMID 29868585.', url: 'https://pubmed.ncbi.nlm.nih.gov/29868585/' },
  { n: 5, text: 'Hill C, et al. (2014). ISAPP consensus statement on the scope and appropriate use of the term probiotic. PMID 24912386.', url: 'https://pubmed.ncbi.nlm.nih.gov/24912386/' },
  { n: 6, text: 'Epidemiology of Saccharomyces fungemia: a systematic review (2023). PMID 36806741.', url: 'https://pubmed.ncbi.nlm.nih.gov/36806741/' },
]

export default function ProbioticStrainsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Probiotic Strains: Product- and Condition-Specific Evidence"
        description="Evidence review separating probiotic strain, formulation, condition, dose and safety."
        url="https://thehippiescientist.net/guides/other/probiotic-strains-guide"
        type="Article"
        citationUrls={PROBIOTIC_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Probiotic Strains' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 6 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Probiotics: The Product and Condition Matter More Than the Biggest CFU Number</h1>
        <p className="text-lg leading-8 text-muted">“Probiotic” is not one treatment. Different strains and combinations can behave differently, and efficacy can change by condition, formulation, baseline risk and dose. That makes a generic species name or a huge CFU number a poor substitute for product-specific clinical evidence [4,5].</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/probiotic-strains-guide.jpg" alt="Probiotic capsules beside yogurt, kimchi, and kombucha" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Evidence follows the studied strain or combination, formulation, population and outcome—not the front-label CFU number.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p><strong>Do not buy a probiotic by species name or CFU count alone.</strong> Adult antibiotic-associated-diarrhea trials show a pooled preventive signal, but the benefit varies by baseline risk and preparation [3]. IBS is much less settled: AGA recommends probiotics for symptomatic IBS only in a clinical-trial context, and single-strain <em>B. infantis</em> 35624 did not significantly improve key IBS symptoms in a meta-analysis [1,2]. The safest evidence translation is product + strain/combination + condition + studied regimen—not “10 billion is good” or “more strains are better.”</p>
      </LegacyGuideQuickAnswer>

      <section id="probiotic-evidence-map" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · What the Evidence Actually Supports</p>
        <div className="overflow-x-auto"><table className="min-w-[940px] text-sm"><caption className="sr-only">Probiotic evidence by indication, intervention type, result and limitation</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Question</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Evidence signal</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">What matters</th><th scope="col" className="text-left py-3 font-semibold text-ink">Do not infer</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Antibiotic-associated diarrhea in adults</th><td className="py-3 pr-4">A 42-RCT meta-analysis found lower pooled AAD risk with probiotics (RR 0.63), with moderate-certainty evidence [3].</td><td className="py-3 pr-4">Baseline AAD risk, species/formulation and within-product dose influenced results.</td><td className="py-3">One universal strain, CFU target, antibiotic-spacing interval or duration.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">IBS</th><td className="py-3 pr-4">AGA recommends probiotic use only in a clinical-trial context [1].</td><td className="py-3 pr-4">Trials use heterogeneous products and outcomes; single-strain B. infantis 35624 efficacy was not confirmed [2].</td><td className="py-3">A “Strong” IBS strain ranking from species-level or pooled data.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Specific strain / combination evidence</th><td className="py-3 pr-4">A large systematic review found clear strain- and disease-specific differences in efficacy [4].</td><td className="py-3 pr-4">Full strain designation, combination, formulation, population and outcome.</td><td className="py-3">Evidence transfer to another strain of the same species or a proprietary blend.</td></tr>
          <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">General “gut health”</th><td className="py-3 pr-4">There is no single validated probiotic regimen for every healthy person.</td><td className="py-3 pr-4">Define a measurable goal before judging whether a product has relevant evidence.</td><td className="py-3">That higher CFU, more strains or a “microbiome” claim means greater benefit.</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why fixed CFU rules are misleading</h2>
        <p className="text-sm leading-7 text-muted">CFU is a dose measure, not an efficacy grade. In the adult AAD meta-analysis, a higher dose sometimes performed better than a lower dose <em>within the same probiotic</em> [3]. That does not create a universal 5-, 10-, 25- or 50-billion-CFU rule across unrelated strains and conditions. A clinically relevant dose is the dose of the preparation that was actually tested for the outcome you care about.</p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Safety boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Live microorganisms are not risk-free in every population</h2>
        <p className="mt-3 text-sm leading-7">Many probiotic trials report good tolerability in the populations studied, but risk changes with organism and host. A systematic review of Saccharomyces fungemia found many cases associated with <em>S. boulardii</em> use, especially in debilitated or critical-care settings [6]. Severe illness, central venous access, major immune compromise, intensive care and complex medical conditions deserve clinician review rather than a generic “safe probiotic” recommendation.</p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">The useful probiotic question is not “Which species is best?” It is “Was this exact strain or combination, in a comparable formulation and dose, tested in people like me for the outcome I care about?” Adult AAD has a pooled preventive signal [3]. IBS remains guideline-level uncertain [1,2]. CFU count, strain count and marketing category should never substitute for that evidence match.</p>
      </section>

      <LegacyGuideFAQ questions={FAQS} pagePath="/guides/other/probiotic-strains-guide/" />

      <section className="card-premium p-6 space-y-3 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Related reading</h2><p className="text-sm leading-7 text-muted">Put probiotic evidence beside the diet and substrate side of gut health:</p><ul className="grid gap-2 sm:grid-cols-2 text-sm font-semibold text-brand-800"><li><Link href="/guides/other/prebiotics/" className="hover:underline">Prebiotics: evidence &amp; types →</Link></li><li><Link href="/guides/best/supplements-for-gut-health/" className="hover:underline">Supplements for gut health →</Link></li></ul></section>

      <div className="max-w-4xl"><RecommendationSection title="Probiotic sourcing examples" description="These are sourcing examples, not treatment recommendations. Verify the exact strain or combination, formulation, viable-count labeling, storage requirements and whether the product meaningfully matches evidence for your intended use." products={getRevenueProductSet('probiotics')?.products ?? []} /></div>

      <section id="references" className="scroll-mt-24"><References refs={PROBIOTIC_REFS} /></section>
      <EmailCapture headline="Get evidence reviews like this" description="Probiotic strains, formulations, and conditions — evidence instead of CFU marketing." ctaLabel="Get the evidence" location="guide-probiotics" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/safety-checker/" className="text-sm font-bold text-brand-800 hover:underline">Safety checker →</Link></div>
    </div>
  )
}
