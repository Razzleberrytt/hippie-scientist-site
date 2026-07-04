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
  title: 'Vitamin D + K2: Why They Work Better Together (2026 Guide)',
  description: 'Vitamin D and K2 are the most important vitamin pairing most people get wrong. Evidence-based dosing, deficiency rates, and why D without K2 is incomplete.',
  path: '/guides/other/vitamin-d-k2-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Why take vitamin D and K2 together?', answer: 'Vitamin D increases calcium absorption from the gut. Vitamin K2 directs that calcium into bones and teeth rather than soft tissues (arteries, kidneys). Taking D without K2 can theoretically increase arterial calcification risk, though the clinical significance in healthy adults is debated. The pairing is biologically rational and recommended by most functional medicine practitioners.' },
  { question: 'How much vitamin D should I take?', answer: 'The RDA is 600-800 IU, but this is widely considered inadequate. Most functional medicine guidelines recommend 2,000-5,000 IU/day for maintenance, with higher doses (5,000-10,000 IU) for deficiency correction under medical supervision. The only way to know your dose is to test: optimal 25(OH)D levels are 40-60 ng/mL. Take with a fat-containing meal for absorption.' },
  { question: 'Which form of vitamin K2 is best?', answer: 'MK-7 (menaquinone-7) is preferred over MK-4. MK-7 has a much longer half-life (3 days vs 1-2 hours for MK-4), allowing once-daily dosing. It\'s derived from natto (fermented soy) and supported by more clinical trials. Dose: 90-200 mcg/day. MK-4 at 45 mg/day is used in Japanese osteoporosis protocols but requires multiple daily doses.' },
  { question: 'Can I get enough vitamin D from the sun?', answer: 'For most people in northern latitudes, no — especially in winter. Sun exposure produces vitamin D only when UVB rays reach the skin at the right angle. Above 37° latitude, this doesn\'t happen from November to March. Darker skin tones need 3-5× more sun exposure. Glass blocks UVB. Sunscreen blocks UVB. Most people need supplementation.' },
  { question: 'Is vitamin D toxicity a real concern?', answer: 'Yes, but rare at normal supplemental doses. Toxicity requires sustained intake above 10,000-20,000 IU/day for months. Symptoms: hypercalcemia, kidney stones, nausea. The tolerable upper intake is 4,000 IU/day though many experts consider this conservative. Testing 25(OH)D levels annually prevents both deficiency and toxicity.' },
]

const VITD_REFS = [
  { n: 1, text: 'Holick MF. (2017). The vitamin D deficiency pandemic. Rev Endocr Metab Disord, 18(2): 161-173.', url: 'https://pubmed.ncbi.nlm.nih.gov/27848107/' },
  { n: 2, text: 'Bischoff-Ferrari HA, et al. (2020). Vitamin D supplementation and musculoskeletal health. JAMA, 324(18): 1855-1868.', url: 'https://pubmed.ncbi.nlm.nih.gov/33170239/' },
  { n: 3, text: 'Schwalfenberg GK. (2017). Vitamins K1 and K2: the emerging roles. J Nutr Metab, 2017: 6254836.', url: 'https://pubmed.ncbi.nlm.nih.gov/28698822/' },
  { n: 4, text: 'Martineau AR, et al. (2017). Vitamin D supplementation to prevent acute respiratory infections. BMJ, 356: i6583.', url: 'https://pubmed.ncbi.nlm.nih.gov/28202713/' },
  { n: 5, text: 'Knapen MH, et al. (2013). Menaquinone-7 supplementation improves arterial stiffness in postmenopausal women. Thromb Haemost, 113(5): 1135-1144.', url: 'https://pubmed.ncbi.nlm.nih.gov/25608625/' },
  { n: 6, text: 'Martineau AR, et al. (2017). Vitamin D for respiratory infections. BMJ, 356: i6583.', url: 'https://pubmed.ncbi.nlm.nih.gov/28202713/' },
  { n: 7, text: 'Knapen MH, et al. (2013). MK-7 improves arterial stiffness. Thromb Haemost, 113(5): 1135-1144.', url: 'https://pubmed.ncbi.nlm.nih.gov/25608625/' },

]

export default function VitaminDK2Page() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Vitamin D + K2 Guide" description="Why D and K2 work better together." url="https://thehippiescientist.net/guides/other/vitamin-d-k2-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Vitamin D + K2' }]} />
      <FAQSchema pagePath="/guides/other/vitamin-d-k2-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 7 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Vitamin D + K2: The Most Important Vitamin Pairing</h1><p className="text-lg leading-8 text-muted">Vitamin D deficiency affects over 40% of the US population [1]. Vitamin K2 deficiency is harder to measure but likely equally widespread. Together, they regulate calcium metabolism — D pulls calcium in, K2 directs where it goes. Most people taking vitamin D are missing the K2 piece. Here&rsquo;s why it matters.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/vitamin-d-k2-guide.jpg" alt="Vitamin D3 softgels and K2 capsules with sunlight" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Vitamin D + K2 — the most important vitamin pairing.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Take 2,000-5,000 IU vitamin D3 + 90-200 mcg vitamin K2 (MK-7) daily with a fat-containing meal.</strong> This is the most evidence-based general recommendation. Test 25(OH)D levels annually — target 40-60 ng/mL. Vitamin D is well-studied for bone health, immune function, and respiratory infection prevention [2,4]. K2 is less studied but has strong mechanistic rationale and emerging evidence for cardiovascular and bone health [3,5]. The combination costs $5-15/month and addresses two of the most common nutritional deficiencies.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Vitamin D + K2</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Nutrient</th><th className="text-left py-2 pr-4 font-semibold text-ink">Role</th><th className="text-left py-2 pr-4 font-semibold text-ink">Deficiency Rate</th><th className="text-left py-2 pr-4 font-semibold text-ink">Optimal Dose</th><th className="text-left py-2 font-semibold text-ink">Cost/mo</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Vitamin D3</td><td className="py-2 pr-4">Calcium absorption, immune, bone</td><td className="py-2 pr-4">~40% of US adults [1]</td><td className="py-2 pr-4">2,000-5,000 IU/day</td><td className="py-2">$3-8</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Vitamin K2 (MK-7)</td><td className="py-2 pr-4">Calcium direction (bones, not arteries)</td><td className="py-2 pr-4">Unknown (not routinely tested)</td><td className="py-2 pr-4">90-200 mcg/day</td><td className="py-2">$5-10</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The calcium story:</p><p className="mt-1 text-xs leading-5 text-muted">Vitamin D increases calcium absorption by 30-40%. Without K2, that calcium deposits in soft tissues (arteries, kidneys) rather than bones. K2 activates osteocalcin (binds calcium to bone) and matrix Gla-protein (prevents arterial calcification). This is why D + K2 are sold together — the pairing is biologically coherent even if large outcome trials are still pending [5].</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Vitamin D3 (2,000-5,000 IU) + K2 MK-7 (90-200 mcg) is the most logical daily supplement pairing after a multivitamin. The deficiency rates are high, the safety margins are wide, the cost is low ($10-18/month for both), and the mechanistic rationale is strong. Test vitamin D annually. If your levels are below 30 ng/mL, supplement aggressively under medical guidance. Above 40 ng/mL is optimal for most people. K2 may be particularly important for postmenopausal women, people with family history of cardiovascular disease, and anyone taking calcium supplements.</p></section>
      <References refs={VITD_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Vitamin D, K2, dosing, deficiency — evidence over marketing." ctaLabel="Get the evidence" location="guide-vitamin-d-k2" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}