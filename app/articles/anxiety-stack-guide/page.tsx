import Link from 'next/link';
import {
  buildPageMetadata,
  blogJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd
} from '@/lib/seo';
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge';
import ResponsiveTable from '@/components/ResponsiveTable';
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard';
import SafetyNotice from '@/components/evidence/SafetyNotice';
import EmailCapture from '@/components/EmailCapture';
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock';
import { AFFILIATE_TAGS } from '@/config/affiliate';

const articleTitle = "Anxiety Stack Guide: Ashwagandha, L-Theanine, Magnesium, and Practical Combinations";
const articleDescription = "An evidence-based guide to anxiety supplement stacks, including ashwagandha, L-theanine, magnesium, safety considerations, timing, and who should consider each approach.";
const lastUpdated = "2026-06-10";
const slug = "anxiety-stack-guide";

export const metadata = buildPageMetadata({
  title: articleTitle,
  description: articleDescription,
  path: `/articles/${slug}`,
  openGraphType: 'article',
});

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Anxiety', url: '/articles/natural-anxiety-relief' },
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

  const stackComparisonData = [
    ["Beginner Stack", "Magnesium", "General stress support, low complexity", "Low", "Low", "Mild GI upset in some forms"],
    ["Stress Stack", "Ashwagandha + Magnesium", "Chronic stress, daily foundational support", "Medium", "Medium", "Ashwagandha cautions (thyroid, autoimmune)"],
    ["Racing Thoughts Stack", "L-Theanine + Magnesium", "Mental tension, calm focus", "Low-Medium", "Low-Medium", "Generally well tolerated"],
    ["Anxiety + Sleep Stack", "Ashwagandha + Magnesium + L-Theanine", "Stress + sleep overlap", "Medium-High", "Medium", "More variables to monitor"],
    ["Full Stack", "All three + others", "Comprehensive approach (not recommended for beginners)", "High", "Higher", "Highest risk of over-supplementation"]
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd(post, `/articles/${slug}`))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageJsonLd({
            pagePath: `/articles/${slug}`,
            questions: faqItems,
          }))
        }}
      />

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
              <li><strong>Ashwagandha</strong> — Adaptogen with research on chronic stress and stress-related anxiety. See <Link href="/articles/ashwagandha-for-anxiety" className="text-primary underline">Ashwagandha for Anxiety</Link>.</li>
              <li><strong>L-Theanine</strong> — Amino acid from tea that may promote calm focus and relaxation without heavy sedation. See <Link href="/articles/l-theanine-for-anxiety" className="text-primary underline">L-Theanine for Anxiety</Link>.</li>
              <li><strong>Magnesium</strong> — Mineral involved in nervous system function and often used for physical tension and sleep support. See <Link href="/articles/magnesium-for-sleep" className="text-primary underline">Magnesium for Sleep</Link>.</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Stack Comparison</h2>

          <ResponsiveTable
            headers={["Stack", "Ingredients", "Best For", "Complexity", "Cost", "Main Caution"]}
            rows={stackComparisonData}
          />
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
              See also: <Link href="/articles/sleep-stack-guide" className="text-primary underline">Sleep Stack Guide</Link> and <Link href="/articles/best-herbs-for-sleep" className="text-primary underline">Best Herbs for Sleep</Link>.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Timing Guide</h2>

          <ResponsiveTable
            headers={["Time of Day", "Recommended Supplements", "Notes"]}
            rows={[
              ["Morning", "Ashwagandha (some prefer), L-Theanine (with or without caffeine)", "TODO: Verify preferred timing from evidence"],
              ["Afternoon", "L-Theanine (for calm focus)", "Useful during high-stress periods"],
              ["Evening", "Magnesium, Ashwagandha (some prefer), L-Theanine", "Support relaxation and sleep quality"]
            ]}
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosing Guide</h2>

          <ResponsiveTable
            headers={["Supplement", "Common Research Range", "Notes"]}
            rows={[
              ["Ashwagandha (standardized extract)", "TODO: Typical daily range from studies", "Often taken once or twice daily"],
              ["L-Theanine", "TODO: Typical single and daily doses", "Often 100–200 mg per dose"],
              ["Magnesium (glycinate/bisglycinate)", "TODO: Elemental magnesium range", "Split doses may improve tolerability"]
            ]}
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety and Interactions</h2>

          <SafetyNotice>
            <ul className="space-y-2">
              <li>Combining multiple supplements increases the potential for additive effects or interactions.</li>
              <li>Caution with sedatives, psychiatric medications, blood pressure medications, and thyroid medications.</li>
              <li>Ashwagandha has specific cautions regarding thyroid function and autoimmune conditions.</li>
              <li>Pregnancy and breastfeeding: Limited safety data for most of these supplements — consult a healthcare provider.</li>
              <li>Severe anxiety, panic attacks, or suicidal thoughts require professional mental health support, not self-managed supplement stacks.</li>
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
            <Link href="/articles/natural-anxiety-relief" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Natural Anxiety Relief: Evidence-Based Approaches
            </Link>
            <Link href="/articles/ashwagandha-for-anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Ashwagandha for Anxiety
            </Link>
            <Link href="/articles/l-theanine-for-anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              L-Theanine for Anxiety
            </Link>
            <Link href="/articles/cbd-vs-ashwagandha-for-anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              CBD vs Ashwagandha for Anxiety
            </Link>
            <Link href="/articles/sleep-stack-guide" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Sleep Stack Guide
            </Link>
            <Link href="/articles/best-herbs-for-sleep" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Best Herbs for Sleep
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
              <a href={`${AFFILIATE_TAGS.amazon}?k=KSM-66+Ashwagandha+third+party+tested`} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                Search KSM-66 Ashwagandha →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Magnesium Glycinate</h3>
              <a href={`${AFFILIATE_TAGS.amazon}?k=Magnesium+glycinate+third+party+tested`} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                Search Magnesium Glycinate →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">L-Theanine</h3>
              <a href={`${AFFILIATE_TAGS.amazon}?k=L-Theanine+third+party+tested`} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                Search L-Theanine →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Stress Support Supplements</h3>
              <a href={`${AFFILIATE_TAGS.amazon}?k=stress+support+supplements`} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                Browse options →
              </a>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Sources &amp; References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <p className="mb-4 font-medium">TODO: Populate with verified references from the evidence workbook.</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Anxiety and stress evidence for Ashwagandha, L-Theanine, and Magnesium</li>
              <li>Stack safety and interaction data</li>
              <li>Systematic reviews</li>
              <li>Timing and dosing verification from clinical studies</li>
            </ul>
          </div>
        </section>

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
