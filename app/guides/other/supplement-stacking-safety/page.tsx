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
  title: 'Supplement Stacking Safety: Interactions & Risks (2026 Guide)',
  description: 'Combining supplements can create unexpected interactions. Evidence-based guide to serotonergic, sedative, stimulant, and metabolic stacking risks.',
  path: '/guides/other/supplement-stacking-safety/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Can I take multiple supplements together?', answer: 'Yes, many supplements can be safely combined. But some combinations create additive or synergistic effects that amplify risks — particularly with sedatives (kava + valerian + alcohol), serotonergic agents (5-HTP + St. John\'s Wort + SSRIs), and stimulants (caffeine + synephrine + yohimbine). Start one supplement at a time, assess for 1-2 weeks, then add the next.' },
  { question: 'What is the most dangerous supplement combination?', answer: 'Serotonergic stacking is the highest-risk: combining multiple serotonin-elevating substances (SSRIs + 5-HTP + St. John\'s Wort + MAOIs) can cause serotonin syndrome — confusion, agitation, hyperthermia, and potentially death. This is a medical emergency. Never combine serotonergic supplements with prescription antidepressants without explicit clinician approval.' },
  { question: 'How do I check if my supplements interact?', answer: 'Check the mechanism of action for each supplement. If two supplements affect the same system (GABA, serotonin, norepinephrine, blood pressure, blood sugar), they may interact additively. Use our safety interaction checker at /safety-checker/. Review medication interactions with your pharmacist. When in doubt, separate new supplements by at least 2 weeks.' },
  { question: 'Are adaptogens safe to stack?', answer: 'Generally yes, but with nuance. Ashwagandha + rhodiola is a common and generally safe combination [1]. However, both can lower blood pressure and affect thyroid function. Ashwagandha can stimulate thyroid hormone production — avoid combining with thyroid medication without monitoring. Start one adaptogen at a time and assess for 2-4 weeks before adding another.' },
  { question: 'Should I take supplements with food?', answer: 'Depends on the supplement. Fat-soluble vitamins (A, D, E, K) need dietary fat for absorption. Magnesium is better absorbed with food. Iron is best absorbed on an empty stomach with vitamin C but causes GI upset in many people. Zinc competes with iron and calcium for absorption — take at different times. Probiotics survive better with food. Creatine absorption is slightly enhanced with carbohydrates.' },
]

const STACKING_SAFETY_REFS = [
  { n: 1, text: 'Panossian A, Wikman G. (2010). Effects of adaptogens on the CNS. Pharmaceuticals, 3(1): 188-224.', url: 'https://pubmed.ncbi.nlm.nih.gov/27713248/' },
  { n: 2, text: 'Boyer EW, Shannon M. (2005). The serotonin syndrome. N Engl J Med, 352(11): 1112-1120.', url: 'https://pubmed.ncbi.nlm.nih.gov/15784664/' },
  { n: 3, text: 'Teschke R, et al. (2011). Kava hepatotoxicity: a six-point plan for new kava standardization. Phytomedicine, 18(2-3): 96-103.', url: 'https://pubmed.ncbi.nlm.nih.gov/21112196/' },
  { n: 4, text: 'Gillman PK. (2010). Triptans, serotonin agonists, and serotonin syndrome. Headache, 50(2): 264-272.', url: 'https://pubmed.ncbi.nlm.nih.gov/19925619/' },
  { n: 5, text: 'Izzo AA, Ernst E. (2009). Interactions between herbal medicines and prescribed drugs. Drugs, 69(13): 1777-1798.', url: 'https://pubmed.ncbi.nlm.nih.gov/19719333/' },
  { n: 6, text: 'Haller CA, Benowitz NL. (2000). Adverse cardiovascular events from ephedra and caffeine. N Engl J Med, 343(25): 1833-1838.', url: 'https://pubmed.ncbi.nlm.nih.gov/11117974/' },
  { n: 7, text: 'Chandrasekhar K, et al. (2012). Ashwagandha safety and efficacy. Indian J Psychol Med, 34(3): 255-262.', url: 'https://pubmed.ncbi.nlm.nih.gov/23439798/' },
]

export default function StackingSafetyPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Supplement Stacking Safety" description="Evidence-based guide to supplement interactions and safe combinations." url="https://thehippiescientist.net/guides/other/supplement-stacking-safety" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Stacking Safety' }]} />
      <FAQSchema pagePath="/guides/other/supplement-stacking-safety/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 7 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Supplement Stacking: The Safety Guide Nobody Reads</h1><p className="text-lg leading-8 text-muted">Most supplement guides tell you what to take. Few tell you what happens when you combine them. Supplements are pharmacologically active — they affect neurotransmitters, liver enzymes, blood pressure, and glucose metabolism. Combining them without understanding their mechanisms can create additive effects, amplify side effects, or produce dangerous interactions. This guide covers the most important stacking risks, organized by biological system.</p>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-red-500 bg-red-50/30"><p className="text-xs font-bold uppercase tracking-wider text-red-700">At a Glance · Stacking Risk Levels</p><p className="text-sm leading-7 text-red-900"><strong>HIGHEST RISK:</strong> Serotonergic stacking (SSRIs + 5-HTP + St. John's Wort → serotonin syndrome). <strong>MODERATE:</strong> Sedative stacking (kava + valerian + alcohol → excessive CNS depression). Stimulant stacking (caffeine + synephrine + yohimbine → cardiovascular strain). <strong>LOW:</strong> Adaptogen stacking (ashwagandha + rhodiola — generally safe with monitoring). <strong>RULE:</strong> One supplement at a time. 1-2 week assessment period. Check mechanisms before combining.</p></section>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/supplement-stacking-safety.jpg" alt="Supplement bottles with caution concept" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Stacking supplements — the safety guide most people skip.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">High-risk combinations by system</h2>

        <div className="p-4 rounded-xl border-2 border-red-400 bg-red-50"><p className="text-sm font-black uppercase tracking-wider text-red-800">Serotonergic stacking — Highest risk</p><div className="mt-3 space-y-2 text-sm leading-7 text-red-900"><p><strong>Why it is dangerous:</strong> Excessive serotonin activity causes serotonin syndrome — a potentially fatal condition with confusion, agitation, hyperthermia, muscle rigidity, and seizures [2].</p><p><strong>Do NOT combine:</strong> SSRIs/SNRIs + 5-HTP + St. John&rsquo;s Wort + MAOIs + MDMA + tramadol. Any two serotonergic agents create additive risk [4].</p><p><strong>If you take an SSRI:</strong> Do not add 5-HTP, St. John&rsquo;s Wort, or SAM-e without explicit prescriber approval. Even &ldquo;natural&rdquo; serotonergic supplements can trigger serotonin syndrome when combined with pharmaceuticals [2,4].</p></div></div>

        <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50"><p className="text-sm font-black uppercase tracking-wider text-amber-800">Sedative stacking — Moderate risk</p><div className="mt-3 space-y-2 text-sm leading-7 text-amber-900"><p><strong>Risk:</strong> Additive CNS depression — excessive sedation, impaired coordination, respiratory depression at extremes.</p><p><strong>Caution with:</strong> Kava + valerian + passionflower + alcohol + benzodiazepines + antihistamines. These all enhance GABA signaling [3,5].</p><p><strong>Kava + alcohol:</strong> Particularly dangerous. Both are hepatically metabolized; combined use amplifies liver stress and sedation [3].</p></div></div>

        <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50"><p className="text-sm font-black uppercase tracking-wider text-amber-800">Stimulant stacking — Moderate risk</p><div className="mt-3 space-y-2 text-sm leading-7 text-amber-900"><p><strong>Risk:</strong> Cardiovascular strain — elevated heart rate, blood pressure, arrhythmia risk [6].</p><p><strong>Caution with:</strong> Caffeine + synephrine + yohimbine + ephedrine + DMAA. Multiple stimulants create additive cardiovascular load [6].</p><p><strong>ADHD medication + stimulants:</strong> Particularly dangerous — amphetamine-based medications plus caffeine or yohimbine amplify cardiac risk.</p></div></div>

        <div className="p-4 rounded-xl bg-brand-50/60"><p className="text-sm font-black uppercase tracking-wider text-ink">Adaptogen stacking — Generally safe with monitoring</p><div className="mt-3 space-y-2 text-sm leading-7 text-muted"><p>Ashwagandha + rhodiola is a common and generally well-tolerated combination [1,7]. However: ashwagandha can stimulate thyroid hormone (caution with hyperthyroidism or thyroid medication) [7]; both can lower blood pressure (monitor if on antihypertensives); ashwagandha may increase testosterone (caution with PCOS or hormone-sensitive conditions).</p></div></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Safe stacking principles</h2>
        <div className="space-y-3 text-sm leading-7 text-muted"><p><strong>1. One at a time.</strong> Introduce one new supplement at a time. Assess for 1-2 weeks before adding another. If you have a reaction, you will know which one caused it.</p><p><strong>2. Check mechanisms.</strong> Before combining, research whether supplements affect the same system. Two &ldquo;natural&rdquo; supplements that both lower blood pressure can cause hypotension together.</p><p><strong>3. Medication interactions first.</strong> Supplements can inhibit or induce liver enzymes (CYP450) that metabolize prescription drugs [5]. St. John&rsquo;s Wort is the most notorious — it renders oral contraceptives, warfarin, and many other drugs less effective by inducing CYP3A4.</p><p><strong>4. Start low, go slow.</strong> Begin with the lowest effective dose. Many supplement side effects are dose-dependent and resolve with dose reduction.</p><p><strong>5. Disclose everything to your doctor.</strong> Most supplement-drug interactions go unreported because patients do not mention supplements to their physicians [5].</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Supplements are pharmacologically active. Combining them without understanding their mechanisms is taking an unregulated polypharmacy approach. The highest-risk combination is serotonergic stacking — never combine SSRIs with 5-HTP, St. John&rsquo;s Wort, or other serotonergic supplements without prescriber approval [2,4]. For most other combinations, the risk is moderate and manageable with the principles above: one at a time, check mechanisms, start low, go slow, and tell your doctor [5].</p></section>
      <References refs={STACKING_SAFETY_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Safety guides, stacking risks, interactions — evidence, not fear." ctaLabel="Get the evidence" location="guide-stacking-safety" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/safety-checker/" className="text-sm font-bold text-brand-800 hover:underline">Safety checker →</Link></div>
    </div>
  )
}