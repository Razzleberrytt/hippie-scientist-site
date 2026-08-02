import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import SafetyBox from '@/components/SafetyBox'
import MechanismBox from '@/components/MechanismBox'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

// This is intentionally a harm-reduction guide, not a product recommendation.
// Kava's efficacy evidence is mixed and no preparation has been proven free of
// the rare but potentially severe liver-injury risk.

const SLUG = 'kava'
const ROUTE = `/guides/herbs/${SLUG}`
const PAGE_URL = `https://thehippiescientist.net${ROUTE}`
const TITLE = 'Kava for Anxiety: Evidence, Liver Risk & Extract Differences'
const DESCRIPTION =
  'A conservative review of kava for anxiety, including conflicting clinical trials, uncertain onset, liver-injury reports, extract differences, interactions, and harm reduction.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-08-01'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTE,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does kava actually work for anxiety?',
    answer:
      'Possibly, but the clinical evidence is mixed and product-specific. Older small trials and reviews found a modest short-term benefit in some participants. A 2013 six-week trial was positive, while a larger 2020 trial in 171 people with generalized anxiety disorder found no benefit over placebo. Kava should not be presented as a proven treatment or a replacement for established anxiety care.',
  },
  {
    question: 'Is kava comparable to a benzodiazepine?',
    answer:
      'The evidence does not support a broad equivalence claim. A few older, small studies used active comparators, but they do not establish that kava matches benzodiazepines for effectiveness, speed, reliability, or safety. Kava also has a distinct liver-injury concern and should not be used in place of prescribed medication without a prescriber’s guidance.',
  },
  {
    question: 'How quickly does kava work?',
    answer:
      'A 30–60 minute clinical onset has not been established. In a small pharmacokinetic study of one standardized capsule extract, several kavalactones reached peak blood concentrations in about 1–3 hours. That does not prove when anxiety relief begins, and the clinical trials evaluated repeated daily use over weeks rather than reliable relief from a single dose.',
  },
  {
    question: 'Are noble cultivars and water extracts safe for the liver?',
    answer:
      'They may avoid some proposed risk factors, but no preparation has been proven to eliminate or quantify the risk. Liver-injury reports have involved solvent extracts and water-prepared beverages. Cultivar, plant part, extraction, contamination, dose, duration, co-use, and individual susceptibility may all matter, but the evidence cannot support a “substantially safer” guarantee.',
  },
  {
    question: 'Can liver testing make kava use safe?',
    answer:
      'No monitoring schedule has been validated to prevent rare idiosyncratic liver injury. A clinician may recommend baseline or follow-up testing for an individual, but normal results do not guarantee safety. Stop using kava and seek prompt medical care for jaundice, dark urine, pale stools, persistent nausea, unusual fatigue, itching, or upper-right abdominal pain.',
  },
  {
    question: 'Who should avoid kava?',
    answer:
      'Avoid kava during pregnancy or breastfeeding, with liver disease, and with alcohol, benzodiazepines, opioids, sleep medicines, or other sedating substances. Anyone taking medication should check with a pharmacist or clinician first because interaction evidence is incomplete and products vary.',
  },
]

const SAFETY_NOTES = [
  {
    severity: 'warning' as const,
    text: 'Kava products have been linked to rare but sometimes severe liver injury, including acute liver failure, transplantation, and death. The true incidence is unknown, and causality is difficult to assess in some reports, but LiverTox classifies kava as a well-known cause of clinically apparent liver injury.',
  },
  {
    severity: 'warning' as const,
    text: 'Do not combine kava with alcohol, benzodiazepines, opioids, barbiturates, sleep medicines, or other sedating substances. Avoid driving or operating machinery after use.',
  },
  {
    severity: 'caution' as const,
    text: 'Laboratory studies suggest effects on several drug-metabolizing enzymes and transporters, but demonstrated human interactions are less certain than in-vitro findings imply. Check every medication with a pharmacist or clinician rather than relying on a generic CYP list.',
  },
  {
    severity: 'caution' as const,
    text: 'Avoid during pregnancy or breastfeeding and in anyone with liver disease. Long-term or heavy use can also cause a reversible dry, scaly skin condition known as kava dermopathy.',
  },
  {
    severity: 'info' as const,
    text: 'FDA’s 2020 toxicology memorandum addressed kava in conventional foods and concluded that indiscriminate use as a recreational or relaxation beverage is unsafe and that there is no basis to consider kava generally recognized as safe (GRAS) as a conventional-food ingredient.',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'GABA-A findings are preclinical',
    description:
      'Kavain can modulate recombinant GABA-A receptors in laboratory systems at a site distinct from the classical benzodiazepine site. This does not establish benzodiazepine-like clinical potency, preserved cognition, or lower dependence risk in people.',
  },
  {
    label: 'Other proposed targets',
    description:
      'Sodium-channel effects, monoamine oxidase inhibition, and neurotransmitter effects have largely been studied in vitro or in animals. They are mechanistic hypotheses, not proof of a specific anxiety outcome.',
  },
  {
    label: 'Human pharmacokinetics',
    description:
      'In ten healthy volunteers taking one flavokavain-free standardized capsule product, five kavalactones reached peak plasma concentrations in roughly 1–3 hours and food reduced absorption. These results cannot be generalized to traditional drinks, tinctures, or other extracts.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
  { id: 'evidence', text: 'What the Clinical Evidence Shows', level: 2 },
  { id: 'not-established', text: 'What Has Not Been Established', level: 2 },
  { id: 'mechanism', text: 'Mechanisms & Pharmacokinetics', level: 2 },
  { id: 'extracts', text: 'Cultivars, Extracts & Liver Risk', level: 2 },
  { id: 'dosing', text: 'Doses Studied Are Not a Recommendation', level: 2 },
  { id: 'safety', text: 'Safety & Harm Reduction', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
  { id: 'related', text: 'Related Reading', level: 2 },
]

const KAVA_REFS = [
  { n: 1, text: 'National Center for Complementary and Integrative Health. Kava: Usefulness and Safety.', url: 'https://www.nccih.nih.gov/health/kava' },
  { n: 2, text: 'Pittler MH, Ernst E. (2003). Kava extract for treating anxiety. Cochrane Database Syst Rev, (1): CD003383.', url: 'https://pubmed.ncbi.nlm.nih.gov/12535473/' },
  { n: 3, text: 'Sarris J, et al. (2013). Kava in the treatment of generalized anxiety disorder: a double-blind, randomized, placebo-controlled study. J Clin Psychopharmacol, 33(5): 643–648.', url: 'https://pubmed.ncbi.nlm.nih.gov/23635869/' },
  { n: 4, text: 'Sarris J, et al. (2013). Kava for generalized anxiety disorder: analysis of adverse reactions, liver function, addiction, and sexual effects. Phytother Res, 27(11): 1723–1728.', url: 'https://pubmed.ncbi.nlm.nih.gov/23348842/' },
  { n: 5, text: 'Smith K, Leiras C. (2018). The effectiveness and safety of Kava Kava for treating anxiety symptoms: a systematic review and analysis of randomized clinical trials. Complement Ther Clin Pract, 33: 107–117.', url: 'https://pubmed.ncbi.nlm.nih.gov/30396607/' },
  { n: 6, text: 'Sarris J, et al. (2020). Kava for generalised anxiety disorder: a 16-week double-blind, randomised, placebo-controlled study. Aust N Z J Psychiatry, 54(3): 288–297.', url: 'https://pubmed.ncbi.nlm.nih.gov/31813230/' },
  { n: 7, text: 'National Institute of Diabetes and Digestive and Kidney Diseases. Kava Kava. LiverTox.', url: 'https://www.ncbi.nlm.nih.gov/books/NBK548637/' },
  { n: 8, text: 'U.S. Food and Drug Administration. (2020). Scientific Memorandum: Review of the published literature pertaining to the safety of Kava for use in conventional foods.', url: 'https://www.fda.gov/media/169556/download' },
  { n: 9, text: 'Wang Y, et al. (2022). Clinical pharmacokinetics of kavalactones after oral dosing of standardized kava extract in healthy volunteers. J Ethnopharmacol, 297: 115514.', url: 'https://pubmed.ncbi.nlm.nih.gov/35777607/' },
  { n: 10, text: 'Chua HC, et al. (2016). Kavain, the major constituent of the anxiolytic kava extract, potentiates GABA-A receptors: functional characteristics and molecular mechanism. PLoS One, 11(6): e0157700.', url: 'https://pubmed.ncbi.nlm.nih.gov/27332705/' },
]

export default function KavaGuidePage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <StructuredData
        pageUrl={PAGE_URL}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished={DATE_PUBLISHED}
        dateModified={DATE_MODIFIED}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Herb Guides', href: '/guides/herbs/' },
          { label: 'Kava', href: `${ROUTE}/` },
        ]}
      />

      <div className="space-y-8">
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
            Evidence Review &amp; Harm Reduction
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
            Kava for Anxiety
          </h1>
          <p className="mt-1 text-base font-medium text-brand-700">
            Mixed clinical evidence, uncertain onset, and a rare but serious liver-injury risk
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            Kava (<em>Piper methysticum</em>) may reduce anxiety symptoms for some people, but the
            trials are inconsistent and the results apply to specific extracts—not every powder,
            drink, tincture, or capsule sold as kava. Reports of severe liver injury make this a
            safety-sensitive decision, not a routine supplement recommendation.
          </p>

          <figure className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/kava.jpg"
                alt="Dried kava root, kava powder, and a traditional serving cup"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Preparation and cultivar may matter, but no kava product has been proven free of liver risk.
            </figcaption>
          </figure>
        </section>

        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 p-5 text-sm leading-6 text-red-950">
          <p className="font-bold uppercase tracking-[0.12em] text-red-800">Important safety notice</p>
          <p className="mt-2">
            Kava products have been associated with rare cases of serious liver injury, including
            liver failure, transplantation, and death. Water extraction and “noble” cultivar labels
            do not guarantee safety. This guide is educational, does not endorse kava use, and cannot
            replace advice from a clinician or pharmacist. See the site’s{' '}
            <Link href="/info/disclaimer/" className="font-semibold underline">medical disclaimer</Link>.
          </p>
        </div>

        <section id="bottom-line" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom Line</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90">
            <table className="w-full min-w-[640px] text-left text-sm">
              <tbody className="divide-y divide-brand-900/10">
                <tr><th className="w-48 p-4 font-semibold text-ink">Anxiety evidence</th><td className="p-4 leading-6 text-muted">Limited and mixed. Some earlier trials were positive; the largest later GAD trial was negative.</td></tr>
                <tr><th className="p-4 font-semibold text-ink">Acute onset</th><td className="p-4 leading-6 text-muted">Not established. Peak blood concentration at 1–3 hours in one small study is not proof of symptom relief.</td></tr>
                <tr><th className="p-4 font-semibold text-ink">Sleep</th><td className="p-4 leading-6 text-muted">Insufficient direct evidence for primary insomnia or a predictable sleep benefit.</td></tr>
                <tr><th className="p-4 font-semibold text-ink">Dependence</th><td className="p-4 leading-6 text-muted">Not well characterized. Available trials are too small and short to prove “no dependence” or “zero tolerance.”</td></tr>
                <tr><th className="p-4 font-semibold text-ink">Main risk</th><td className="p-4 leading-6 text-muted">Rare, unpredictable, and potentially severe liver injury; sedation and product variability also matter.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="evidence" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Clinical Evidence Shows</h2>
          <p className="text-sm leading-6 text-muted">
            The most defensible reading is “possible short-term benefit, with meaningful uncertainty.”
            Reviews pool different extracts, doses, populations, and trial designs, so the result cannot
            be treated as a class effect for every kava product.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <EvidenceSummaryBox
              level="limited"
              outcome="Anxiety symptoms"
              takeaway="A Cochrane review found a small benefit, and a 2018 review found kava superior to placebo in only 3 of 7 placebo-controlled trials. The pooled responder result favored kava, but the evidence base was small and heterogeneous."
              citationCount={2}
            />
            <EvidenceSummaryBox
              level="limited"
              outcome="Diagnosed generalized anxiety disorder"
              takeaway="A six-week trial of 75 participants reported benefit. A later 16-week trial of 171 participants found no advantage over placebo, with remission numerically favoring placebo."
              citationCount={2}
            />
            <EvidenceSummaryBox
              level="limited"
              outcome="Single-dose or rapid relief"
              takeaway="The treatment trials measured repeated use over weeks. Human pharmacokinetic data do not establish a reliable 30–60 minute anxiolytic effect."
              citationCount={1}
            />
            <EvidenceSummaryBox
              level="limited"
              outcome="Sleep and long-term use"
              takeaway="Kava has not been established as a treatment for primary insomnia, and longer-term benefit, tolerance, dependence, and safety remain inadequately studied."
              citationCount={1}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink">
                <tr><th className="p-4">Evidence</th><th className="p-4">Result</th><th className="p-4">Why it does not settle the question</th></tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-4">2013 RCT, 75 participants</td><td className="p-4">Positive over six weeks</td><td className="p-4">Small trial of a particular aqueous root extract; short safety window</td></tr>
                <tr><td className="p-4">2018 systematic review</td><td className="p-4">3 of 7 placebo-controlled trials positive; pooled responders favored kava</td><td className="p-4">Different products and methods; limited trial count</td></tr>
                <tr><td className="p-4">2020 RCT, 171 participants</td><td className="p-4">No benefit for diagnosed GAD over 16 weeks</td><td className="p-4">One extract still cannot represent every preparation, but this is the largest later trial</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="not-established" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What Has Not Been Established</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            <li>Kava has not been shown to be broadly equivalent to benzodiazepines in effectiveness or safety.</li>
            <li>A predictable 30–60 minute anxiety benefit is not supported by the treatment trials.</li>
            <li>“Calm without cognitive impairment” is not established; the 2020 trial reported more memory complaints in the kava group.</li>
            <li>Short trials cannot prove that kava causes no tolerance, withdrawal, misuse, or dependence.</li>
            <li>No cultivar or extraction method has been proven to remove the liver-injury risk.</li>
          </ul>
        </section>

        <section id="mechanism" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Mechanisms &amp; Pharmacokinetics</h2>
          <MechanismBox
            summary="Kava contains several kavalactones, including kavain, dihydrokavain, methysticin, dihydromethysticin, yangonin, and desmethoxyyangonin. Laboratory findings can help explain biological plausibility, but they cannot be translated directly into speed, effectiveness, cognition, or dependence claims in people."
            points={MECHANISM_POINTS}
          />
        </section>

        <section id="extracts" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Cultivars, Extracts &amp; Liver Risk</h2>
          <p className="text-sm leading-6 text-muted">
            Root-only material, cultivar identity, and extraction quality are reasonable product-quality
            considerations. They are not a clinically validated safety system. NCCIH notes that undesirable
            cultivars, inappropriate plant parts, alcohol co-use, contamination, genetic susceptibility,
            dose, and duration have all been proposed as contributors. The cause of injury remains uncertain.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink"><tr><th className="p-4">Common claim</th><th className="p-4">Evidence-based interpretation</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-4 font-medium text-ink">“Water extraction is safe”</td><td className="p-4 leading-6">Water preparation may change the chemical profile, but liver injury has also been reported after aqueous products or beverages.</td></tr>
                <tr><td className="p-4 font-medium text-ink">“Noble kava prevents toxicity”</td><td className="p-4 leading-6">Cultivar choice is plausible as one risk variable; clinical data do not quantify the reduction or prove that risk is eliminated.</td></tr>
                <tr><td className="p-4 font-medium text-ink">“A normal six-week trial proves liver safety”</td><td className="p-4 leading-6">Small RCTs can miss rare events. In the 2020 trial, liver-test abnormalities were more frequent with kava even though no participant met criteria for herb-induced liver injury.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="dosing" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Doses Studied Are Not a Recommendation</h2>
          <p className="text-sm leading-6 text-muted">
            The two modern GAD trials used standardized aqueous root extracts delivering about 120–240 mg
            of kavalactones per day. One trial was positive and the larger trial was negative. Those amounts
            cannot be converted reliably into “shells,” grams of powder, tincture milliliters, or another
            brand’s capsules because chemical profiles and labeling vary. There is no evidence-based DIY
            escalation protocol and no proven dose that removes liver risk.
          </p>
        </section>

        <section id="safety" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety &amp; Harm Reduction</h2>
          <SafetyBox notes={SAFETY_NOTES} />
          <p className="text-sm leading-6 text-muted">
            If someone is already using kava, the lowest-risk next step is to show the exact product and
            medication list to a clinician or pharmacist. Seek prompt care for possible liver symptoms.
            Do not restart kava after suspected kava-related liver injury.
          </p>
        </section>

        <div id="faq" className="scroll-mt-20">
          <FAQAccordion faqs={FAQS} heading="Common Questions About Kava" />
        </div>

        <section id="related" className="scroll-mt-20 space-y-4">
          <h2 className="text-xl font-semibold text-ink">Related Reading</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/herbs/kava/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Herb profile</p>
              <p className="mt-1 text-sm font-semibold text-ink">Kava Monograph</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">Identity, compounds, evidence, and safety context.</p>
            </Link>
            <Link href="/guides/anxiety/natural-anxiety-relief/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
              <p className="mt-1 text-sm font-semibold text-ink">Natural Anxiety Relief</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">Compare supportive options without treating supplements as medication substitutes.</p>
            </Link>
            <Link href="/guides/compare/kava-vs-alcohol/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Comparison</p>
              <p className="mt-1 text-sm font-semibold text-ink">Kava vs Alcohol</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">A harm-reduction comparison—not a claim that either is risk-free.</p>
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm">
          <Link href="/guides/herbs/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">← Herb Guides</Link>
          <Link href="/guides/anxiety/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">Anxiety Guides →</Link>
        </div>
      </div>

      <References refs={KAVA_REFS} />
    </ArticleLayout>
  )
}
