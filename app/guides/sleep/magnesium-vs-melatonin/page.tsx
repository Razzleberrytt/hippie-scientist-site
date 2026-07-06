import Link from 'next/link';
import Image from 'next/image';
import { SeoEntryPage, generateSeoEntryMetadata } from '../../../seo-entry-pages';
import StructuredData from '@/components/StructuredData';
import { ArticleLayout, TableOfContents } from '@/components/articles';
import type { Heading } from '@/components/articles';
import { getRevenueProductSet } from '@/config/revenue-products';
import RecommendationSection from '@/components/RecommendationSection';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';
import EmailCapture from '@/components/EmailCapture';
import References from '@/components/References'
import ComparisonVerdict from '@/components/editorial/ComparisonVerdict'

const CANONICAL_PATH = '/guides/sleep/magnesium-vs-melatonin/'
const route = 'guides/magnesium-vs-melatonin';
const PAGE_URL = 'https://thehippiescientist.net/guides/sleep/magnesium-vs-melatonin';

export const metadata = {
  ...generateSeoEntryMetadata(route, CANONICAL_PATH),
  robots: { index: true, follow: true },
};

const HEADINGS: Heading[] = [
  { id: 'comparison', text: 'Quick Comparison at a Glance', level: 2 },
  { id: 'mechanism', text: 'How They Work', level: 2 },
  { id: 'decision', text: 'Decision Framework', level: 2 },
  { id: 'routine', text: 'Example Evening Routine', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const MAGNESIUM_VS_MELATONIN_REFS = [
  { n: 1, text: 'Abbasi B, et al. (2012). Magnesium and insomnia. J Res Med Sci, 17(12): 1161-1169.', url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
  { n: 2, text: 'Ferracioli-Oda E, et al. (2013). Melatonin for sleep. PLoS ONE, 8(5): e63773.', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
]

export default function MagnesiumVsMelatoninGuidePage() {
  const toc = <TableOfContents headings={HEADINGS} />
  const magnesiumProducts = getRevenueProductSet('magnesium')

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <AffiliateDisclosure variant="compact" className="mb-6" />
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Magnesium vs Melatonin for Sleep: Evidence-Based Comparison"
        description="Nuanced comparison of magnesium and melatonin for sleep support. Mechanisms, timing, dosing, safety, decision framework, and when stacking makes sense."
        datePublished="2026-06-14"
        dateModified="2026-06-14"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Magnesium vs Melatonin', href: '/guides/sleep/magnesium-vs-melatonin' },
        ]}
      />

      <ComparisonVerdict
        optionA="Magnesium"
        optionB="Melatonin"
        chooseA={[
          'Muscle tension or trouble winding down',
          'You suspect a low magnesium intake (common)',
          'You want sleep-quality support, not just faster onset',
        ]}
        chooseB={[
          'A circadian / timing problem — jet lag, shift work, delayed sleep phase',
          'You mainly struggle to fall asleep at the desired hour',
          'You need it only occasionally, for a schedule shift',
        ]}
        useBoth={['Both relaxation and timing are issues — take magnesium in the evening and low-dose melatonin 30–120 min before your target bedtime.']}
        avoidBoth={['Loud snoring with daytime exhaustion (possible sleep apnea) or chronic insomnia — see a clinician; neither supplement fixes these.']}
        winners={[
          { label: 'Fastest to act', winner: 'Melatonin' },
          { label: 'Best for muscle tension', winner: 'Magnesium' },
          { label: 'Best for jet lag / timing', winner: 'Melatonin' },
          { label: 'Best safety for nightly use', winner: 'Magnesium', note: 'no morning grog' },
        ]}
      >
        They solve different problems — magnesium calms the body and nervous system; melatonin shifts your clock. Most people should start with whichever matches the list above, and many combine them.
      </ComparisonVerdict>

      <SeoEntryPage route={route} canonicalPath={CANONICAL_PATH} />

      {magnesiumProducts && (
      <>
        <References refs={MAGNESIUM_VS_MELATONIN_REFS} />
          <RecommendationSection products={magnesiumProducts.products} />
      </>
      )}

      <EmailCapture location="guides-magnesium-vs-melatonin" className="mt-6" />

      <div className="space-y-12">

        {/* Quick Comparison Table */}
        <section id="comparison" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mb-4">Quick Comparison at a Glance</h2>
          <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
            <table className="min-w-[720px] w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-900/10 bg-brand-50/50">
                  <th className="text-left p-4 font-semibold text-ink">Aspect</th>
                  <th className="text-left p-4 font-semibold text-ink">Magnesium</th>
                  <th className="text-left p-4 font-semibold text-ink">Melatonin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                <tr>
                  <td className="p-4 font-medium text-ink">Primary mechanisms</td>
                  <td className="p-4 text-muted">NMDA receptor antagonism + GABA support, muscle relaxation</td>
                  <td className="p-4 text-muted">MT1/MT2 receptor activation in SCN for circadian signaling</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-ink">Best suited for</td>
                  <td className="p-4 text-muted">Relaxation, muscle tension, possible deficiency, sleep quality</td>
                  <td className="p-4 text-muted">Sleep onset latency, jet lag, delayed sleep phase, schedule shifts</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-ink">Evidence context</td>
                  <td className="p-4 text-muted">B-C overall; stronger in deficient or older adults</td>
                  <td className="p-4 text-muted">B for specific circadian/onset uses</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-ink">Typical timing</td>
                  <td className="p-4 text-muted">Evening use; benefits often build over days to weeks</td>
                  <td className="p-4 text-muted">30–120 min before desired bedtime (timing is critical)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Mechanisms + Visual */}
        <section id="mechanism" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mb-4">How They Work</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card-premium p-6">
              <h3 className="font-semibold text-xl mb-3">Magnesium</h3>
              <p className="text-muted">Acts as an NMDA receptor antagonist and supports GABAergic tone. This helps reduce neuronal excitability while promoting muscle relaxation. Benefits are often more noticeable when addressing suboptimal magnesium status.</p>
            </div>
            <div className="card-premium p-6">
              <h3 className="font-semibold text-xl mb-3">Melatonin</h3>
              <p className="text-muted">Activates MT1 and MT2 receptors in the suprachiasmatic nucleus (SCN). It primarily helps align circadian timing and reduce the time it takes to fall asleep.</p>
            </div>
          </div>

          <figure className="my-8">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/magnesium-melatonin-mechanisms.jpg"
                alt="Diagram comparing magnesium and melatonin mechanisms for sleep support"
                width={1176}
                height={784}
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Magnesium primarily supports relaxation and sleep quality. Melatonin primarily aids sleep timing and onset via circadian signaling.
            </figcaption>
          </figure>
        </section>

        {/* Decision Framework + Visual */}
        <section id="decision" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mb-4">Decision Framework</h2>
          <div className="space-y-4 text-muted">
            <div className="card-premium p-5">
              <p><strong>Lean toward magnesium first if:</strong> Muscle tension, difficulty winding down, or possible low magnesium status is the main issue.</p>
            </div>
            <div className="card-premium p-5">
              <p><strong>Lean toward melatonin first if:</strong> Clear circadian or timing problems (jet lag, delayed sleep phase, or difficulty falling asleep at the desired hour).</p>
            </div>
            <div className="card-premium p-5">
              <p><strong>Consider both / thoughtful stacking if:</strong> Overlapping factors exist. Many people combine them successfully when attention is paid to timing and dose.</p>
            </div>
          </div>

          <figure className="my-8 max-w-2xl mx-auto">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/magnesium-melatonin-decision.jpg"
                alt="Decision flowchart for choosing magnesium vs melatonin"
                width={784}
                height={1176}
                priority
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Use the compare tool for deeper evidence context.
            </figcaption>
          </figure>
        </section>

        {/* Evening Routine Visual */}
        <section id="routine" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold text-ink mb-4">Example Evening Routine</h2>
          <figure>
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/evening-sleep-routine.jpg"
                alt="Sample evening timeline for magnesium and melatonin"
                width={1176}
                height={784}
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Adjust timing and doses based on your personal response.
            </figcaption>
          </figure>
        </section>

        <section id="bottom-line" className="scroll-mt-20 rounded-2xl border border-brand-900/10 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-ink mb-3">Bottom Line</h2>
          <p className="text-muted">
            Magnesium and melatonin are complementary tools. Choose emphasis based on whether your main need is relaxation/quality support or circadian timing/onset. Thoughtful stacking is common. Prioritize sleep hygiene and use the compare tool for deeper evidence views.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/guides/sleep/magnesium-vs-melatonin" className="font-semibold text-emerald-700 hover:underline">Open side-by-side compare →</Link>
            <Link href="/compounds/magnesium" className="font-semibold text-emerald-700 hover:underline">Magnesium profile →</Link>
            <Link href="/compounds/melatonin" className="font-semibold text-emerald-700 hover:underline">Melatonin profile →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  );
}
