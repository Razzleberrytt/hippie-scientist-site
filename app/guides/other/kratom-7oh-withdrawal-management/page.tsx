import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = buildPageMetadata({
  title: '7-OH Withdrawal: 2026 Evidence & Kratom Differences',
  description:
    'Updated 2026 review of concentrated 7-hydroxymitragynine withdrawal: new clinical cases, kratom-vs-7-OH chemistry, product-label data, FDA status, DEA scheduling process, and when medical care matters.',
  path: '/guides/other/kratom-7oh-withdrawal-management/',
})

const HEADINGS: Heading[] = [
  { id: 'research-brief', text: 'Research Brief', level: 2 },
  { id: 'what-changed', text: 'What Changed in 2025–2026', level: 2 },
  { id: 'not-kratom-leaf', text: 'Concentrated 7-OH Is Not Kratom Leaf', level: 2 },
  { id: 'withdrawal-evidence', text: 'What Withdrawal Evidence Shows', level: 2 },
  { id: 'treatment-evidence', text: 'Treatment Evidence: Early, Not Standardized', level: 2 },
  { id: 'product-quality', text: 'Product Chemistry and Label Accuracy', level: 2 },
  { id: 'regulatory', text: 'Federal Regulatory Snapshot', level: 2 },
  { id: 'care', text: 'When Medical Care Matters', level: 2 },
  { id: 'gaps', text: 'Unanswered-Question Ledger', level: 2 },
  { id: 'faq', text: 'Frequently Asked Questions', level: 2 },
  { id: 'references', text: 'References', level: 2 },
]

const FAQS = [
  {
    question: 'Are concentrated 7-OH products the same thing as kratom leaf?',
    answer:
      'No. Natural kratom leaf contains 7-hydroxymitragynine only at trace levels. Modern concentrated or semi-synthetic 7-OH products can deliver a materially different opioid exposure, and recent chemical analyses show that many 7-OH-labeled products are not chemically representative of botanical kratom.',
  },
  {
    question: 'Is there a proven at-home 7-OH withdrawal taper?',
    answer:
      'No validated universal taper has been established. The direct clinical literature is still dominated by case reports and small case series, while commercial products vary in chemistry and labeled versus measured content. Individual medical assessment is safer than copying a percentage schedule from the internet.',
  },
  {
    question: 'Can buprenorphine be used for problematic 7-OH use or withdrawal?',
    answer:
      'Clinician-managed buprenorphine has been reported in several 7-OH cases and a 2026 nine-patient case series, but that evidence does not establish one standardized initiation or dosing protocol. It is prescription treatment that requires individual clinical assessment.',
  },
  {
    question: 'Is 7-OH federally Schedule I right now?',
    answer:
      'The federal status is changing quickly. DEA published a July 6, 2026 notice of intent to temporarily schedule 7-OH above a specified threshold, with a separate notice for three related synthetic substances. That notice states control begins only when a temporary scheduling order is published. This page records the status located in our August 15, 2026 regulatory review and should not be used as legal advice.',
  },
  {
    question: 'When should someone seek urgent medical care during suspected 7-OH withdrawal?',
    answer:
      'Urgent evaluation is appropriate for severe confusion or agitation, seizure, trouble breathing, chest pain, fainting, inability to keep fluids down with signs of dehydration, suicidal thoughts, or rapidly worsening symptoms—especially with pregnancy, serious medical illness, or use of other opioids, alcohol, benzodiazepines, or sedatives.',
  },
] as const

const REFS = [
  {
    n: 1,
    text: 'FDA. Products Containing 7-OH Can Cause Serious Harm. Current consumer safety communication, accessed August 15, 2026.',
    url: 'https://www.fda.gov/consumers/consumer-updates/products-containing-7-oh-can-cause-serious-harm',
  },
  {
    n: 2,
    text: 'FDA. Hiding in Plain Sight: 7-OH Products. Includes July 13, 2026 federal scheduling-process update.',
    url: 'https://www.fda.gov/news-events/public-health-focus/hiding-plain-sight-7-oh-products',
  },
  {
    n: 3,
    text: 'Drug Enforcement Administration. DEA to Temporarily Schedule 7-OH and Related Substances to Protect Public Safety. July 1, 2026.',
    url: 'https://www.dea.gov/press-releases/2026/07/01/dea-temporarily-schedule-7-oh-and-related-substances-protect-public',
  },
  {
    n: 4,
    text: 'HHS/OASH. Temporary Placement of 7-Hydroxymitragynine Above a Specified Threshold in Schedule I; Request for Information. Federal Register 91 FR 41049, July 6, 2026.',
    url: 'https://www.federalregister.gov/documents/2026/07/06/2026-13608/temporary-placement-of-7-hydroxymitragynine-above-a-specified-threshold-in-schedule-i-request-for',
  },
  {
    n: 5,
    text: 'DEA. Schedules of Controlled Substance: Temporary Placement of 7-Hydroxymitragynine Above a Specified Threshold in Schedule I. Notice of intent, Federal Register 91 FR 40917, July 6, 2026.',
    url: 'https://www.federalregister.gov/documents/2026/07/06/2026-13580/schedules-of-controlled-substance-temporary-placement-of-7-hydroxymitragynine-above-a-specified',
  },
  {
    n: 6,
    text: 'Lybik N, Cone B, Skelton S, Elfessi Z. Management of acute withdrawal from 7-hydroxymitragynine after high-dose chronic use: A case report. J Am Pharm Assoc. 2026;66(3):103047. PMID 41690384.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41690384/',
    pmid: '41690384',
    doi: '10.1016/j.japh.2026.103047',
  },
  {
    n: 7,
    text: 'Fenske E, Williams B, Hallock-Koppelman L, Buchheit BM. Buprenorphine for the Management of 7-Hydroxymitragynine (7-OH) Use: A Retrospective Case Series. J Addict Med. 2026. PMID 42225057.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42225057/',
    pmid: '42225057',
    doi: '10.1097/ADM.0000000000001723',
  },
  {
    n: 8,
    text: 'Hendler R, Karavolis Z, Kim J, Gonzalez G. A Case of 7-Hydroxymitragynine Use Disorder Treated With Buprenorphine. J Addict Med. 2026. PMID 41875249.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41875249/',
    pmid: '41875249',
    doi: '10.1097/ADM.0000000000001685',
  },
  {
    n: 9,
    text: 'Wightman RS, Hu D. A Case of 7-OH Mitragynine Use Requiring Inpatient Medically Managed Withdrawal. J Addict Med. 2025. PMID 40758956.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40758956/',
    pmid: '40758956',
    doi: '10.1097/ADM.0000000000001558',
  },
  {
    n: 10,
    text: 'Sharma A, Nair BS, Pemminati S. 7-Hydroxymitragynine and Nicotine Pouch Withdrawal Syndrome: A Case Report. Cureus. 2025;17:e98386. PMID 41487756.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41487756/',
    pmid: '41487756',
    doi: '10.7759/cureus.98386',
  },
  {
    n: 11,
    text: 'Substance Use Disorder Following Consumption of a Novel Synthetic 7-Hydroxymitragynine Product. J Addict Med. 2025. PMID 41189061.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41189061/',
    pmid: '41189061',
    doi: '10.1097/ADM.0000000000001603',
  },
  {
    n: 12,
    text: 'Quantitative analysis of 7-hydroxymitragynine in commercial kratom products and its stability under chemical and physiological conditions. Phytochemistry. 2026. PMID 41825819.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41825819/',
    pmid: '41825819',
    doi: '10.1016/j.phytochem.2026.114871',
  },
  {
    n: 13,
    text: 'Elevated 7-Hydroxymitragynine Levels Found in Products Misbranded as Kratom. 2025. PMID 41065466.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41065466/',
    pmid: '41065466',
  },
  {
    n: 14,
    text: 'De facto opioids: Characterization of novel 7-hydroxymitragynine and mitragynine pseudoindoxyl product marketing. 2025. PMID 40373645.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40373645/',
    pmid: '40373645',
  },
  {
    n: 15,
    text: 'Hiranita T, et al. In vitro and in vivo pharmacology of kratom. Adv Pharmacol. 2022;93:35-76. PMID 35341571.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35341571/',
    pmid: '35341571',
  },
  {
    n: 16,
    text: 'FDA. FDA Issues Warning Letters to Firms Marketing Products Containing 7-Hydroxymitragynine. July 15, 2025.',
    url: 'https://www.fda.gov/news-events/press-announcements/fda-issues-warning-letters-firms-marketing-products-containing-7-hydroxymitragynine',
  },
  {
    n: 17,
    text: 'FDA. FDA Seizes 7-OH Opioids to Protect American Consumers. December 2, 2025.',
    url: 'https://www.fda.gov/news-events/press-announcements/fda-seizes-7-oh-opioids-protect-american-consumers',
  },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityJsonLd
          title="7-OH Withdrawal: 2026 Evidence & Kratom Differences"
          description="Current evidence review of concentrated 7-hydroxymitragynine withdrawal, emerging treatment literature, product chemistry, FDA actions, and the 2026 DEA scheduling process."
          url="https://thehippiescientist.net/guides/other/kratom-7oh-withdrawal-management/"
          type="MedicalWebPage"
          breadcrumbs={[
            { name: 'Home', url: 'https://thehippiescientist.net/' },
            { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
            { name: '7-OH Withdrawal', url: 'https://thehippiescientist.net/guides/other/kratom-7oh-withdrawal-management/' },
          ]}
          faqItems={[...FAQS]}
          citationUrls={REFS.map(reference => reference.url)}
        />

        <AuthorityBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides' },
            { label: '7-OH Withdrawal' },
          ]}
        />

        <header className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Emerging opioid safety · Literature checked August 15, 2026</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            7-OH Withdrawal: What the 2026 Evidence Actually Shows
          </h1>
          <p className="detail-reading mt-4 max-w-3xl text-muted">
            Concentrated 7-hydroxymitragynine is increasingly sold under kratom-adjacent branding, but the exposure is not equivalent to traditional kratom leaf. This review tracks the new clinical withdrawal literature, product chemistry, FDA actions, and the still-changing federal scheduling process without inventing a universal taper or withdrawal clock.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">17-source ledger</span>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">2026 clinical cases included</span>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">Regulatory status dated</span>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">No DIY taper protocol</span>
          </div>
        </header>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Medical and legal scope</p>
          <p className="mt-2">
            This is harm-reduction education, not a withdrawal plan, diagnosis, or legal opinion. Product chemistry, co-use, dependence severity, pregnancy, medical illness, and mental-health status can change risk substantially. Federal and state rules are changing quickly; verify current law rather than relying on a cached article.
          </p>
        </section>

        <AffiliateDisclosure />

        <section id="research-brief" className="scroll-mt-20 prose-section space-y-5">
          <p className="section-label">Research brief</p>
          <h2 className="text-2xl font-semibold text-ink">The answer changed in 2026</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Direct evidence</p>
              <p className="mt-2 text-sm text-muted">
                Direct 7-OH withdrawal evidence now includes multiple published cases plus a 2026 retrospective series of nine patients treated for problematic purified 7-OH use [6–11].
              </p>
            </div>
            <div className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Product reality</p>
              <p className="mt-2 text-sm text-muted">
                A 2026 chemical analysis found major label inconsistencies and evidence that more than 98% of analyzed 7-OH-labeled products had a semi-synthetic origin [12].
              </p>
            </div>
            <div className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Regulation</p>
              <p className="mt-2 text-sm text-muted">
                DEA began a temporary Schedule I process in July 2026 for 7-OH above a proposed threshold and separately for three related synthetic substances [2–5].
              </p>
            </div>
          </div>
          <p className="text-muted leading-relaxed">
            The evidence is moving from “kratom case reports might be relevant” toward a distinct 7-OH literature. That is useful progress, but it is still too early to justify a universal at-home taper, a precise withdrawal timeline, or one medication protocol.
          </p>
        </section>

        <section id="what-changed" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">What changed in 2025–2026</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Development</th>
                  <th className="p-3">Why it matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3 font-semibold text-ink">2025</td><td className="p-3">FDA warning letters and later seizure action targeted concentrated 7-OH products [16,17].</td><td className="p-3">7-OH added to foods or sold as a dietary-supplement ingredient is not being treated by FDA as ordinary lawful kratom supplementation.</td></tr>
                <tr><td className="p-3 font-semibold text-ink">2025</td><td className="p-3">Clinical reports documented 7-OH use disorder, medically managed withdrawal, and severe polysubstance withdrawal presentations [9–11].</td><td className="p-3">The safety signal is no longer extrapolated only from botanical kratom.</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Feb–Jun 2026</td><td className="p-3">A direct acute-withdrawal case and a nine-patient buprenorphine case series were published [6,7].</td><td className="p-3">Clinicians now have early 7-OH-specific treatment observations, although not randomized evidence.</td></tr>
                <tr><td className="p-3 font-semibold text-ink">2026</td><td className="p-3">Chemical surveillance found mislabeled concentrations and semi-synthetic signatures in commercial products [12,13].</td><td className="p-3">The number on a package may be an unreliable proxy for exposure.</td></tr>
                <tr><td className="p-3 font-semibold text-ink">July 2026</td><td className="p-3">DEA published notices of intent for elevated 7-OH and three related synthetic compounds [3–5].</td><td className="p-3">Federal control is in an active, rapidly changing process and must be dated precisely.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="not-kratom-leaf" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Concentrated 7-OH is not the same exposure as kratom leaf</h2>
          <p className="text-muted leading-relaxed">
            Kratom leaf is chemically complex and contains mitragynine as a major alkaloid; 7-OH is present only at trace levels and can also be formed from mitragynine through metabolism or oxidation [12,15]. Modern 7-OH products may instead contain enriched or semi-synthetic 7-OH at concentrations far outside the botanical profile.
          </p>
          <p className="text-muted leading-relaxed">
            That distinction is not semantic. A 2025 analysis of products labeled as “kratom extracts” found 7-OH concentrations of 22–75 mg/g, relatively little mitragynine, missing major botanical alkaloids, and chromatographic profiles inconsistent with kratom leaf [13]. A separate 2026 analysis reported that more than 98% of 7-OH-labeled products examined showed evidence of semi-synthetic origin and found substantial discrepancies between some label claims and measured 7-OH [12].
          </p>
          <div className="rounded-2xl border border-amber-800/15 bg-amber-50 p-5 text-sm text-amber-950">
            <p className="font-semibold">Competitor trap: “kratom withdrawal” and “7-OH withdrawal” are not interchangeable evidence labels.</p>
            <p className="mt-2">Kratom literature can provide context, but direct 7-OH data should be identified separately so readers can see where evidence is specific versus extrapolated.</p>
          </div>
        </section>

        <section id="withdrawal-evidence" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">What direct withdrawal evidence shows</h2>
          <p className="text-muted leading-relaxed">
            The direct literature is small, but the pattern is increasingly consistent with opioid-like physical dependence and withdrawal. Published reports describe gastrointestinal symptoms, restlessness, anxiety, sweating or clamminess, chills, body aches, insomnia, craving, and other opioid-withdrawal-type features after stopping concentrated 7-OH [6,8–11]. FDA’s consumer safety communication also lists addiction and withdrawal among reported harms [1].
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">What we can say</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                <li>Repeated concentrated 7-OH use can be associated with tolerance, dependence, use disorder, and opioid-like withdrawal.</li>
                <li>Some cases required emergency, inpatient, residential, or addiction-medicine care.</li>
                <li>Symptoms and severity varied substantially across reports.</li>
              </ul>
            </div>
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">What we cannot responsibly say</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                <li>That withdrawal always starts at one exact hour after the last dose.</li>
                <li>That one milligram exposure predicts a particular severity.</li>
                <li>That all products have equivalent pharmacokinetics or label accuracy.</li>
                <li>That a single percentage-based taper is validated.</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-muted">
            A 2025 case involving both concentrated 7-OH and high-dose nicotine is especially important as a caution against over-attribution: the patient developed severe agitation, psychosis, and respiratory compromise, but two withdrawal syndromes and a polysubstance history complicated causal interpretation [10].
          </p>
        </section>

        <section id="treatment-evidence" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Treatment evidence: promising observations, not a standardized protocol</h2>
          <p className="text-muted leading-relaxed">
            The newest evidence concerns clinician-managed medication for opioid use disorder. A 2026 retrospective case series described nine patients with problematic purified 7-OH use treated in a low-barrier addiction-medicine setting; eight of nine successfully initiated and stabilized on buprenorphine, and eight reported symptom improvement at follow-up [7]. Other 2025–2026 reports also describe buprenorphine or other medically supervised opioid-withdrawal approaches [6,8,9,11].
          </p>
          <p className="text-muted leading-relaxed">
            Those reports are clinically useful but sit low on the evidence hierarchy. They do not establish one best medication, timing strategy, dose, treatment duration, or at-home induction method for every 7-OH user. One published polysubstance case described precipitated withdrawal after buprenorphine initiation, which underscores why a clinician should assess timing, co-use, and objective withdrawal rather than copying a regimen [10].
          </p>
          <div className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 text-sm text-muted">
            <p className="font-semibold text-ink">Practical evidence boundary</p>
            <p className="mt-2">The literature supports telling clinicians about 7-OH specifically—not merely “kratom”—and supports evaluation for opioid use disorder and evidence-based addiction care. It does not support publishing a DIY buprenorphine or methadone protocol.</p>
          </div>
        </section>

        <section id="product-quality" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Product chemistry and label accuracy are clinical variables</h2>
          <p className="text-muted leading-relaxed">
            A withdrawal history is only as good as the exposure history. Recent analytical studies show why “I took X mg according to the package” may not describe the true dose or even the true product chemistry [12,13].
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
            <li>The 2026 Phytochemistry analysis found substantial inconsistencies between claimed and measured 7-OH in several commercial products [12].</li>
            <li>More than 98% of analyzed 7-OH-labeled products in that study showed evidence consistent with semi-synthetic origin [12].</li>
            <li>A separate analysis found commercial products marketed as kratom extracts with unusually high 7-OH and chromatographic profiles inconsistent with authentic leaf [13].</li>
            <li>FDA has warned that concentrated 7-OH products may be unclearly or inaccurately labeled and are not approved for any medical use [1,16].</li>
          </ul>
          <p className="text-sm text-muted">
            For medical evaluation, preserve the package or clear photographs of the label and report the exact form—tablet, gummy, shot, powder, strip, or other formulation—plus other substances used. This is documentation, not a dosing recommendation.
          </p>
        </section>

        <section id="regulatory" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Federal regulatory snapshot — reviewed August 15, 2026</h2>
          <p className="text-muted leading-relaxed">
            FDA states that added or enhanced 7-OH is not lawful as a dietary-supplement ingredient or conventional-food ingredient and that there are no FDA-approved drugs containing 7-OH [1,16]. FDA issued warning letters in 2025 and later announced seizure of about 73,000 units of concentrated 7-OH products valued at roughly $1 million [16,17].
          </p>
          <p className="text-muted leading-relaxed">
            DEA’s July 6, 2026 notice of intent proposes temporary Schedule I control for 7-OH above a defined threshold. The proposed threshold includes botanical kratom above 0.050% 7-OH by dry weight and certain alternative/processed materials above 0.050% or above 1 mg of 7-OH per article [4,5]. The agencies explicitly said the action was designed not to capture ordinary botanical leaf with naturally occurring trace 7-OH [2–5].
          </p>
          <div className="rounded-2xl border border-sky-900/15 bg-sky-50 p-5 text-sm text-sky-950">
            <p className="font-semibold">Intent is not the same as an effective order.</p>
            <p className="mt-2">
              The July notice states that temporary control takes effect only when the scheduling order is published in the Federal Register and that the order would not be issued before August 5, 2026 [5]. In our August 15 regulatory search, we located the notice of intent but did not locate a later published temporary order. Because this can change at any time, verify the current DEA/Federal Register status before making legal decisions.
            </p>
          </div>
          <p className="text-sm text-muted">State and local restrictions can be different from federal status. This page deliberately does not publish a static “legal states” list that can become wrong between updates.</p>
        </section>

        <section id="care" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">When medical care matters</h2>
          <p className="text-muted leading-relaxed">
            Direct 7-OH reports range from outpatient addiction care to inpatient medically managed withdrawal and intensive care in a complicated polysubstance case [6–11]. Seek urgent evaluation for severe confusion or agitation, seizure, trouble breathing, chest pain, fainting, severe dehydration or inability to keep fluids down, suicidal thoughts, or rapidly worsening symptoms.
          </p>
          <p className="text-muted leading-relaxed">
            A lower threshold for professional assessment is reasonable with pregnancy, serious heart/liver/kidney disease, a history of opioid overdose, unstable mental health, or substantial co-use of alcohol, benzodiazepines, prescription/illicit opioids, gabapentinoids, or other sedating substances. Do not assume every symptom is “just withdrawal” when another medical problem or a second substance could be contributing.
          </p>
          <p className="text-sm text-muted">
            In the U.S., the federal treatment locator at <a href="https://findtreatment.gov/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 underline underline-offset-4">FindTreatment.gov</a> can help identify licensed substance-use treatment services. Immediate emergencies require local emergency services.
          </p>
        </section>

        <section id="gaps" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Unanswered-question ledger</h2>
          <p className="text-muted">These are the gaps that should stay labeled as gaps rather than being filled with forum anecdotes or kratom-leaf extrapolation:</p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>What is the typical withdrawal course for analytically confirmed concentrated 7-OH exposure across different formulations?</li>
            <li>How strongly do measured dose, frequency, duration, and route predict withdrawal severity?</li>
            <li>How often are commercial label claims inaccurate enough to change clinical risk?</li>
            <li>Which medication-for-opioid-use-disorder initiation strategy is safest and most effective specifically for 7-OH?</li>
            <li>What is the risk of precipitated withdrawal under different 7-OH pharmacokinetic conditions?</li>
            <li>How do synthetic derivatives such as mitragynine pseudoindoxyl and MGM-15 change the clinical picture when they are present in a product?</li>
            <li>What are the overdose and withdrawal risks when 7-OH is combined with alcohol, benzodiazepines, opioids, gabapentinoids, nicotine, or stimulants?</li>
            <li>What percentage of people using concentrated 7-OH develop clinically significant dependence or use disorder?</li>
            <li>How will the 2026 federal scheduling process alter product availability, substitution, treatment seeking, or exposure to illicit opioids?</li>
          </ol>
        </section>

        <section className="prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Evidence hierarchy</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink"><tr><th className="p-3">Claim</th><th className="p-3">Best current evidence</th><th className="p-3">Confidence</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3">Concentrated 7-OH can produce dependence/withdrawal</td><td className="p-3">Multiple direct cases + 2026 case series + opioid pharmacology</td><td className="p-3 font-semibold">Moderate, converging</td></tr>
                <tr><td className="p-3">Buprenorphine can be feasible in selected patients</td><td className="p-3">Nine-patient retrospective series + cases</td><td className="p-3 font-semibold">Preliminary</td></tr>
                <tr><td className="p-3">One universal taper/timeline exists</td><td className="p-3">No validating trial located</td><td className="p-3 font-semibold">Not established</td></tr>
                <tr><td className="p-3">Commercial 7-OH products equal botanical kratom</td><td className="p-3">Analytical chemistry contradicts this generalization</td><td className="p-3 font-semibold">Not supported</td></tr>
                <tr><td className="p-3">Labels always reflect actual exposure</td><td className="p-3">2025–2026 analytical studies show discrepancies</td><td className="p-3 font-semibold">Not supported</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 prose-section space-y-5">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          {FAQS.map(item => (
            <div key={item.question} className="border-t border-brand-900/10 pt-4">
              <h3 className="font-semibold text-ink">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-5 text-sm text-muted">
          <p className="font-semibold text-ink">Related evidence</p>
          <p className="mt-2">
            For the compound-level pharmacology rather than withdrawal management, see the <Link href="/compounds/7-hydroxymitragynine/" className="font-semibold text-brand-800 underline underline-offset-4">7-hydroxymitragynine evidence monograph</Link>. This guide intentionally keeps treatment advice conservative because the direct clinical evidence is still emerging.
          </p>
        </section>

        <References refs={REFS} />
      </div>
    </ArticleLayout>
  )
}
