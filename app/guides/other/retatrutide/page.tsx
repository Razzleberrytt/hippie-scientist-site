import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Retatrutide: 2026 Phase 3 Results, FDA Status & Gray-Market Risk',
  description:
    'Current retatrutide guide: 2026 TRIUMPH phase 3 weight-loss results, triple GIP/GLP-1/glucagon mechanism, investigational FDA status, compounding prohibition, safety signals, and why research-peptide products are not trial drug.',
  path: '/guides/other/retatrutide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Is retatrutide FDA approved?',
    answer:
      'No. As of August 15, 2026, retatrutide remains investigational and is still in clinical development. Eli Lilly has said it plans to submit a U.S. Biologics License Application in the first quarter of 2027.',
  },
  {
    question: 'Can a compounding pharmacy legally make retatrutide?',
    answer:
      'FDA states that retatrutide cannot be used in compounding under federal law. FDA also notes that retatrutide is not a component of an FDA-approved drug and has not been found safe and effective for any condition.',
  },
  {
    question: 'How much weight loss did retatrutide produce in phase 3?',
    answer:
      'In Lilly’s May 2026 TRIUMPH-1 topline report, adults with obesity or overweight without diabetes lost an average of 28.3% at 80 weeks on the 12 mg regimen and 19.0% on 4 mg. In a prespecified extension among participants who entered with BMI at least 35, the 12 mg group reached 30.3% average loss at 104 weeks. These are pivotal phase 3 results, but readers should distinguish company-reported/presented data from fully peer-reviewed journal publications.',
  },
  {
    question: 'What is a triple agonist?',
    answer:
      'Retatrutide is designed to activate GIP, GLP-1, and glucagon receptors in one molecule. That differs from semaglutide, which targets GLP-1, and tirzepatide, which targets GIP and GLP-1. Mechanistic novelty does not itself establish safety or superiority; outcomes trials do.',
  },
  {
    question: 'Are online “research-grade retatrutide” vials the same drug used in Lilly trials?',
    answer:
      'No equivalence should be assumed. FDA says retatrutide cannot lawfully be compounded and has warned about unapproved GLP-1-related products. An online vial labeled “research use only” does not establish identity, sterility, purity, potency, storage integrity, or equivalence to the investigational product used in clinical trials.',
  },
  {
    question: 'What are the main known side effects?',
    answer:
      'In peer-reviewed phase 2 studies, gastrointestinal events such as nausea, diarrhea, vomiting, and constipation were most common and were dose-related. The obesity phase 2 study also reported dose-dependent increases in heart rate that peaked around 24 weeks and then declined. Phase 3 safety interpretation should rely on full regulatory and peer-reviewed datasets as they become available.',
  },
] as const

const RETATRUTIDE_REFS = [
  {
    n: 1,
    text: 'Jastreboff AM, et al. Triple-Hormone-Receptor Agonist Retatrutide for Obesity — A Phase 2 Trial. N Engl J Med. 2023;389:514-526. PMID 37366315.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37366315/',
  },
  {
    n: 2,
    text: 'Rosenstock J, et al. Retatrutide for people with type 2 diabetes: randomized phase 2 trial. Lancet. 2023;402:529-544. PMID 37385280.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37385280/',
  },
  {
    n: 3,
    text: 'Eli Lilly and Company. TRIUMPH-1 pivotal Phase 3 topline results. May 21, 2026: up to 28.3% average weight reduction at 80 weeks; extension up to 30.3% at 104 weeks.',
    url: 'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-powerful-weight-loss',
  },
  {
    n: 4,
    text: 'Eli Lilly and Company. TRIUMPH-2 and TRIUMPH-3 pivotal Phase 3 topline results. July 23, 2026; BLA planned for Q1 2027.',
    url: 'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-successful-two-additional',
  },
  {
    n: 5,
    text: 'U.S. Food and Drug Administration. FDA’s Concerns with Unapproved GLP-1 Drugs Used for Weight Loss. FDA states retatrutide and cagrilintide cannot be used in compounding under federal law.',
    url: 'https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss',
  },
  {
    n: 6,
    text: 'Triple hormone receptor agonist retatrutide for metabolic dysfunction-associated steatotic liver disease: randomized phase 2a trial. PMID 38858523.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38858523/',
  },
  {
    n: 7,
    text: 'Effects of retatrutide on body composition in people with type 2 diabetes: randomized phase 2 substudy. Lancet Diabetes Endocrinol. 2025. PMID 40609566.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40609566/',
  },
]

export default function RetatrutidePage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Retatrutide: 2026 Phase 3 Results, FDA Status and Gray-Market Risk"
        description="Evidence and regulatory review of investigational triple-agonist retatrutide, including phase 3 efficacy, peer-reviewed phase 2 safety, and FDA compounding restrictions."
        url="https://thehippiescientist.net/guides/other/retatrutide/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={RETATRUTIDE_REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Retatrutide' },
        ]}
      />
      <FAQSchema pagePath="/guides/other/retatrutide/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Investigational Drug Watch · Status checked August 15, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Retatrutide: Huge Phase 3 Weight Loss, Still Not an Approved Drug
        </h1>
        <p className="text-lg leading-8 text-muted">
          Retatrutide is one of 2026&apos;s most important obesity-drug stories: a once-weekly investigational molecule designed to activate <strong>GIP, GLP-1, and glucagon receptors</strong>. Phase 3 topline results are striking. The regulatory reality is equally important: retatrutide is not FDA approved, FDA says it cannot be used in compounding, and online “research” products should not be treated as the clinical-trial drug.
        </p>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-7 text-rose-950 max-w-4xl">
        <p className="font-semibold">Current U.S. status</p>
        <p className="mt-2">
          As of August 15, 2026, retatrutide remains investigational. FDA explicitly states that retatrutide <strong>cannot be used in compounding under federal law</strong> and has not been found safe and effective for any condition [5]. This page does not provide sourcing, reconstitution, injection, or self-dosing instructions.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence maturity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Peer-reviewed phase 2 evidence and 2026 phase 3 toplines are not the same publication stage</h2>
        <p className="text-sm leading-7 text-muted">
          The obesity and type 2 diabetes phase 2 programs are peer reviewed [1,2]. The newest pivotal TRIUMPH numbers were announced by Lilly in 2026 and presented through scientific-meeting channels, while full peer-reviewed publication of all phase 3 datasets is still catching up [3,4].
        </p>
        <p className="text-sm leading-7 text-muted">
          That does not make the phase 3 results unimportant. It means the page should label <strong>where each number came from</strong> rather than presenting every figure as though it had identical independent review and follow-up detail.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-5 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">TRIUMPH-1</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The May 2026 obesity topline result</h2>
        <p className="text-sm leading-7 text-muted">
          Lilly reported that adults with obesity or overweight and at least one weight-related comorbidity, without diabetes, lost an average of <strong>19.0% at 4 mg, 25.9% at 9 mg, and 28.3% at 12 mg</strong> over 80 weeks in TRIUMPH-1 [3].
        </p>
        <p className="text-sm leading-7 text-muted">
          At 12 mg, 45.3% of participants achieved at least 30% weight loss. In a prespecified blinded extension for participants entering with BMI at least 35, the 12 mg group reached <strong>30.3% average weight loss at 104 weeks</strong> [3]. These are unusually large pharmacologic weight-loss figures, but they remain results from a controlled investigational program—not evidence for unverified commercial vials.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">TRIUMPH-2 and TRIUMPH-3</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">July 2026 broadened the phase 3 evidence package</h2>
        <p className="text-sm leading-7 text-muted">
          In TRIUMPH-2, adults with obesity or overweight plus type 2 diabetes lost up to <strong>20.8%</strong> at 80 weeks, with A1C reductions up to 1.6 percentage points in Lilly&apos;s topline report [4].
        </p>
        <p className="text-sm leading-7 text-muted">
          In TRIUMPH-3, adults with severe obesity and established cardiovascular disease, with or without type 2 diabetes, lost up to <strong>22.6%</strong> at 80 weeks [4]. Lilly says the completed program supports planned global submissions and a U.S. BLA in the first quarter of 2027 [4].
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Mechanism</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“Triple agonist” describes receptor pharmacology—not proven superiority</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Drug concept</th><th className="py-2 pr-4 text-left font-semibold text-ink">Receptors</th><th className="py-2 text-left font-semibold text-ink">Evidence implication</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">Semaglutide</td><td className="py-3 pr-4">GLP-1</td><td className="py-3">Approved products have their own outcomes and safety programs.</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">Tirzepatide</td><td className="py-3 pr-4">GIP + GLP-1</td><td className="py-3">Dual agonism does not make cross-trial numerical rankings head-to-head.</td></tr>
              <tr><td className="py-3 pr-4 font-medium text-ink">Retatrutide</td><td className="py-3 pr-4">GIP + GLP-1 + glucagon</td><td className="py-3">The third receptor is scientifically novel; superiority must be proven in appropriate comparative trials.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">What peer review already tells us</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Phase 2 established efficacy—and important tolerability signals</h2>
        <p className="text-sm leading-7 text-muted">
          The 338-participant peer-reviewed obesity phase 2 trial found dose-responsive weight loss up to <strong>24.2% at 48 weeks</strong> with the 12 mg regimen versus 2.1% with placebo [1]. Gastrointestinal adverse events were most common, were dose-related, and were mostly mild to moderate. Dose-dependent heart-rate increases peaked around week 24 and then declined [1].
        </p>
        <p className="text-sm leading-7 text-muted">
          In the 281-participant type 2 diabetes phase 2 trial, retatrutide produced clinically meaningful A1C and weight reductions; nausea, diarrhea, vomiting, and constipation were again the main adverse events [2]. These controlled studies are a much stronger safety source than anecdotes from gray-market users.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Body composition</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Large total weight loss does not mean every pound is fat</h2>
        <p className="text-sm leading-7 text-muted">
          A 2025 randomized phase 2 body-composition substudy in people with type 2 diabetes found substantial reductions in total fat mass with retatrutide [7]. The proportion of lean-mass loss relative to total weight loss was reported as similar to other obesity treatments [7].
        </p>
        <p className="text-sm leading-7 text-muted">
          This is more useful than marketing phrases like “pure fat loss.” Any drug causing very large weight reduction deserves attention to nutrition, resistance exercise, function, and body composition rather than assuming the scale change is metabolically uniform.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">Gray-market reality</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“Research use only” does not create a legal consumer version of retatrutide</h2>
        <p className="text-sm leading-7 text-muted">
          FDA&apos;s current unapproved-GLP-1 page specifically names retatrutide and says it cannot be used in compounding under federal law [5]. FDA has also warned companies marketing unapproved retatrutide products to consumers [5].
        </p>
        <p className="text-sm leading-7 text-muted">
          A gray-market vial does not come with the evidentiary bridge needed to assume it contains the same molecule, concentration, purity, sterility, excipients, storage history, or dose accuracy as Lilly&apos;s investigational product. Therefore trial efficacy percentages cannot be transferred to online “retatrutide” products.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Comparison integrity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Do not call it “better than Zepbound” from separate trials</h2>
        <p className="text-sm leading-7 text-muted">
          Retatrutide&apos;s reported phase 3 weight-loss numbers are larger than many historical obesity-drug trial averages. But a numerical cross-trial comparison is not a randomized head-to-head comparison. Populations, estimands, durations, discontinuation handling, dose escalation, and background care can differ materially.
        </p>
        <p className="text-sm leading-7 text-muted">
          The correct 2026 statement is that retatrutide has produced exceptionally large weight-loss estimates in its own pivotal program. Whether it is superior to a specific approved therapy requires direct comparative evidence or carefully qualified indirect analysis.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What is established versus still pending</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">August 15, 2026 status</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Retatrutide has peer-reviewed randomized phase 2 efficacy data</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Pivotal phase 3 trials have reported positive topline results</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">All pivotal phase 3 data are fully peer reviewed and regulator adjudicated</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Retatrutide is FDA approved</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Retatrutide can lawfully be compounded under federal law</td><td className="py-3"><strong>No</strong>, per FDA</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Online research-peptide retatrutide is proven equivalent to trial drug</td><td className="py-3"><strong>No</strong></td></tr>
              <tr><td className="py-3 pr-4">Retatrutide is proven superior to tirzepatide or semaglutide head-to-head</td><td className="py-3"><strong>Not established</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">What to watch next</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The highest-value updates are regulatory and full-data updates</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Peer-reviewed full publications for TRIUMPH-1, TRIUMPH-2, and TRIUMPH-3.</li>
          <li>The planned U.S. BLA submission in Q1 2027 and FDA review timeline.</li>
          <li>Full adjudicated cardiovascular safety and event data.</li>
          <li>Longer-term weight maintenance, discontinuation, and regain data.</li>
          <li>Direct comparative trials against approved incretin therapies.</li>
          <li>More complete gallbladder, pancreatic, renal, heart-rate, and other adverse-event characterization.</li>
          <li>Whether obesity-complication indications such as sleep apnea or knee osteoarthritis are included in future submissions.</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Retatrutide may become a major obesity medicine, and its 2026 phase 3 results deserve attention. But the most valuable content distinction today is regulatory honesty: <strong>very strong investigational efficacy is not the same thing as FDA approval, and a gray-market “research peptide” is not the clinical-trial product.</strong> The right page should update quickly as peer-reviewed phase 3 papers and regulatory decisions arrive—without turning an investigational drug into a consumer protocol in the meantime.
        </p>
      </section>

      <References refs={RETATRUTIDE_REFS} />

      <div className="max-w-4xl rounded-xl border border-rose-900/15 bg-rose-50/70 p-4 text-xs leading-6 text-rose-950">
        <strong>No purchase links:</strong> retatrutide is investigational, FDA says it cannot be used in compounding under federal law, and this guide intentionally does not link to “research peptide” sellers or provide injection instructions.
      </div>

      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link href="/guides/other/" className="text-sm font-bold text-brand-800 hover:underline">← More topic guides</Link>
        <div className="flex gap-4">
          <Link href="/guides/other/orforglipron-foundayo/" className="text-sm font-bold text-brand-800 hover:underline">Foundayo →</Link>
          <Link href="/guides/other/tirzepatide/" className="text-sm font-bold text-brand-800 hover:underline">Tirzepatide →</Link>
        </div>
      </div>
    </div>
  )
}
