import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = buildPageMetadata({
  title: 'BPC-157: Human Studies, FDA Vote & Safety (2026)',
  description:
    'Post-July-2026 evidence review of BPC-157: every human study found by FDA, the 8-6 advisory vote, current 503A compounding status, peptide identity concerns, safety gaps, and WADA status.',
  path: '/guides/other/bpc-157/',
})

const HEADINGS: Heading[] = [
  { id: 'research-brief', text: 'Research Brief', level: 2 },
  { id: 'what-changed', text: 'What Changed in July 2026?', level: 2 },
  { id: 'human-evidence', text: 'Human Evidence Ledger', level: 2 },
  { id: 'claims-gap', text: 'The Claims-to-Evidence Gap', level: 2 },
  { id: 'fda-status', text: 'FDA & Compounding Status', level: 2 },
  { id: 'identity', text: 'The BPC-157 Identity Problem', level: 2 },
  { id: 'safety', text: 'Human Safety: What Is Known', level: 2 },
  { id: 'athletes', text: 'Athletes & Anti-Doping', level: 2 },
  { id: 'applicability', text: 'Evidence Applicability Ledger', level: 2 },
  { id: 'gaps', text: 'Unanswered-Question Ledger', level: 2 },
  { id: 'faq', text: 'Frequently Asked Questions', level: 2 },
  { id: 'references', text: 'References', level: 2 },
]

const FAQS = [
  {
    question: 'Has BPC-157 been studied in humans?',
    answer:
      'Yes, but the human evidence is much thinner than online marketing often implies. FDA identified five clinical studies: two older rectal-enema studies available as meeting abstracts, a small retrospective knee-pain chart review, a 12-person uncontrolled interstitial-cystitis study, and a two-person intravenous safety pilot. That is human exposure evidence, not a replicated efficacy program.',
  },
  {
    question: 'Did FDA approve BPC-157 in July 2026?',
    answer:
      'No. An FDA advisory committee voted to recommend BPC-157-related bulk drug substances for the 503A bulks list, but FDA states that advisory-committee recommendations are non-binding. A 503A compounding-list recommendation is also fundamentally different from FDA approval of a drug for safety and effectiveness.',
  },
  {
    question: 'Can compounding pharmacies legally make BPC-157 now?',
    answer:
      'The July 23 advisory vote did not itself change federal compounding law. In our August 15, 2026 review, we did not locate a final FDA rule adding BPC-157 to the 503A bulks list. Because this status is changing quickly, pharmacies and patients should verify the current FDA rule rather than rely on a cached article or social-media post.',
  },
  {
    question: 'Is there good human evidence that BPC-157 heals tendons or muscles?',
    answer:
      'No controlled human tendon- or muscle-healing trial was identified in the FDA review. The human musculoskeletal evidence located by FDA was a retrospective knee-pain chart review without randomization, placebo control, validated outcome instruments, or a large sample.',
  },
  {
    question: 'Is BPC-157 allowed in tested sport?',
    answer:
      'No. USADA identifies BPC-157 under the WADA S0 Non-Approved Substances category, and the current 2026 WADA Prohibited List is in force. Athletes subject to anti-doping rules should treat BPC-157 as prohibited at all times and verify status through their anti-doping organization.',
  },
] as const

const BPC_157_REFS = [
  {
    n: 1,
    text: 'FDA. July 23-24, 2026 Meeting of the Pharmacy Compounding Advisory Committee. Official agenda, meeting materials, and non-binding advisory-committee explanation.',
    url: 'https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026',
  },
  {
    n: 2,
    text: 'FDA. Briefing Document for BPC-157-Related Bulk Drug Substances (BPC-157 free base and BPC-157 acetate), Pharmacy Compounding Advisory Committee, July 23-24, 2026.',
    url: 'https://www.fda.gov/media/193343/download',
  },
  {
    n: 3,
    text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act. Current framework and rulemaking process.',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act',
  },
  {
    n: 4,
    text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks. BPC-157 safety-risk entry.',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks',
  },
  {
    n: 5,
    text: 'Salzman S, Kekatos M. FDA advisory committee votes to add popular peptide BPC-157 to drug compounding list. ABC News. July 23, 2026. Reports the 8-6 vote with one abstention.',
    url: 'https://abcnews.com/Health/fda-advisory-committee-votes-add-popular-peptide-bpc/story?id=134913891',
  },
  {
    n: 6,
    text: 'Lee E, Padgett B. Intra-Articular Injection of BPC 157 for Multiple Types of Knee Pain. Altern Ther Health Med. 2021. PMID 34324435.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34324435/',
    pmid: '34324435',
  },
  {
    n: 7,
    text: 'Intravesical BPC-157 for interstitial cystitis: small uncontrolled pilot study in 12 women. 2024. PMID 39325560.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39325560/',
    pmid: '39325560',
  },
  {
    n: 8,
    text: 'Intravenous BPC-157 safety pilot in two healthy adults. 2025. PMID 40131143.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40131143/',
    pmid: '40131143',
  },
  {
    n: 9,
    text: 'ClinicalTrials.gov. NCT02637284: Phase 1 oral BPC-157 study in healthy subjects. FDA reported no posted results or associated publication in its December 2025 search.',
    url: 'https://clinicaltrials.gov/study/NCT02637284',
  },
  {
    n: 10,
    text: 'BPC-157 narrative review emphasizing the human-evidence gap. 2025. PMID 40789979.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40789979/',
    pmid: '40789979',
  },
  {
    n: 11,
    text: 'BPC-157 translational review: no approved formulation, validated dosing strategy, or completed Phase II development program. Pharmaceutics. 2026. PMID 42198317.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42198317/',
    pmid: '42198317',
  },
  {
    n: 12,
    text: 'World Anti-Doping Agency. 2026 Prohibited List, in force January 1, 2026.',
    url: 'https://www.wada-ama.org/en/resources/world-anti-doping-program/prohibited-list',
  },
  {
    n: 13,
    text: 'USADA. BPC-157: Experimental Peptide Prohibited. BPC-157 is identified under S0 Non-Approved Substances.',
    url: 'https://www.usada.org/spirit-of-sport/education/bpc-157-peptide-prohibited/',
  },
  {
    n: 14,
    text: 'USADA. Triathlon Athlete Anthony McCauley Accepts Sanction for Anti-Doping Rule Violations. September 17, 2025; includes BPC-157 possession/use.',
    url: 'https://www.usada.org/sanction/anthony-mccauley-accepts-doping-sanction/',
  },
  {
    n: 15,
    text: 'Sikiric P, et al. BPC 157 research review. Curr Pharm Des. 2014. PMID 23782141.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23782141/',
    pmid: '23782141',
  },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityJsonLd
          title="BPC-157: Human Studies, FDA Vote & Safety (2026)"
          description="Post-July-2026 evidence review of every human BPC-157 study identified by FDA, the advisory-committee vote, compounding status, peptide identity concerns, safety uncertainty, and anti-doping status."
          url="https://thehippiescientist.net/guides/other/bpc-157/"
          type="MedicalWebPage"
          breadcrumbs={[
            { name: 'Home', url: 'https://thehippiescientist.net/' },
            { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
            { name: 'BPC-157', url: 'https://thehippiescientist.net/guides/other/bpc-157/' },
          ]}
          faqItems={[...FAQS]}
          citationUrls={BPC_157_REFS.map(reference => reference.url)}
        />

        <AuthorityBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides' },
            { label: 'BPC-157: Human Evidence, FDA Status, and Safety' },
          ]}
        />

        <header className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Experimental peptide · Literature and regulatory check: August 15, 2026</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            BPC-157: Human Studies, FDA Vote, Compounding Status & Safety
          </h1>
          <p className="detail-reading mt-4 max-w-3xl text-muted">
            BPC-157 is much more studied in animals than in people. The useful question in 2026 is no longer “are there any human data?” but exactly what those human data can support—and what the July FDA advisory vote did and did not change.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">15-source ledger</span>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">All 5 FDA-identified human studies mapped</span>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">Post-PCAC status</span>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-900">No dosing protocol</span>
          </div>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/bpc-157.jpg"
                alt="A glass vial of lyophilized research peptide powder in a lab setting"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              BPC-157 is an experimental peptide. Human exposure data exist, but an established human treatment program does not.
            </figcaption>
          </figure>
        </header>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Unapproved-drug and compounding notice</p>
          <p className="mt-2">
            BPC-157 is not an FDA-approved drug. A July 2026 advisory-committee recommendation is not FDA approval and is not, by itself, a final 503A bulks-list rule. “Research use only,” clinic availability, or online sale does not establish clinical effectiveness, product quality, legal compounding status, or suitability for human use [1–5].
          </p>
        </section>

        <AffiliateDisclosure />

        <section id="research-brief" className="scroll-mt-20 prose-section space-y-5">
          <p className="section-label">Research brief</p>
          <h2 className="text-2xl font-semibold text-ink">Four facts matter more than the hype</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Human data exist</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                FDA located five clinical studies involving BPC-157, including two older meeting-abstract studies and three very small modern reports [2]. Saying “there are zero human studies” is now too absolute.
              </p>
            </div>
            <div className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Human efficacy is not established</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                The studies are small, short, heterogeneous, and often uncontrolled. They do not create a replicated tendon-healing, muscle-recovery, gut-healing, or systemic efficacy program [2,6–11].
              </p>
            </div>
            <div className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">The July vote was advisory</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                The Pharmacy Compounding Advisory Committee voted 8–6 with one abstention to recommend BPC-157, but FDA says advisory recommendations are non-binding [1,5].
              </p>
            </div>
            <div className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">“BPC-157” can hide chemistry differences</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                FDA found inconsistent naming involving free base, acetate, salts, and derivatives sold under the same common name—a product-identity problem that matters before efficacy is even discussed [2].
              </p>
            </div>
          </div>
        </section>

        <section id="what-changed" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">What changed on July 23, 2026?</h2>
          <p className="text-muted leading-relaxed">
            FDA convened the Pharmacy Compounding Advisory Committee to consider BPC-157 free base and BPC-157 acetate for possible inclusion on the section 503A Bulks List. Importantly, the use FDA formally evaluated for BPC-157 at this meeting was <strong>ulcerative colitis</strong>—not the tendon, muscle, athletic-recovery, or injury-healing uses that dominate online promotion [1,2].
          </p>
          <p className="text-muted leading-relaxed">
            FDA staff's briefing concluded that the evaluation criteria weighed <strong>against</strong> placing both BPC-157 free base and BPC-157 acetate on the 503A list [2]. The advisory committee nevertheless voted narrowly in favor; contemporaneous reporting recorded an 8–6 vote with one abstention [5].
          </p>
          <div className="rounded-2xl border border-amber-900/15 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <p className="font-semibold">A vote to recommend compounding is not a drug approval.</p>
            <p className="mt-2">
              FDA's own meeting page says advisory committees make non-binding recommendations. Drug approval requires a different regulatory pathway evaluating a specific product for safety, effectiveness, manufacturing quality, labeling, and an indicated use [1].
            </p>
          </div>
        </section>

        <section id="human-evidence" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Human evidence ledger: every clinical study FDA found</h2>
          <p className="text-muted leading-relaxed">
            FDA's 2026 briefing searched PubMed and Embase and identified five clinical studies that used BPC-157 [2]. Mapping them side by side shows why “human research exists” and “human efficacy is established” are very different statements.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink">
                <tr>
                  <th className="p-3">Study</th>
                  <th className="p-3">Population / design</th>
                  <th className="p-3">Route / target</th>
                  <th className="p-3">What it contributes</th>
                  <th className="p-3">Main limitation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr>
                  <td className="p-3 font-semibold text-ink">Veljaca 2002/2003</td>
                  <td className="p-3">32 healthy subjects randomized; 24 received BPC-157</td>
                  <td className="p-3">Rectal enema; phase-1 tolerability/PK</td>
                  <td className="p-3">Early human exposure and tolerability context</td>
                  <td className="p-3">Available to FDA as meeting abstracts rather than a full modern peer-reviewed report [2]</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink">Ruenzi 2005</td>
                  <td className="p-3">53 people with mild-moderate ulcerative colitis randomized; 46 completed</td>
                  <td className="p-3">Rectal enema; ulcerative colitis</td>
                  <td className="p-3">Only randomized clinical efficacy signal in the FDA human-study table</td>
                  <td className="p-3">Meeting-abstract-level reporting leaves major methods, safety, and effect-estimate details unresolved [2]</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink">Lee & Padgett 2021</td>
                  <td className="p-3">17 knee-pain patients identified; 16 contacted retrospectively</td>
                  <td className="p-3">Intra-articular injection; knee pain</td>
                  <td className="p-3">Small real-world human musculoskeletal signal</td>
                  <td className="p-3">Retrospective, uncontrolled, tiny sample, self-reported response, some combination treatment [2,6]</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink">Interstitial cystitis pilot 2024</td>
                  <td className="p-3">12 women; single-arm pilot</td>
                  <td className="p-3">Intravesical administration; interstitial cystitis</td>
                  <td className="p-3">Prospective human symptom-response observation</td>
                  <td className="p-3">No placebo/control arm, very small sample, subjective clinical outcome [2,7]</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink">IV safety pilot 2025</td>
                  <td className="p-3">2 healthy adults</td>
                  <td className="p-3">Intravenous; short safety observation</td>
                  <td className="p-3">Very limited IV exposure/lab context</td>
                  <td className="p-3">N=2 cannot establish uncommon harms, long-term safety, or efficacy [2,8]</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-6 text-muted">
            FDA also found ClinicalTrials.gov registration NCT02637284, an estimated 42-person oral phase-1 study in healthy subjects, but reported that no results were posted and no associated published study was located in its December 2025 search [2,9]. A registered study is not the same thing as an available result.
          </p>
        </section>

        <section id="claims-gap" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">The claims-to-evidence gap</h2>
          <p className="text-muted leading-relaxed">
            BPC-157 is marketed around tendon repair, muscle healing, ligament recovery, gut repair, ulcer healing, neurologic recovery, inflammation, and athletic performance. FDA's formal July 2026 assessment, however, reviewed BPC-157 for ulcerative colitis and specifically noted that it did not identify human clinical studies supporting a tendonitis use in the material it evaluated [1,2].
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">What animal studies can do</p>
              <p className="mt-2 text-sm leading-6 text-muted">Generate biologic hypotheses, identify mechanisms worth testing, and justify better clinical research [10,11,15].</p>
            </div>
            <div className="card-premium p-5">
              <p className="font-semibold text-ink">What animal studies cannot do</p>
              <p className="mt-2 text-sm leading-6 text-muted">Establish a human dose, prove tendon or muscle healing in people, quantify long-term adverse-event rates, or validate a commercial injectable product.</p>
            </div>
          </div>
          <p className="text-muted leading-relaxed">
            A credible BPC-157 page therefore should not say “no human evidence” and stop there—but it also should not promote a handful of small human exposures as though they close the translational gap.
          </p>
        </section>

        <section id="fda-status" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">FDA and compounding status — checked August 15, 2026</h2>
          <p className="text-muted leading-relaxed">
            Neither BPC-157 free base nor BPC-157 acetate is a component of an FDA-approved drug, and FDA's briefing states that neither has an applicable USP/NF drug-substance monograph [2]. Under section 503A, those facts matter because a bulk drug substance generally must satisfy the applicable statutory pathway—including appearing on the 503A Bulks List when no qualifying monograph or approved-drug-component route applies [3].
          </p>
          <p className="text-muted leading-relaxed">
            The July committee recommendation did not itself add BPC-157 to a final rule. FDA says it develops the 503A list through notice-and-comment rulemaking and is not legally bound by advisory-committee recommendations [1,3]. In our August 15, 2026 check of FDA's current compounding pages and rule materials, we did not locate a subsequent final rule adding BPC-157.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink"><tr><th className="p-3">Statement</th><th className="p-3">Status</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3">“BPC-157 is FDA-approved.”</td><td className="p-3 font-semibold">False [2]</td></tr>
                <tr><td className="p-3">“FDA's advisory committee recommended it for the 503A bulks list.”</td><td className="p-3 font-semibold">Yes, by a narrow advisory vote [1,5]</td></tr>
                <tr><td className="p-3">“That vote itself made BPC-157 FDA-approved.”</td><td className="p-3 font-semibold">False [1]</td></tr>
                <tr><td className="p-3">“That vote itself was a final 503A rule.”</td><td className="p-3 font-semibold">False; FDA rulemaking is separate [1,3]</td></tr>
                <tr><td className="p-3">“FDA staff endorsed the substance before the vote.”</td><td className="p-3 font-semibold">No; FDA's briefing said the criteria weighed against listing both forms [2]</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="identity" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">The BPC-157 identity problem most consumer pages miss</h2>
          <p className="text-muted leading-relaxed">
            “BPC-157” is a common name, not a U.S. Adopted Name. FDA's briefing says it has encountered multiple salts and derivatives—including different active moieties—sold under the same common name. It separately evaluated BPC-157 free base and BPC-157 acetate as distinct bulk drug substances [2].
          </p>
          <p className="text-muted leading-relaxed">
            FDA warned that inconsistent naming can create a patient-safety problem if the material dispensed is not the bulk drug substance the prescriber intended. The agency also identified characterization gaps involving peptide-related impurities, aggregation, microbial quality, endotoxins, particle size, and dosage-form-specific critical quality attributes [2].
          </p>
          <div className="rounded-2xl border border-sky-900/15 bg-sky-50 p-5 text-sm leading-6 text-sky-950">
            <p className="font-semibold">Why this changes how research should be read</p>
            <p className="mt-2">
              A study of one defined BPC-157 material, route, and formulation does not automatically validate every vial, capsule, spray, cream, or “BPC-157 acetate” product sold online. Identity and formulation are part of the evidence—not packaging trivia.
            </p>
          </div>
        </section>

        <section id="safety" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Human safety: reassuring observations are not a safety database</h2>
          <p className="text-muted leading-relaxed">
            FDA noted that no serious adverse events appeared to have been reported in the five clinical studies it identified. That sounds reassuring until the denominator is examined: the studies were short, sample sizes were small, doses were exploratory, and safety monitoring was unclear or sparsely described in several reports [2].
          </p>
          <p className="text-muted leading-relaxed">
            FDA also identified three FAERS reports associated with injectable BPC-157 through December 4, 2025, involving injection-site symptoms, a report of shortness of breath/ER evaluation, and a pigmentation/gingival report with concurrent TB-500 exposure. FDA emphasized the reports were incomplete or confounded and cannot establish causality [2].
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            <li><strong>Immunogenicity:</strong> FDA identifies potential immune-response risk for peptide products, particularly where aggregation or peptide-related impurities are possible [2,4].</li>
            <li><strong>Product quality:</strong> API identity, purity, stability, sterility, microbial quality, and formulation are not guaranteed by the name “BPC-157” alone [2].</li>
            <li><strong>Long-term exposure:</strong> the human studies located by FDA do not provide a robust long-duration safety dataset [2].</li>
            <li><strong>Route extrapolation:</strong> FDA reported no human pharmacokinetic data for several routes commonly discussed online, including oral, subcutaneous, nasal, and transdermal use [2].</li>
          </ul>
          <p className="text-muted leading-relaxed">
            FDA's current safety-risk page therefore continues to say it has no or only limited safety-related information for proposed BPC-157 routes and lacks sufficient information to know whether compounded use would cause harm in humans [4].
          </p>
        </section>

        <section id="athletes" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Athletes: BPC-157 is an anti-doping problem even if regulation changes</h2>
          <p className="text-muted leading-relaxed">
            The 2026 WADA Prohibited List is in force, and USADA identifies BPC-157 under the S0 Non-Approved Substances category [12,13]. That anti-doping status is a separate question from whether FDA eventually changes compounding policy.
          </p>
          <p className="text-muted leading-relaxed">
            This is not theoretical enforcement. In September 2025, USADA announced a triathlon sanction in a case involving possession and use of BPC-157 and TB-500 and stated that BPC-157 is prohibited at all times under the applicable anti-doping rules [14].
          </p>
          <p className="text-sm text-muted">
            Athletes should verify the current status through Global DRO/USADA or the anti-doping organization governing their sport rather than assuming that a prescription, clinic sale, or future compounding change makes a substance permitted in competition.
          </p>
        </section>

        <section id="applicability" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Evidence applicability ledger</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-brand-50/70 text-ink"><tr><th className="p-3">Question</th><th className="p-3">Best current evidence</th><th className="p-3">Conclusion</th></tr></thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr><td className="p-3">Has any BPC-157 been given to humans?</td><td className="p-3">Five clinical studies found by FDA [2]</td><td className="p-3 font-semibold">Yes</td></tr>
                <tr><td className="p-3">Does it have replicated human efficacy for tendon/muscle healing?</td><td className="p-3">No controlled tendon/muscle efficacy program found; small retrospective knee series [2,6]</td><td className="p-3 font-semibold">Not established</td></tr>
                <tr><td className="p-3">Does it have a validated consumer dose?</td><td className="p-3">Heterogeneous experimental routes/doses; no approved formulation or validated dosing program [2,11]</td><td className="p-3 font-semibold">No</td></tr>
                <tr><td className="p-3">Is long-term human safety characterized?</td><td className="p-3">Short, small clinical exposures + limited post-market reports [2,4]</td><td className="p-3 font-semibold">No</td></tr>
                <tr><td className="p-3">Did the July 2026 vote equal FDA approval?</td><td className="p-3">FDA PCAC process [1,3]</td><td className="p-3 font-semibold">No</td></tr>
                <tr><td className="p-3">Is every product labeled “BPC-157” chemically interchangeable?</td><td className="p-3">FDA identity/characterization review [2]</td><td className="p-3 font-semibold">Do not assume equivalence</td></tr>
                <tr><td className="p-3">Is it permitted for tested athletes?</td><td className="p-3">2026 WADA/USADA framework [12–14]</td><td className="p-3 font-semibold">Prohibited</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gaps" className="scroll-mt-20 prose-section space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Unanswered-question ledger</h2>
          <p className="text-muted">A premium evidence page should make the missing data visible rather than fill them with mechanism or anecdotes:</p>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
            <li>Can any claimed tendon, ligament, or muscle-repair benefit be reproduced in adequately powered randomized human trials?</li>
            <li>What are human pharmacokinetics and bioavailability for the oral, subcutaneous, nasal, and transdermal routes commonly marketed?</li>
            <li>Are BPC-157 free base and acetate clinically interchangeable at any route or formulation?</li>
            <li>What impurity, aggregation, sterility, stability, and immunogenicity specifications are necessary for reproducible human use?</li>
            <li>What adverse events emerge with months or years of exposure rather than days or a few administrations?</li>
            <li>Can the old ulcerative-colitis findings be reproduced in a modern full-text randomized trial with transparent outcomes and safety monitoring?</li>
            <li>Why does the registered oral phase-1 study NCT02637284 still lack publicly posted results or a publication identified in FDA's review?</li>
            <li>How closely do commercial gray-market products match the identity and purity of materials used in published studies?</li>
            <li>Will FDA ultimately follow or reject the July 2026 advisory recommendation in a future 503A rulemaking action?</li>
          </ol>
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

        <section className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-5 text-sm leading-6 text-muted">
          <p className="font-semibold text-ink">Related evidence</p>
          <p className="mt-2">
            See the <Link href="/compounds/bpc-157/" className="font-semibold text-brand-800 underline underline-offset-4">BPC-157 compound profile</Link> for the broader compound record, or compare another experimental recovery peptide in the <Link href="/guides/other/tb-500/" className="font-semibold text-brand-800 underline underline-offset-4">TB-500 evidence guide</Link>. This page intentionally reports study exposure without turning experimental doses into a self-use protocol.
          </p>
        </section>

        <References refs={BPC_157_REFS} />
      </div>
    </ArticleLayout>
  )
}
