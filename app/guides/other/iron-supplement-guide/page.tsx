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
  title: 'Iron Supplements: Types, Dosing & Deficiency Guide (2026)',
  description: 'Iron bisglycinate, sulfate, and heme compared. Evidence-based dosing for deficiency, anemia, and who should not supplement without blood work.',
  path: '/guides/other/iron-supplement-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which form of iron is best?', answer: 'Iron bisglycinate (ferrous bisglycinate) is best-absorbed with the fewest GI side effects. Ferrous sulfate is the most studied and cheapest but causes constipation and nausea in 20-30% of users. Heme iron (from animal sources) has the highest absorption but costs significantly more. For most people: bisglycinate 25-50 mg/day with vitamin C is the best balance of absorption, tolerability, and cost.' },
  { question: 'How do I know if I need iron?', answer: 'Get blood work — do not supplement based on symptoms alone. Ferritin below 30 ng/mL indicates iron deficiency. Hemoglobin below 12 g/dL (women) or 13 g/dL (men) indicates anemia. Symptoms of deficiency — fatigue, pallor, shortness of breath, restless legs — are nonspecific and common to many conditions. Iron overload (hemochromatosis) is dangerous and underdiagnosed. Testing before supplementing is essential.' },
  { question: 'Why does iron cause constipation?', answer: 'Unabsorbed iron is pro-oxidative in the gut, irritating the intestinal lining and slowing motility. Bisglycinate is better tolerated because the glycine chelation improves absorption, leaving less unabsorbed iron in the gut. Taking iron with vitamin C (200 mg) increases absorption. Taking iron every other day (rather than daily) may improve absorption and reduce side effects through the hepcidin mechanism.' },
  { question: 'Can men take iron supplements?', answer: 'Rarely. Men do not menstruate and are at much higher risk of iron overload (hemochromatosis affects 1 in 200 people of Northern European descent). Do not supplement iron without a confirmed deficiency on blood work. Excess iron is pro-oxidative and associated with increased cardiovascular and cancer risk. The exception: male endurance athletes (foot strike hemolysis) and vegetarians may have higher needs.' },
  { question: 'What blocks iron absorption?', answer: 'Calcium (dairy, supplements), tannins (tea, coffee), phytates (whole grains, legumes), and PPIs (reduce stomach acid needed for absorption). Take iron 2 hours apart from these. Conversely, vitamin C (200 mg) and heme iron (meat) enhance absorption. The best time: morning on an empty stomach with vitamin C, but if this causes nausea, take with a small non-dairy meal.' },
]

const IRON_REFS = [
  { n: 1, text: 'Stoffel NU, et al. (2017). Iron bisglycinate vs ferrous sulfate. Lancet Haematol, 4(11): e524-e533.', url: 'https://pubmed.ncbi.nlm.nih.gov/29032957/' },
  { n: 2, text: 'Moretti D, et al. (2015). Iron bioavailability from supplements. Blood, 126(17): 1981-1989.', url: 'https://pubmed.ncbi.nlm.nih.gov/26276669/' },
  { n: 3, text: 'Camaschella C. (2015). Iron-deficiency anemia. N Engl J Med, 372(19): 1832-1843.', url: 'https://pubmed.ncbi.nlm.nih.gov/25946282/' },
]

export default function IronSupplementPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Iron Supplement Guide" description="Types, dosing, and deficiency evidence." url="https://thehippiescientist.net/guides/other/iron-supplement-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Iron Supplements' }]} />
      <FAQSchema pagePath="/guides/other/iron-supplement-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 3 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Iron: The Supplement You Should Not Take Without a Blood Test</h1><p className="text-lg leading-8 text-muted">Iron deficiency is the most common nutritional deficiency worldwide — affecting 25% of the global population. But iron overload is also dangerous, and supplementing without testing can cause harm. Here is how to supplement safely, which form to choose, and when iron is actually necessary.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/iron-supplement-guide.jpg" alt="Iron capsules beside spinach and red meat" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Iron — do not supplement without a blood test.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Test ferritin before supplementing.</strong> If ferritin is below 30 ng/mL: iron bisglycinate 25-50 mg/day + vitamin C 200 mg. Take on an empty stomach if tolerated, every other day to reduce GI effects. Re-test in 3 months. Do not supplement without a confirmed deficiency — iron overload (hemochromatosis) is underdiagnosed and dangerous. Women with heavy periods, vegetarians, and endurance athletes are at highest risk for deficiency [1,3]. Ferrous sulfate is the cheapest but causes constipation in 20-30% — bisglycinate is worth the small premium [2].</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Iron Form Comparison</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Form</th><th className="text-left py-2 pr-4 font-semibold text-ink">Absorption</th><th className="text-left py-2 pr-4 font-semibold text-ink">GI Tolerance</th><th className="text-left py-2 pr-4 font-semibold text-ink">Cost/mo</th><th className="text-left py-2 font-semibold text-ink">Best For</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Iron Bisglycinate</td><td className="py-2 pr-4 text-emerald-700 font-semibold">Excellent</td><td className="py-2 pr-4 text-emerald-700">Good</td><td className="py-2 pr-4">$8-15</td><td className="py-2">Best all-purpose choice</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Ferrous Sulfate</td><td className="py-2 pr-4 text-amber-700 font-semibold">Good</td><td className="py-2 pr-4 text-red-600">Poor (constipation)</td><td className="py-2 pr-4">$3-5</td><td className="py-2">Budget, short-term correction</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Heme Iron</td><td className="py-2 pr-4 text-emerald-700 font-semibold">Best</td><td className="py-2 pr-4 text-emerald-700">Excellent</td><td className="py-2 pr-4">$20-30</td><td className="py-2">Severe deficiency, poor responders</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">Iron is not a general wellness supplement — it is a deficiency correction tool. Test before supplementing. Bisglycinate at 25-50 mg every other day + vitamin C is the best-tolerated, best-absorbed approach for most people [1,2]. Men and postmenopausal women should rarely supplement iron without confirmed deficiency. The risks of iron overload (oxidative damage, organ dysfunction) outweigh the benefits in iron-replete individuals [3].</p></section>
      <References refs={IRON_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Iron, deficiency, forms — evidence over guesswork." ctaLabel="Get the evidence" location="guide-iron" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}