import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Nootropic Stacking Guide: Safe & Effective Combinations (2026)',
  description: 'Caffeine + L-theanine, creatine + bacopa, lion\'s mane + rhodiola — evidence-based nootropic stacks with mechanisms, dosing, and safety notes.',
  path: '/guides/other/nootropic-stacking-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What is the best nootropic stack for beginners?', answer: 'Caffeine (100 mg) + L-theanine (200 mg) — the most studied, safest, and most effective starting stack. Caffeine provides alertness; L-theanine smooths the jitters and improves focus. This combination has multiple RCTs showing improved cognitive performance [1]. It is also the cheapest and most accessible — coffee and L-theanine capsules cost under $15/month combined.' },
  { question: 'Can I combine multiple nootropics safely?', answer: 'Yes, if they work through different mechanisms. Safe combinations: caffeine + L-theanine (stimulant + calming amino acid), creatine + bacopa (energy + memory), lion\'s mane + rhodiola (NGF + adaptogen). Avoid combining multiple stimulants (caffeine + synephrine + yohimbine). Avoid cholinergic stacking (alpha-GPC + huperzine A + racetams — can cause choline depression). The rule: one cholinergic, one stimulant, one adaptogen/neurotrophic.' },
  { question: 'When should I take each nootropic?', answer: 'Stimulants (caffeine, rhodiola): morning only. Adaptogens (ashwagandha): evening. Creatine: anytime, consistently. Bacopa: with a fat-containing meal (fat-soluble). Lion\'s mane: morning preferred, empty stomach. L-theanine: as needed for focus or before bed. The key: stimulants and activating nootropics in the AM; calming/sleep-supporting ones in the PM.' },
  { question: 'Do I need to cycle nootropics?', answer: 'Some need cycling, others do not. Caffeine: cycle to prevent tolerance (take weekends off). Rhodiola: does not need cycling. Bacopa: slow build, no cycling needed. Lion\'s mane: no cycling needed. Ashwagandha: some practitioners recommend cycling (8 weeks on, 2 weeks off) to prevent anhedonia. Racetams and stronger nootropics: need cycling. Most beginner stacks do not need cycling.' },
  { question: 'What nootropics should I not combine?', answer: 'Multiple stimulants (cardiovascular risk), multiple cholinergics (choline depression — headache, fatigue, brain fog), MAOIs + any serotonergic nootropic (serotonin syndrome risk), St. John\'s Wort + SSRIs (same). The most common mistake: stacking too many nootropics at once without assessing individual response. Start one, assess 1-2 weeks, then add the next.' },
]

const NOOTROPIC_REFS = [
  { n: 1, text: 'Haskell CF, et al. (2008). L-theanine, caffeine and cognition. Biol Psychol, 77(2): 113-122.', url: 'https://pubmed.ncbi.nlm.nih.gov/18006208/' },
  { n: 2, text: 'Giesbrecht T, et al. (2010). L-theanine and caffeine on cognitive performance. Nutr Neurosci, 13(6): 283-290.', url: 'https://pubmed.ncbi.nlm.nih.gov/21040626/' },
  { n: 3, text: 'Mori K, et al. (2009). Lion\'s mane and mild cognitive impairment. Phytother Res, 23(3): 367-372.', url: 'https://pubmed.ncbi.nlm.nih.gov/18844328/' },
  { n: 4, text: 'Pase MP, et al. (2012). Bacopa monnieri cognitive effects: systematic review. J Altern Complement Med, 18(7): 647-652.', url: 'https://pubmed.ncbi.nlm.nih.gov/22747190/' },
]

export default function NootropicStackingPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Nootropic Stacking Guide" description="Safe and effective nootropic combinations." url="https://thehippiescientist.net/guides/other/nootropic-stacking-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Nootropic Stacking' }]} />
      <FAQSchema pagePath="/guides/other/nootropic-stacking-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 4 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Nootropic Stacking: Safe Combinations That Work</h1><p className="text-lg leading-8 text-muted">Nootropic stacking is the art of combining cognitive enhancers for synergistic effect. Done right, it produces results greater than the sum of the parts. Done wrong, it wastes money or creates dangerous interactions. Here is how to build an evidence-based stack, starting with the simplest, most studied combination in the field.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>The best beginner stack: caffeine (100 mg) + L-theanine (200 mg)</strong> — the most studied nootropic combination with multiple RCTs [1,2]. <strong>The best memory stack: creatine (3-5 g/day) + bacopa (300 mg)</strong> — energy + memory consolidation [4]. <strong>The best brain longevity stack: lion&apos;s mane (1 g) + rhodiola (200 mg)</strong> — NGF stimulation + adaptogenic energy [3]. <strong>Rule: one cholinergic, one stimulant/energetic, one adaptogen/neurotrophic.</strong> Start one at a time for 1-2 weeks before adding the next. Cost: $20-40/month for a quality 2-3 compound stack.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Nootropic Stack Builder</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Stack Name</th><th className="text-left py-2 pr-4 font-semibold text-ink">Compounds</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best For</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 font-semibold text-ink">Cost/mo</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Beginner Focus</td><td className="py-2 pr-4">Caffeine + L-Theanine</td><td className="py-2 pr-4">Daily focus, work, studying</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2">$10-15</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Memory Stack</td><td className="py-2 pr-4">Creatine + Bacopa</td><td className="py-2 pr-4">Long-term memory, study</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2">$15-25</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Brain Longevity</td><td className="py-2 pr-4">Lion&apos;s Mane + Rhodiola</td><td className="py-2 pr-4">Cognition, brain aging</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Preliminary</span></td><td className="py-2">$25-40</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Calm Focus</td><td className="py-2 pr-4">L-Theanine + Ashwagandha</td><td className="py-2 pr-4">Anxious focus, stress</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2">$20-30</td></tr>
        </tbody></table></div><div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The golden rule of stacking:</p><p className="mt-1 text-xs leading-5 text-muted">One new compound at a time. Assess for 1-2 weeks. If good, add the next. If you have a negative reaction, you know which compound caused it. Never start a multi-compound stack all at once — you will never know what is working and what is causing side effects.</p></div></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">The best nootropic stack is the simplest one that works for you. Caffeine + L-theanine is the most studied, safest, and most effective starting point for focus [1,2]. Add creatine for energy, bacopa for memory, lion&apos;s mane for brain longevity [3,4]. Avoid stimulant stacking and cholinergic stacking. One compound at a time. The nootropic space is filled with overhyped, understudied compounds — stick to the ones with human RCTs. The best cognitive enhancer remains sleep, exercise, and consistent mental challenge.</p></section>
      <References refs={NOOTROPIC_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Nootropics, stacking, focus — evidence over hype." ctaLabel="Get the evidence" location="guide-nootropic-stacking" />
      <div className="pt-4 border-t flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border px-4 py-2 text-sm font-bold transition">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold hover:underline">Herb library →</Link></div>
    </div>
  )
}