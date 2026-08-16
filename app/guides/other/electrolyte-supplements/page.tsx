import type { Metadata } from 'next'
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
  title: 'Electrolyte Supplements: Who Needs Them? (2026 Evidence Review)',
  description: 'Evidence-based guide to electrolyte use for endurance exercise, heat exposure, illness-related dehydration, ketogenic diets, and everyday hydration.',
  path: '/guides/other/electrolyte-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do I need electrolyte supplements?', answer: 'It depends on the situation. During prolonged exercise, especially with high sweat losses, sodium-containing fluids can be useful; the Australian Institute of Sport gives a general starting range of 0.5-0.7 g sodium per litre while emphasizing individual variation [1,3]. Significant vomiting or diarrhea is a different use case: oral rehydration solution combines glucose and electrolytes in a defined formulation to replace gastrointestinal losses [4]. For routine daily hydration in healthy people eating a varied diet, there is no single evidence-based reason to add an electrolyte packet automatically [2,8].' },
  { question: 'How do I choose an electrolyte product?', answer: 'Choose by use case rather than brand. For prolonged exercise, match fluid and sodium intake to duration, heat, sweat rate, and individual sweat sodium losses [1,3]. For diarrhea-related dehydration, use an oral rehydration formulation designed for that purpose rather than assuming a sports drink is equivalent [4]. Exact retail formulas and prices change, so compare the current label with your actual goal instead of relying on a fixed product ranking.' },
];

export default function ElectrolyteGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Electrolyte Supplements: Who Needs Them?" description="Evidence-based electrolyte guidance for exercise, heat, dehydration, and everyday use." url="https://thehippiescientist.net/guides/other/electrolyte-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Electrolyte Supplements' }]} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Electrolyte Supplements: Who Actually Needs Them?</h1><p className="text-lg leading-8 text-muted">Electrolytes are essential physiology, but an electrolyte supplement is useful only when it matches the problem being solved. Prolonged exercise, heavy sweating, heat exposure, and gastrointestinal fluid loss are not interchangeable situations. Here&rsquo;s what the evidence supports — without treating a changing retail product lineup as scientific evidence.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/electrolyte-supplements.jpg" alt="Electrolyte supplement packets and a glass of water on a gym surface" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Electrolyte needs depend on the source and magnitude of fluid and mineral losses.</figcaption></figure></section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>Electrolyte supplementation is most defensible when fluid and mineral losses are meaningfully increased. During prolonged exercise, the AIS gives a general starting point of <strong>0.5-0.7 g sodium per litre of fluid</strong>, while noting that people with large sweat sodium losses may need a more individualized approach [1]. Sweat rate and sweat sodium concentration vary widely between and within athletes [3]. For dehydration from diarrhea, <strong>oral rehydration solution is a distinct glucose-electrolyte therapy</strong>, not simply a sports supplement [4]. Routine use in otherwise healthy people should be driven by context rather than marketing or a universal daily dose [2,8].</p>
      </LegacyGuideQuickAnswer>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by use case</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Prolonged exercise and heavy sweating — Strongest sports use case</h3><p className="mt-2 text-sm leading-7 text-muted">Sweat rate and sweat sodium concentration show substantial intra- and interindividual variability, so there is no universal grams-per-hour sodium-loss value that fits every athlete [3]. The AIS gives a general recommendation of 0.5-0.7 g sodium/L in exercise fluids, with more proactive replacement potentially appropriate when whole-body sodium losses are large; it also notes that the best methods for assessing and planning individualized sodium replacement remain unsettled [1].</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Physical labor in heat — Context-dependent evidence</h3><p className="mt-2 text-sm leading-7 text-muted">A pragmatic three-week trial in 50 Guatemalan sugarcane workers compared water with electrolyte-beverage strategies during hot agricultural work. Electrolyte beverage intake was associated with less muscle-injury signal and maintenance of kidney function, although the higher-fluid condition also produced mild hyponatremia in some workers [5]. The result supports structured workplace hydration, but it does not justify one drink or sodium dose for every hot-work environment.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Vomiting or diarrhea — Use oral rehydration therapy, not a generic sports rule</h3><p className="mt-2 text-sm leading-7 text-muted">Illness-related dehydration is a separate clinical use case. WHO and UNICEF oral rehydration salts combine glucose and electrolytes in a defined reduced-osmolarity formulation because sodium-glucose transport helps replace gastrointestinal water and electrolyte losses [4]. A commercial sports electrolyte mix should not automatically be treated as equivalent to oral rehydration solution.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Ketogenic or very-low-carbohydrate diets — Physiologic rationale, no universal supplement dose</h3><p className="mt-2 text-sm leading-7 text-muted">Insulin changes can influence renal sodium handling, and natriuresis is recognized during starvation/fasting physiology [7]. Classic ketogenic-diet research also documents substantial metabolic adaptation during chronic ketosis [6]. Those observations support paying attention to fluid and electrolyte status during dietary transitions, but they do not establish a universal 2-5 g/day supplemental-sodium prescription for every person following a ketogenic diet.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Everyday wellness — Usually a context question, not a packet requirement</h3><p className="mt-2 text-sm leading-7 text-muted">Healthy people can adapt across a range of water and electrolyte intakes, with needs changing with activity and temperature [2]. A 2026 athlete-hydration review highlights that inadequate habitual fluid intake may matter for long-term health, but also emphasizes that long-term risks and optimal hydration strategies remain incompletely defined [8]. That is different from evidence that every sedentary adult benefits from a daily electrolyte supplement.</p></div>
        </div>
      </section>

      <section id="electrolyte-use-cases" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Electrolyte decisions by scenario</h2>
        <div className="overflow-x-auto"><table className="min-w-[780px] text-sm"><caption className="sr-only">Electrolyte use cases, evidence-supported approach, and main caveat</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4">Scenario</th><th scope="col" className="text-left py-3 pr-4">Evidence-supported approach</th><th scope="col" className="text-left py-3">Main caveat</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Prolonged exercise / high sweat loss</th><td className="py-3 pr-4">Use fluid plus sodium as needed; AIS general starting range 0.5-0.7 g sodium/L [1]</td><td className="py-3">Sweat rate and sodium concentration vary widely [3]</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Hot physical labor</th><td className="py-3 pr-4">Structured hydration with electrolyte access can be reasonable [5]</td><td className="py-3">Fluid volume and sodium concentration must be balanced; overdrinking can also be harmful</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Diarrhea / major GI fluid loss</th><td className="py-3 pr-4">Use purpose-designed oral rehydration solution [4]</td><td className="py-3">Sports drinks and ORS are not interchangeable formulations</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Ketogenic diet transition</th><td className="py-3 pr-4">Monitor hydration/electrolyte status; individualize intake [6,7]</td><td className="py-3">No universal supplemental sodium dose established by these sources</td></tr>
          <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Routine sedentary day</th><td className="py-3 pr-4">Meet water/electrolyte needs through normal diet and fluids unless circumstances change [2]</td><td className="py-3">Medical conditions, medications, heat, illness, and unusually high losses can change needs</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Electrolyte products are tools, not a universal hydration upgrade. Their strongest role is replacing meaningful losses during prolonged exercise or heat exposure [1,3,5]. Gastrointestinal dehydration calls for purpose-designed oral rehydration therapy [4]. Ketogenic diets can alter fluid and sodium physiology, but the evidence cited here does not support a one-size-fits-all supplemental sodium prescription [6,7]. For routine hydration, focus on the actual loss pattern, diet, environment, and medical context rather than brand rankings or fixed packet habits [2,8].</p></section>

      <section id="references" className="card-premium scroll-mt-24 p-6 space-y-3 max-w-4xl"><h2 className="text-xl font-semibold text-ink">References</h2><ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        <Ref n={1} text="Australian Institute of Sport. Electrolyte Supplement: Sports Food fact sheet. AIS Supplement Framework, Group A." url="https://www.ausport.gov.au/ais/nutrition/supplements/group_a/sports-foods2/electrolyte-supplement2" />
        <Ref n={2} text="Institute of Medicine. (2005). Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate. National Academies Press." url="https://doi.org/10.17226/10925" />
        <Ref n={3} text="Baker LB. (2017). Sweating Rate and Sweat Sodium Concentration in Athletes: A Review of Methodology and Intra/Interindividual Variability. Sports Med, 47(Suppl 1): 111-128." url="https://pubmed.ncbi.nlm.nih.gov/28332116/" />
        <Ref n={4} text="World Health Organization, UNICEF. (2006). Oral rehydration salts: production of the new ORS. WHO/FCH/CAH/06.1." url="https://www.who.int/publications/i/item/WHO-FCH-CAH-06.1" />
        <Ref n={5} text="Krisher L, Butler-Dawson J, Yoder H, et al. (2020). Electrolyte Beverage Intake to Promote Hydration and Maintain Kidney Function in Guatemalan Sugarcane Workers Laboring in Hot Conditions. J Occup Environ Med, 62(12): e696-e703." url="https://pubmed.ncbi.nlm.nih.gov/33003044/" />
        <Ref n={6} text="Phinney SD, Bistrian BR, Evans WJ, Gervino E, Blackburn GL. (1983). The human metabolic response to chronic ketosis without caloric restriction: preservation of submaximal exercise capability with reduced carbohydrate oxidation. Metabolism, 32(8): 769-776." url="https://doi.org/10.1016/0026-0495(83)90106-3" />
        <Ref n={7} text="DeFronzo RA. (1981). The effect of insulin on renal sodium metabolism: a review with clinical implications. Diabetologia, 21(3): 165-171." url="https://pubmed.ncbi.nlm.nih.gov/7028550/" />
        <Ref n={8} text="Francisco R, Armstrong LE. (2026). Athlete Hydration: Beyond Performance Toward Long-Term Health. Sports Med." url="https://pubmed.ncbi.nlm.nih.gov/42020895/" />
      </ol></section>
      <LegacyGuideFAQ pagePath="/guides/other/electrolyte-supplements/" questions={FAQS} />
      <EmailCapture headline="Get evidence reviews like this" description="Evidence-first guidance with source links and explicit limitations." ctaLabel="Get the evidence" location="guide-electrolytes" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
