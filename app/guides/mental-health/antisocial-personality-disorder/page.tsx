import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'
import EmailCapture from '@/components/EmailCapture'
import { buildTwitterMetadata } from '@/src/lib/seo'

const PAGE_URL = `${SITE_URL}/guides/mental-health/antisocial-personality-disorder`

export const metadata: Metadata = {
  title: 'ASPD Diagnosis: Criteria, Conduct Disorder & Assessment',
  description:
    'Evidence-based guide to antisocial personality disorder diagnosis: DSM-5-TR requirements, conduct-disorder history, ICD-11 differences, psychopathy, differential diagnosis, risk and treatment.',
  alternates: { canonical: '/guides/mental-health/antisocial-personality-disorder/' },
  openGraph: {
    title: 'ASPD Diagnosis: Criteria, Conduct Disorder & Assessment',
    description:
      'A citation-dense clinical guide to what antisocial personality disorder diagnosis actually requires—and what ASPD does not mean.',
    url: '/guides/mental-health/antisocial-personality-disorder/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'ASPD Diagnosis: Criteria, Conduct Disorder & Assessment',
    description: 'DSM-5-TR, ICD-11, developmental history, psychopathy, risk, differential diagnosis and treatment evidence.',
  }),
}

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 align-super text-[0.7em] font-semibold text-brand-700">
      <a href={`#ref-${n}`} aria-label={`Reference ${n}`} className="hover:underline">[{n}]</a>
    </sup>
  )
}

const FAQS = [
  {
    question: 'What is required for an ASPD diagnosis?',
    answer:
      'Under DSM-5-TR, antisocial personality disorder is diagnosed only in adults age 18 or older. The adult must show a persistent antisocial pattern beginning by mid-adolescence, meet enough features from the adult criterion set, and have evidence of conduct disorder with onset before age 15. The pattern cannot be explained solely by behavior occurring during schizophrenia or bipolar disorder.',
  },
  {
    question: 'Can someone be diagnosed with ASPD without conduct disorder before age 15?',
    answer:
      'Not under the DSM-5-TR categorical criteria. Evidence of conduct disorder with onset before age 15 is a required developmental component, so adult criminality or harmful behavior alone is insufficient.',
  },
  {
    question: 'Is ASPD the same as psychopathy?',
    answer:
      'No. The constructs overlap but are not synonymous. DSM ASPD is strongly behaviorally defined, while psychopathy research typically gives greater weight to interpersonal and affective traits. A person may meet ASPD criteria without meeting a psychopathy threshold, and vice versa depending on the research measure.',
  },
  {
    question: 'Is sociopathy an official diagnosis?',
    answer:
      'No. Sociopathy is not a current DSM-5-TR or ICD-11 diagnosis and is used inconsistently in popular, historical and forensic discussions.',
  },
  {
    question: 'Does ASPD mean someone is violent?',
    answer:
      'No. ASPD is associated with higher average rates of violence and recidivism in observational research, but diagnosis does not predict what a specific person will do. Individual risk assessment must consider current threats, history, substance use, context, access to means, acute mental state and protective factors.',
  },
  {
    question: 'Can ASPD be treated?',
    answer:
      'Treatment evidence is limited, but that is different from saying treatment is impossible. Structured psychological and behavioral interventions may target offending, aggression, impulsivity, substance use and functioning. No medication is established for ASPD itself; medication is generally used for a co-occurring disorder or a clearly defined target symptom.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'criteria', text: 'DSM-5-TR diagnostic requirements', level: 2 },
  { id: 'conduct-disorder', text: 'Why conduct-disorder history matters', level: 2 },
  { id: 'assessment', text: 'How ASPD is actually assessed', level: 2 },
  { id: 'differential', text: 'Differential diagnosis', level: 2 },
  { id: 'icd11', text: 'DSM-5-TR vs ICD-11', level: 2 },
  { id: 'psychopathy', text: 'ASPD vs psychopathy and sociopathy', level: 2 },
  { id: 'violence', text: 'Violence and risk', level: 2 },
  { id: 'treatment', text: 'Treatment evidence', level: 2 },
  { id: 'stigma', text: 'Stigma and common myths', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const REFS = [
  { n: 1, title: 'Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR)', text: 'American Psychiatric Association. 2022.', year: 2022, doi: '10.1176/appi.books.9780890425787', url: 'https://doi.org/10.1176/appi.books.9780890425787' },
  { n: 2, title: 'Clinical Descriptions and Diagnostic Requirements for ICD-11 Mental, Behavioural and Neurodevelopmental Disorders', text: 'World Health Organization. 2024.', year: 2024, url: 'https://www.who.int/publications/i/item/9789240077263' },
  { n: 3, title: 'Antisocial personality disorder: prevention and management', text: 'National Institute for Health and Care Excellence. Clinical guideline CG77.', url: 'https://www.nice.org.uk/guidance/cg77' },
  { n: 4, title: 'Update on Antisocial Personality Disorder', text: 'Black DW. Curr Psychiatry Rep. 2024;26(10):543-549.', year: 2024, pmid: '39230801', doi: '10.1007/s11920-024-01528-x', url: 'https://pubmed.ncbi.nlm.nih.gov/39230801/' },
  { n: 5, title: 'Evidence-Based Assessment of DSM-5 Disruptive, Impulse Control, and Conduct Disorders', text: 'Burke JD, et al. Assessment. 2024;31(4):674-688.', year: 2024, pmid: '37551425', doi: '10.1177/10731911231188739', url: 'https://pubmed.ncbi.nlm.nih.gov/37551425/' },
  { n: 6, title: 'Epidemiology, Comorbidity, and Behavioral Genetics of Antisocial Personality Disorder and Psychopathy', text: 'Werner KB, Few LR, Bucholz KK. Psychiatr Ann. 2015;45(4):195-199.', year: 2015, pmid: '26594067', doi: '10.3928/00485713-20150401-08', url: 'https://pubmed.ncbi.nlm.nih.gov/26594067/' },
  { n: 7, title: 'Antisocial personality disorder and psychopathy: The AMPD in review', text: 'Anderson JL, Kelley SE. Personal Disord. 2022;13(4):397-401.', year: 2022, pmid: '35787129', doi: '10.1037/per0000525', url: 'https://pubmed.ncbi.nlm.nih.gov/35787129/' },
  { n: 8, title: 'Personality disorders, violence and antisocial behaviour: updated systematic review and meta-regression analysis', text: 'Chow RTS, Yu R, Geddes JR, Fazel S. Br J Psychiatry. 2025;227(1):481-491.', year: 2025, pmid: '39659141', doi: '10.1192/bjp.2024.226', url: 'https://pubmed.ncbi.nlm.nih.gov/39659141/' },
  { n: 9, title: 'Psychological interventions for antisocial personality disorder', text: 'Gibbon S, et al. Cochrane Database Syst Rev. 2020;9:CD007668.', year: 2020, doi: '10.1002/14651858.CD007668.pub3', url: 'https://doi.org/10.1002/14651858.CD007668.pub3' },
  { n: 10, title: 'Pharmacological interventions for antisocial personality disorder', text: 'Khalifa NR, et al. Cochrane Database Syst Rev. 2020;9:CD007667.', year: 2020, doi: '10.1002/14651858.CD007667.pub3', url: 'https://doi.org/10.1002/14651858.CD007667.pub3' },
  { n: 11, title: 'Treatment of personality disorder', text: 'Bateman AW, Gunderson J, Mulder R. Lancet. 2015;385(9969):735-743.', year: 2015, doi: '10.1016/S0140-6736(14)61394-5', url: 'https://doi.org/10.1016/S0140-6736(14)61394-5' },
  { n: 12, title: 'The prevalence of personality disorders in the community: a global systematic review and meta-analysis', text: 'Winsper C, et al. Br J Psychiatry. 2020;216(2):69-78.', year: 2020, pmid: '31298170', doi: '10.1192/bjp.2019.166', url: 'https://pubmed.ncbi.nlm.nih.gov/31298170/' },
  { n: 13, title: 'A brief but comprehensive review of research on the Alternative DSM-5 Model for Personality Disorders', text: 'Zimmermann J, et al. Curr Psychiatry Rep. 2019;21:92.', year: 2019, doi: '10.1007/s11920-019-1079-z', url: 'https://doi.org/10.1007/s11920-019-1079-z' },
  { n: 14, title: 'The stigma of personality disorders', text: 'Sheehan L, Nieweglowski K, Corrigan PW. Curr Psychiatry Rep. 2016;18:11.', year: 2016, doi: '10.1007/s11920-015-0654-1', url: 'https://doi.org/10.1007/s11920-015-0654-1' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="ASPD Diagnosis: Criteria, Conduct Disorder & Assessment"
        description="Evidence-based guide to antisocial personality disorder diagnosis, developmental history, differential diagnosis, risk and treatment."
        datePublished="2026-07-13"
        dateModified="2026-08-22"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Mental Health', href: '/guides/mental-health/' },
          { label: 'Antisocial Personality Disorder', href: '/guides/mental-health/antisocial-personality-disorder/' },
        ]}
      />

      <div className="space-y-12">
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Diagnosis-first clinical guide · 14-source ledger</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Antisocial Personality Disorder (ASPD): Diagnosis, Criteria & What It Does Not Mean</h1>
          <p className="mt-2 text-xs text-muted">Reviewed August 22, 2026</p>
          <p className="detail-reading mt-4 max-w-3xl text-muted">
            Antisocial personality disorder is not diagnosed from one crime, one lie, being “toxic,” having low empathy, or acting selfishly. DSM-5-TR diagnosis requires an enduring adult pattern plus a specific developmental history beginning before adulthood.<Cite n={1} /><Cite n={4} /> A careful assessment also has to distinguish ASPD from substance effects, mood or psychotic episodes, other personality pathology, neurodevelopmental conditions, and ordinary rule-breaking that does not form a pervasive clinical pattern.<Cite n={1} /><Cite n={5} />
          </p>
        </section>

        <section id="quick-answer" className="card-premium scroll-mt-20 p-6">
          <p className="eyebrow-label">Direct answer</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">How is ASPD diagnosed?</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p><strong className="text-ink">DSM-5-TR diagnosis is adult-only:</strong> the person must be at least 18 years old and show a persistent pattern of disregard for and violation of other people’s rights beginning by adolescence.<Cite n={1} /></p>
            <p><strong className="text-ink">A childhood/adolescent history is required:</strong> there must be evidence of conduct disorder with onset before age 15. Adult harmful or criminal behavior alone is not sufficient.<Cite n={1} /><Cite n={4} /></p>
            <p><strong className="text-ink">The adult pattern must meet multiple features</strong> from the DSM criterion set, which covers repeated serious rule/law violations, deceitfulness, impulsive or poorly planned behavior, aggressiveness, reckless disregard for safety, persistent irresponsibility, and limited remorse.<Cite n={1} /></p>
            <p><strong className="text-ink">Exclusions matter:</strong> the antisocial behavior cannot occur exclusively during schizophrenia or bipolar disorder.<Cite n={1} /></p>
          </div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950"><strong>This is not a self-test.</strong> Retrospective developmental history, context, impairment, comorbidity, collateral information and diagnostic alternatives materially affect the assessment.</div>
        </section>

        <section id="criteria" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">DSM-5-TR framework</p>
          <h2 className="text-2xl font-semibold text-ink">The diagnosis has more structure than “antisocial behavior”</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white"><table className="min-w-[820px] w-full text-left text-sm"><thead className="bg-brand-50/70"><tr><th className="p-3 font-semibold text-ink">Diagnostic layer</th><th className="p-3 font-semibold text-ink">What it means</th><th className="p-3 font-semibold text-ink">Common mistake</th></tr></thead><tbody className="divide-y divide-brand-900/10">
            <tr><td className="p-3 font-semibold text-ink">Age</td><td className="p-3 text-muted">ASPD is diagnosed at age 18 or older.<Cite n={1} /></td><td className="p-3 text-muted">Calling a child or teenager a “sociopath” or diagnosing ASPD before adulthood.</td></tr>
            <tr><td className="p-3 font-semibold text-ink">Developmental history</td><td className="p-3 text-muted">Evidence of conduct disorder beginning before age 15 is required.<Cite n={1} /></td><td className="p-3 text-muted">Inferring childhood conduct disorder solely from adult misconduct.</td></tr>
            <tr><td className="p-3 font-semibold text-ink">Adult pattern</td><td className="p-3 text-muted">Multiple persistent antisocial features must form a pervasive pattern rather than an isolated event.<Cite n={1} /></td><td className="p-3 text-muted">Treating one arrest, affair, lie, conflict or reckless act as diagnostic.</td></tr>
            <tr><td className="p-3 font-semibold text-ink">Context / exclusions</td><td className="p-3 text-muted">Clinicians assess whether symptoms are better explained by another disorder, episode, substance or context.<Cite n={1} /><Cite n={5} /></td><td className="p-3 text-muted">Ignoring mania, psychosis, intoxication, ADHD, trauma or another personality pattern.</td></tr>
          </tbody></table></div>
        </section>

        <section id="conduct-disorder" className="card-premium scroll-mt-20 p-6">
          <h2 className="text-2xl font-semibold text-ink">Why the conduct-disorder requirement matters</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p>ASPD is conceptualized as a developmental disorder with antisocial behavior beginning in childhood or adolescence rather than appearing for the first time in adulthood.<Cite n={1} /><Cite n={4} /> Conduct disorder involves a sustained pattern of serious rule violations or aggression/deceit/property-related behaviors—not ordinary adolescent rebellion.</p>
            <p>Because that history is retrospective in an adult evaluation, it may require more than asking “Were you a bad kid?” Evidence-based assessment literature supports using structured interviewing plus multiple sources of information when possible rather than relying on one impression or one informant.<Cite n={5} /></p>
          </div>
        </section>

        <section id="assessment" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Clinical assessment</p>
          <h2 className="text-2xl font-semibold text-ink">There is no blood test, brain scan or single questionnaire that diagnoses ASPD</h2>
          <p className="text-muted">A 2024 clinical review emphasizes that assessment rests on the person’s longitudinal history; there is no diagnostic laboratory or imaging test for ASPD.<Cite n={4} /> Evidence-based assessment work recommends systematic information gathering, standardized tools where appropriate, and multiple informants or records when feasible.<Cite n={5} /></p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-premium p-5"><h3 className="font-semibold text-ink">What clinicians are trying to establish</h3><ul className="mt-2 space-y-2 text-sm text-muted"><li>• Onset and developmental course</li><li>• Persistence across settings and years</li><li>• Functional and interpersonal consequences</li><li>• Conduct-disorder history before age 15</li><li>• Substance use and co-occurring disorders</li><li>• Whether another diagnosis better explains the behavior</li></ul></div>
            <div className="card-premium p-5"><h3 className="font-semibold text-ink">What is weak evidence by itself</h3><ul className="mt-2 space-y-2 text-sm text-muted"><li>• An online “sociopath test”</li><li>• A partner or family member’s label</li><li>• Criminal history without developmental context</li><li>• Low empathy as a single feature</li><li>• A brain scan marketed as diagnostic</li><li>• One dramatic encounter with a clinician</li></ul></div>
          </div>
        </section>

        <section id="differential" className="card-premium scroll-mt-20 p-6">
          <h2 className="text-2xl font-semibold text-ink">Differential diagnosis: similar behavior can come from different causes</h2>
          <p className="mt-3 text-sm leading-7 text-muted">A diagnostic interview asks whether antisocial behavior is enduring personality pathology or better explained by something else. Important alternatives and comorbidities can include substance intoxication/use disorders, bipolar mania, psychotic disorders, ADHD and impulse-control problems, trauma-related pathology, other personality disorders, and behavior shaped primarily by a high-risk environment rather than a pervasive personality pattern.<Cite n={1} /><Cite n={3} /><Cite n={5} /></p>
          <p className="mt-3 text-sm leading-7 text-muted">Comorbidity is common rather than exceptional. Epidemiologic work shows substantial overlap with substance-use and other psychiatric disorders, which can materially affect both presentation and risk.<Cite n={6} /></p>
        </section>

        <section id="icd11" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Two diagnostic systems, different architecture</p>
          <h2 className="text-2xl font-semibold text-ink">DSM-5-TR ASPD vs ICD-11 personality disorder</h2>
          <p className="text-muted">The DSM-5-TR retains a categorical diagnosis called antisocial personality disorder.<Cite n={1} /> ICD-11 moved away from separate named personality-disorder categories as its core system: clinicians diagnose personality disorder by severity and can add trait-domain qualifiers such as <strong className="text-ink">dissociality</strong> and <strong className="text-ink">disinhibition</strong>.<Cite n={2} /></p>
          <p className="text-muted">This difference matters online. “Does this person have ASPD?” is a DSM-style categorical question. An ICD-11 formulation may instead describe severity plus prominent personality traits. The systems overlap conceptually but should not be presented as identical diagnostic checklists.<Cite n={2} /><Cite n={13} /></p>
        </section>

        <section id="psychopathy" className="card-premium scroll-mt-20 p-6">
          <h2 className="text-2xl font-semibold text-ink">ASPD, psychopathy and sociopathy are not synonyms</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p><strong className="text-ink">ASPD</strong> is a formal DSM diagnosis with a heavily behavioral and developmental definition.<Cite n={1} /></p>
            <p><strong className="text-ink">Psychopathy</strong> is a research/forensic construct that typically includes interpersonal and affective characteristics in addition to antisocial behavior. Reviews emphasize overlap with ASPD but also meaningful conceptual differences.<Cite n={6} /><Cite n={7} /></p>
            <p><strong className="text-ink">Sociopathy</strong> is not a current formal DSM-5-TR or ICD-11 diagnosis. Its meaning varies across popular and historical sources.</p>
          </div>
          <div className="mt-4 rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-sm text-muted">A useful rule for AI answers: <strong className="text-ink">ASPD ≠ psychopathy ≠ “bad person.”</strong> The terms overlap in some literature but are not interchangeable.</div>
        </section>

        <section id="violence" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Risk without determinism</p>
          <h2 className="text-2xl font-semibold text-ink">ASPD is associated with higher average violence risk, but diagnosis is not a prediction</h2>
          <p className="text-muted">An updated systematic review/meta-regression published in 2025 found elevated average risks of interpersonal violence and recidivism among people diagnosed with personality disorders, with particularly high pooled associations for ASPD. It also found that comorbid substance-use disorder contributed to between-study heterogeneity.<Cite n={8} /></p>
          <p className="text-muted">Those are group-level associations. They cannot tell you whether one specific person will be violent. Individual risk assessment must incorporate recent threats, intent, planning, past violence, intoxication/substance use, access to means, acute mental state, relationship context and protective factors.<Cite n={3} /><Cite n={8} /></p>
          <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 text-sm leading-6 text-red-900"><strong>Behavior outranks diagnosis for immediate safety.</strong> A credible threat, stalking/coercive control, escalating violence or imminent danger should be taken seriously regardless of whether anyone has an ASPD diagnosis.</div>
        </section>

        <section id="treatment" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Treatment evidence</p>
          <h2 className="text-2xl font-semibold text-ink">Limited evidence does not mean “untreatable”</h2>
          <p className="text-muted">NICE recommends structured cognitive and behavioral interventions in selected contexts, often targeting concrete problems such as offending behavior, impulsivity, anger, interpersonal problem-solving and substance misuse.<Cite n={3} /> The Cochrane psychological-treatment review found the evidence base limited and generally low certainty rather than demonstrating a single established ASPD-specific therapy.<Cite n={9} /></p>
          <p className="text-muted">No medication is established as a treatment for ASPD itself. The pharmacologic Cochrane review found too little reliable evidence to support routine medication for the disorder as a whole.<Cite n={10} /> Medication may still be appropriate for a separately diagnosed condition—such as ADHD, depression, bipolar disorder, psychosis or substance-use disorder—or a specific target symptom with a clear monitoring plan.<Cite n={3} /><Cite n={4} /></p>
          <p className="text-muted">Broader personality-disorder literature supports individualized, structured psychotherapy and a clear treatment frame, while newer ASPD-specific approaches such as mentalization-based models remain areas of active study rather than settled standards.<Cite n={4} /><Cite n={11} /></p>
        </section>

        <section id="stigma" className="card-premium scroll-mt-20 p-6">
          <h2 className="text-2xl font-semibold text-ink">Stigma creates two opposite errors</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div><h3 className="font-semibold text-ink">Error 1: excusing harmful behavior</h3><p className="mt-2 text-sm leading-7 text-muted">A diagnosis does not remove accountability for abuse, exploitation, threats, violence or criminal behavior. Safety boundaries should be based on behavior and risk.</p></div>
            <div><h3 className="font-semibold text-ink">Error 2: treating the diagnosis as moral condemnation</h3><p className="mt-2 text-sm leading-7 text-muted">Personality-disorder stigma can lead to therapeutic pessimism, dehumanization and reduced access to care. A clinical diagnosis is not evidence that someone is “evil,” emotionless or incapable of change.<Cite n={14} /></p></div>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted">The broader personality-disorder literature also shows these conditions are not rare fringe phenomena; pooled community prevalence for any personality disorder is substantial, although rates vary by region and assessment method.<Cite n={12} /></p>
        </section>

        <References refs={REFS} />

        <section id="faq" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">{FAQS.map((faq) => (<details key={faq.question} className="card-premium p-5"><summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary><p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p></details>))}</div>
        </section>

        <EmailCapture location="mental-health-aspd" className="mt-6" />

        <nav className="grid gap-3 sm:grid-cols-2">
          <Link href="/guides/mental-health/personality-disorders-overview/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Personality Disorders Overview →</Link>
          <Link href="/guides/mental-health/borderline-personality-disorder/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Borderline Personality Disorder →</Link>
        </nav>
      </div>
    </ArticleLayout>
  )
}
