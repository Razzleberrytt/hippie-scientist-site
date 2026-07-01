import Link from 'next/link'

const claim = {
  statement: 'Ashwagandha may support perceived stress reduction in generally healthy adults.',
  entity: 'Ashwagandha (Withania somnifera)',
  goal: 'Stress / Calm',
  evidenceLabel: 'Moderate',
  contradictionStatus: 'Mixed evidence — mostly supportive, not uniform',
  safetyModifier: 'Moderate caution',
  lastReviewed: 'May 30, 2026',
  bottomLine: [
    'Several short randomized placebo-controlled trials in adults with self-reported stress report improvements on perceived-stress or anxiety scales, often alongside cortisol changes.',
    'The signal is not strong enough for hype: studies are small, short, often use different branded extracts, and at least one relevant trial in stressed, fatigued adults did not reduce perceived stress versus placebo.',
    'This claim matters most to generally healthy adults comparing non-prescription options for everyday stress, especially when stress feels tense, sleep-adjacent, or rumination-heavy.',
  ],
}

const decisionStates = [
  {
    state: 'Consider with caution',
    active: true,
    note: 'Best-supported action for a generally healthy adult after reviewing pregnancy, thyroid, liver, autoimmune, sedative, blood-pressure, blood-sugar, and medication concerns.',
  },
  {
    state: 'Consider',
    active: false,
    note: 'Too casual for this claim because the benefit signal is short-term and the safety profile has real caveats.',
  },
  {
    state: 'Experimental',
    active: false,
    note: 'The human evidence is stronger than purely experimental, but extract-specific uncertainty remains.',
  },
  {
    state: 'Avoid in context',
    active: false,
    note: 'Applies when pregnant or breastfeeding, with liver disease history, thyroid instability, hormone-sensitive prostate cancer, or relevant medication risk unless a clinician says otherwise.',
  },
  {
    state: 'Not enough evidence',
    active: false,
    note: 'Not the right overall label: multiple human trials exist, but they are not definitive.',
  },
]

const evidenceBreakdown = [
  {
    dimension: 'Human relevance',
    level: 'High',
    indicator: '●●●●○',
    explanation: 'The core signal comes from randomized placebo-controlled trials in human adults reporting stress, not only from animal or mechanistic data.',
  },
  {
    dimension: 'Directness',
    level: 'Moderate-high',
    indicator: '●●●◐○',
    explanation: 'Most supportive studies measure perceived stress or anxiety directly, but preparations, doses, outcome scales, and stress definitions differ.',
  },
  {
    dimension: 'Study quality',
    level: 'Moderate',
    indicator: '●●●○○',
    explanation: 'Placebo control and blinding help, while small samples, short durations, branded extracts, and limited independent replication keep confidence below strong.',
  },
  {
    dimension: 'Consistency',
    level: 'Moderate',
    indicator: '●●●○○',
    explanation: 'Most trials point toward benefit, but not every relevant trial improves perceived stress; the disagreement changes the decision from simple “consider” to “consider with caution.”',
  },
  {
    dimension: 'Practical usefulness',
    level: 'Moderate',
    indicator: '●●●○○',
    explanation: 'Potentially useful for subjective stress over 4–12 weeks, but it is not acute rescue, not a substitute for care, and not proven for long-term stress management.',
  },
]

const supportingStudies = [
  {
    year: '2012',
    type: 'Randomized, double-blind, placebo-controlled trial',
    population: 'Adults with chronic self-reported stress',
    sampleSize: '64',
    duration: '60 days',
    result: 'High-concentration root extract improved perceived stress and related well-being measures versus placebo.',
    relevance: 'Directly supports the claim, but it is small and extract-specific.',
  },
  {
    year: '2019',
    type: 'Randomized, double-blind, placebo-controlled three-arm trial',
    population: 'Stressed healthy adults with elevated perceived stress scores',
    sampleSize: '60',
    duration: '8 weeks',
    result: 'Ashwagandha groups reported greater stress reduction than placebo; pharmacologic stress markers also moved favorably.',
    relevance: 'Directly relevant to generally healthy adults, with dose comparison, but still small.',
  },
  {
    year: '2021',
    type: 'Randomized, double-blind, placebo-controlled trial',
    population: 'Healthy stressed adults',
    sampleSize: '130',
    duration: '90 days',
    result: 'Sustained-release root extract improved validated stress and sleep measures and lowered cortisol versus placebo.',
    relevance: 'A larger short-term trial that supports the stress claim, though it uses one standardized extract.',
  },
  {
    year: '2022',
    type: 'Randomized, placebo-controlled trial',
    population: 'Adults reporting perceived stress',
    sampleSize: '60',
    duration: '30 days',
    result: 'Root-and-leaf extract groups reported improvements in stress, anxiety, mood, and cravings; one dose lowered salivary cortisol.',
    relevance: 'Useful supportive signal, but the 30-day window and root/leaf extract limit generalization.',
  },
]

const sources = [
  {
    citation: 'Chandrasekhar K, Kapoor J, Anishetty S. Indian Journal of Psychological Medicine. 2012;34(3):255–262.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/23439798/',
    studyType: 'Randomized placebo-controlled trial',
    relationship: 'Supportive primary evidence',
    note: 'Small 60-day trial in stressed adults; directly maps to perceived-stress reduction but cannot settle extract generalizability.',
  },
  {
    citation: 'Lopresti AL, Smith SJ, Malvi H, Kodgule R. Medicine. 2019;98(37):e17186.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31517876/',
    studyType: 'Randomized placebo-controlled trial',
    relationship: 'Supportive primary evidence',
    note: 'Eight-week dose-ranging study in stressed healthy adults; relevant outcomes, small sample.',
  },
  {
    citation: 'Gopukumar K, Thanawala S, Somepalli V, et al. Evidence-Based Complementary and Alternative Medicine. 2021;2021:8254344.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/34887949/',
    studyType: 'Randomized placebo-controlled trial',
    relationship: 'Supportive primary evidence',
    note: 'Larger 90-day sustained-release root-extract trial; useful for short-term stress interpretation.',
  },
  {
    citation: 'Remenapp A, Coyle K, Orange T, et al. Journal of Ayurveda and Integrative Medicine. 2022;13(1):100510.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/34999212/',
    studyType: 'Randomized placebo-controlled trial',
    relationship: 'Supportive but less direct extract match',
    note: 'Root-and-leaf extract over 30 days; supports perceived stress but differs from root-only products.',
  },
  {
    citation: 'Smith SJ, Lopresti AL, Fairchild TJ. Journal of Psychopharmacology. 2023;37(11):1091–1104.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/37982907/',
    studyType: 'Randomized placebo-controlled trial',
    relationship: 'Mixed / contradictory evidence',
    note: 'Relevant stressed and fatigued population; fatigue improved, but perceived stress did not clearly beat placebo.',
  },
  {
    citation: 'NIH Office of Dietary Supplements. Ashwagandha: Fact Sheet for Health Professionals. Updated evidence and safety review.',
    href: 'https://ods.od.nih.gov/factsheets/Ashwagandha-HealthProfessional/',
    studyType: 'Evidence and safety review',
    relationship: 'Context and safety interpretation',
    note: 'Summarizes trial patterns, extract variation, short-term tolerability, liver and thyroid concerns, pregnancy cautions, and medication interactions.',
  },
]

const safetyGroups = [
  {
    title: 'Important cautions',
    items: [
      'Short-term use appears reasonably tolerated in trials, but long-term safety over months or years is not established.',
      'Stop and seek care for jaundice, dark urine, severe itching, unusual fatigue, abdominal pain, or other possible liver-warning symptoms.',
      'Drowsiness and gastrointestinal effects such as nausea or loose stools can occur.',
    ],
  },
  {
    title: 'Medication concerns',
    items: [
      'Review use with sedatives, alcohol-heavy patterns, thyroid medication, immunosuppressants, blood-pressure drugs, and blood-sugar-lowering drugs.',
      'Do not use as a substitute for treatment of anxiety disorders, depression, insomnia, thyroid disease, or chronic stress-related illness.',
    ],
  },
  {
    title: 'Populations requiring caution',
    items: [
      'Pregnant or breastfeeding people should avoid unless specifically cleared by a qualified clinician.',
      'People with liver disease history, thyroid instability, autoimmune conditions, hormone-sensitive prostate cancer, or complex medication lists need clinician review first.',
    ],
  },
  {
    title: 'Known uncertainties',
    items: [
      'Risk may vary by plant part, extract, withanolide profile, contamination, dose, and product quality.',
      'Trial safety does not rule out uncommon adverse events in broader consumer use.',
    ],
  },
]

const unknowns = [
  'Whether benefits persist, fade, or change with continuous use beyond roughly 8–12 weeks.',
  'Which extracts, plant parts, and withanolide profiles are genuinely interchangeable for perceived stress.',
  'How well trial results generalize outside mostly self-reported stress populations and outside specific study settings.',
  'Whether people with psychiatric diagnoses, endocrine disease, liver vulnerability, autoimmune disease, or complex medication use have a different risk-benefit balance.',
]

const nextDecisions = [
  { label: 'Rhodiola vs Ashwagandha', href: '/guides/compare/rhodiola-vs-ashwagandha', note: 'Compare calming stress support with fatigue-oriented stress support.' },
  { label: 'Ashwagandha vs Rhodiola for Stress', href: '/guides/compare/rhodiola-vs-ashwagandha', note: 'Choose by wired-versus-tired stress pattern.' },
  { label: 'Stress / Calm goal guide', href: '/guides/anxiety', note: 'See other stress-support options and caution groups.' },
  { label: 'Best Adaptogens for Stress', href: '/guides/anxiety/best-adaptogens-for-stress', note: 'Compare ashwagandha with other adaptogens before buying.' },
]

function SectionHeader({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="eyebrow-label">{kicker}</p>
      <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
      {children ? <div className="text-sm leading-6 text-muted">{children}</div> : null}
    </div>
  )
}

export function AshwagandhaStressClaim() {
  return (
    <section id="ashwagandha-stress-claim" className="space-y-6 rounded-[1.35rem] border border-emerald-900/15 bg-white/80 p-4 shadow-sm sm:p-6">
      <header className="hero-shell rounded-[1.15rem] border border-brand-900/10 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="evidence-pill-moderate">{claim.evidenceLabel} evidence</span>
          <span className="rounded-full border border-amber-700/15 bg-amber-100/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">{claim.safetyModifier}</span>
        </div>
        <div className="mt-5 space-y-3">
          <p className="eyebrow-label">Evidence Engine proof of concept</p>
          <h2 className="max-w-[26ch] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{claim.statement}</h2>
          <p className="max-w-3xl text-base leading-7 text-muted">A claim-level view for one practical question: does the evidence justify considering ashwagandha for perceived stress?</p>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Entity', claim.entity],
            ['Goal category', claim.goal],
            ['Contradiction status', claim.contradictionStatus],
            ['Safety modifier', claim.safetyModifier],
            ['Last reviewed', claim.lastReviewed],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="card-premium p-4 sm:p-5">
        <SectionHeader kicker="Bottom line" title="Promising, short-term, and not universal" />
        <div className="mt-4 grid gap-3">
          {claim.bottomLine.map(item => (
            <p key={item} className="rounded-xl border border-brand-900/10 bg-white/80 p-3 text-sm leading-6 text-muted">{item}</p>
          ))}
        </div>
      </section>

      <section className="card-premium p-4 sm:p-5">
        <SectionHeader kicker="Decision snapshot" title="What action does the evidence support?">
          <p>The evidence supports a cautious trial only for people whose safety context fits. It does not support treating ashwagandha as risk-free or as a replacement for care.</p>
        </SectionHeader>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {decisionStates.map(item => (
            <div key={item.state} className={`rounded-xl border p-4 ${item.active ? 'border-emerald-700/25 bg-emerald-50/80' : 'border-brand-900/10 bg-white/75'}`}>
              <p className={`text-sm font-bold ${item.active ? 'text-emerald-900' : 'text-ink'}`}>{item.active ? '✓ ' : ''}{item.state}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium p-4 sm:p-5">
        <SectionHeader kicker="Evidence breakdown" title="Why the grade is moderate" />
        <div className="mt-4 space-y-3">
          {evidenceBreakdown.map(item => (
            <div key={item.dimension} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-ink">{item.dimension}</h3>
                <span className="font-mono text-sm tracking-wider text-emerald-800" aria-label={`${item.level} evidence indicator`}>{item.indicator}</span>
              </div>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{item.level}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium p-4 sm:p-5">
        <SectionHeader kicker="Supporting evidence" title="Representative studies, not a citation dump" />
        <div className="mt-4 overflow-x-auto rounded-xl border border-brand-900/10 bg-white/80">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-sand-50 text-ink">
              <tr className="border-b border-brand-900/10">
                {['Year', 'Type', 'Population', 'Sample', 'Duration', 'Result', 'Relevance'].map(heading => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}
              </tr>
            </thead>
            <tbody className="text-muted">
              {supportingStudies.map(study => (
                <tr key={`${study.year}-${study.sampleSize}`} className="border-b border-brand-900/10 last:border-0">
                  <td className="px-3 py-3 font-semibold text-ink">{study.year}</td>
                  <td className="px-3 py-3">{study.type}</td>
                  <td className="px-3 py-3">{study.population}</td>
                  <td className="px-3 py-3">{study.sampleSize}</td>
                  <td className="px-3 py-3">{study.duration}</td>
                  <td className="px-3 py-3">{study.result}</td>
                  <td className="px-3 py-3">{study.relevance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-800/15 bg-amber-50/75 p-4 sm:p-5">
        <SectionHeader kicker="Contradictory evidence" title="What disagrees, and how much should it change confidence?" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-900/10 bg-white/70 p-4"><h3 className="text-base font-semibold text-ink">What disagrees</h3><p className="mt-2 text-sm leading-6 text-[#5f4a24]">A 2023 trial in adults with high stress and fatigue found fatigue improvement but not a clear perceived-stress reduction versus placebo.</p></div>
          <div className="rounded-xl border border-amber-900/10 bg-white/70 p-4"><h3 className="text-base font-semibold text-ink">Why it may disagree</h3><p className="mt-2 text-sm leading-6 text-[#5f4a24]">Population, baseline fatigue, extract chemistry, dose, study duration, and outcome sensitivity can all change whether perceived stress moves.</p></div>
          <div className="rounded-xl border border-amber-900/10 bg-white/70 p-4"><h3 className="text-base font-semibold text-ink">Confidence change</h3><p className="mt-2 text-sm leading-6 text-[#5f4a24]">This keeps the label at Moderate and changes the practical state to “consider with caution,” not “strongly recommended.”</p></div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/80 p-4 sm:p-5">
        <SectionHeader kicker="Safety before sourcing" title="Who should slow down or avoid?" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {safetyGroups.map(group => (
            <div key={group.title} className="rounded-xl border border-amber-900/10 bg-white/75 p-4">
              <h3 className="text-base font-semibold text-ink">{group.title}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[#5f4a24]">
                {group.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium p-4 sm:p-5">
        <SectionHeader kicker="What we still do not know" title="The limits are part of the claim" />
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {unknowns.map(item => <li key={item} className="rounded-xl border border-brand-900/10 bg-white/80 p-3 text-sm leading-6 text-muted">{item}</li>)}
        </ul>
      </section>

      <section className="card-premium p-4 sm:p-5">
        <SectionHeader kicker="Source trail" title="How each source affects the claim" />
        <div className="mt-4 space-y-3">
          {sources.map(source => (
            <article key={source.citation} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
              <h3 className="max-w-none text-base font-semibold text-ink"><a href={source.href} className="hover:underline">{source.citation}</a></h3>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div><dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Study type</dt><dd className="mt-1 text-muted">{source.studyType}</dd></div>
                <div><dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Relationship</dt><dd className="mt-1 text-muted">{source.relationship}</dd></div>
                <div><dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Extraction note</dt><dd className="mt-1 text-muted">{source.note}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="card-premium p-4 sm:p-5">
        <SectionHeader kicker="Next decisions" title="What should a skeptical reader compare next?" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {nextDecisions.map(item => (
            <Link key={item.href} href={item.href} className="rounded-xl border border-brand-900/10 bg-white/80 p-4 hover:border-emerald-700/20 hover:bg-emerald-50/60">
              <span className="text-sm font-semibold text-ink">{item.label}</span>
              <span className="mt-2 block text-sm leading-6 text-muted">{item.note}</span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  )
}
