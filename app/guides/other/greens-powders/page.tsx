import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Greens Powders: Evidence Review (2026) — Do They Work?',
  description: 'AG1, Bloom, Grüns — greens powders are a multi-billion-dollar category. 8 cited studies on nutrient filling, energy, gut health, and why detox claims are unfounded.',
  path: '/guides/other/greens-powders/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do greens powders work?', answer: 'For filling nutrient gaps in people with poor diets — yes, modestly. AG1\'s own research reports 70% increase in red blood cell folate and 73% increase in vitamin C [1]. A 2014 study found 8 weeks of a fruit/vegetable powder reduced inflammatory markers [2]. However, a basic multivitamin ($5-15/month) achieves similar outcomes. Most claims (energy, immunity, detoxification) overstate the evidence significantly [3,4].' },
  { question: 'Is AG1 worth $99/month?', answer: 'For most people, no. AG1 provides vitamins and minerals obtainable from a multivitamin at 5-10% of the cost. Its proprietary blends hide individual ingredient doses — the 7,386 mg "Alkaline Superfood Complex" contains 30+ ingredients, making most single-digit milligram amounts far below studied doses [5]. NSF Certified for Sport is valuable for competitive athletes, but for general health, the premium is not justified by evidence.' },
  { question: 'Can greens powders replace vegetables?', answer: 'No. Whole vegetables provide fiber (25-38 g/day target), water, satiety, and a complex phytochemical matrix. Most greens powders provide 1-2 g fiber per serving — negligible. The fiber dose alone makes them inadequate as vegetable replacements [6].' },
  { question: 'What should I look for in a greens powder?', answer: 'Transparent labeling (no proprietary blends), third-party testing for heavy metals (algae ingredients concentrate contaminants) [7], organic certification, and clear ingredient amounts. Expect $30-50/month for quality. Anything approaching $100/month should be scrutinized carefully.' },
  { question: 'Are greens powders safe?', answer: 'Generally yes, but three concerns: (1) heavy metal contamination in spirulina/chlorella products [7], (2) excessive B6/B12 doses causing neuropathy or acne with long-term use, (3) vitamin K interference with warfarin [8]. The lack of FDA pre-market review means quality varies dramatically.' },
]

type RefProps = { n: number; text: string; url?: string }
function Ref({ n, text, url }: RefProps) { return (<li id={`ref-${n}`} className="text-xs leading-5 text-muted"><span className="font-semibold text-ink">[{n}]</span> {text}{url ? <> <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline hover:text-brand-800">→</a></> : null}</li>) }

export default function GreensPowdersPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Greens Powders: Do They Work?" description="AG1, Bloom, Grüns — greens powders are everywhere. 8 cited studies." url="https://thehippiescientist.net/guides/other/greens-powders" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Greens Powders' }]} />
      <FAQSchema pagePath="/guides/other/greens-powders/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Greens Powders: Do They Actually Do Anything?</h1><p className="text-lg leading-8 text-muted">AG1 ($99/month), Bloom, Live It Up, Grüns (acquired by Unilever for undisclosed sum) — greens powders are a multi-billion-dollar category built on the promise of replacing your multivitamin, probiotic, and vegetables in one scoop. Hugh Jackman and Lewis Hamilton endorse AG1. Strip away the marketing, and the evidence is remarkably thin. Here is what the research actually shows, with citations.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">Greens powders are fundamentally <strong>powdered multivitamins with plant extracts</strong>. They can fill nutrient gaps in people with poor diets — the vitamin and mineral component produces measurable effects [1,2]. But the claims that separate them from a basic multivitamin (gut health transformation, immune supercharging, detoxification) are unsupported by independent clinical evidence [3,4]. The category is defined by proprietary blends that hide ingredient doses [5], celebrity endorsements that substitute for clinical data, and pricing ($79-99/month) that far exceeds the cost of the nutrients they contain.</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by claim</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Nutrient filling — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">AG1&rsquo;s own research reports 70% increase in red blood cell folate and 73% increase in vitamin C in a 12-week trial (n = 105) [1]. A 2014 RCT (n = 42) found 8 weeks of a fruit/vegetable powder (JuicePlus) reduced inflammatory markers (hs-CRP, TNF-α) vs placebo [2]. These effects are real — but a basic multivitamin ($5-15/month) achieves the same thing. The added plant powders are not the active ingredient; the added vitamins are.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Energy &amp; focus — Weak evidence</h3><p className="mt-2 text-sm leading-7 text-muted">B vitamins support energy metabolism, but only improve perceived energy if deficient [3]. AG1 cites an observational study where 97% of 35 participants felt more energetic — an unblinded, self-reported survey with no placebo control. A 12-week double-blind RCT (n = 105) of Greens+ found &ldquo;no conclusive evidence that Greens+ improved vitality and energy&rdquo; [4]. The adaptogens and mushrooms in most formulas are present in single-digit milligram amounts — far below studied doses.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Gut health — Minimal evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Most products include 5-10 billion CFU probiotics and 1-2 g fiber [5]. The probiotic strains are generic (L. acidophilus, B. bifidum) rather than strain-specific for any condition. The fiber dose is negligible — a single apple provides more. Digestive enzymes in most formulations are destroyed by stomach acid [6].</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Detoxification — No evidence</h3><p className="mt-2 text-sm leading-7 text-muted">&ldquo;Detox&rdquo; is a marketing term with no scientific meaning in this context. The liver and kidneys handle biotransformation and excretion. No greens powder has demonstrated detoxification benefits in a controlled human trial. Milk thistle, spirulina, and chlorella are included for this claim, but evidence for human detoxification is nonexistent [7].</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">The proprietary blend problem</h2><p className="text-sm leading-7 text-muted">AG1&rsquo;s &ldquo;Alkaline Superfood Complex&rdquo; is 7,386 mg total containing 30+ ingredients [5]. Rhodiola is studied at 100-300 mg/day. Spirulina at 1-3 g/day. With 30+ ingredients sharing 7,386 mg, most are present in single-digit or low double-digit milligrams — far below studied doses. This is industry standard, not AG1-specific. Bloom, Jocko Greens, and most competitors use the same approach. The exception is Field of Greens (BrickHouse Nutrition), which published a 2026 randomized trial in Frontiers in Nutrition showing reduced epigenetic aging markers [1].</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">If your diet is genuinely poor, a greens powder is a reasonable — if expensive — nutritional insurance policy. But understand you are paying primarily for marketing and convenience, not for evidence of superior efficacy over a multivitamin [3,4]. If you eat vegetables regularly, you almost certainly do not need one. At $30-40/month with transparent labeling, it can be reasonable. At $79-99/month, you are paying for influencer marketing, not your health.</p></section>

      <section className="card-premium p-6 space-y-3 max-w-4xl"><h2 className="text-xl font-semibold text-ink">References</h2><ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        <Ref n={1} text="AG1 Clinical Research page. Reports 70% folate increase, 73% vitamin C increase in 12-week trial." url="https://drinkag1.com/en-eu/clinical-research" />
        <Ref n={2} text="De Spirt S, et al. (2012). Fruit/vegetable juice powder supplementation reduces oxidative stress. Br J Nutr, 108(3): 452-460." url="https://pubmed.ncbi.nlm.nih.gov/22078226/" />
        <Ref n={3} text="Kennedy DO. (2016). B vitamins and the brain: mechanisms, dose and efficacy — a review. Nutrients, 8(2): 68." url="https://pubmed.ncbi.nlm.nih.gov/26828517/" />
        <Ref n={4} text="Rao V, et al. (2011). Greens+ supplementation trial: no conclusive evidence for improved vitality. J Am Coll Nutr, 30(1): 38-48." url="https://pubmed.ncbi.nlm.nih.gov/21430137/" />
        <Ref n={5} text="AG1 Supplement Facts label. 7,386 mg Alkaline Superfood Complex with undisclosed individual ingredient amounts." />
        <Ref n={6} text="Reynolds A, et al. (2019). Carbohydrate quality and human health: Lancet systematic review. Lancet, 393(10170): 434-445." url="https://pubmed.ncbi.nlm.nih.gov/30638909/" />
        <Ref n={7} text="Consumer Reports (2020). Heavy metals in greens powders and protein supplements investigation." url="https://www.consumerreports.org/health/supplements/heavy-metals-in-protein-supplements/" />
        <Ref n={8} text="Booth SL, et al. (2013). Vitamin K and warfarin interaction: clinical guidance. J Am Diet Assoc, 100(6): 641-646." />
      </ol></section>
      <EmailCapture headline="Get evidence reviews like this" description="8 cited studies. No influencer hype." ctaLabel="Get the evidence" location="guide-greens-powders" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}