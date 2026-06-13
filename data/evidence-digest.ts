/**
 * Evidence Digest — a recurring, append-only log of human-evidence summaries.
 *
 * Each issue collects 3–5 goal-linked summaries of what controlled human research
 * currently supports, written conservatively. Entries deliberately summarize the
 * *state of the human evidence* and link out to the full on-site profile (which
 * carries the underlying citations) plus a PubMed query — rather than asserting a
 * single trial's metadata we cannot verify here. This keeps the digest aligned with
 * the site's evidence-grading discipline: interesting does not mean recommended.
 *
 * To publish a new issue: prepend an object to `evidenceDigestIssues`. Keep the
 * newest issue first. Grades must use the StandardEvidenceLabel vocabulary.
 */

import type { StandardEvidenceLabel } from '@/lib/decision-primitives'

export type DigestSource = {
  label: string
  href: string
}

export type DigestEntry = {
  /** Headline for the summary, e.g. "Ashwagandha for chronic stress". */
  title: string
  /** One-line, decision-useful takeaway. No hype. */
  takeaway: string
  /** Conservative evidence grade using the site-standard vocabulary. */
  grade: StandardEvidenceLabel
  /** Dominant human study design behind the grade. */
  studyType: string
  /** Who was studied (population framing). */
  population: string
  /** What the controlled human evidence shows. */
  finding: string
  /** The honest limitation that holds the grade back. */
  limitation: string
  /** Goal pathway this connects to. */
  goalSlug: string
  goalLabel: string
  /** Canonical on-site profile that carries the full citations. */
  profileHref?: string
  /** External evidence pointers (PubMed queries, registries). */
  sources: DigestSource[]
}

export type DigestIssue = {
  /** URL-safe issue number, used as an anchor. */
  number: number
  /** Display title. */
  title: string
  /** ISO date (YYYY-MM-DD) the issue was reviewed/published. */
  date: string
  /** Short editorial framing for the issue. */
  intro: string
  entries: DigestEntry[]
}

const PUBMED = (query: string) =>
  `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`

export const evidenceDigestIssues: DigestIssue[] = [
  {
    number: 2,
    title: 'Issue #2 — Calm without sedation: daytime anxiety & stress',
    date: '2026-06-13',
    intro:
      'This issue looks at options people reach for during the day, when the goal is a quieter nervous system without blunting alertness. The pattern across the controlled evidence: real but modest effects, with the strongest signals in standardized extracts and acute-stress settings.',
    entries: [
      {
        title: 'L-Theanine for acute stress and attention',
        takeaway:
          'A reasonable daytime option for taking the edge off acute stress — effects are real but subtle, and best documented short-term.',
        grade: 'Moderate evidence',
        studyType: 'Randomized, placebo-controlled human trials (mostly acute/short-term)',
        population: 'Healthy adults under induced or everyday stress',
        finding:
          'Controlled trials report reductions in subjective stress and improvements in attention/relaxation measures, often most clearly when paired with caffeine.',
        limitation:
          'Effect sizes are small, many studies are single-dose, and long-term anxiety outcomes are thin.',
        goalSlug: 'anxiety',
        goalLabel: 'Anxiety & calm',
        profileHref: '/compounds/l-theanine',
        sources: [
          { label: 'PubMed: L-theanine stress RCT', href: PUBMED('l-theanine stress anxiety randomized') },
          { label: 'Methodology', href: '/methodology' },
        ],
      },
      {
        title: 'Ashwagandha (standardized root extract) for chronic stress',
        takeaway:
          'One of the better-supported botanicals for subjective stress — but it is a multi-week commitment, not an acute fix.',
        grade: 'Moderate evidence',
        studyType: 'Multiple randomized, placebo-controlled trials',
        population: 'Adults with self-reported chronic stress or elevated anxiety',
        finding:
          'Standardized root extracts (e.g. KSM-66, Shoden) reduced perceived-stress and anxiety scale scores versus placebo over 6–8 weeks, often alongside lower cortisol.',
        limitation:
          'Many trials are small, industry-funded, and short; thyroid, pregnancy, and autoimmune cautions apply.',
        goalSlug: 'stress',
        goalLabel: 'Stress resilience',
        profileHref: '/herbs/ashwagandha',
        sources: [
          { label: 'PubMed: ashwagandha stress RCT', href: PUBMED('ashwagandha stress anxiety randomized controlled') },
          { label: 'Compare: Rhodiola vs Ashwagandha', href: '/compare/rhodiola-vs-ashwagandha' },
        ],
      },
      {
        title: 'Rhodiola rosea for stress-related fatigue',
        takeaway:
          'Worth considering when stress shows up as mental fatigue rather than as racing anxiety; evidence is mixed.',
        grade: 'Limited evidence',
        studyType: 'Randomized trials with heterogeneous designs',
        population: 'Adults with stress-related or burnout-type fatigue',
        finding:
          'Some controlled trials show improvements in fatigue and stress symptoms; results vary by extract and endpoint.',
        limitation:
          'Trial quality and standardization are inconsistent; can feel overstimulating in sensitive users.',
        goalSlug: 'stress',
        goalLabel: 'Stress resilience',
        profileHref: '/herbs/rhodiola',
        sources: [
          { label: 'PubMed: Rhodiola fatigue RCT', href: PUBMED('rhodiola rosea fatigue stress randomized') },
        ],
      },
      {
        title: 'Kava for generalized anxiety',
        takeaway:
          'Among the stronger anxiety signals for a botanical — but liver-safety caution makes it a careful, short-term choice.',
        grade: 'Moderate evidence',
        studyType: 'Randomized, placebo-controlled trials and meta-analyses',
        population: 'Adults with generalized or non-clinical anxiety',
        finding:
          'Aqueous and standardized kavalactone preparations reduced anxiety scores versus placebo in pooled analyses.',
        limitation:
          'Rare but serious hepatotoxicity reports; avoid with alcohol, liver disease, or other hepatically-cleared drugs.',
        goalSlug: 'anxiety',
        goalLabel: 'Anxiety & calm',
        profileHref: '/compare/kava-vs-alcohol',
        sources: [
          { label: 'PubMed: kava anxiety meta-analysis', href: PUBMED('kava anxiety meta-analysis randomized') },
        ],
      },
    ],
  },
  {
    number: 1,
    title: 'Issue #1 — What actually helps with sleep onset',
    date: '2026-06-06',
    intro:
      'The inaugural issue tackles the most-searched goal on the site: falling asleep. The honest summary is that the strongest human evidence is narrow and timing-specific, while several popular options sit at "limited but reasonable to try."',
    entries: [
      {
        title: 'Melatonin for sleep-onset and circadian timing',
        takeaway:
          'Best-supported for shifting sleep timing (jet lag, delayed phase); a smaller, lower-dose effect for general sleep onset.',
        grade: 'Strong evidence',
        studyType: 'Randomized trials and meta-analyses',
        population: 'Adults with circadian disruption or difficulty initiating sleep',
        finding:
          'Meta-analyses support reduced sleep-onset latency, with the clearest benefit for circadian-timing problems at low doses taken at the right time.',
        limitation:
          'General-insomnia effect sizes are modest; timing and dose matter more than amount; possible morning grogginess.',
        goalSlug: 'sleep',
        goalLabel: 'Sleep support',
        profileHref: '/compounds/melatonin',
        sources: [
          { label: 'PubMed: melatonin sleep onset meta-analysis', href: PUBMED('melatonin sleep onset latency meta-analysis') },
          { label: 'Compare: sleep herbs vs melatonin', href: '/compare/sleep-herbs-vs-melatonin' },
        ],
      },
      {
        title: 'Magnesium for sleep quality',
        takeaway:
          'Reasonable to try, especially if intake is low — but the human evidence is thinner than the popularity suggests.',
        grade: 'Limited evidence',
        studyType: 'Small randomized trials and observational data',
        population: 'Older adults and people with low magnesium status',
        finding:
          'Some controlled trials report modest improvements in subjective sleep, strongest where baseline magnesium is inadequate.',
        limitation:
          'Trials are small and mixed; benefit in magnesium-replete people is unclear; loose stools at higher doses.',
        goalSlug: 'sleep',
        goalLabel: 'Sleep support',
        profileHref: '/compounds/magnesium-glycinate',
        sources: [
          { label: 'PubMed: magnesium sleep RCT', href: PUBMED('magnesium supplementation sleep randomized') },
        ],
      },
      {
        title: 'L-Theanine for pre-sleep cognitive quieting',
        takeaway:
          'Helpful for a busy mind at bedtime rather than for severe insomnia; gentle and low-risk.',
        grade: 'Limited evidence',
        studyType: 'Small randomized and combination-product trials',
        population: 'Adults with stress-linked restlessness at night',
        finding:
          'Controlled studies suggest improved relaxation and some sleep-quality measures, often within combination products.',
        limitation:
          'Isolated long-term sleep data are limited; effect can be too subtle for clinical insomnia.',
        goalSlug: 'sleep',
        goalLabel: 'Sleep support',
        profileHref: '/compounds/l-theanine',
        sources: [
          { label: 'PubMed: L-theanine sleep RCT', href: PUBMED('l-theanine sleep quality randomized') },
        ],
      },
      {
        title: 'Curcumin for inflammation-linked discomfort',
        takeaway:
          'A useful adjacent option when poor sleep tracks with inflammatory joint discomfort; works on a days-to-weeks timeline.',
        grade: 'Moderate evidence',
        studyType: 'Randomized trials in osteoarthritis-adjacent pain',
        population: 'Adults with inflammatory joint discomfort',
        finding:
          'Bioavailability-enhanced curcumin reduced pain and function scores versus placebo in several controlled trials.',
        limitation:
          'Absorption varies widely by formulation; anticoagulant and gallbladder cautions apply.',
        goalSlug: 'inflammation',
        goalLabel: 'Inflammation support',
        profileHref: '/herbs/turmeric',
        sources: [
          { label: 'PubMed: curcumin osteoarthritis RCT', href: PUBMED('curcumin osteoarthritis pain randomized') },
        ],
      },
    ],
  },
]

/** Total human-evidence summaries published across all issues. */
export const evidenceDigestEntryCount = evidenceDigestIssues.reduce(
  (total, issue) => total + issue.entries.length,
  0,
)

/** Most recent issue date (ISO), for freshness signals. */
export const evidenceDigestLatestDate = evidenceDigestIssues
  .map((issue) => issue.date)
  .sort()
  .at(-1) as string
