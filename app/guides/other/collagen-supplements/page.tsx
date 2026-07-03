import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Collagen Supplements: Do They Work? Evidence Review (2026)',
  description: 'Collagen supplements promise better skin, stronger joints, and healthier hair. Here\'s what 100+ randomized trials actually show — and what\'s still just marketing.',
  path: '/guides/other/collagen-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do collagen supplements actually improve skin?', answer: 'Yes, modestly. A 2026 umbrella review of 100+ RCTs with nearly 8,000 participants found collagen supplementation improves skin elasticity, hydration, and wrinkle depth. Effect sizes are small to moderate — not dramatic transformations. Benefits typically appear at 4-12 weeks of daily use at 2.5-10 g/day. The improvements are real but should be understood as supportive, not transformative.' },
  { question: 'Does collagen help joint pain?', answer: 'Moderate evidence for osteoarthritis. Multiple trials show hydrolyzed collagen (type II) at 40 mg/day or 10 g/day reduces joint pain and improves function in people with knee OA. Effects take 3-6 months. Evidence for tendon health and sports-related joint stress is weaker. Collagen is not a replacement for medical OA management.' },
  { question: 'Which type of collagen is best?', answer: 'Types I and III (bovine, marine) are for skin, bone, and general connective tissue. Type II (chicken sternum) is for joint cartilage. Most "multi-collagen" products contain types I, II, and III. Marine collagen may have slightly better absorption but costs more. For skin, bovine types I+III at 2.5-10 g/day is best-supported. For joints, undenatured type II at 40 mg/day has the most specific evidence.' },
  { question: 'Is collagen just overpriced protein?', answer: 'Partially. Collagen is an incomplete protein (lacking tryptophan) and won\'t replace whey or food protein for muscle building. However, its unique amino acid profile (high glycine, proline, hydroxyproline) may stimulate collagen synthesis in ways other proteins don\'t. The evidence for skin and joint benefits — while modest — is more specific than what you\'d get from general protein. Whether that justifies $30-50/month is a personal value judgment.' },
  { question: 'Can I get the same benefits from bone broth?', answer: 'Bone broth contains collagen but in unpredictable amounts — one study found commercial bone broths ranged from undetectable to 5 g of collagen per serving. Supplements provide standardized doses (2.5-20 g) that match clinical trial protocols. Bone broth is a healthy food; it is not a reliable substitute for collagen supplementation if you are targeting specific studied outcomes.' },
]

export default function CollagenGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Collagen Supplements: Do They Work?" description="Collagen supplements promise better skin and joints. Here's what 100+ trials show." url="https://thehippiescientist.net/guides/other/collagen-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Collagen Supplements' }]} />
      <FAQSchema pagePath="/guides/other/collagen-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review</p><h1 className="text-5xl font-bold tracking-tight text-ink">Collagen Supplements: What 100+ Trials Actually Show</h1><p className="text-lg leading-8 text-muted">Collagen is a $5+ billion market, endorsed by celebrities and backed by a growing body of research. Unlike many supplement categories, collagen has substantial clinical trial data — but the effects are modest, the products vary dramatically, and the marketing consistently overstates what the evidence supports.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">Collagen supplements <strong>modestly improve skin hydration, elasticity, and wrinkle depth</strong> at 2.5-10 g/day over 4-12 weeks. They <strong>moderately reduce joint pain</strong> in osteoarthritis at 40 mg-10 g/day over 3-6 months. These effects are supported by multiple meta-analyses and the largest umbrella review to date (100+ RCTs, 8,000 participants). Collagen is one of the better-studied supplement categories — but effects are incremental, not dramatic, and most products are overpriced relative to the benefit they provide.</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">The evidence by claim</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Skin health — Moderate to strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The best-studied outcome. A 2021 meta-analysis of 19 RCTs found hydrolyzed collagen improved skin hydration, elasticity, and wrinkle depth. A 2026 umbrella review confirmed these findings across 100+ trials. Effects are visible at 4-12 weeks but plateau — collagen is not a cumulative anti-aging therapy. Typical effective dose: 2.5-10 g/day. Marine and bovine sources both show benefit.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Joint pain (osteoarthritis) — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Multiple trials show reduced pain and improved function in knee OA. Undenatured type II collagen at 40 mg/day has specific evidence. Hydrolyzed collagen at 10 g/day also shows benefit. Effects take 3-6 months. Less evidence for non-OA joint pain or sports-related joint stress.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Bone density — Emerging evidence</h3><p className="mt-2 text-sm leading-7 text-muted">One trial in 131 postmenopausal women found 5 g/day for 1 year increased spine BMD by 3% and femoral BMD by 7%. Promising but needs replication. Most bone studies are in animals.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Muscle building — Not better than other protein</h3><p className="mt-2 text-sm leading-7 text-muted">Collagen is an incomplete protein lacking tryptophan. Studies show it supports muscle growth when combined with resistance training, but whey protein is superior for muscle protein synthesis. Collagen should not replace a complete protein source for muscle-building goals.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Collagen types at a glance</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Type</th><th className="text-left py-3 pr-4">Source</th><th className="text-left py-3 pr-4">Primary use</th><th className="text-left py-3">Dose</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">I + III</td><td className="py-3 pr-4">Bovine, marine</td><td className="py-3 pr-4">Skin, bone, general</td><td className="py-3">2.5-10 g/day</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">II (undenatured)</td><td className="py-3 pr-4">Chicken sternum</td><td className="py-3 pr-4">Joint cartilage</td><td className="py-3">40 mg/day</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">Multi-collagen</td><td className="py-3 pr-4">Mixed</td><td className="py-3 pr-4">General wellness</td><td className="py-3">5-20 g/day</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Collagen is one of the better-evidenced supplement categories — the skin and joint data are real, if modest. At $25-50/month for quality products, the value proposition depends on your goals. If you have osteoarthritis knee pain and want a low-risk adjunct, type II collagen at 40 mg/day is worth trying. If you want modest skin improvements and are already spending on skincare, 5-10 g/day of hydrolyzed bovine collagen is reasonable. If you're expecting dramatic transformations or muscle growth, collagen is not the right tool.</p></section>
      <EmailCapture headline="Get evidence reviews like this" description="Collagen, NMN, greens powders — we track what the evidence actually says." ctaLabel="Get the evidence" location="guide-collagen" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}