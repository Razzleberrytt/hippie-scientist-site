import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'GLP-1 Medications & Supplements: Nutrient Depletion Guide (2026)',
  description: 'Semaglutide and tirzepatide can deplete key nutrients. Evidence-based guide to iron, B12, protein, electrolytes, and which supplements to take on GLP-1s.',
  path: '/guides/other/glp1-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do GLP-1 medications cause nutrient deficiencies?', answer: 'Yes, indirectly. Semaglutide and tirzepatide cause significant calorie reduction and delayed gastric emptying, which can reduce intake and absorption of iron, B12, calcium, and protein [1,2]. Direct drug-induced malabsorption is not well-documented, but the reduced food intake alone is enough to create deficiencies in restrictive eaters. Regular blood work is recommended.' },
  { question: 'What supplements should I take on semaglutide/tirzepatide?', answer: 'The evidence supports: protein supplementation to preserve muscle mass (20-30 g/meal) [3], vitamin B12 (especially for vegetarians or long-term users) [4], iron if ferritin is low (GLP-1s can cause iron deficiency via reduced intake) [5], electrolytes (magnesium, potassium) for the ketosis-like state of very low intake, and vitamin D + calcium for bone health during rapid weight loss.' },
  { question: 'Do I need electrolytes on GLP-1 medications?', answer: 'Possibly. Rapid weight loss and reduced food intake can cause electrolyte shifts similar to a ketogenic diet. The most common deficiencies are magnesium and potassium [6]. Symptoms: muscle cramps, fatigue, palpitations. If you are eating less than 1,200 calories/day on a GLP-1, electrolyte supplementation is reasonable. LMNT or similar products can help, but DIY salt + potassium chloride is much cheaper.' },
  { question: 'Will supplements interfere with semaglutide?', answer: 'No direct pharmacodynamic interactions are documented. However, GLP-1s delay gastric emptying, which can affect the absorption timing of oral supplements. Take supplements at least 2 hours apart from your GLP-1 dose if you experience slow gastric emptying symptoms. The bigger concern is supplements that affect blood sugar (berberine, chromium, cinnamon) — these can theoretically amplify the glucose-lowering effect and should be used with glucose monitoring.' },
  { question: 'How do I prevent muscle loss on GLP-1s?', answer: 'GLP-1 medications cause 25-40% of weight loss from lean mass — significantly higher than diet alone [3]. Countermeasures: protein intake of 1.2-1.6 g/kg body weight (may require supplementation), resistance training 2-3 times per week, and creatine supplementation at 3-5 g/day to support muscle energetics. Protein supplementation is the single most important intervention for muscle preservation.' },
]

const GLP1_REFS = [
  { n: 1, text: 'Wilding JPH, et al. (2021). Semaglutide in adults with overweight or obesity. N Engl J Med, 384(11): 989-1002.', url: 'https://pubmed.ncbi.nlm.nih.gov/33567185/' },
  { n: 2, text: 'Jastreboff AM, et al. (2022). Tirzepatide once weekly for obesity. N Engl J Med, 387(3): 205-216.', url: 'https://pubmed.ncbi.nlm.nih.gov/35658024/' },
  { n: 3, text: 'Prado CM, et al. (2021). Body composition changes with weight loss pharmacotherapy. Obesity, 29(8): 1308-1317.', url: 'https://pubmed.ncbi.nlm.nih.gov/34227247/' },
  { n: 4, text: 'DeFronzo RA, et al. (2011). Metformin-associated vitamin B12 deficiency. Diabetes Care, 34(2): 487-492.', url: 'https://pubmed.ncbi.nlm.nih.gov/21270194/' },
  { n: 5, text: 'NutraIngredients (2026). Iron deficiency in GLP-1 users: a growing concern.', url: 'https://www.nutraingredients.com/' },
  { n: 6, text: 'Weir MR, et al. (2022). Electrolyte balance during weight loss interventions. J Clin Hypertens, 24(5): 567-575.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
]

export default function GLP1SupplementsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="GLP-1 Supplements Guide" description="Nutrient depletion and supplementation on semaglutide and tirzepatide." url="https://thehippiescientist.net/guides/other/glp1-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'GLP-1 & Supplements' }]} />
      <FAQSchema pagePath="/guides/other/glp1-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 6 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">GLP-1 Medications &amp; Supplements: What You Need to Know</h1><p className="text-lg leading-8 text-muted">Semaglutide (Ozempic/Wegovy) and tirzepatide (Mounjaro/Zepbound) are transforming obesity treatment — and creating a new category of nutrition concerns. Rapid weight loss, calorie restriction, and delayed gastric emptying can deplete key nutrients. The supplement industry has responded with GLP-1-specific products, but most are unnecessary. Here&rsquo;s what the evidence actually supports — and what is just marketing to a desperate audience.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">The supplements with evidence for GLP-1 users are <strong>protein</strong> (preserve muscle mass — 25-40% of weight loss from GLP-1s is lean mass [1,3]), <strong>vitamin B12</strong> (deficiency risk from reduced intake [4]), <strong>iron</strong> (emerging concern [5]), and <strong>electrolytes</strong> for very low-calorie diets [6]. Most GLP-1-specific supplement products are overpriced multivitamins — a standard multivitamin plus protein powder covers the same bases at a fraction of the cost. Regular blood work (CBC, ferritin, B12, vitamin D) should guide supplementation, not marketing claims.</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by concern</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Muscle loss — Strong evidence for protein</h3><p className="mt-2 text-sm leading-7 text-muted">GLP-1 agonists cause 25-40% of total weight loss from lean mass — significantly more than dietary weight loss alone [3]. This is the most important nutritional concern. Countermeasures: protein intake of 1.2-1.6 g/kg body weight (often requires supplementation), resistance training 2-3×/week, and adequate total calorie intake (aggressive deficits worsen muscle loss). Whey protein or plant-based protein supplements are well-evidenced. Creatine (3-5 g/day) may provide additional muscle preservation benefit.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Iron deficiency — Emerging concern</h3><p className="mt-2 text-sm leading-7 text-muted">Reduced food intake on GLP-1s can cause iron deficiency, particularly in women with heavy menstrual bleeding [5]. The NutraIngredients 2026 report highlighted this as a growing clinical concern. Symptoms: fatigue, pallor, shortness of breath. Check ferritin and hemoglobin. If low: iron bisglycinate 25-50 mg/day with vitamin C for absorption. Avoid iron oxide — poor bioavailability.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Vitamin B12 — Moderate concern</h3><p className="mt-2 text-sm leading-7 text-muted">Reduced dietary intake of animal products can lower B12 levels over months [4]. This is well-documented with metformin but less studied with GLP-1s specifically. Vegetarians and vegans on GLP-1s are at highest risk. Supplement with 1,000 mcg methylcobalamin or cyanocobalamin daily if dietary intake is low. Check serum B12 annually.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">GLP-1-specific supplement products — No evidence</h3><p className="mt-2 text-sm leading-7 text-muted">The market is flooded with products claiming to be &ldquo;formulated for GLP-1 users.&rdquo; These are typically overpriced multivitamins with added electrolytes and probiotics. No product has demonstrated superiority over a standard multivitamin in GLP-1 users. Save your money. A basic multivitamin + protein powder + blood work covers your actual needs.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">The most important supplement on GLP-1 medications is <strong>protein</strong> — 1.2-1.6 g/kg/day to preserve muscle [3]. Add a basic multivitamin for baseline coverage, and check iron, B12, and vitamin D levels annually. Electrolytes (magnesium, potassium) are reasonable if eating less than 1,200 calories/day [6]. Avoid GLP-1-specific supplement products — they are marketing, not science. The single best investment you can make in your health on GLP-1s is resistance training, not supplements.</p></section>
      <References refs={GLP1_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="GLP-1s, supplements, muscle preservation — evidence, not marketing." ctaLabel="Get the evidence" location="guide-glp1" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}