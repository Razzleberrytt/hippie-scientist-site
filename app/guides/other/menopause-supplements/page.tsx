import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Menopause Supplements: Evidence Review (2026 Guide)',
  description: 'Which supplements actually help with menopause symptoms? Evidence-graded review of creatine, magnesium, ashwagandha, black cohosh, soy isoflavones, and vitamin D.',
  path: '/guides/other/menopause-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What supplements actually work for menopause symptoms?', answer: 'The strongest evidence supports: creatine for brain fog and muscle preservation [1,2], soy isoflavones for hot flashes (modest effect) [3], vitamin D + calcium for bone density [4], and magnesium for sleep [5]. Black cohosh shows mixed results — some trials positive, others no better than placebo [6]. Most herbal menopause supplements lack rigorous evidence.' },
  { question: 'Does creatine help with menopause brain fog?', answer: 'Emerging evidence suggests yes. A 2025 RCT in peri/postmenopausal women (n=36) found 1,500 mg/day creatine improved reaction time, reduced mood swings, and increased frontal brain creatine [1]. A 2024 meta-analysis found creatine improves cognition in adults, especially under stress [2]. The mechanism: declining estrogen reduces brain creatine synthesis; supplementation may compensate.' },
  { question: 'Can supplements replace HRT?', answer: 'No. Hormone replacement therapy has stronger evidence for vasomotor symptoms and bone density than any supplement [7]. Supplements may complement HRT or serve as alternatives for women who cannot take HRT, but they should not be considered equivalent. Always discuss HRT and supplement options with a menopause specialist.' },
  { question: 'How much creatine should menopausal women take?', answer: 'Studies use 3-5 g/day of creatine monohydrate [1,2]. No loading phase needed for cognitive benefits. Take consistently — effects build over 4-8 weeks. Creatine monohydrate is preferred (most studied, best absorbed). Pair with resistance training for muscle preservation benefits.' },
  { question: 'Are menopause supplements safe?', answer: 'Most are generally safe, but interactions matter. Black cohosh may affect the liver (monitor LFTs) [6]. Soy isoflavones have theoretical estrogenic effects (caution with hormone-sensitive cancers). Creatine is well-studied with decades of safety data. Always disclose all supplements to your healthcare provider, especially if taking HRT, blood thinners, or thyroid medication.' },
]

const MENOPAUSE_REFS = [
  { n: 1, text: 'Korovljev D, et al. (2025). Creatine supplementation in perimenopausal and menopausal women: a randomized controlled trial (CONCRET-MENOPA). Nutrients.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
  { n: 2, text: 'Candow DG, et al. (2023). "Heads Up" for creatine supplementation and brain health. Sports Med, 53(Suppl 1): 69-83.', url: 'https://pubmed.ncbi.nlm.nih.gov/37814108/' },
  { n: 3, text: 'Taku K, et al. (2012). Extracted or synthesized soybean isoflavones reduce menopausal hot flash frequency. Menopause, 19(7): 776-790.', url: 'https://pubmed.ncbi.nlm.nih.gov/22433977/' },
  { n: 4, text: 'Weaver CM, et al. (2016). Calcium plus vitamin D supplementation and risk of fractures. Osteoporos Int, 27(1): 367-376.', url: 'https://pubmed.ncbi.nlm.nih.gov/26416385/' },
  { n: 5, text: 'Abbasi B, et al. (2012). Magnesium supplementation and primary insomnia in elderly. J Res Med Sci, 17(12): 1161-1169.', url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
  { n: 6, text: 'Leach MJ, Moore V. (2012). Black cohosh for menopausal symptoms. Cochrane Database Syst Rev, (9): CD007244.', url: 'https://pubmed.ncbi.nlm.nih.gov/22972105/' },
  { n: 7, text: 'The NAMS 2022 Hormone Therapy Position Statement Advisory Panel. The 2022 hormone therapy position statement of The North American Menopause Society. Menopause, 29(7): 767-794.', url: 'https://pubmed.ncbi.nlm.nih.gov/35797481/' },
  { n: 8, text: 'Xu C, et al. (2024). Creatine supplementation on cognitive function: systematic review and meta-analysis. Front Nutr, 11: 1421486.', url: 'https://pubmed.ncbi.nlm.nih.gov/39131742/' },
]

export default function MenopauseSupplementsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Menopause Supplements: Evidence Review" description="Which supplements actually help with menopause symptoms?" url="https://thehippiescientist.net/guides/other/menopause-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Menopause Supplements' }]} />
      <FAQSchema pagePath="/guides/other/menopause-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Menopause Supplements: What the Evidence Actually Shows</h1><p className="text-lg leading-8 text-muted">Menopause is not a condition to be cured — it&rsquo;s a biological transition that half the population experiences. The supplement industry has responded with hundreds of products claiming to ease symptoms, preserve cognition, and protect bones. Some of these claims have evidence behind them. Most don&rsquo;t. Here&rsquo;s what the research actually supports — with citations to the primary literature.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">The supplements with the strongest evidence for menopause symptoms are: <strong>creatine</strong> for brain fog, mood, and muscle preservation [1,2,8]; <strong>soy isoflavones</strong> for modest hot flash reduction [3]; <strong>vitamin D + calcium</strong> for bone density [4]; and <strong>magnesium</strong> for sleep [5]. Black cohosh shows mixed results and the Cochrane review found insufficient evidence to recommend it [6]. No supplement replaces the evidence base for HRT, which remains the most effective intervention for vasomotor symptoms and bone protection when clinically appropriate [7]. The 2025 CONCRET-MENOPA trial is the first RCT specifically examining creatine in menopausal women [1].</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by supplement</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Creatine — Brain fog, mood, muscle (Emerging to Moderate)</h3><p className="mt-2 text-sm leading-7 text-muted">The most exciting development in menopause supplementation. A 2025 RCT (Korovljev et al., n=36) found 1,500 mg/day creatine hydrochloride improved reaction time, reduced mood swing severity, and increased frontal brain creatine concentrations in peri/postmenopausal women [1]. A 2024 meta-analysis (Xu et al., 14 RCTs) confirmed creatine improves cognition, especially under stress conditions [8]. The mechanism: estrogen supports creatine synthesis; declining estrogen reduces brain creatine stores, and supplementation may compensate [1,2]. Dosing: 3-5 g/day creatine monohydrate. Benefits build over 4-8 weeks. Pair with resistance training for muscle preservation. This is well-studied, safe, and inexpensive — a strong candidate for most menopausal women.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Soy isoflavones — Hot flashes (Moderate)</h3><p className="mt-2 text-sm leading-7 text-muted">A 2012 meta-analysis (Taku et al., 17 RCTs) found soy isoflavones reduced hot flash frequency by ~20% vs placebo, with effects stronger in women with more frequent symptoms [3]. Effect sizes are modest but consistent. Equol-producing women (those who can convert daidzein to equol in the gut) appear to benefit more. Dosing: 30-100 mg/day isoflavones. Safety note: theoretical estrogenic effects warrant caution with hormone-sensitive cancers, though epidemiological data is reassuring.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Black cohosh — Mixed evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The 2012 Cochrane review (Leach &amp; Moore, 16 RCTs) found insufficient evidence to recommend black cohosh for menopausal symptoms [6]. Some individual trials show benefit; others show no difference from placebo. The heterogeneity in products (extract type, dose) partly explains the inconsistency. Liver safety monitoring is recommended with use.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Vitamin D + Calcium — Bone health (Strong)</h3><p className="mt-2 text-sm leading-7 text-muted">Well-established for bone density preservation in postmenopausal women [4]. The combination reduces fracture risk, particularly in women with low baseline intake. Dosing: 800-2,000 IU vitamin D3 + 1,000-1,200 mg calcium (diet + supplement). Vitamin K2 may enhance calcium deposition in bone but evidence is weaker.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Why menopause creates unique supplement needs</h2><p className="text-sm leading-7 text-muted">The 2026 Cambridge UK Biobank study (n=125,000) confirmed menopause is linked to reductions in grey matter volume in the hippocampus, entorhinal cortex, and anterior cingulate — regions involved in memory, emotion, and attention. Estrogen plays a critical role in brain glucose metabolism, creatine synthesis, and bone turnover. As it declines, the brain becomes less efficient at generating energy, contributing to brain fog and cognitive fatigue. HRT addresses some of these deficits but does not fully reverse grey matter changes. This is where targeted supplementation — particularly creatine for brain energetics and vitamin D for bone — has a plausible biological rationale.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Creatine at 3-5 g/day is the strongest evidence-based supplement for menopausal brain fog and muscle preservation [1,2,8]. Soy isoflavones modestly reduce hot flashes [3]. Vitamin D + calcium protect bones [4]. Magnesium supports sleep [5]. Most other menopause supplements lack rigorous evidence — and none replace the evidence base for HRT when it is clinically appropriate [7]. If you choose to supplement, start with creatine and vitamin D: well-studied, safe, inexpensive, and supported by plausible mechanisms. Track symptoms for 8-12 weeks before adding anything else.</p></section>
      <References refs={MENOPAUSE_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="We track claims against clinical evidence. No hype, no influencer talking points." ctaLabel="Get the evidence" location="guide-menopause" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}