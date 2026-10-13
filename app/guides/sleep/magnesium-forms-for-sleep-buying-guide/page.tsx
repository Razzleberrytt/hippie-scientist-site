import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import References from '@/components/References'
import StructuredData from '@/components/StructuredData'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { canRenderConfiguredRevenueProducts } from '@/lib/revenue-product-governance'
import { SITE_URL, buildTwitterMetadata } from '@/lib/seo'

const PATH = '/guides/sleep/magnesium-forms-for-sleep-buying-guide/'
const TITLE = 'Best Magnesium for Sleep? Six Forms Compared'
const DESCRIPTION =
  'Compare magnesium glycinate, citrate, L-threonate, malate, taurate and oxide by elemental dose, direct sleep trials, absorption, gut tolerance, and relative cost. No miracle claims.'
const REVIEWED = '2026-10-13'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    type: 'article',
    images: ['/images/guides/best-magnesium-for-sleep.jpg'],
  },
  twitter: buildTwitterMetadata({ title: TITLE, description: DESCRIPTION }),
}

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'comparison-table', text: 'Six-form comparison', level: 2 },
  { id: 'how-we-compare', text: 'How we compared', level: 2 },
  { id: 'form-by-form', text: 'Form-by-form evidence', level: 2 },
  { id: 'decision-guide', text: 'Choose by what matters', level: 2 },
  { id: 'shop', text: 'Shop by form, not by promise', level: 2 },
  { id: 'wont-do', text: 'What magnesium will not do', level: 2 },
  { id: 'safety', text: 'Safety and interactions', level: 2 },
  { id: 'faq', text: 'Common questions', level: 2 },
  { id: 'references', text: 'References', level: 2 },
]

const FORMS = [
  {
    name: 'Glycinate / bisglycinate',
    amount: '100–200 mg',
    evidence: 'Limited positive: 1 small-effect RCT',
    gi: 'Often gentle; comparison data limited',
    price: '$$',
    absorption: 'Chelated and soluble; no solid proof it is the best-absorbed or the best for every person.',
    trial: 'A 2025 four-week RCT (155 adults) used 250 mg/day elemental bisglycinate. Insomnia Severity Index fell by 3.9 points vs 2.3 with placebo; between-group difference 1.6 points, small effect d = 0.2 (PMID 40918053).',
    fit: 'A pragmatic first comparison for someone focused on sleep and avoiding a laxative effect. It is not proven superior to citrate or threonate in a head-to-head sleep trial.',
    refs: [1, 2],
  },
  {
    name: 'Citrate',
    amount: '100–200 mg',
    evidence: 'No verified citrate-only sleep trial',
    gi: 'More likely to loosen stools',
    price: '$',
    absorption: 'More soluble and better absorbed than oxide in small human comparisons; exact personal absorption is not predictable (PMIDs 2407766, 14596323).',
    trial: 'No verified direct citrate-only randomized sleep trial was identified for this comparison. Absorption data are not sleep-outcome data.',
    fit: 'Often a practical lower-cost option when constipation or stool-softening would be acceptable. Skip as a sleep-first choice if diarrhea is already an issue.',
    refs: [5, 6],
  },
  {
    name: 'L-threonate',
    amount: 'About 72–144 mg from 1–2 g of compound',
    evidence: 'Limited, mixed: 2 direct RCTs',
    gi: 'Usually tolerated in small trials; limited comparison data',
    price: '$$$',
    absorption: 'Brain-delivery claims come largely from preclinical or indirect work. Human sleep effects cannot establish superior brain penetration or bioavailability versus other salts.',
    trial: 'An 80-person, 21-day 2024 trial using 1 g/day reported some better Oura-derived sleep scores (PMID 39252819). A separate 100-person, six-week 2026 trial using 2 g/day showed some subjective sleep-related improvement, but no between-group wearable sleep-outcome difference (PMID 41601871).',
    fit: 'Someone weighing a premium, cognition-marketed formula against mixed human evidence; brain fog is not a proven indication, and sleep benefits are not clearly better than cheaper forms.',
    refs: [3, 4],
  },
  {
    name: 'Malate',
    amount: '100–200 mg',
    evidence: 'No verified malate-only sleep trial',
    gi: 'Variable; direct comparison data sparse',
    price: '$$',
    absorption: 'Often sold as a soluble organic salt, but rigorous human head-to-head uptake data specific to malate are too thin to rank it confidently.',
    trial: 'No verified direct malate-only randomized sleep trial was identified. Claims that malate gives extra energy or fixes bedtime fatigue are not established by sleep trials.',
    fit: 'Someone who already tolerates malate as a routine magnesium source; no reason to pay extra specifically for a sleep claim.',
    refs: [1, 8],
  },
  {
    name: 'Taurate',
    amount: '50–150 mg',
    evidence: 'No verified taurate-only sleep trial',
    gi: 'Variable; direct comparison data sparse',
    price: '$$–$$$',
    absorption: 'Not enough good human comparative data to claim that taurate absorbs better or targets the nervous system more effectively.',
    trial: 'No verified direct taurate-only randomized sleep trial was identified. Taurine research on its own cannot be transferred automatically to magnesium taurate.',
    fit: 'Mainly a preference-based option if label clarity and tolerance are good; do not pay a premium for unproven sleep or heart-related claims.',
    refs: [1, 8],
  },
  {
    name: 'Oxide',
    amount: '200–400 mg',
    evidence: 'Very limited: older-adult RCT',
    gi: 'Loose stools more common; laxative use',
    price: '$',
    absorption: 'High elemental percentage by weight, but low fractional absorption in small human comparisons; 4% was reported in one preparation study (PMID 11794633).',
    trial: 'A small 2012 trial in 46 older adults with insomnia used approximately 500 mg/day elemental magnesium as oxide for eight weeks and reported some subjective improvements (PMID 23853635). It does not establish superiority, and that trial dose is above the adult U.S. supplemental UL.',
    fit: 'Low ingredient cost or a laxative-oriented product, not a first choice for someone seeking reliable absorption without GI effects.',
    refs: [7, 9, 10],
  },
] as const

const FAQS = [
  {
    question: 'Which magnesium is best for sleep?',
    answer: 'There is no proven best magnesium form for sleep. Bisglycinate has one small positive four-week randomized trial (PMID 40918053), L-threonate has two direct but mixed trials (PMIDs 39252819, 41601871), and the 2026 review of 12 main sleep RCTs rated overall certainty low to very low (PMID 42661485).',
    refs: [1, 2, 3, 4],
  },
  {
    question: 'Is magnesium glycinate better than citrate for sleep?',
    answer: 'No head-to-head sleep trial establishes glycinate as better than citrate. Glycinate has one direct small-benefit sleep RCT (PMID 40918053), while citrate has better evidence for absorption relative to oxide than for an independent sleep effect (PMIDs 2407766, 14596323).',
    refs: [2, 5, 6],
  },
  {
    question: 'Does magnesium L-threonate improve deep sleep or brain fog?',
    answer: 'L-threonate has promising but inconsistent preliminary findings, not proof that it increases deep sleep or treats brain fog. One 2024 trial reported improved Oura-derived sleep metrics (PMID 39252819), but a 2026 trial found no between-group wearable sleep improvement despite some subjective and cognitive signals (PMID 41601871).',
    refs: [3, 4],
  },
  {
    question: 'How much elemental magnesium is in a typical sleep supplement?',
    answer: 'Many adult product labels list about 100–200 mg of elemental magnesium per serving, but this is not a recommended sleep dose. L-threonate may advertise 1–2 g of compound yet provide only roughly 72–144 mg elemental magnesium; the NIH adult upper limit is 350 mg/day from supplements and magnesium-containing medications, excluding food.',
    refs: [9],
  },
  {
    question: 'Can magnesium cause diarrhea?',
    answer: 'Yes. Unabsorbed magnesium salts can pull water into the gut, causing loose stools, cramping or nausea; this is dose- and formulation-dependent. NIH lists oxide among the forms frequently associated with diarrhea, while citrate can also loosen stools (NIH ODS magnesium fact sheet).',
    refs: [9],
  },
  {
    question: 'How long does magnesium take to help sleep?',
    answer: 'Magnesium is not a same-night sleeping pill; when small benefits have been reported, trials generally evaluated outcomes after weeks, not minutes. The bisglycinate RCT assessed four weeks (PMID 40918053), and a 2026 trial of L-threonate followed adults for six weeks (PMID 41601871).',
    refs: [2, 4],
  },
  {
    question: 'Is it safe to take magnesium with antibiotics or osteoporosis medicine?',
    answer: 'Magnesium can reduce absorption of certain tetracycline and quinolone antibiotics and oral bisphosphonates. NIH says relevant antibiotics should be taken at least 2 hours before or 4–6 hours after magnesium; magnesium-rich supplements should be separated by at least 2 hours from oral bisphosphonates, with the medicine’s instructions taking priority.',
    refs: [9],
  },
  {
    question: 'Should someone with kidney disease take magnesium for sleep?',
    answer: 'Kidney impairment increases the risk of magnesium accumulation and toxicity, so a routine over-the-counter sleep experiment is not appropriate without professional review. The NIH Office of Dietary Supplements flags impaired kidney function as a major risk factor for high magnesium levels.',
    refs: [9],
  },
] as const

const REFS = [
  { n: 1, text: 'Lopresti AL, Smith SJ, Drummond PD. (2026). Systematic review of 12 adult sleep RCTs: low to very-low certainty; no routine insomnia-treatment support.', pmid: '42661485', url: 'https://pubmed.ncbi.nlm.nih.gov/42661485/' },
  { n: 2, text: 'Schuster J, et al. (2025). Magnesium bisglycinate, 155 adults, 250 mg elemental per day, four weeks: small ISI difference.', pmid: '40918053', url: 'https://pubmed.ncbi.nlm.nih.gov/40918053/' },
  { n: 3, text: 'Hausenblas HA, et al. (2024). Magnesium L-threonate, 80 adults, 1 g compound per day, 21 days; selected positive sleep outcomes.', pmid: '39252819', url: 'https://pubmed.ncbi.nlm.nih.gov/39252819/' },
  { n: 4, text: 'Lopresti AL, Smith SJ. (2026). Magnesium L-threonate, 100 adults, 2 g compound per day, six weeks; subjective signals, objective sleep null.', pmid: '41601871', url: 'https://pubmed.ncbi.nlm.nih.gov/41601871/' },
  { n: 5, text: 'Lindberg JS, et al. (1990). Magnesium citrate versus oxide: small human absorption comparison.', pmid: '2407766', url: 'https://pubmed.ncbi.nlm.nih.gov/2407766/' },
  { n: 6, text: 'Walker AF, et al. (2003). Magnesium citrate versus oxide and amino-acid chelate in a 60-day human bioavailability study.', pmid: '14596323', url: 'https://pubmed.ncbi.nlm.nih.gov/14596323/' },
  { n: 7, text: 'Firoz M, Graber M. (2001). Comparative magnesium preparations: low fractional oxide absorption in a small volunteer sample.', pmid: '11794633', url: 'https://pubmed.ncbi.nlm.nih.gov/11794633/' },
  { n: 8, text: 'Schuchardt JP, Hahn A. (2017). Intestinal absorption and factors influencing magnesium bioavailability: an update.', pmid: '29123461', url: 'https://pubmed.ncbi.nlm.nih.gov/29123461/' },
  { n: 9, text: 'NIH Office of Dietary Supplements. Magnesium: Fact Sheet for Health Professionals. Elemental label meaning, UL, diarrhea, renal risk and medication spacing.', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
  { n: 10, text: 'Abbasi B, et al. (2012). Magnesium oxide in 46 older adults with primary insomnia, eight weeks; small, high-dose trial.', pmid: '23853635', url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
  { n: 11, text: 'Mah J, Pitre T. (2021). Meta-analysis of three insomnia trials in older adults: sleep-onset estimate ~17 minutes, low/very-low certainty.', pmid: '33865376', url: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
] as const

function Cites({ refs }: { refs: readonly number[] }) {
  return <span className="whitespace-nowrap text-xs font-semibold text-brand-800">{refs.map((n) => (
    <a key={n} href={'#ref-' + n} className="ml-1 underline underline-offset-2" aria-label={'Go to reference ' + n}>[{n}]</a>
  ))}</span>
}

function searchUrl(query: string) {
  return 'https://www.amazon.com/s?k=' + encodeURIComponent(query) + '&tag=' + encodeURIComponent(AFFILIATE_TAGS.amazon)
}

export default function MagnesiumFormsForSleepBuyingGuide() {
  // No direct product ASIN is admitted without an explicitly HIGH-confidence
  // verification ledger row. Only generic form searches are permitted here.
  // This fail-closed guard follows existing configured-catalog safety holds.
  const allowSearchLinks = canRenderConfiguredRevenueProducts('magnesium')

  return (
    <ArticleLayout toc={<TableOfContents headings={HEADINGS} />} zone="supplement">
      <StructuredData
        pageUrl={SITE_URL + PATH}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished={REVIEWED}
        dateModified={REVIEWED}
        faqs={FAQS.map(({ question, answer }) => ({ question, answer }))}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sleep guides', href: '/guides/sleep/' },
          { label: 'Magnesium forms for sleep', href: PATH },
        ]}
        zone="monetized"
      />

      <div className="space-y-9">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-9">
          <p className="eyebrow-label">Sleep / Buying decisions · Evidence checked October 13, 2026</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">Best Magnesium for Sleep? Six Forms Compared</h1>
          <p className="mt-4 text-base leading-8 text-muted">
            The best option is not necessarily the most expensive magnesium. Compare what you actually get per serving,
            which forms have real human sleep trials, what might upset your stomach, and when a supplement is unlikely to help.
            This is a comparison of forms, <strong>not</strong> an endorsement of unverified products.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-brand-800">
            <Link href="/guides/sleep/best-magnesium-for-sleep/" className="underline underline-offset-4">Existing magnesium sleep overview</Link>
            <Link href="/guides/sleep/magnesium-types-for-sleep/" className="underline underline-offset-4">Magnesium types evidence guide</Link>
          </div>
        </header>

        <AffiliateDisclosure />

        <section id="quick-answer" className="card-premium p-5 sm:p-7" data-answer-engine-summary="true" data-evidence="true">
          <h2 className="text-2xl font-semibold text-ink">Quick answer: what would we compare first?</h2>
          <p className="mt-3 leading-7 text-muted" data-claim="true">
            <strong>Glycinate / bisglycinate is a reasonable sleep-first starting point</strong> if you prioritize lower GI disruption,
            but its one direct trial found only a small benefit. <strong>Citrate</strong> makes sense when price and stool-softening
            matter more than a direct sleep study. <strong>L-threonate</strong> costs more and has mixed sleep results.
            <strong> Oxide</strong> is cheap and has an older small insomnia trial, but generally poorer fractional absorption.
            The 2026 review found that overall magnesium evidence for sleep remains low to very-low certainty. <Cites refs={[1, 2, 3, 4, 7, 10]} />
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">No form has proved superior to every other form in a direct, sufficiently powered sleep head-to-head trial.</p>
        </section>

        <section id="comparison-table" className="card-premium p-5 sm:p-7">
          <h2 className="text-2xl font-semibold text-ink">Six-form magnesium comparison table</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Elemental amounts are <strong>illustrative product-label serving ranges, not standardized doses or instructions</strong>.
            Formulations vary, particularly buffered blends. $ = usually lower-cost; $$$ = usually premium.
            These are relative price tiers, not live retailer prices or verified price quotes.
          </p>
          <ResponsiveTable label="Six magnesium forms compared for sleep" className="mt-4">
            <table className="w-full min-w-[740px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/15 text-xs uppercase tracking-wider text-ink">
                  <th scope="col" className="py-3 pr-3">Form</th>
                  <th scope="col" className="py-3 pr-3">Elemental Mg / typical label serving</th>
                  <th scope="col" className="py-3 pr-3">Direct sleep evidence</th>
                  <th scope="col" className="py-3 pr-3">GI tolerance</th>
                  <th scope="col" className="py-3">Typical price tier</th>
                </tr>
              </thead>
              <tbody>
                {FORMS.map((form) => (
                  <tr key={form.name} className="border-b border-brand-900/10 align-top text-muted last:border-0">
                    <th scope="row" className="py-3 pr-3 font-semibold text-ink">{form.name}</th>
                    <td className="py-3 pr-3">{form.amount}</td>
                    <td className="py-3 pr-3">{form.evidence}</td>
                    <td className="py-3 pr-3">{form.gi}</td>
                    <td className="py-3 font-semibold">{form.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
          <p className="mt-3 text-xs leading-6 text-muted">
            The Supplement Facts <strong>“Magnesium”</strong> number is elemental magnesium; the front-label salt weight is not.
            A product listing 2,000 mg of L-threonate compound is not providing 2,000 mg of elemental magnesium.
            Absorption and GI rankings are qualified below. <Cites refs={[8, 9]} />
          </p>
        </section>

        <section id="how-we-compare" className="card-premium p-5 sm:p-7">
          <h2 className="text-2xl font-semibold text-ink">How we compare: evidence first, brand second</h2>
          <p className="mt-3 leading-7 text-muted">
            We weigh (1) direct, form-specific human sleep outcomes; (2) size, duration and consistency of those trials;
            (3) elemental magnesium on the label; (4) GI tolerance and medication safety; and (5) cost per elemental serving.
            An absorption comparison is <strong>not</strong> a sleep trial. Most bioavailability research uses small samples,
            urinary excretion or other indirect proxies; no credible all-form percentage leaderboard exists. <Cites refs={[5, 6, 7, 8]} />
          </p>
          <p className="mt-3 leading-7 text-muted">
            The broadest recent review (PMID 42661485) examined 12 main adult sleep RCTs and found inconsistent outcomes
            with low to very-low certainty, not evidence that supplements routinely treat insomnia. An older three-trial
            review estimated about 17 fewer minutes to fall asleep in older adults, but rated the result low/very-low certainty
            and did not find a reliable total-sleep-time improvement. <Cites refs={[1, 11]} />
          </p>
        </section>

        <section id="form-by-form" className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">What each magnesium form actually offers</h2>
          {FORMS.map((form) => (
            <article key={form.name} className="card-premium p-5 sm:p-7">
              <h3 className="text-xl font-semibold text-ink">{form.name}</h3>
              <p className="mt-2 text-sm font-semibold text-brand-800">Typical label: {form.amount} elemental · {form.price} · {form.gi}</p>
              <p className="mt-3 leading-7 text-muted"><strong>Absorption:</strong> {form.absorption}</p>
              <p className="mt-3 leading-7 text-muted"><strong>Sleep studies:</strong> {form.trial} <Cites refs={form.refs} /></p>
              <p className="mt-3 leading-7 text-muted"><strong>Who it suits:</strong> {form.fit}</p>
            </article>
          ))}
        </section>

        <section id="decision-guide" className="card-premium p-5 sm:p-7">
          <h2 className="text-2xl font-semibold text-ink">If this matters to you, compare this form first</h2>
          <ul className="mt-4 space-y-3 leading-7 text-muted">
            <li><strong>Sensitive stomach or frequent loose stools:</strong> compare a clearly labeled glycinate first, while recognizing that “gentle” is a tendency, not a form-specific guarantee.</li>
            <li><strong>Constipation and lower price matter too:</strong> compare citrate; stool-softening is a tradeoff, not proof of better sleep.</li>
            <li><strong>Brain fog / cognitive marketing catches your attention:</strong> read both L-threonate trials before paying a premium. Neither proves treatment for brain fog or superior deep sleep. <Cites refs={[3, 4]} /></li>
            <li><strong>Budget comes first:</strong> compare citrate with oxide on <em>elemental milligrams and tolerance</em>, not the bold number on the front. Oxide often supplies more elemental magnesium per gram but is less efficiently absorbed in small studies. <Cites refs={[5, 7]} /></li>
            <li><strong>Already happy with malate or taurate:</strong> no sound sleep-evidence reason to switch solely because of a new label claim.</li>
            <li><strong>Possible inadequate dietary magnesium:</strong> review your intake and food sources before assuming a particular form fixes sleep. Magnesium needs differ by age, sex and diet. <Cites refs={[9]} /></li>
          </ul>
        </section>

        <section id="shop" className="card-premium p-5 sm:p-7">
          <h2 className="text-2xl font-semibold text-ink">Compare labels before buying</h2>
          <p className="mt-3 leading-7 text-muted">
            <strong>No direct ASIN-backed product pick is approved for this page.</strong> The current catalog has magnesium listings,
            but this page requires an explicit HIGH-confidence, exact-variant verification record before recommending any specific product.
            We will not turn a provisional brand or candidate ASIN into a “top pick.”
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Look for the form stated in full, elemental magnesium per serving, serving size, other magnesium salts in the formula,
            independent quality documentation where available, and total cost per 100 mg elemental magnesium. Do not confuse
            a manufacturer’s absorption slogan with human sleep evidence.
          </p>
          {allowSearchLinks ? (
            <div className="mt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Generic Amazon form searches · affiliate links · no products endorsed</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Browse glycinate labels', query: 'magnesium bisglycinate elemental magnesium' },
                  { label: 'Browse citrate labels', query: 'magnesium citrate elemental magnesium' },
                  { label: 'Browse L-threonate labels', query: 'magnesium l threonate elemental magnesium' },
                ].map(({ label, query }) => (
                  <a
                    key={label}
                    href={searchUrl(query)}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    data-ingredient="magnesium"
                    data-product-slot="search-only"
                    data-tracking-location="magnesium-forms-sleep-buying-guide"
                    className="inline-flex min-h-11 items-center rounded-full border border-brand-900/20 bg-white px-4 py-2 text-sm font-bold text-brand-800 hover:border-brand-700 hover:bg-brand-50"
                  >
                    {label} ↗
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Shopping links are currently withheld under catalog safety governance.</p>
          )}
          <p className="mt-4 text-xs leading-6 text-muted">Search results, sellers, prices and availability change; these links do not certify or recommend any product shown by Amazon.</p>
        </section>

        <section id="wont-do" className="card-premium p-5 sm:p-7">
          <h2 className="text-2xl font-semibold text-ink">What magnesium will not do</h2>
          <p className="mt-3 leading-7 text-muted">
            Magnesium is <strong>not a sleeping pill</strong>. There is no strong evidence it reliably makes a well-nourished
            person fall asleep the same night, increases deep sleep across all devices, or cures chronic insomnia. Where benefits
            were reported, they were modest, variable and generally measured over <strong>days to weeks</strong>.
            The best recent systematic review does not support routine insomnia treatment with oral magnesium. <Cites refs={[1, 2, 3, 4]} />
          </p>
          <p className="mt-3 leading-7 text-muted">
            Sleep timing problems, sleep apnea, persistent insomnia, and medication-related sleep disruption do not turn into
            magnesium-deficiency problems just because an ad says “relax.” For a different evidence track, compare{' '}
            <Link href="/articles/cbt-i-vs-sleep-supplements/" className="font-semibold text-brand-800 underline underline-offset-4">CBT-I versus sleep supplements</Link>.
          </p>
        </section>

        <section id="safety" className="card-premium p-5 sm:p-7">
          <h2 className="text-2xl font-semibold text-ink">Safety: the numbers that matter</h2>
          <ul className="mt-4 space-y-3 leading-7 text-muted">
            <li><strong>350 mg/day is the U.S. adult upper limit from supplements and magnesium-containing medicines</strong> (including some antacids/laxatives), <em>not</em> from ordinary food. It is a safety ceiling for otherwise healthy adults, not a recommended sleep dose. Clinical-trial doses above it should not be copied. <Cites refs={[9, 10]} /></li>
            <li><strong>Diarrhea, nausea and cramps:</strong> unabsorbed magnesium can have a laxative effect, even if the bottle says “gentle.” Dose, formulation and individual tolerance matter. <Cites refs={[9]} /></li>
            <li><strong>Kidney impairment:</strong> reduced clearance raises the risk of magnesium toxicity. Kidney disease calls for professional review rather than routine self-experimentation. <Cites refs={[9]} /></li>
            <li><strong>Some antibiotics:</strong> tetracyclines and quinolones can bind magnesium. NIH guidance: take the antibiotic at least <strong>2 hours before</strong> or <strong>4–6 hours after</strong> magnesium; follow the specific prescription directions. <Cites refs={[9]} /></li>
            <li><strong>Oral bisphosphonates:</strong> magnesium reduces absorption; separate by at least <strong>2 hours</strong> under NIH guidance, while honoring stricter drug-specific fasting instructions. <Cites refs={[9]} /></li>
          </ul>
          <p className="mt-4 text-sm leading-7 text-muted">This is general research and label-literacy information, not personalized medical advice or a recommendation to treat insomnia. <Link href="/info/disclaimer/" className="font-semibold text-brand-800 underline">Read the site's educational disclaimer</Link>.</p>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Common questions, answered with evidence</h2>
          {FAQS.map(({ question, answer, refs }) => (
            <section key={question} className="card-premium p-5 sm:p-7" data-answer-engine-summary="true">
              <h2 className="text-xl font-semibold text-ink">{question}</h2>
              <p className="mt-3 leading-7 text-muted" data-claim="true">{answer} <Cites refs={refs} /></p>
            </section>
          ))}
        </section>

        <div className="flex flex-wrap gap-4 text-sm font-semibold text-brand-800">
          <Link href="/guides/sleep/" className="underline underline-offset-4">All sleep research →</Link>
          <Link href="/guides/other/magnesium-types-guide/" className="underline underline-offset-4">Magnesium absorption guide →</Link>
          <Link href="/articles/magnesium-glycinate/" className="underline underline-offset-4">Glycinate trial deep dive →</Link>
          <Link href="/info/affiliate-disclosure/" className="underline underline-offset-4">Affiliate editorial policy →</Link>
        </div>

        <References refs={REFS.map((ref) => ({ ...ref, text: ref.text }))} />
      </div>
    </ArticleLayout>
  )
}
