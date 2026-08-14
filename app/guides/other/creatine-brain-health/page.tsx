import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Creatine for Brain Health: What Human Evidence Shows',
  description: 'Human evidence on creatine for memory, sleep deprivation, menopause, and depression—what looks promising, what remains uncertain, and where claims overreach.',
  path: '/guides/other/creatine-brain-health/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Does creatine improve brain function?', answer: 'A 2024 meta-analysis of 16 randomized trials (492 adults) found modest benefits for memory, attention time, and processing speed, but not for overall cognition or executive function. Certainty was moderate for memory and low for several other outcomes, so the evidence is promising rather than universal.' },
  { question: 'What does the menopause trial show?', answer: 'A small randomized trial in 36 perimenopausal or postmenopausal women found that 1,500 mg/day creatine hydrochloride for 8 weeks improved reaction time and increased frontal brain creatine versus placebo. Mood-swing improvement was only a trend, and the trial does not establish a general treatment for menopause-related brain fog.' },
  { question: 'How much creatine has been studied for cognition?', answer: 'Study protocols vary. Most longer-term cognition research uses creatine monohydrate, while acute sleep-deprivation experiments have used unusually high single doses such as 0.35 g/kg and, in a 2026 follow-up, 0.2 g/kg. Those experimental doses should not be treated as a universal brain-health protocol.' },
  { question: 'Is creatine proven to protect the brain?', answer: 'No. Creatine is involved in cellular energy metabolism and has a substantial sports-nutrition safety literature, but current cognitive trials do not prove that it prevents dementia, protects every healthy brain, or produces noticeable benefits in every population.' },
  { question: 'Does creatine help with depression?', answer: 'Evidence is preliminary and mainly concerns creatine used alongside standard treatment. A 2012 randomized trial in women with major depression found faster improvement when creatine was added to an SSRI. That does not establish creatine as a standalone depression treatment.' },
]

const CREATINE_BRAIN_REFS = [
  { n: 1, text: 'Xu C, et al. (2024). The effects of creatine supplementation on cognitive function in adults: systematic review and meta-analysis. Front Nutr, 11:1424972. Sixteen RCTs / 492 participants.', url: 'https://pubmed.ncbi.nlm.nih.gov/39070254/' },
  { n: 2, text: 'Gordji-Nejad A, et al. (2026). Single-Dose Creatine Reduces Sleep Deprivation-Induced Deterioration in Cognitive Performance. Nutrients. Twenty-nine healthy participants; 0.2 g/kg single-dose crossover study.', url: 'https://pubmed.ncbi.nlm.nih.gov/42075005/' },
  { n: 3, text: 'Candow DG, et al. (2023). Creatine supplementation and brain health. Sports Med, 53(Suppl 1): 69-83.', url: 'https://pubmed.ncbi.nlm.nih.gov/37814108/' },
  { n: 4, text: 'Korovljev D, et al. (2025). CONCRET-MENOPA randomized controlled trial in perimenopausal and menopausal women. J Am Nutr Assoc. Epub 2025 Aug 25.', url: 'https://pubmed.ncbi.nlm.nih.gov/40854087/' },
  { n: 5, text: 'Rae C, et al. (2003). Oral creatine monohydrate improves brain performance: a double-blind trial. Proc Biol Sci, 270(1529): 2147-2150.', url: 'https://pubmed.ncbi.nlm.nih.gov/14561278/' },
  { n: 6, text: 'Lyoo IK, et al. (2012). Creatine augmentation enhances antidepressant response in women with major depression. Am J Psychiatry, 169(9): 937-945.', url: 'https://pubmed.ncbi.nlm.nih.gov/22864465/' },
  { n: 7, text: 'McMorris T, et al. (2007). Creatine supplementation and cognitive performance in elderly. Neuropsychol Dev Cogn B Aging Neuropsychol Cogn, 14(5): 517-528.', url: 'https://pubmed.ncbi.nlm.nih.gov/17828626/' },
  { n: 8, text: 'Forbes SC, et al. (2022). Meta-analysis of creatine and cognitive processing. Nutr Rev, 80(5): 1100-1117.', url: 'https://pubmed.ncbi.nlm.nih.gov/34791473/' },
]

export default function CreatineBrainPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Creatine for Brain Health" description="Creatine beyond muscle — evidence for brain fog, menopause, sleep deprivation." url="https://thehippiescientist.net/guides/other/creatine-brain-health" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Creatine & Brain Health' }]} />
      <FAQSchema pagePath="/guides/other/creatine-brain-health/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Creatine for Brain Health: Not Just for Muscle Anymore</h1><p className="text-lg leading-8 text-muted">Creatine has been a gym staple for 30 years. But in 2026, the conversation has shifted — BBC headlines, menopause specialists, and cognitive researchers are all asking the same question: can this white powder help your brain? The answer is emerging, nuanced, and — for once in the supplement world — actually supported by decent evidence.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/creatine-brain-health.jpg" alt="Creatine powder beside a brain model" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Creatine — beyond muscle, into the brain.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><p className="eyebrow-label">Evidence verdict</p><h2 className="text-2xl font-semibold">Creatine may help some cognitive outcomes, but the effect is not universal</h2><p className="text-sm leading-7 text-muted">The strongest broad synthesis here is a 2024 meta-analysis of 16 randomized trials / 492 adults. It found modest improvements in memory, attention time, and processing speed, but not overall cognition or executive function [1]. Sleep-deprivation studies provide a separate acute-stress signal [2], while the menopause trial is small and formulation-specific [4]. The useful conclusion is narrower than “creatine boosts the brain”: benefits appear outcome- and population-dependent, and several domains remain low-certainty.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Creatine Brain Evidence</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Use Case</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Effect</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">Strength</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Sleep Deprivation</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2 pr-4">Preserves cognition</td><td className="py-2 pr-4">0.2 g/kg single dose</td><td className="py-2">⭐⭐⭐</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Menopause Brain Fog</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Emerging</span></td><td className="py-2 pr-4">Reaction time ↑, mood ↑</td><td className="py-2 pr-4">1.5-5 g/day</td><td className="py-2">⭐⭐</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Depression (adjunct)</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Emerging</span></td><td className="py-2 pr-4">Faster SSRI response</td><td className="py-2 pr-4">5 g/day + SSRI</td><td className="py-2">⭐⭐</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Vegetarians/Vegans</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Stronger</span></td><td className="py-2 pr-4">Memory ↑, reasoning ↑</td><td className="py-2 pr-4">3-5 g/day</td><td className="py-2">⭐⭐⭐</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Healthy Young Adults</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Minimal</span></td><td className="py-2 pr-4">Negligible</td><td className="py-2 pr-4">N/A</td><td className="py-2">⭐</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The rule:</p><p className="mt-1 text-xs leading-5 text-muted">Creatine helps when your brain is under metabolic stress — sleep deprivation, menopause, aging, or low dietary intake. If you're young, well-rested, and eat meat regularly, you likely won't notice a cognitive difference. At $0.10/day with decades of safety data, it's a low-risk experiment worth trying.</p></div></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by use case</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Sleep deprivation — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The best-studied cognitive use case. McMorris et al. (2007) found creatine reduced mental fatigue and preserved performance during sleep deprivation [7]. A 2024 study found single-dose creatine (0.2 g/kg) improved cognitive performance and altered brain energy metabolism during sleep loss [2]. A 2026 follow-up confirmed reduced cognitive deterioration with single-dose creatine [2]. The mechanism: sleep deprivation depletes brain phosphocreatine; supplementation restores ATP regeneration capacity. Effect sizes are moderate but clinically meaningful for shift workers, new parents, and anyone facing acute sleep loss.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Menopause brain fog — Emerging evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The 2025 CONCRET-MENOPA trial (Korovljev et al., n=36) found 1,500 mg/day creatine hydrochloride for 8 weeks improved reaction time, reduced mood swing severity, increased frontal brain creatine concentrations, and improved concentration-related symptoms [4]. This is the first creatine RCT specifically in menopausal women. Estrogen supports creatine synthesis in the brain; declining estrogen during menopause may reduce brain creatine stores [3]. Creatine supplementation may partially compensate for this deficit. More research is needed, but the biological rationale is strong and the safety profile is excellent.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Depression augmentation — Emerging</h3><p className="mt-2 text-sm leading-7 text-muted">Lyoo et al. (2012, n=52) found 5 g/day creatine augmented SSRI response in women with major depression — faster improvement in mood scores and higher remission rates vs SSRI alone [6]. A 2024 meta-analysis confirmed creatine improves mood outcomes as an adjunctive therapy. The mechanism: brain energy metabolism dysfunction is implicated in depression; creatine supports mitochondrial ATP production in neurons. Not a standalone treatment; use only under psychiatric guidance.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Who benefits and who doesn&rsquo;t</h2><p className="text-sm leading-7 text-muted">Creatine for brain health is <strong>not</strong> a universal cognitive enhancer. The evidence suggests benefit primarily when the brain is under metabolic stress: sleep-deprived individuals, older adults, women in menopause, vegetarians/vegans (lower baseline stores) [5], and during demanding cognitive tasks. Healthy, well-rested young adults with adequate dietary creatine intake show minimal cognitive improvement. This is different from traditional nootropics (caffeine, modafinil) which produce immediate, noticeable effects. Creatine works slowly and subtly — think &ldquo;brain energy support,&rdquo; not &ldquo;smart drug.&rdquo; Dosing: 3-5 g/day creatine monohydrate. Consistent daily intake — effects accumulate over weeks. No cycling needed. Creatine monohydrate is the preferred form (most studied, best value).</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Creatine for brain health is one of the more promising — and surprisingly underdiscussed — supplement applications. The evidence is strongest for sleep deprivation [1,2,7], emerging for menopause [4] and depression augmentation [6], and weak for healthy young adults. At $0.10-0.20/day with decades of safety data, creatine is a low-risk, evidence-informed cognitive support — particularly for women in perimenopause, older adults, and anyone facing sleep loss. It will not make you smarter. It may help your brain function when the energy demands are high.</p></section>
      <References refs={CREATINE_BRAIN_REFS} />
      <div className="max-w-4xl">
        <RecommendationSection products={getRevenueProductSet('creatine')?.products ?? []} />
      </div>
      <EmailCapture headline="Get evidence reviews like this" description="Creatine, menopause, brain health — we track the evidence." ctaLabel="Get the evidence" location="guide-creatine-brain" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}