import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd'
import {
  buildPageMetadata,
  blogJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  compactMetaTitle
} from '../../../../src/lib/seo';
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import SafetyNotice from '@/components/evidence/SafetyNotice';
import EmailCapture from '@/components/EmailCapture';
import { getRevenueProductSet } from '@/config/revenue-products';
import RecommendationSection from '@/components/RecommendationSection';
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock';
import { AFFILIATE_TAGS } from '@/config/affiliate';

const articleTitle = "Anxiety Stack Guide: Ashwagandha, L-Theanine, Magnesium, and Practical Combinations";
const articleDescription = "An evidence-based guide to anxiety supplement stacks, including ashwagandha, L-theanine, magnesium, safety considerations, timing, and who should consider each approach.";
const lastUpdated = "2026-06-10";
const slug = "anxiety-stack-guide";

export const metadata = buildPageMetadata({
  title: compactMetaTitle(articleTitle),
  description: articleDescription,
  path: `/guides/anxiety/${slug}`,
  openGraphType: 'article',
});

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Anxiety', url: '/guides/anxiety/natural-anxiety-relief' },
  { name: 'Anxiety Stack Guide', url: `/articles/${slug}` },
];

export default function AnxietyStackGuidePage() {
  const faqItems = [
    {
      question: "What is the best anxiety stack?",
      answer: "There is no single 'best' stack. The most appropriate combination depends on whether anxiety is primarily driven by chronic stress, racing thoughts, or sleep issues. Starting simple (e.g., magnesium only) and adding one supplement at a time is generally safer than combining many at once."
    },
    {
      question: "Can I combine ashwagandha and L-theanine?",
      answer: "Many people use them together for complementary effects (longer-term stress adaptation + more acute calm focus). Limited published research exists on the specific combination. Introduce one at a time and monitor how you feel."
    },
    {
      question: "Can I combine magnesium and ashwagandha?",
      answer: "This is a common and generally well-tolerated pairing. Magnesium often supports physical relaxation while ashwagandha targets stress response. As with any stack, start low and consult a clinician if you take medications."
    },
    {
      question: "How long do anxiety supplements take to work?",
      answer: "L-theanine often produces noticeable effects within 30–60 minutes. Ashwagandha typically requires consistent daily use over 2–8 weeks. Magnesium effects can vary from hours (for relaxation) to days/weeks depending on the form and individual status."
    },
    {
      question: "Are anxiety stacks safe?",
      answer: "When used thoughtfully and one at a time, many people tolerate these supplements well. However, combining multiple supplements increases the chance of interactions or side effects. People on psychiatric medications, sedatives, or with certain medical conditions should consult a healthcare provider first."
    },
    {
      question: "Can anxiety stacks help with sleep?",
      answer: "Yes, particularly when anxiety interferes with sleep. Ashwagandha and L-theanine have both been studied in the context of stress-related sleep issues. See the Sleep Stack Guide for more targeted combinations."
    }
  ];

  const post = {
    title: articleTitle,
    description: articleDescription,
    slug: slug,
    date: lastUpdated,
  };


  return (
    <>
      <JsonLd schema={blogJsonLd(post, `/articles/${slug}`)} />
      <JsonLd schema={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd schema={faqPageJsonLd({
            pagePath: `/articles/${slug}`,
            questions: faqItems,
          })} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <LastUpdatedBadge date={lastUpdated} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">
            {articleTitle}
          </h1>
          <p className="text-xl text-muted-foreground">
            {articleDescription}
          </p>
        </div>

        <div className="prose prose-sm mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Affiliate Disclosure:</strong> This article contains affiliate links.
            Purchases through these links may earn us a small commission at no extra cost to you.
          </p>
        </div>

        <div className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• <strong>Beginner stack</strong>: Start with magnesium only.</li>
            <li>• <strong>Stress-focused stack</strong>: Ashwagandha + Magnesium.</li>
            <li>• <strong>Racing thoughts stack</strong>: L-Theanine + Magnesium.</li>
            <li>• <strong>Anxiety + Sleep stack</strong>: Ashwagandha + Magnesium + L-Theanine.</li>
            <li>• <strong>Important</strong>: Do not start multiple new supplements at once. Introduce one at a time and monitor effects.</li>
          </ul>
        </div>

        {/* Fastest useful choice */}
        <section className="mb-12 rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm">
          <p className="eyebrow-label">Fastest useful choice</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">If you only try one thing: L-theanine alone</h2>
          <p className="mt-3 text-base leading-7 text-muted">
            <strong>L-theanine (100–200&nbsp;mg) alone is the fastest useful choice for anxiety stacks.</strong>{' '}
            It works within 30–60 minutes, does not require stacking to be effective, and has a clean
            safety profile. Adding magnesium (200–400&nbsp;mg/day, glycinate form) creates the most
            reliable beginner stack. Reserve ashwagandha for when you have a clear chronic-stress
            pattern and can commit to 6–8 weeks of daily use. See the{' '}
            <Link href="/guides/herbs/l-theanine" className="font-semibold text-brand-700 hover:underline">
              full L-theanine guide
            </Link>{' '}
            and the{' '}
            <Link href="/guides/herbs/ashwagandha" className="font-semibold text-brand-700 hover:underline">
              ashwagandha guide
            </Link>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Is an Anxiety Stack?</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              An anxiety stack refers to the intentional combination of supplements that target complementary aspects of stress and anxiety (e.g., stress hormone regulation, mental relaxation, physical tension, and sleep support).
            </p>
            <p>
              The goal of a well-designed stack is synergy — using lower doses of multiple compounds that work through different mechanisms rather than high doses of a single supplement. However, stacking also increases complexity and the potential for interactions or side effects.
            </p>
            <p>
              Randomly combining many supplements ("supplement piling") is generally discouraged. A thoughtful, goal-oriented approach with gradual introduction is safer and more effective for most people.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Core Anxiety Supplements</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              The three supplements most commonly discussed for anxiety support in this cluster are:
            </p>
            <ul>
              <li><strong>Ashwagandha</strong> — Adaptogen with research on chronic stress and stress-related anxiety. See <Link href="/guides/herbs/ashwagandha" className="text-primary underline">Ashwagandha for Anxiety</Link> or the umbrella <Link href="/guides/herbs/ashwagandha" className="text-primary underline">Ashwagandha article</Link>.</li>
              <li><strong>L-Theanine</strong> — Amino acid from tea that may promote calm focus and relaxation without heavy sedation. See <Link href="/guides/herbs/l-theanine" className="text-primary underline">L-Theanine for Anxiety</Link> or the umbrella <Link href="/guides/herbs/l-theanine" className="text-primary underline">L-Theanine article</Link>.</li>
              <li><strong>Magnesium</strong> — Mineral involved in nervous system function and often used for physical tension and sleep support. See <Link href="/guides/sleep/magnesium-for-sleep" className="text-primary underline">Magnesium for Sleep</Link>.</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Stack Comparison</h2>

          <ResponsiveTable label="Anxiety stack comparison by use case and complexity">
            <table className="min-w-[680px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Stack</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Ingredients</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Best For</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Complexity</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Cost</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Main Caution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Beginner Stack</td>
                  <td className="py-3 pr-4 text-muted">Magnesium</td>
                  <td className="py-3 pr-4 text-muted">General stress support, low complexity</td>
                  <td className="py-3 pr-4 text-muted">Low</td>
                  <td className="py-3 pr-4 text-muted">Low</td>
                  <td className="py-3 text-muted">Mild GI upset in some forms</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Stress Stack</td>
                  <td className="py-3 pr-4 text-muted">Ashwagandha + Magnesium</td>
                  <td className="py-3 pr-4 text-muted">Chronic stress, daily foundational support</td>
                  <td className="py-3 pr-4 text-muted">Medium</td>
                  <td className="py-3 pr-4 text-muted">Medium</td>
                  <td className="py-3 text-muted">Ashwagandha cautions (thyroid, autoimmune)</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Racing Thoughts Stack</td>
                  <td className="py-3 pr-4 text-muted">L-Theanine + Magnesium</td>
                  <td className="py-3 pr-4 text-muted">Mental tension, calm focus</td>
                  <td className="py-3 pr-4 text-muted">Low–Medium</td>
                  <td className="py-3 pr-4 text-muted">Low–Medium</td>
                  <td className="py-3 text-muted">Generally well tolerated</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Anxiety + Sleep Stack</td>
                  <td className="py-3 pr-4 text-muted">Ashwagandha + Magnesium + L-Theanine</td>
                  <td className="py-3 pr-4 text-muted">Stress + sleep overlap</td>
                  <td className="py-3 pr-4 text-muted">Medium–High</td>
                  <td className="py-3 pr-4 text-muted">Medium</td>
                  <td className="py-3 text-muted">More variables to monitor</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Full Stack</td>
                  <td className="py-3 pr-4 text-muted">All three + others</td>
                  <td className="py-3 pr-4 text-muted">Comprehensive (not for beginners)</td>
                  <td className="py-3 pr-4 text-muted">High</td>
                  <td className="py-3 pr-4 text-muted">Higher</td>
                  <td className="py-3 text-muted">Highest risk of over-supplementation</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Beginner Stack: Magnesium Only</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              For most people new to supplement stacks for anxiety, starting with a single well-tolerated mineral like magnesium is the lowest-risk approach.
            </p>
            <p>
              Magnesium glycinate or bisglycinate is frequently recommended for its good tolerability and potential benefits for both physical relaxation and sleep quality.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Stress Stack: Ashwagandha + Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              This combination targets both the physiological stress response (ashwagandha) and physical/muscular tension plus sleep support (magnesium). It is a popular foundational stack for people experiencing chronic stress that manifests as anxiety.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Racing Thoughts Stack: L-Theanine + Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              This pairing focuses more on mental relaxation and calm focus during the day. L-theanine may help with racing thoughts while magnesium supports overall nervous system calm. Many people find this combination less "heavy" than stacks containing ashwagandha.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Anxiety + Sleep Stack: Ashwagandha + Magnesium + L-Theanine</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              This is a more comprehensive stack that addresses chronic stress (ashwagandha), mental tension (L-theanine), and physical relaxation/sleep (magnesium). It is best suited for people whose anxiety significantly impacts sleep.
            </p>
            <p>
              See also: <Link href="/guides/sleep/sleep-stack-guide" className="text-primary underline">Sleep Stack Guide</Link> and <Link href="/guides/sleep/best-herbs-for-sleep" className="text-primary underline">Best Herbs for Sleep</Link>.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Timing Guide</h2>

          <ResponsiveTable label="Anxiety supplement timing guide">
            <table className="min-w-[500px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Time of Day</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Recommended Supplements</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Morning</td>
                  <td className="py-3 pr-4 text-muted">Ashwagandha (some prefer), L-Theanine (with or without caffeine)</td>
                  <td className="py-3 text-muted">Timing is flexible; most evidence does not specify strict time-of-day requirements. Some prefer ashwagandha with meals to reduce GI upset.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Afternoon</td>
                  <td className="py-3 pr-4 text-muted">L-Theanine (for calm focus)</td>
                  <td className="py-3 text-muted">Useful during high-stress periods</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Evening</td>
                  <td className="py-3 pr-4 text-muted">Magnesium, Ashwagandha (some prefer), L-Theanine</td>
                  <td className="py-3 text-muted">Support relaxation and sleep quality</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosing Guide</h2>

          <ResponsiveTable label="Anxiety supplement dosing guide">
            <table className="min-w-[500px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Supplement</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Common Research Range</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Ashwagandha (standardized extract)</td>
                  <td className="py-3 pr-4 text-muted">300–600 mg/day (standardized extract)</td>
                  <td className="py-3 text-muted">Often taken once or twice daily</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">L-Theanine</td>
                  <td className="py-3 pr-4 text-muted">100–200 mg per dose, 100–400 mg/day</td>
                  <td className="py-3 text-muted">Often 100–200 mg per dose</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Magnesium (glycinate/bisglycinate)</td>
                  <td className="py-3 pr-4 text-muted">200–400 mg elemental magnesium/day</td>
                  <td className="py-3 text-muted">Split doses may improve tolerability</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety and Interactions</h2>

          <SafetyNotice>
            <ul className="space-y-2">
              <li>Combining multiple supplements increases the potential for additive effects, drug interactions, or side effects &mdash; introduce one supplement at a time.</li>
              <li><strong>Ashwagandha:</strong> avoid in pregnancy and breastfeeding; rare hepatotoxicity reported; may affect thyroid hormone levels; caution with autoimmune disease and immunosuppressants.</li>
              <li><strong>Magnesium:</strong> caution with kidney disease (kidneys regulate excretion); high doses cause loose stools &mdash; lower the dose rather than stopping.</li>
              <li><strong>L-theanine:</strong> generally well-tolerated; some evidence of mild blood pressure reduction &mdash; caution with antihypertensives; do not combine with sedatives without medical supervision.</li>
              <li>Caution with sedatives, psychiatric medications, SSRIs/SNRIs/MAOIs, blood pressure medications, and thyroid medications.</li>
              <li>Severe anxiety, panic attacks, suicidal thoughts, or significant functional impairment require professional mental health support, not self-managed supplement stacks.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Who Should Consider Which Stack?</h2>
          <div className="prose prose-lg max-w-none">
            <p><strong>Beginner / Low complexity</strong>: Start with magnesium only.</p>
            <p><strong>Chronic stress dominant</strong>: Consider Ashwagandha + Magnesium.</p>
            <p><strong>Racing thoughts / daytime tension</strong>: Consider L-Theanine + Magnesium.</p>
            <p><strong>Significant sleep disruption</strong>: Consider the three-supplement Anxiety + Sleep stack (after trying simpler options).</p>
            <p>
              People with complex medical histories, on multiple medications, or with severe anxiety should work with a clinician rather than self-experimenting with stacks.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Not To Do</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>• Do not start multiple new supplements at the same time.</li>
            <li>• Do not replace prescribed psychiatric care or therapy with supplements.</li>
            <li>• Do not ignore panic attacks, severe anxiety, or suicidal thoughts — seek professional help immediately.</li>
            <li>• Do not megadose supplements in an attempt to get faster results.</li>
            <li>• Do not assume "natural" means risk-free when combining multiple compounds.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/guides/anxiety/natural-anxiety-relief" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Natural Anxiety Relief: Evidence-Based Approaches
            </Link>
            <Link href="/guides/herbs/ashwagandha" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Ashwagandha: Full Guide
            </Link>
            <Link href="/guides/herbs/l-theanine" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              L-Theanine: Full Guide
            </Link>
            <Link href="/guides/anxiety/cbd-vs-ashwagandha-for-anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              CBD vs Ashwagandha for Anxiety
            </Link>
            <Link href="/guides/sleep/sleep-stack-guide" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Sleep Stack Guide
            </Link>
            <Link href="/guides/anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Anxiety Goal Hub
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Future articles: Magnesium for Anxiety • Passionflower for Anxiety • Saffron for Anxiety
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Buyer Guide</h2>
          <div className="prose prose-lg max-w-none">
            <p>Look for third-party tested products from reputable brands when possible.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Ashwagandha</h3>
              <a href={`https://www.amazon.com/s?k=KSM-66+ashwagandha+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`} target="_blank" rel="noopener noreferrer sponsored" className="text-primary underline text-sm">
                Search KSM-66 Ashwagandha →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Magnesium Glycinate</h3>
              <a href={`https://www.amazon.com/s?k=magnesium+glycinate+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`} target="_blank" rel="noopener noreferrer sponsored" className="text-primary underline text-sm">
                Search Magnesium Glycinate →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">L-Theanine</h3>
              <a href={`https://www.amazon.com/s?k=l-theanine+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`} target="_blank" rel="noopener noreferrer sponsored" className="text-primary underline text-sm">
                Search L-Theanine →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Stress Support Supplements</h3>
              <a href={`https://www.amazon.com/s?k=stress+support+supplements&tag=${AFFILIATE_TAGS.amazon}`} target="_blank" rel="noopener noreferrer sponsored" className="text-primary underline text-sm">
                Browse options →
              </a>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Sources &amp; References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <p className="mb-4 font-medium">Key sources include:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Anxiety and stress evidence for Ashwagandha, L-Theanine, and Magnesium</li>
              <li>Stack safety and interaction data</li>
              <li>Systematic reviews</li>
              <li>Timing and dosing verification from clinical studies</li>
            </ul>
          </div>
        </section>

        <RecommendationSection products={getRevenueProductSet('ashwagandha')?.products ?? []} />

        <div className="my-12">
          <NewsletterCtaBlock />
          <div className="mt-6">
            <EmailCapture />
          </div>
        </div>
      </div>
    </>
  );
}
