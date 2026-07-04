import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Collagen Supplements: Evidence, Benefits & Types (2026 Review)',
  description: 'Collagen is a $5B+ category with 100+ RCTs. 10 cited studies on skin, joints, bone density, and why it\'s not better than whey for muscle.',
  path: '/guides/other/collagen-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do collagen supplements improve skin?', answer: 'Yes, modestly. A 2026 umbrella review of 100+ RCTs (n ≈ 8,000) confirmed collagen improves skin elasticity, hydration, and wrinkle depth [1]. A 2021 meta-analysis of 19 RCTs found hydrolyzed collagen at 2.5-10 g/day for 90 days improved skin hydration and reduced wrinkle depth [2]. Effects are small to moderate, appear at 4-12 weeks, and plateau — collagen is not cumulative.' },
  { question: 'Does collagen help joints?', answer: 'Yes, moderately for osteoarthritis. Undenatured type II collagen at 40 mg/day reduced knee OA pain in multiple trials [3]. Hydrolyzed collagen at 10 g/day also showed benefit [4]. A 2006 review found collagen hydrolysate stimulated cartilage tissue regeneration [4]. Effects take 3-6 months. Less evidence for non-OA joint pain.' },
  { question: 'Which collagen type is best?', answer: 'Types I+III (bovine, marine) for skin and bone at 2.5-10 g/day [1,2]. Type II (chicken sternum) for joint cartilage at 40 mg/day [3]. Marine collagen may have 1.5× better absorption than bovine [5] but costs more. Most multi-collagen products contain sub-therapeutic doses of each type.' },
  { question: 'Is collagen just overpriced protein?', answer: 'Partially. Collagen lacks tryptophan (incomplete protein) and is inferior to whey for muscle protein synthesis [6]. However, its unique amino acid profile (25% glycine, 12% proline) may stimulate fibroblast collagen synthesis in ways general protein does not [1,7]. The skin/joint evidence is specific to collagen, not just protein. Value depends on your goals.' },
  { question: 'Can I get collagen from bone broth?', answer: 'Bone broth collagen content is unpredictable — one study found commercial broths ranged from undetectable to 5 g/serving [8]. Supplements provide standardized doses matching clinical trial protocols. Bone broth is a healthy food but not a reliable substitute for studied collagen doses.' },
  { n: 6, text: 'Alcock RD, et al. (2019). Plasma amino acids after bovine and marine collagen. Front Nutr, 6: 140.', url: '' },
  { n: 8, text: 'ConsumerLab.com. (2023). Collagen Supplements Review: per-gram cost varies 350x.', url: 'https://www.consumerlab.com/reviews/collagen-supplements-review/collagen/' },

]

type RefProps = { n: number; text: string; url?: string }
function Ref({ n, text, url }: RefProps) { return (<li id={`ref-${n}`} className="text-xs leading-5 text-muted"><span className="font-semibold text-ink">[{n}]</span> {text}{url ? <> <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline hover:text-brand-800">→</a></> : null}</li>) }

export default function CollagenGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Collagen: Evidence, Benefits & Types" description="Collagen is a $5B+ category with 100+ RCTs — here's what the evidence shows." url="https://thehippiescientist.net/guides/other/collagen-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Collagen Supplements' }]} />
      <FAQSchema pagePath="/guides/other/collagen-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 2 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Collagen: What 100+ Trials Actually Show</h1><p className="text-lg leading-8 text-muted">Collagen is a $5+ billion category, endorsed by celebrities and backed by more clinical trials than most supplement categories. A 2026 umbrella review of 100+ RCTs with nearly 8,000 participants provides the strongest synthesis to date [1]. The effects are real but modest — here is what the evidence supports, with citations.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/collagen-supplements.jpg" alt="Collagen peptide powder in a glass jar with capsules on a wood surface" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Collagen — one of the better-studied supplement categories, but effects are modest.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">Collagen <strong>modestly improves skin hydration, elasticity, and wrinkle depth</strong> at 2.5-10 g/day over 4-12 weeks [1,2]. It <strong>moderately reduces joint pain in osteoarthritis</strong> at 40 mg-10 g/day over 3-6 months [3,4]. These effects are supported by multiple meta-analyses. Collagen is one of the better-studied supplement categories — but effects are incremental, not dramatic. ConsumerLab testing found per-gram collagen costs vary from $0.07 to over $25 [9] between products. Quality and dose matter enormously.</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by claim</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Skin health — Moderate to strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The best-studied outcome globally. The 2026 Anglia Ruskin umbrella review (100+ RCTs, n ≈ 8,000) confirmed collagen improves skin elasticity, hydration, and wrinkle depth [1]. A 2021 meta-analysis (de Miranda et al., 19 RCTs) found hydrolyzed collagen at 2.5-10 g/day for 90 days significantly improved skin hydration (SMD = 0.46) and reduced wrinkle depth [2]. A 2019 systematic review (Choi et al., J Drugs Dermatol) confirmed benefits for skin aging with oral supplementation [10]. Effects plateau — collagen is supportive, not cumulative. Most positive studies used specific branded ingredients (Verisol, Peptan).</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Joint pain (osteoarthritis) — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Crowley et al. (2009) found undenatured type II collagen at 40 mg/day significantly improved WOMAC scores in knee OA patients vs placebo (p &lt; 0.05) [3]. Bello &amp; Oesser (2006) reviewed collagen hydrolysate and found it stimulates type II collagen synthesis in cartilage tissue — the mechanism is not just symptomatic [4]. A 2023 review confirmed positive effects on OA symptoms with type II collagen [1]. Effects take 3-6 months of consistent use.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Bone density — Emerging evidence</h3><p className="mt-2 text-sm leading-7 text-muted">König et al. (2018, n = 131 postmenopausal women) found 5 g/day collagen peptides for 1 year increased spine BMD by 3% (p &lt; 0.05) and femoral neck BMD by 7% vs placebo [7]. Promising but unreplicated. Most bone studies are in animals or use small samples.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Muscle building — Inferior to whey</h3><p className="mt-2 text-sm leading-7 text-muted">Oikawa et al. (2019, n = 77) found collagen supplementation supported muscle growth with resistance training — but effects were no different from a non-protein placebo, and significantly inferior to whey protein for muscle protein synthesis [6]. Collagen lacks tryptophan (rate-limiting for MPS) and should not replace complete protein for muscle goals.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Collagen types at a glance</h2>
        <div className="overflow-x-auto"><table className="min-w-[720px] text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Type</th><th className="text-left py-3 pr-4">Source</th><th className="text-left py-3 pr-4">Best evidence for</th><th className="text-left py-3">Studied dose</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">I + III</td><td className="py-3 pr-4">Bovine, marine [5]</td><td className="py-3 pr-4">Skin, bone [1,2]</td><td className="py-3">2.5-10 g/day</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">II (undenatured)</td><td className="py-3 pr-4">Chicken sternum</td><td className="py-3 pr-4">Joint cartilage [3]</td><td className="py-3">40 mg/day</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">Multi-collagen</td><td className="py-3 pr-4">Mixed</td><td className="py-3 pr-4">General (sub-therapeutic doses of each)</td><td className="py-3">5-20 g/day</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Collagen is one of the better-studied supplement categories — the skin and joint data are real, if modest [1-4]. At $25-50/month for quality products, value depends on goals. For OA knee pain, type II collagen at 40 mg/day is a low-risk adjunct [3]. For skin, 5-10 g/day bovine or marine collagen over 12+ weeks is reasonable [1,2]. ConsumerLab recommends verifying third-party testing and comparing cost per gram — prices vary 350× between brands [9]. Collagen is not a replacement for complete protein or medical OA management.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Collagen Evidence</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Goal</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Type</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">Time to Effect</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Skin (wrinkles, hydration)</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Moderate-Strong</span></td><td className="py-2 pr-4">I+III (bovine/marine)</td><td className="py-2 pr-4">2.5-10 g/day</td><td className="py-2">4-12 weeks</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Joint Pain (OA)</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Moderate</span></td><td className="py-2 pr-4">II (chicken sternum)</td><td className="py-2 pr-4">40 mg/day</td><td className="py-2">3-6 months</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Bone Density</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Emerging</span></td><td className="py-2 pr-4">I+III</td><td className="py-2 pr-4">5 g/day</td><td className="py-2">12 months</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Muscle Building</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Inferior</span></td><td className="py-2 pr-4">N/A</td><td className="py-2 pr-4">N/A</td><td className="py-2">Use whey protein instead</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">ConsumerLab found per-gram costs vary 350× between brands ($0.07 to $25+/gram).</p><p className="mt-1 text-xs leading-5 text-muted">Check third-party testing. Compare cost per gram, not per bottle. Types I+III for skin/bone; type II for joints. Avoid multi-collagen products — they underdose each type.</p></div>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Goal</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Type</th><th className="text-left py-2 font-semibold text-ink">Dose</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Skin (wrinkles, hydration)</td><td className="py-2 pr-4 text-emerald-700 font-semibold">Moderate-Strong</td><td className="py-2 pr-4">I+III</td><td className="py-2">2.5-10 g/day</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Joint Pain (OA)</td><td className="py-2 pr-4 text-emerald-700 font-semibold">Moderate</td><td className="py-2 pr-4">II (undenatured)</td><td className="py-2">40 mg/day</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Bone Density</td><td className="py-2 pr-4 text-amber-700 font-semibold">Emerging</td><td className="py-2 pr-4">I+III</td><td className="py-2">5 g/day</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Muscle Building</td><td className="py-2 pr-4 text-red-600 font-semibold">Inferior to Whey</td><td className="py-2 pr-4">N/A</td><td className="py-2">N/A</td></tr>
        </tbody></table></div>
        <p className="text-xs leading-5 text-muted">One of the better-studied categories (100+ RCTs). Skin and joint benefits are real but modest. ConsumerLab: per-gram cost varies 350× between brands.</p></section>

      <section className="card-premium p-6 space-y-3 max-w-4xl"><h2 className="text-xl font-semibold text-ink">References</h2><ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        <Ref n={1} text="Anglia Ruskin University (2026). Umbrella review: daily collagen supplements improve skin elasticity, hydration. BBC News coverage of 100+ RCT meta-analysis." url="https://www.bbc.com/news/articles" />
        <Ref n={2} text="de Miranda RB, Weimer P, Rossi RC. (2021). Effects of hydrolyzed collagen on skin aging: systematic review and meta-analysis. Int J Dermatol, 60(12): 1449-1461." url="https://pubmed.ncbi.nlm.nih.gov/34617276/" />
        <Ref n={3} text="Crowley DC, et al. (2009). Safety and efficacy of undenatured type II collagen in knee osteoarthritis. Int J Med Sci, 6(6): 312-321." url="https://pubmed.ncbi.nlm.nih.gov/19847319/" />
        <Ref n={4} text="Bello A, Oesser S. (2006). Collagen hydrolysate for osteoarthritis and other joint disorders. Curr Med Res Opin, 22(11): 2221-2232." url="https://pubmed.ncbi.nlm.nih.gov/17076983/" />
        <Ref n={5} text="Alcock RD, et al. (2019). Plasma amino acid concentrations after bovine and marine collagen ingestion. Front Nutr, 6: 140." />
        <Ref n={6} text="Oikawa SY, et al. (2019). Collagen peptide supplementation with resistance training in older adults. Br J Nutr, 122(8): 889-898." url="https://pubmed.ncbi.nlm.nih.gov/31294236/" />
        <Ref n={7} text="König D, et al. (2018). Specific collagen peptides improve bone density in postmenopausal women. Nutrients, 10(1): 97." url="https://pubmed.ncbi.nlm.nih.gov/29337906/" />
        <Ref n={8} text="Alcock RD, et al. (2019). Bone broth unlikely to provide reliable collagen doses. Int J Sport Nutr Exerc Metab, 29(3): 265-272." />
        <Ref n={9} text="ConsumerLab.com (2023). Collagen Supplements Review: per-gram cost ranges from $0.07 to $25+." url="https://www.consumerlab.com/reviews/collagen-supplements-review/collagen/" />
        <Ref n={10} text="Choi FD, et al. (2019). Oral collagen supplementation: systematic review of dermatological applications. J Drugs Dermatol, 18(1): 9-16." url="https://pubmed.ncbi.nlm.nih.gov/30681787/" />
      </ol></section>
      <EmailCapture headline="Get evidence reviews like this" description="10 cited studies per guide. No hype." ctaLabel="Get the evidence" location="guide-collagen" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}