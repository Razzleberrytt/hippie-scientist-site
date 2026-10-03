import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../lib/seo'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kratom & 7-OH Withdrawal and Recovery: 2026 Evidence Review',
  description:
    'Masterclass 2026 review of kratom and concentrated 7-hydroxymitragynine withdrawal and recovery: dependence, symptoms, timelines, treatment evidence, product chemistry, relapse risk, and current regulation.',
  path: '/guides/other/kratom-7oh-withdrawal-management/',
})

const HEADINGS: Heading[] = [
  { id: 'research-brief', text: 'Research Brief', level: 2 },
  { id: 'what-changed', text: 'What Changed in 2025–2026', level: 2 },
  { id: 'not-kratom-leaf', text: 'Concentrated 7-OH Is Not Kratom Leaf', level: 2 },
  { id: 'dependence-vs-kud', text: 'Dependence Is Not the Same as Kratom Use Disorder', level: 2 },
  { id: 'withdrawal-evidence', text: 'What Withdrawal Evidence Shows', level: 2 },
  { id: 'symptom-map', text: 'Withdrawal Symptom Map', level: 2 },
  { id: 'timeline', text: 'Timeline and Pharmacokinetics', level: 2 },
  { id: 'exposure-types', text: 'Leaf, Extracts, 7-OH and Related Products', level: 2 },
  { id: 'treatment-evidence', text: 'Treatment Evidence: Early, Not Standardized', level: 2 },
  { id: 'recovery', text: 'Recovery Beyond Acute Withdrawal', level: 2 },
  { id: 'polysubstance', text: 'Polysubstance and Product-Uncertainty Reality', level: 2 },
  { id: 'return-to-use', text: 'Return to Use, Tolerance and Overdose Risk', level: 2 },
  { id: 'special-populations', text: 'Special Populations', level: 2 },
  { id: 'product-quality', text: 'Product Chemistry and Label Accuracy', level: 2 },
  { id: 'regulatory', text: 'Federal Regulatory Snapshot', level: 2 },
  { id: 'care', text: 'When Medical Care Matters', level: 2 },
  { id: 'myths', text: 'Myths Versus Evidence', level: 2 },
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
      'The federal status now differs by substance. DEA temporarily placed mitragynine pseudoindoxyl, MGM-15, and MGM-16 into Schedule I effective August 26, 2026. The separate threshold-based process for 7-OH itself began with a July notice of intent; in our October 3, 2026 review, we located the later HHS comment-period extension but not a published temporary scheduling order for thresholded 7-OH. Verify current DEA/Federal Register status before making legal decisions.',
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
    text: 'FDA. Products Containing 7-OH Can Cause Serious Harm. Current consumer safety communication, accessed October 3, 2026.',
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
  {
    n: 18,
    text: 'Stanciu CN, Gnanasegaram SA, Ahmed S, Penders T. Kratom Withdrawal: A Systematic Review with Case Series. J Psychoactive Drugs. 2019. PMID 30614408.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30614408/',
    pmid: '30614408',
  },
  {
    n: 19,
    text: 'Singh D, Müller CP, Vicknasingam BK. Kratom (Mitragyna speciosa) dependence, withdrawal symptoms and craving in regular users. Drug Alcohol Depend. 2014;139:132-137. PMID 24698080.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24698080/',
    pmid: '24698080',
    doi: '10.1016/j.drugalcdep.2014.03.017',
  },
  {
    n: 20,
    text: 'Smith KE, Dunn KE, Rogers JM, Garcia-Romeu A, Strickland JC, Epstein DH. Assessment of Kratom Use Disorder and Withdrawal Among an Online Convenience Sample of US Adults. J Addict Med. 2022. PMID 35220331.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35220331/',
    pmid: '35220331',
    doi: '10.1097/ADM.0000000000000986',
  },
  {
    n: 21,
    text: 'Smith KE, Epstein DH, Weiss ST. Controversies in Assessment, Diagnosis, and Treatment of Kratom Use Disorder. Curr Psychiatry Rep. 2024;26:487-496. PMID 39134892.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39134892/',
    pmid: '39134892',
    doi: '10.1007/s11920-024-01524-1',
  },
  {
    n: 22,
    text: 'Broyan VR, Brar JK, Allgaier T, Allgaier JT. Long-term buprenorphine treatment for kratom use disorder: A case series. Subst Abus. 2022;43:763-766. PMID 35112990.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35112990/',
    pmid: '35112990',
    doi: '10.1080/08897077.2021.2010250',
  },
  {
    n: 23,
    text: 'Weiss ST, Douglas HE, Burns M, et al. Pharmacotherapy for Management of Kratom Use Disorder: A Systematic Literature Review With Survey of Experts. J Addict Med. 2021. PMID 33974767.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33974767/',
    pmid: '33974767',
  },
  {
    n: 24,
    text: 'Huestis MA, et al. Human Mitragynine and 7-Hydroxymitragynine Pharmacokinetics after Single and Multiple Daily Doses of Oral Encapsulated Dried Kratom Leaf Powder. Molecules. 2024. PMID 38474495.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38474495/',
    pmid: '38474495',
  },
  {
    n: 25,
    text: 'Mitragynine and 7-hydroxymitragynine plasma pharmacokinetics in humans after single and 15 multiple oral kratom extract doses. 2026. PMID 42266029.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42266029/',
    pmid: '42266029',
  },
  {
    n: 26,
    text: 'Kratom exposure cases reported to United States Poison Centers: 2016-July 2025. 2026. PMID 42013627.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42013627/',
    pmid: '42013627',
  },
  {
    n: 27,
    text: 'Striley CW, Hoeflich CC, Viegas AT, et al. Health Effects Associated With Kratom and Polysubstance Use: A Narrative Review. Subst Abuse. 2022. PMID 35645563.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35645563/',
    pmid: '35645563',
    doi: '10.1177/11782218221095873',
  },
  {
    n: 28,
    text: 'Singh D, Narayanan S, Vicknasingam B, et al. Severity of Pain and Sleep Problems during Kratom Cessation among Regular Kratom Users. 2018. PMID 29558272.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29558272/',
    pmid: '29558272',
  },
  {
    n: 29,
    text: 'Wright ME, Ginsberg C, Parkison AM, et al. Outcomes of mothers and newborns to prenatal exposure to kratom: a systematic review. J Perinatol. 2021. PMID 33589723.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33589723/',
    pmid: '33589723',
  },
  {
    n: 30,
    text: 'Eggleston W, Stoppacher R, Suen K, Marraffa JM, Nelson LS. Kratom Use and Toxicities in the United States. Pharmacotherapy. 2019;39:775-777. PMID 31099038.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31099038/',
    pmid: '31099038',
    doi: '10.1002/phar.2280',
  },
  {
    n: 31,
    text: 'Post S, Spiller HA, Chounthirath T, Smith GA. Kratom exposures reported to United States poison control centers: 2011-2017. Clin Toxicol. 2019;57:847-854. PMID 30786220.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30786220/',
    pmid: '30786220',
    doi: '10.1080/15563650.2019.1569236',
  },
  {
    n: 32,
    text: 'DEA. Schedules of Controlled Substances: Temporary Placement of Mitragynine Pseudoindoxyl, MGM-15, and MGM-16 in Schedule I. Temporary scheduling order, effective August 26, 2026; scheduled through August 26, 2028 unless extended or made permanent.',
    url: 'https://public-inspection.federalregister.gov/2026-17429.pdf',
  },
  {
    n: 33,
    text: 'HHS/OASH. Temporary Placement of 7-Hydroxymitragynine Above a Specified Threshold in Schedule I; Request for Information; Extension of Comment Period. Federal Register publication August 26, 2026.',
    url: 'https://public-inspection.federalregister.gov/2026-17409.pdf',
  }
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityJsonLd
          title="Kratom & 7-OH Withdrawal and Recovery: 2026 Evidence Review"
          description="Masterclass evidence review of kratom and concentrated 7-hydroxymitragynine withdrawal, treatment, longer recovery, product chemistry, and current regulation."
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
          <p className="eyebrow-label">Emerging opioid safety · Literature checked October 3, 2026</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            Kratom & 7-OH Withdrawal and Recovery: What the 2026 Evidence Actually Shows
          </h1>
          <p className="detail-reading mt-4 max-w-3xl text-muted">
            Kratom leaf, extracts, and concentrated or semi-synthetic 7-hydroxymitragynine products sit on the same broad pharmacologic family tree but can create materially different exposures. This review separates those products, maps dependence and withdrawal evidence, follows recovery beyond the acute syndrome, and tracks current product chemistry and regulation without inventing a universal taper, dose conversion, or withdrawal clock.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">33-source evidence ledger</span>
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
                DEA began a threshold-based temporary-scheduling process for 7-OH in July 2026; separately, mitragynine pseudoindoxyl, MGM-15, and MGM-16 were placed into temporary Schedule I effective August 26, 2026 [2–5,32,33].
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
          <h2 className="text-2xl font-semibold text-ink">Federal regulatory snapshot — reviewed October 3, 2026</h2>
          <p className="text-muted leading-relaxed">
            FDA states that added or enhanced 7-OH is not lawful as a dietary-supplement ingredient or conventional-food ingredient and that there are no FDA-approved drugs containing 7-OH [1,16]. FDA issued warning letters in 2025 and later announced seizure of about 73,000 units of concentrated 7-OH products valued at roughly $1 million [16,17].
          </p>
          <p className="text-muted leading-relaxed">
            Federal control now differs by substance. DEA's August 26, 2026 temporary scheduling order placed <strong>mitragynine pseudoindoxyl, MGM-15, and MGM-16</strong> into Schedule I, effective that day and scheduled to remain in effect through August 26, 2028 unless extended or made permanent [32].
          </p>
          <p className="text-muted leading-relaxed">
            <strong>Thresholded 7-OH itself is a separate proceeding.</strong> DEA's July 6 notice of intent proposed temporary Schedule I control for 7-OH above a defined threshold, while HHS sought information on the threshold and later extended that comment process [4,5,33]. In our October 3, 2026 review, we located the notice of intent and the August comment-period extension but did not locate a later published temporary scheduling order putting thresholded 7-OH itself into effect.
          </p>
          <div className="rounded-2xl border border-sky-900/15 bg-sky-50 p-5 text-sm text-sky-950">
            <p className="font-semibold">Do not collapse these legal categories.</p>
            <p className="mt-2">
              Mitragynine pseudoindoxyl, MGM-15, and MGM-16 are temporarily Schedule I under the August 26 order [32]. The proposed threshold-based treatment of 7-OH is a separate federal action [4,5,33]. Ordinary botanical kratom, concentrated 7-OH products, and the three scheduled synthetic/semisynthetic derivatives therefore should not be described as though they share one identical federal status.
            </p>
          </div>
          <p className="text-sm text-muted">State and local restrictions can differ from federal status. This page deliberately does not publish a static “legal states” list that can become wrong between updates.</p>
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

        <section id="dependence-vs-kud" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Dependence is not the same as kratom use disorder</h2>
          <p className="text-muted leading-relaxed">
            Frequent kratom or 7-OH exposure can produce tolerance and physical dependence, but those findings do not automatically prove a substance use disorder. Physical dependence means the nervous system has adapted enough that reducing exposure can produce withdrawal. A use disorder adds a broader pattern of impaired control, craving, repeated unsuccessful attempts to cut down, continued use despite harm, or disruption of important activities.
          </p>
          <p className="text-muted leading-relaxed">
            This distinction is especially important for kratom because many users report self-treatment of pain, mood symptoms, fatigue, or prior opioid withdrawal. In a U.S. online sample, tolerance and withdrawal were among the most common kratom-use-disorder features, while major social or occupational impairment was less common [20]. A 2024 review emphasized that assessment should not equate any physical dependence with addiction and should account for the reason the person began using kratom [21].
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">Physical dependence can include</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
                <li>tolerance;</li>
                <li>withdrawal when use stops;</li>
                <li>symptom relief after re-exposure.</li>
              </ul>
            </div>
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">Use disorder adds broader impairment</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
                <li>loss of control over use;</li>
                <li>persistent craving or unsuccessful attempts to stop;</li>
                <li>continued use despite meaningful harm or functional consequences.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="symptom-map" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Withdrawal symptom map</h2>
          <p className="text-muted leading-relaxed">
            Traditional kratom withdrawal has been described in clinical reports, systematic reviews, community studies in Southeast Asia, and U.S. survey research [18–20]. The syndrome overlaps with opioid withdrawal but is not necessarily identical in severity, timing, or symptom balance.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink">
                <tr><th className="p-3">Domain</th><th className="p-3">Reported features</th><th className="p-3">Interpretation</th></tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3 font-semibold text-ink">GI</td><td className="p-3">diarrhea, abdominal discomfort, nausea, reduced appetite</td><td className="p-3">dehydration risk rises if fluid intake is poor or vomiting is severe</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Autonomic</td><td className="p-3">sweating, hot flashes/chills, runny nose, watery eyes, yawning</td><td className="p-3">overlaps with opioid-like withdrawal</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Musculoskeletal</td><td className="p-3">body aches, muscle pain or spasms, joint pain, physical tension</td><td className="p-3">pain can be withdrawal plus re-emergence of the condition kratom was being used to manage</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Sleep</td><td className="p-3">insomnia, restless sleep, difficulty settling</td><td className="p-3">sleep disruption can persist after the most obvious physical symptoms improve [28]</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Mood</td><td className="p-3">irritability, anxiety, tension, sadness or depressed mood</td><td className="p-3">severe or persistent psychiatric symptoms require assessment beyond a withdrawal label</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Reward/craving</td><td className="p-3">craving, low energy, restlessness, urge to resume use</td><td className="p-3">can drive return to use even after the acute physical syndrome is fading</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            In the 2014 Malaysian community study, more frequent kratom-tea consumption was associated with more severe dependence, withdrawal, and craving [19]. A U.S. survey similarly described moderate withdrawal dominated by GI upset, restlessness, anxiety, irritability, fatigue/low energy, and craving [20]. These populations and products differ, so neither dataset should be treated as a universal U.S. commercial-product timeline.
          </p>
        </section>

        <section id="timeline" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Timeline and pharmacokinetics: why one clock is misleading</h2>
          <p className="text-muted leading-relaxed">
            Kratom withdrawal is often described online with an exact hour-by-hour clock. The human evidence does not support that level of precision. Traditional leaf, concentrated extracts, isolated 7-OH, and products containing other semi-synthetic opioid-active compounds can differ in alkaloid composition and pharmacokinetics.
          </p>
          <p className="text-muted leading-relaxed">
            Controlled human pharmacokinetic work with dried leaf powder found that mitragynine can have a long and variable terminal half-life, while 7-hydroxymitragynine showed a shorter but still exposure-dependent time course [24]. A 2026 human extract study separately characterized mitragynine and 7-OH after concentrated extract exposures [25]. Those studies are valuable for understanding accumulation and exposure; they do not directly establish one withdrawal peak for dependent users.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink"><tr><th className="p-3">Phase</th><th className="p-3">What may occur</th><th className="p-3">Why timing varies</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3">Early</td><td className="p-3">craving, restlessness, anxiety, GI symptoms, aches, sleep disruption may begin as opioid-active exposure falls</td><td className="p-3">product type, repeated dosing, mitragynine/7-OH balance, co-use, metabolism</td></tr>
                <tr><td className="p-3">Acute</td><td className="p-3">physical and affective symptoms may intensify before gradually improving</td><td className="p-3">dependence severity, long-lived mitragynine exposure, concentrated products, other opioids</td></tr>
                <tr><td className="p-3">Later recovery</td><td className="p-3">sleep, mood, pain, energy, GI function, and craving can recover on different schedules</td><td className="p-3">underlying pain/psychiatric illness, environment, nicotine, other drugs, treatment access</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            The correct evidence statement is therefore a range and a set of modifiers—not a promise that “day three is the worst” or “everything is over by day seven” for every kratom-derived product.
          </p>
        </section>

        <section id="exposure-types" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Leaf, extracts, 7-OH and related products should not be collapsed together</h2>
          <p className="text-muted leading-relaxed">
            “Kratom withdrawal” can refer to very different exposure histories. Traditional leaf or tea contains a broad alkaloid mixture dominated by mitragynine. Standardized or concentrated extracts can deliver much more mitragynine per serving. Purified or semi-synthetic 7-OH products can deliver an opioid-active alkaloid at levels not representative of ordinary leaf. Some newer products may also contain mitragynine pseudoindoxyl or other kratom-derived opioid-active compounds.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">Traditional leaf/tea</p>
              <p className="mt-2 text-sm text-muted">Human survey and observational withdrawal literature is broader, but product composition and cultural use patterns differ from the current U.S. concentrate market [18–21].</p>
            </div>
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">Concentrated extracts</p>
              <p className="mt-2 text-sm text-muted">Higher mitragynine exposure is possible, and 2026 human PK data now exist for concentrated extract [25]. Withdrawal-specific prospective studies remain limited.</p>
            </div>
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">Purified/concentrated 7-OH</p>
              <p className="mt-2 text-sm text-muted">Direct 2025–2026 clinical cases and a nine-patient series document problematic use and opioid-like withdrawal [6–11].</p>
            </div>
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">Mixed/novel kratom-derived products</p>
              <p className="mt-2 text-sm text-muted">Label accuracy and hidden semi-synthetic compounds can make the exposure uncertain; product-specific toxicology matters [12–14].</p>
            </div>
          </div>
        </section>

        <section id="recovery" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Recovery is more than getting through acute withdrawal</h2>
          <p className="text-muted leading-relaxed">
            Acute withdrawal is only one layer of recovery. Kratom is frequently used to self-manage chronic pain, anxiety, low mood, fatigue, or prior opioid withdrawal. When kratom stops, the original condition can reappear at the same time as withdrawal.
          </p>
          <h3 className="text-xl font-semibold text-ink">Sleep</h3>
          <p className="text-muted leading-relaxed">
            Sleep disruption can be both a withdrawal symptom and a relapse trigger. Malaysian observational data found increased sleep problems during cessation, particularly among heavier tea users, although symptoms were generally characterized as relatively mild in that population [28]. That finding should not be generalized to purified high-potency 7-OH products.
          </p>
          <h3 className="text-xl font-semibold text-ink">Pain</h3>
          <p className="text-muted leading-relaxed">
            Body aches can be part of withdrawal, while chronic pain may also return when a person stops a product they were using for analgesia. Those are different mechanisms and may require different treatment. A page that labels every post-cessation pain flare as withdrawal can miss the underlying pain disorder.
          </p>
          <h3 className="text-xl font-semibold text-ink">Mood, anxiety and energy</h3>
          <p className="text-muted leading-relaxed">
            Anxiety, irritability, sadness, fatigue and low energy are reported during withdrawal [19,20]. Persistent severe depression, mania, psychosis, or suicidality should trigger broader psychiatric evaluation rather than an assumption that time alone will fix the problem.
          </p>
          <h3 className="text-xl font-semibold text-ink">Craving and cue reactivity</h3>
          <p className="text-muted leading-relaxed">
            A person may feel physically better while still experiencing strong urges in the situations where kratom or 7-OH became routine—waking, driving, work breaks, pain flares, stress, or bedtime. Recovery planning has to address those learned patterns as well as the acute syndrome.
          </p>
        </section>

        <section id="polysubstance" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Polysubstance and product-uncertainty reality</h2>
          <p className="text-muted leading-relaxed">
            Kratom-related emergency and poison-center data repeatedly show that co-exposures matter. U.S. poison-center studies found more severe outcomes with multiple-substance exposures, and the literature includes combinations with prescription/illicit opioids, benzodiazepines, alcohol, stimulants, gabapentinoids, nicotine and other sedatives [26,27,30,31].
          </p>
          <p className="text-muted leading-relaxed">
            This changes withdrawal interpretation. A person stopping 7-OH and alcohol, for example, should not be told that all symptoms fit a kratom-derived opioid syndrome: alcohol withdrawal can independently become life-threatening. Likewise, sedation or slowed breathing suggests intoxication or a co-exposure rather than uncomplicated opioid withdrawal.
          </p>
          <p className="text-sm text-muted">
            Product uncertainty adds another layer. When a tablet or gummy is marketed with botanical language but actually contains concentrated 7-OH or another opioid-active derivative, the consumer may not know what dependence they are withdrawing from [12–14].
          </p>
        </section>

        <section id="return-to-use" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Return to use, reduced tolerance and overdose risk</h2>
          <p className="text-muted leading-relaxed">
            Withdrawal itself is not the only safety issue. A period of abstinence can reduce opioid tolerance. Returning to a previously tolerated amount of a concentrated opioid-active product may therefore carry more risk than expected—especially when the actual product concentration is uncertain or when alcohol, benzodiazepines, prescription opioids, illicit opioids, or other sedatives are also present.
          </p>
          <p className="text-muted leading-relaxed">
            Kratom toxicology should also be described carefully. Poison-center data document serious outcomes, including respiratory depression and deaths, but many severe or fatal cases involve polysubstance exposure [26,30,31]. That supports caution without pretending every kratom-associated death is a clean single-compound experiment.
          </p>
          <p className="text-sm text-muted">
            When an opioid exposure is suspected and a person is unresponsive or not breathing normally, opioid-overdose response—including emergency services and naloxone when available—is appropriate harm-reduction context. Naloxone treats opioid receptor-mediated respiratory depression; it is not a treatment for ordinary withdrawal discomfort.
          </p>
        </section>

        <section id="special-populations" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Special populations</h2>
          <h3 className="text-xl font-semibold text-ink">Pregnancy and newborn exposure</h3>
          <p className="text-muted leading-relaxed">
            Pregnancy deserves a lower threshold for specialist care. A systematic review found only a small case-report literature, but maternal kratom exposure and neonatal withdrawal were repeatedly described [29]. The absence of large trials is not evidence of safety. Abrupt self-directed medication changes during pregnancy are also not a substitute for obstetric and addiction care.
          </p>
          <h3 className="text-xl font-semibold text-ink">Chronic pain</h3>
          <p className="text-muted leading-relaxed">
            Many people use kratom because conventional pain care was inadequate or because they were trying to reduce prescription-opioid exposure. Recovery planning should address the underlying pain rather than treating abstinence as the only outcome that matters.
          </p>
          <h3 className="text-xl font-semibold text-ink">Prior opioid use disorder</h3>
          <p className="text-muted leading-relaxed">
            Kratom may have been adopted as self-treatment for opioid withdrawal. Stopping it without a plan can therefore expose two problems: kratom-derived physical dependence and an untreated underlying opioid use disorder. Evidence-based OUD treatment should not be withheld because the current product is sold as “kratom.”
          </p>
          <h3 className="text-xl font-semibold text-ink">Adolescents and older adults</h3>
          <p className="text-muted leading-relaxed">
            Direct treatment evidence is sparse at both age extremes. Co-medications, cardiovascular risk, falls, cognition, liver/kidney disease, and developmental context can all change the risk-benefit picture. Adult case-series protocols should not be copied automatically.
          </p>
        </section>

        <section id="myths" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Myths versus evidence</h2>
          <div className="space-y-4 text-sm text-muted">
            <div><p className="font-semibold text-ink">Myth: “Natural kratom cannot cause physical dependence.”</p><p className="mt-1">Regular kratom use has been associated with tolerance, craving and withdrawal in multiple human datasets [18–20].</p></div>
            <div><p className="font-semibold text-ink">Myth: “All 7-OH products are basically strong kratom leaf.”</p><p className="mt-1">Analytical studies show that concentrated/semi-synthetic 7-OH products can be chemically unlike traditional leaf [12,13].</p></div>
            <div><p className="font-semibold text-ink">Myth: “There is one reliable day-by-day kratom withdrawal timeline.”</p><p className="mt-1">Product type, alkaloid composition, repeated exposure, individual metabolism and co-use vary too much for one validated clock.</p></div>
            <div><p className="font-semibold text-ink">Myth: “If someone is physically dependent, they necessarily have addiction.”</p><p className="mt-1">Dependence and withdrawal can occur without the broader behavioral impairment required for a use-disorder diagnosis [20,21].</p></div>
            <div><p className="font-semibold text-ink">Myth: “A successful buprenorphine case report proves a universal induction protocol.”</p><p className="mt-1">Case reports and case series support clinician-managed feasibility, not a one-size-fits-all self-treatment regimen [7,8,22,23].</p></div>
            <div><p className="font-semibold text-ink">Myth: “Once acute withdrawal ends, recovery is finished.”</p><p className="mt-1">Sleep, pain, mood, craving, function and the original reason for use may continue to need treatment.</p></div>
          </div>
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
