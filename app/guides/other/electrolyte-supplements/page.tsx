import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Electrolyte Supplements: Who Needs Them? (2026 Evidence Review)',
  description: 'LMNT, Liquid IV, DripDrop — electrolyte supplements are everywhere. 8 cited studies on who actually benefits and when water is enough.',
  path: '/guides/other/electrolyte-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do I need electrolyte supplements?', answer: 'Most people do not. The AIS (Australian Institute of Sport) classifies electrolyte supplements as a sports food for specific use cases: prolonged exercise &gt;90 min, extreme heat, or documented high sodium losses [1]. For healthy adults with normal diets and moderate activity, kidneys regulate electrolyte balance effectively [2]. Supplementation is primarily indicated for endurance athletes, outdoor laborers in heat, and during illness with vomiting/diarrhea.' },
  { question: 'Is LMNT worth it?', answer: 'For heavy sweaters and endurance athletes — reasonable. LMNT provides 1,000 mg sodium, 200 mg potassium, and 60 mg magnesium at ~$1.50/serving. The 5:1 sodium-to-potassium ratio reflects sweat composition [3]. For everyone else, salt your food and eat potassium-rich foods (bananas, potatoes, spinach) — same electrolytes at 1% of the cost.' },
  { question: 'Can you consume too many electrolytes?', answer: 'Yes. Excessive sodium increases blood pressure in sodium-sensitive individuals [2]. Hyperkalemia (excess potassium) can cause dangerous cardiac arrhythmias, especially in kidney disease. The Tolerable Upper Intake Level for sodium is 2,300 mg/day [2]. One LMNT packet is 1,000 mg. Don\'t consume multiple packets daily on top of a normal diet.' },
  { question: 'Powders vs sports drinks vs DIY?', answer: 'For exercise &gt;60 min, some carbohydrate (sports drinks) benefits performance [1]. For shorter exercise or everyday use, sugar-free powders are preferable. DIY (1/4 tsp salt + 1/8 tsp potassium chloride in water with lemon) costs ~$0.05/serving — same electrolyte profile as commercial products [4].' },
  { question: 'What ratio is best?', answer: 'Sodium dominates sweat losses. A 3:1 to 5:1 sodium-to-potassium ratio reflects sweat composition [3]. LMNT uses 5:1 (1,000:200 mg). WHO oral rehydration solution: ~2:1. For athletes losing 2+ L sweat/hr, more sodium may be needed. General guidance: 0.5-0.7 g sodium/L fluid during exercise [1].' },
]

type RefProps = { n: number; text: string; url?: string }
function Ref({ n, text, url }: RefProps) { return (<li id={`ref-${n}`} className="text-xs leading-5 text-muted"><span className="font-semibold text-ink">[{n}]</span> {text}{url ? <> <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline hover:text-brand-800">→</a></> : null}</li>) }

export default function ElectrolyteGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Electrolyte Supplements: Who Needs Them?" description="LMNT, Liquid IV — 8 cited studies on who actually benefits." url="https://thehippiescientist.net/guides/other/electrolyte-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Electrolyte Supplements' }]} />
      <FAQSchema pagePath="/guides/other/electrolyte-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Electrolyte Supplements: Who Actually Needs Them?</h1><p className="text-lg leading-8 text-muted">LMNT ($1.50/serving), Liquid IV, DripDrop — the electrolyte category has expanded from sports nutrition into mainstream wellness. But for most people, these products solve a problem they don&rsquo;t have. The AIS classifies electrolytes as a sports food for specific use cases only [1]. Here&rsquo;s the evidence.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">Electrolyte supplements are <strong>medically indicated for a small fraction of the population</strong>: endurance athletes (&gt;90 min exercise), outdoor laborers in heat, those on very low-carb diets (increased natriuresis), and illness with significant fluid loss [1,5]. For everyone else, they are an expensive way to consume salt, potassium, and magnesium — all abundantly available in food [2]. The marketing positions them as daily wellness products, but evidence for everyday use by non-athletes is nonexistent.</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by use case</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Endurance exercise — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">During exercise &gt;90 min, especially in heat, sodium losses reach 1-3 g/hr [3]. A 2020 pragmatic trial in Guatemalan sugarcane workers (n = 50) found electrolyte supplementation reduced muscle injury markers and maintained kidney function vs water alone [5]. The AIS recommends 0.5-0.7 g sodium/L fluid during prolonged exercise [1]. This is the best-supported use case.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Physical labor in heat — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The Guatemalan sugarcane worker trial demonstrated feasibility of maintaining electrolyte levels under extreme conditions (WBGT 34°C) while mitigating muscle injury [5]. Workers consuming higher electrolyte solution (5 L vs 2.5 L) showed better kidney function preservation. Workplace hydration programs for at-risk workers should include electrolyte access.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Low-carb/keto adaptation — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Very low-carb diets reduce insulin, increasing urinary sodium excretion (natriuresis of fasting) [6]. This causes &ldquo;keto flu&rdquo; symptoms — headache, fatigue, cramps — that respond to 2-5 g supplemental sodium/day. Electrolyte supplementation during adaptation is reasonable and widely recommended in clinical keto protocols [7].</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Everyday wellness — No evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The idea that healthy, sedentary adults need daily electrolyte supplementation is a marketing invention. Kidneys regulate electrolyte balance exceptionally well — the RAS (renin-angiotensin-aldosterone system) maintains sodium homeostasis across a wide range of intakes [2]. A 2026 review in Sports Medicine found 58% of athletes consumed &lt;35 mL/kg/day of fluid but noted no evidence that supplementing electrolytes in non-exercising populations provides benefit [8].</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Popular products compared</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Product</th><th className="text-left py-3 pr-4">Na (mg)</th><th className="text-left py-3 pr-4">K (mg)</th><th className="text-left py-3 pr-4">Sugar (g)</th><th className="text-left py-3">$/serving</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">LMNT</td><td className="py-3 pr-4">1,000</td><td className="py-3 pr-4">200</td><td className="py-3 pr-4">0</td><td className="py-3">$1.50</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Liquid IV</td><td className="py-3 pr-4">500</td><td className="py-3 pr-4">380</td><td className="py-3 pr-4">11</td><td className="py-3">$1.50</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">DripDrop (NSF Sport)</td><td className="py-3 pr-4">330</td><td className="py-3 pr-4">185</td><td className="py-3 pr-4">9</td><td className="py-3">$1.25</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">DIY (salt + NoSalt)</td><td className="py-3 pr-4">575</td><td className="py-3 pr-4">350</td><td className="py-3 pr-4">0</td><td className="py-3">$0.05</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">For endurance athletes and outdoor laborers in heat, electrolyte supplements are evidence-based tools — choose LMNT or DripDrop for high sodium, Liquid IV if you want carbohydrates with electrolytes [1,3,5]. For keto adaptation, 2-5 g supplemental sodium/day from salt or electrolyte products is reasonable [6,7]. For everyone else: salt your food, eat fruits and vegetables for potassium, drink to thirst [2,8]. The $40-50/month electrolyte habit is better allocated to food.</p></section>

      <section className="card-premium p-6 space-y-3 max-w-4xl"><h2 className="text-xl font-semibold text-ink">References</h2><ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        <Ref n={1} text="Australian Institute of Sport (AIS). Electrolyte Supplement: Sports Food fact sheet. AIS Supplement Framework, Group A." url="https://www.ausport.gov.au/ais/nutrition/supplements/group_a/sports-foods2/electrolyte-supplement2" />
        <Ref n={2} text="IOM (2005). Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate. National Academies Press." url="https://pubmed.ncbi.nlm.nih.gov/15883093/" />
        <Ref n={3} text="Baker LB. (2017). Sweating rate and sweat sodium concentration in athletes. Sports Med, 47(Suppl 1): 65-77." url="https://pubmed.ncbi.nlm.nih.gov/28332115/" />
        <Ref n={4} text="LMNT. DIY electrolyte drink recipes. science.drinklmnt.com." url="https://science.drinklmnt.com/electrolytes/lmnts-electrolyte-ratios-explained" />
        <Ref n={5} text="Butler-Dawson J, et al. (2020). Electrolyte beverage intake in Guatemalan sugarcane workers in hot conditions. J Occup Environ Med, 62(12): e739-747." url="https://pubmed.ncbi.nlm.nih.gov/33298780/" />
        <Ref n={6} text="Phinney SD, et al. (1983). The human metabolic response to chronic ketosis without caloric restriction. Metabolism, 32(8): 769-776." url="https://pubmed.ncbi.nlm.nih.gov/6865778/" />
        <Ref n={7} text="Volek JS, Phinney SD. (2012). The Art and Science of Low Carbohydrate Performance. Beyond Obesity LLC." />
        <Ref n={8} text="Francisco R, et al. (2026). Athlete hydration: beyond performance toward long-term health. Sports Med, Apr 22." url="https://pubmed.ncbi.nlm.nih.gov/42020895/" />
      </ol></section>
      <EmailCapture headline="Get evidence reviews like this" description="8 cited studies. No influencer hype." ctaLabel="Get the evidence" location="guide-electrolytes" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}