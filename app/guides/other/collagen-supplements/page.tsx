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
import Ref from '@/components/LegacyGuideReference'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Collagen Supplements: Evidence, Benefits & Types (2026 Review)',
  description: 'Collagen is a $5B+ category with 100+ RCTs. 10 cited studies on skin, joints, bone density, and why it\'s not better than whey for muscle.',
  path: '/guides/other/collagen-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do collagen supplements improve skin?', answer: 'Yes, modestly. A 2026 umbrella review of 113 RCTs (n = 7,983) found high-certainty improvements in skin elasticity and hydration, but no significant improvement in skin roughness [1]. A 2021 meta-analysis of 19 RCTs found hydrolyzed collagen improved skin hydration, elasticity, and wrinkles [2]. Effects are small to moderate, appear over weeks to months, and are not a quick fix.' },
  { question: 'Does collagen help joints?', answer: 'Yes, moderately for osteoarthritis. Undenatured type II collagen at 40 mg/day improved WOMAC and VAS scores over 90 days compared with glucosamine plus chondroitin in one knee OA trial [3]. A review of collagen hydrolysate also found some clinical improvement in pain and function alongside preclinical evidence of increased extracellular-matrix synthesis in chondrocytes [4]. Effects take months, and evidence is stronger for osteoarthritis than for nonspecific joint pain.' },
  { question: 'Which collagen type is best?', answer: 'Types I+III (commonly bovine or marine) are generally used for skin and bone at 2.5-10 g/day [1,2]. Type II (chicken sternum) is studied for joint cartilage at 40 mg/day [3]. A 2024 crossover study comparing fish-, porcine-, and bovine-derived collagen hydrolysates found comparable uptake of free hydroxyproline across sources, although individual peptide profiles differed [5]. Most multi-collagen products contain less of each individual type.' },
  { question: 'Is collagen just overpriced protein?', answer: 'Partially. Collagen lacks tryptophan (incomplete protein) and is inferior to whey for stimulating muscle protein synthesis [6]. However, collagen provides a distinct amino-acid and peptide profile, and the skin and joint evidence is specific to collagen interventions [1,2,4]. Value depends on your goals.' },
  { question: 'Can I get collagen from bone broth?', answer: 'Bone broth amino-acid content is highly variable and can be substantially lower than the amounts provided by collagen supplements used in research [8]. Supplements provide standardized doses matching clinical trial protocols. Bone broth can be a food source of collagen-related amino acids, but it is not a reliable substitute for studied collagen doses.' },
];

export default function CollagenGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Collagen: Evidence, Benefits & Types" description="Collagen is a $5B+ category with 100+ RCTs — here's what the evidence shows." url="https://thehippiescientist.net/guides/other/collagen-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Collagen Supplements' }]} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 10 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Collagen: What 100+ Trials Actually Show</h1><p className="text-lg leading-8 text-muted">Collagen is a $5+ billion category, endorsed by celebrities and backed by more clinical trials than most supplement categories. A 2026 umbrella review of 113 RCTs with 7,983 participants provides the broadest synthesis to date [1]. The effects are real in some domains but not universal — here is what the evidence supports, with citations.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/collagen-supplements.jpg" alt="Collagen peptide powder in a glass jar with capsules on a wood surface" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Collagen — one of the better-studied supplement categories, but effects are modest.</figcaption></figure></section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>Collagen <strong>modestly improves skin hydration and elasticity, with some evidence for wrinkles</strong> over weeks to months [1,2]. It can also <strong>reduce osteoarthritis symptoms</strong>, with evidence varying by collagen form and study design [1,3,4]. Collagen is one of the better-studied supplement categories — but effects are incremental, not dramatic. ConsumerLab testing found per-gram collagen costs vary substantially between products [9]. Quality and dose matter enormously.</p>
      </LegacyGuideQuickAnswer>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by claim</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Skin health — Moderate to strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The 2026 umbrella review synthesized 16 systematic reviews covering 113 RCTs and 7,983 participants. It found high-certainty improvements in skin elasticity and hydration, while skin roughness was not significantly improved [1]. A 2021 meta-analysis of 19 randomized, double-blind controlled trials (1,125 participants) found favorable results for hydration, elasticity, and wrinkles [2]. A 2019 systematic review of 11 dermatology studies also reported promising effects on elasticity, hydration, and dermal collagen density [10]. The evidence supports modest skin benefits, not a rapid or universal anti-aging effect.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Joint pain (osteoarthritis) — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Crowley et al. (2009) compared undenatured type II collagen with glucosamine plus chondroitin in knee osteoarthritis. After 90 days, UC-II reduced WOMAC scores by 33% versus 14% in the comparator group and VAS scores by 40% versus 15.4% [3]. Bello &amp; Oesser (2006) reviewed clinical and preclinical collagen-hydrolysate research, finding some improvements in pain and function alongside evidence that collagen hydrolysate can stimulate extracellular-matrix synthesis in chondrocytes [4]. The 2026 umbrella review also found favorable osteoarthritis outcomes overall [1].</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Bone density — Emerging evidence</h3><p className="mt-2 text-sm leading-7 text-muted">König et al. (2018) randomized 131 postmenopausal women with age-related reductions in bone mineral density to 5 g/day of specific collagen peptides or placebo for 12 months. Spine and femoral-neck BMD increased significantly in the collagen group compared with control, alongside favorable changes in bone-turnover markers [7]. The result is promising, but it should not be treated as a precise population-wide percentage gain or as definitive evidence on fracture prevention.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Muscle protein synthesis — Inferior to whey</h3><p className="mt-2 text-sm leading-7 text-muted">Oikawa et al. (2020) randomized 22 healthy older women to whey or collagen protein and measured acute and longer-term muscle protein synthesis with and without resistance exercise. Whey produced greater muscle protein synthesis than collagen; collagen did not significantly elevate longer-term muscle protein synthesis above baseline [6]. Collagen is therefore a poor replacement for a high-quality complete protein when the primary goal is stimulating muscle protein synthesis.</p></div>
        </div>
      </section>

      <section id="collagen-types" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Collagen types at a glance</h2>
        <div className="overflow-x-auto"><table className="min-w-[720px] text-sm"><caption className="sr-only">Collagen types compared by source, best-supported use, and studied dose</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4">Type</th><th scope="col" className="text-left py-3 pr-4">Source</th><th scope="col" className="text-left py-3 pr-4">Best evidence for</th><th scope="col" className="text-left py-3">Studied dose</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">I + III</th><td className="py-3 pr-4">Bovine, marine [5]</td><td className="py-3 pr-4">Skin, bone [1,2]</td><td className="py-3">2.5-10 g/day</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">II (undenatured)</th><td className="py-3 pr-4">Chicken sternum</td><td className="py-3 pr-4">Joint cartilage [3]</td><td className="py-3">40 mg/day</td></tr>
          <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Multi-collagen</th><td className="py-3 pr-4">Mixed</td><td className="py-3 pr-4">General (dose depends on formulation)</td><td className="py-3">Check per-type amount</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Collagen is one of the better-studied supplement categories, with the clearest signals in skin hydration/elasticity and osteoarthritis outcomes [1-4]. For knee OA, undenatured type II collagen at 40 mg/day has supportive clinical evidence [3]. For skin, hydrolyzed collagen has been studied across roughly 2.5-10 g/day and over multi-week interventions [2,10]. Source alone is not a reliable shortcut for bioavailability: a direct human comparison found relevant uptake across fish, porcine, and bovine hydrolysates with peptide-specific differences [5]. Collagen is not a replacement for complete protein or medical OA management.</p></section>

      <section id="collagen-evidence-summary" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Collagen Evidence</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><caption className="sr-only">Collagen evidence by goal, evidence strength, collagen type, dose, and time to effect</caption><thead><tr className="border-b"><th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Goal</th><th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Type</th><th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th scope="col" className="text-left py-2 font-semibold text-ink">Time to Effect</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-2 pr-4 text-left font-medium text-ink">Skin (hydration, elasticity)</th><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Moderate-Strong</span></td><td className="py-2 pr-4">Hydrolyzed collagen</td><td className="py-2 pr-4">2.5-10 g/day</td><td className="py-2">Multi-week studies</td></tr>
          <tr className="border-b"><th scope="row" className="py-2 pr-4 text-left font-medium text-ink">Joint Pain (OA)</th><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Moderate</span></td><td className="py-2 pr-4">II (undenatured)</td><td className="py-2 pr-4">40 mg/day</td><td className="py-2">About 3 months in trial [3]</td></tr>
          <tr className="border-b"><th scope="row" className="py-2 pr-4 text-left font-medium text-ink">Bone Density</th><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Emerging</span></td><td className="py-2 pr-4">Specific collagen peptides</td><td className="py-2 pr-4">5 g/day</td><td className="py-2">12 months [7]</td></tr>
          <tr><th scope="row" className="py-2 pr-4 text-left font-medium text-ink">Muscle Protein Synthesis</th><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Inferior to Whey</span></td><td className="py-2 pr-4">Collagen protein</td><td className="py-2 pr-4">30 g twice/day in RCT [6]</td><td className="py-2">Acute + 6-day measures</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">Compare products by studied dose and independent quality testing, not by ingredient count alone.</p><p className="mt-1 text-xs leading-5 text-muted">Collagen source affects peptide composition, but current human pharmacokinetic data do not justify a blanket claim that marine collagen is universally better absorbed than bovine collagen [5].</p></div>
      </section>

      <section id="references" className="card-premium scroll-mt-24 p-6 space-y-3 max-w-4xl"><h2 className="text-xl font-semibold text-ink">References</h2><ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        <Ref n={1} text="Ravindran R, et al. (2026). Collagen Supplementation for Skin and Musculoskeletal Health: An Umbrella Review of Meta-Analyses on Elasticity, Hydration, and Structural Outcomes. Aesthet Surg J Open Forum, 8: ojag018." url="https://pubmed.ncbi.nlm.nih.gov/41809116/" />
        <Ref n={2} text="de Miranda RB, Weimer P, Rossi RC. (2021). Effects of hydrolyzed collagen supplementation on skin aging: systematic review and meta-analysis. Int J Dermatol, 60(12): 1449-1461." url="https://pubmed.ncbi.nlm.nih.gov/33742704/" />
        <Ref n={3} text="Crowley DC, et al. (2009). Safety and efficacy of undenatured type II collagen in knee osteoarthritis. Int J Med Sci, 6(6): 312-321." url="https://pubmed.ncbi.nlm.nih.gov/19847319/" />
        <Ref n={4} text="Bello A, Oesser S. (2006). Collagen hydrolysate for osteoarthritis and other joint disorders. Curr Med Res Opin, 22(11): 2221-2232." url="https://pubmed.ncbi.nlm.nih.gov/17076983/" />
        <Ref n={5} text="Virgilio N, et al. (2024). Absorption of bioactive peptides following collagen hydrolysate intake: a randomized, double-blind crossover study in healthy individuals. Front Nutr." url="https://pubmed.ncbi.nlm.nih.gov/39149544/" />
        <Ref n={6} text="Oikawa SY, et al. (2020). Whey protein but not collagen peptides stimulate acute and longer-term muscle protein synthesis with and without resistance exercise in healthy older women: a randomized controlled trial. Am J Clin Nutr, 111(3): 708-718." url="https://pubmed.ncbi.nlm.nih.gov/31919527/" />
        <Ref n={7} text="König D, et al. (2018). Specific collagen peptides improve bone mineral density and bone markers in postmenopausal women: a randomized controlled study. Nutrients, 10(1): 97." url="https://pubmed.ncbi.nlm.nih.gov/29337906/" />
        <Ref n={8} text="Alcock RD, Shaw GC, Burke LM. (2019). Bone Broth Unlikely to Provide Reliable Concentrations of Collagen Precursors Compared With Supplemental Sources of Collagen Used in Collagen Research. Int J Sport Nutr Exerc Metab, 29(3): 265-272." url="https://pubmed.ncbi.nlm.nih.gov/29893587/" />
        <Ref n={9} text="ConsumerLab.com (2023). Collagen Supplements Review: per-gram cost ranges from $0.07 to $25+." url="https://www.consumerlab.com/reviews/collagen-supplements-review/collagen/" />
        <Ref n={10} text="Choi FD, et al. (2019). Oral collagen supplementation: systematic review of dermatological applications. J Drugs Dermatol, 18(1): 9-16." url="https://pubmed.ncbi.nlm.nih.gov/30681787/" />
      </ol></section>
      <LegacyGuideFAQ pagePath="/guides/other/collagen-supplements/" questions={FAQS} />
      <div className="max-w-4xl">
        <RecommendationSection products={getRevenueProductSet('collagen')?.products ?? []} />
      </div>
      <EmailCapture headline="Get evidence reviews like this" description="10 cited studies per guide. No hype." ctaLabel="Get the evidence" location="guide-collagen" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
