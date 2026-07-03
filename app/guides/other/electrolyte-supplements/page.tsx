import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Electrolyte Supplements: Do You Need Them? (2026 Guide)',
  description: 'LMNT, Liquid IV, DripDrop — electrolyte supplements are everywhere. Here\'s who actually needs them, what the evidence says, and when plain water is enough.',
  path: '/guides/other/electrolyte-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do I need electrolyte supplements?', answer: 'Most people do not. If you eat a balanced diet with adequate sodium, potassium, and magnesium, and you\'re not losing large amounts of fluid through sweat (intense exercise, hot climate, physical labor), plain water is sufficient. Electrolyte supplements are primarily useful for: endurance athletes, people working in extreme heat, those on low-carb/keto diets (which increase sodium loss), and during illness with vomiting or diarrhea.' },
  { question: 'Is LMNT worth the cost?', answer: 'LMNT provides 1,000 mg sodium, 200 mg potassium, and 60 mg magnesium per serving at roughly $1.50/serving. For endurance athletes and heavy sweaters who need precise sodium replacement, this is a reasonable value. For everyone else, you can achieve similar electrolyte intake through diet (salt your food, eat potassium-rich foods, take a basic magnesium supplement) at a fraction of the cost.' },
  { question: 'Can you drink too many electrolytes?', answer: 'Yes. Excessive sodium increases blood pressure in sodium-sensitive individuals. Too much potassium can cause dangerous cardiac arrhythmias, especially in people with kidney disease. Most electrolyte products contain far less potassium than would cause acute harm, but chronic overconsumption combined with a high-sodium diet can contribute to hypertension. Follow serving recommendations and don\'t treat electrolyte drinks like water.' },
  { question: 'Are electrolyte powders better than sports drinks?', answer: 'Electrolyte powders typically have less sugar than traditional sports drinks (Gatorade, Powerade) and allow you to control concentration. For endurance exercise over 60 minutes, some carbohydrate is beneficial for performance. For shorter exercise or everyday hydration, sugar-free electrolyte powders are preferable. The best choice depends on your activity duration and intensity.' },
  { question: 'What electrolyte ratio is best?', answer: 'Sodium is the primary electrolyte lost in sweat, so it should dominate any formula. A 3:1 to 5:1 sodium-to-potassium ratio reflects sweat composition. LMNT uses 5:1 (1000:200 mg). WHO oral rehydration solution uses roughly 2:1. There is no universally optimal ratio — it depends on your sweat rate, diet, and activity. Athletes losing 2+ liters of sweat per hour may need more sodium than standard products provide.' },
]

export default function ElectrolyteGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Electrolyte Supplements: Do You Need Them?" description="LMNT, Liquid IV — electrolyte supplements are everywhere. Here's who actually needs them." url="https://thehippiescientist.net/guides/other/electrolyte-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Electrolyte Supplements' }]} />
      <FAQSchema pagePath="/guides/other/electrolyte-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Electrolyte Supplements: Who Actually Needs Them?</h1>
        <p className="text-lg leading-8 text-muted">LMNT, Liquid IV, DripDrop, Hydrant — the electrolyte category has exploded from sports nutrition into mainstream wellness. But for most people, these products solve a problem they don't have. Here's what the evidence says about who benefits, who doesn't, and what to look for if you do need one.</p>
      </section>

      <section className="card-premium p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Quick answer</h2>
        <p className="text-sm leading-7 text-muted">Electrolyte supplements are <strong>medically necessary for a small fraction of the population</strong>: endurance athletes, outdoor laborers in hot climates, people with certain medical conditions, and those recovering from vomiting or diarrhea. For everyone else, they are an expensive way to consume salt, potassium, and magnesium — all of which are abundantly available in food. The marketing positions them as daily wellness products, but the evidence for everyday use by non-athletes is essentially nonexistent.</p>
      </section>

      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">When electrolytes matter</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Endurance exercise — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">During prolonged exercise (90+ minutes), especially in heat, sodium losses through sweat can reach 1-3 grams per hour. Replacing sodium during exercise maintains plasma volume, reduces cardiovascular strain, and may prevent hyponatremia in ultra-endurance events. This is the best-supported use case for electrolyte supplementation.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Physical labor in heat — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Agricultural and construction workers in hot climates lose substantial sodium and fluid. Studies show electrolyte supplementation reduces muscle damage markers and maintains kidney function compared to plain water alone. Workplace hydration programs should include electrolyte access for at-risk workers.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Low-carb and ketogenic diets — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Very low-carb diets increase urinary sodium excretion due to reduced insulin levels. This can cause "keto flu" symptoms — headache, fatigue, muscle cramps — that respond to increased sodium intake. Electrolyte supplementation during the adaptation phase is reasonable and commonly recommended.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Everyday wellness — No evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The idea that healthy, sedentary adults need daily electrolyte supplementation is a marketing invention. Your kidneys are exceptionally good at regulating electrolyte balance. If you eat food and drink to thirst, you are almost certainly maintaining normal electrolyte levels without supplementation.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Comparing popular products</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Product</th><th className="text-left py-3 pr-4">Sodium</th><th className="text-left py-3 pr-4">Potassium</th><th className="text-left py-3 pr-4">Sugar</th><th className="text-left py-3">$/Serving</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">LMNT</td><td className="py-3 pr-4">1,000 mg</td><td className="py-3 pr-4">200 mg</td><td className="py-3 pr-4">0 g</td><td className="py-3">$1.50</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Liquid IV</td><td className="py-3 pr-4">500 mg</td><td className="py-3 pr-4">380 mg</td><td className="py-3 pr-4">11 g</td><td className="py-3">$1.50</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">DripDrop</td><td className="py-3 pr-4">330 mg</td><td className="py-3 pr-4">185 mg</td><td className="py-3 pr-4">9 g</td><td className="py-3">$1.25</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">DIY (salt + salt substitute)</td><td className="py-3 pr-4">Variable</td><td className="py-3 pr-4">Variable</td><td className="py-3 pr-4">0 g</td><td className="py-3">$0.05</td></tr>
        </tbody></table></div>
        <p className="text-sm leading-7 text-muted">A homemade alternative — mix 1/4 tsp salt (575 mg sodium) with 1/8 tsp salt substitute/potassium chloride (350 mg potassium) in water with lemon juice for flavor — costs pennies per serving and achieves similar electrolyte replacement to commercial products. Add a magnesium supplement separately if needed.</p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">If you exercise intensely for 90+ minutes, work outdoors in heat, or eat very low-carb, an electrolyte supplement is a reasonable tool. Choose one with adequate sodium (500+ mg), minimal sugar unless you need the carbs for performance, and transparent labeling. LMNT and DripDrop are well-formulated options.</p>
        <p className="text-sm leading-7 text-muted">If you're a healthy adult with a normal diet and moderate activity, you do not need electrolyte supplements. Salt your food to taste, eat fruits and vegetables for potassium, and drink water when thirsty. The $40-50/month you'd spend on electrolyte packets is better allocated to actual food.</p>
      </section>

      <EmailCapture headline="Get evidence reviews like this" description="No hype, no affiliate bias, no influencer talking points. Just evidence." ctaLabel="Get the evidence" location="guide-electrolytes" />

      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link>
      </div>
    </div>
  )
}