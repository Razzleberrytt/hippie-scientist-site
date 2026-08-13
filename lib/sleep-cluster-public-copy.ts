import type { SleepArticleContent } from './sleep-cluster-content'

const REVIEW_DATE = 'August 12, 2026'

const CALIBRATED_SLUGS = new Set([
  'magnesium-for-sleep',
  'best-magnesium-for-sleep',
  'sleep-stack-magnesium-melatonin',
  'l-theanine-for-calm',
])

const metadataOverrides: Record<string, { title: string; description: string }> = {
  'magnesium-for-sleep': {
    title: 'Magnesium for Sleep: What the Human Evidence Supports',
    description:
      'Evidence-first guide to magnesium and sleep, including the newer bisglycinate trial, older insomnia evidence, medication and kidney safety, and why study regimens are not universal bedtime doses.',
  },
  'best-magnesium-for-sleep': {
    title: 'Best Magnesium for Sleep? What Form-Specific Evidence Can Actually Show',
    description:
      'Evidence-first magnesium-form guide for sleep. Compare direct human trials, tolerability, study formulations, safety, and product matching without declaring a universal form winner.',
  },
  'sleep-stack-magnesium-melatonin': {
    title: 'Magnesium + Melatonin for Sleep: What Combination Evidence Shows',
    description:
      'Evidence-first review of magnesium plus melatonin for sleep, including the small direct combination trial, multi-ingredient studies, safety limits, and why trial regimens do not create a universal stack.',
  },
  'l-theanine-for-calm': {
    title: 'L-Theanine for Calm and Sleep: What the Evidence Supports',
    description:
      'Evidence-first guide to L-theanine for calm and sleep, separating the newer sleep signal from acute-anxiety claims, fixed bedtime dosing, and unsupported supplement-stack assumptions.',
  },
}

export function isCalibratedSleepArticleSlug(slug: string) {
  return CALIBRATED_SLUGS.has(slug)
}

export function getSleepArticlePublicMetadata(
  slug: string,
  fallback: { title: string; description: string },
) {
  return metadataOverrides[slug] ?? fallback
}

function limitedEvidence(
  content: SleepArticleContent,
  label: string,
  explanation: string,
  downgradeReasons: string[],
  score = 45,
): SleepArticleContent['evidence'] {
  return {
    ...content.evidence,
    tier: 'limited',
    grade: 'C',
    label,
    score,
    explanation,
    downgradeReasons,
    barColorClass: 'bg-amber-500',
    textColorClass: 'text-amber-800',
    bgColorClass: 'bg-amber-50',
    borderColorClass: 'border-amber-200',
  }
}

function calibrateMagnesiumForSleep(content: SleepArticleContent): SleepArticleContent {
  return {
    ...content,
    eyebrow: 'Sleep evidence guide',
    tlDr: [
      'Magnesium has a plausible sleep signal, but the direct insomnia evidence is still limited and does not establish a universal bedtime dose or a single best magnesium form.',
      'A 2025 placebo-controlled bisglycinate trial in 155 adults found a statistically significant but small improvement in insomnia severity after four weeks (Cohen d=0.2); objective sleep was not measured.',
      'Kidney function and medication spacing matter: supplemental magnesium can accumulate with impaired renal clearance and can reduce absorption of some antibiotics and oral bisphosphonates.',
    ],
    evidence: limitedEvidence(
      content,
      'Limited Human Sleep Evidence',
      'Human trials support a possible magnesium sleep signal, but the evidence is small, heterogeneous, formulation-specific, and not strong enough for a universal form, dose, timing, or symptom-matching claim.',
      [
        'The 2021 insomnia review included only three randomized trials / 151 older adults and rated the evidence low to very low certainty.',
        'The newer 2025 bisglycinate trial found only a small between-group insomnia-severity effect and did not measure objective sleep.',
        'A trial regimen describes what researchers tested; it is not a personalized bedtime protocol.',
      ],
      47,
    ),
    pathway: {
      ...content.pathway,
      title: 'Why Magnesium Is Plausible for Sleep—but Not Predictive',
      summary:
        'Magnesium participates in neuromuscular and excitability pathways, but mechanistic plausibility does not establish a preferred salt, a same-night effect, or a clinically meaningful benefit for every sleeper.',
      nodes: content.pathway.nodes.map((node) =>
        node.label === 'Magnesium'
          ? { ...node, sublabel: 'Studied in several formulations' }
          : node.label === 'Physical Calm'
            ? { ...node, sublabel: 'Plausible pathway' }
            : node.label === 'Sleep Quality'
              ? { ...node, sublabel: 'Small / uncertain human signal' }
              : node,
      ),
    },
    sections: [
      {
        heading: 'What the human evidence actually shows',
        body: [
          'A 2021 systematic review found only three randomized magnesium trials in 151 older adults with insomnia, with low to very low certainty. That review is better read as a signal worth studying than as proof that magnesium treats insomnia broadly.',
          'A newer 2025 placebo-controlled trial randomized 155 adults ages 18–65 with self-reported poor sleep to magnesium bisglycinate providing 250 mg elemental magnesium daily or placebo for four weeks. Insomnia Severity Index scores improved slightly more with magnesium, but the effect was small (Cohen d=0.2), and the study did not include objective sleep measurement.',
        ],
      },
      {
        heading: 'Study regimens are not bedtime instructions',
        body: [
          'The 250 mg elemental-magnesium regimen in the 2025 bisglycinate trial describes that specific four-week intervention. It does not establish a universal dose, prove a first-night rescue effect, or show that glycinate is superior to other magnesium forms.',
          'Form choice can still matter for elemental-magnesium labeling, tolerability, bowel effects, capsule burden, and product quality. Those practical differences should not be presented as form-specific sleep efficacy unless a direct comparison actually tests them.',
        ],
      },
      {
        heading: 'Safety, kidney function, and medication spacing',
        body: [
          'Supplemental magnesium can cause diarrhea, nausea, and abdominal cramping. Toxicity risk rises when kidney function is impaired because renal clearance is central to magnesium balance.',
          'Magnesium can reduce absorption of oral bisphosphonates and tetracycline or quinolone antibiotics. Medication spacing should follow the product label and pharmacist or prescriber guidance rather than a generic sleep-supplement schedule.',
        ],
      },
      {
        heading: 'Magnesium versus melatonin is not a symptom quiz',
        body: [
          'Magnesium and melatonin have different evidence bases, but symptoms such as “tension” or “racing thoughts” do not reliably identify which supplement will work. Melatonin is better established for circadian-timing contexts than as a universal chronic-insomnia treatment.',
          'For chronic insomnia, CBT-I has a stronger evidence base than supplement sequencing. Persistent insomnia, loud snoring or gasping, dangerous daytime sleepiness, restless-legs symptoms, or major mood symptoms deserve evaluation rather than escalating supplements.',
        ],
      },
    ],
    faq: [
      {
        question: 'Which magnesium form is best for sleep?',
        answer:
          'No magnesium form has been established as the universal sleep winner in a direct head-to-head trial. Bisglycinate has a recent placebo-controlled sleep trial, while other formulations have separate evidence and practical tradeoffs. Match a product to the studied preparation when possible instead of treating the salt name as proof of efficacy.',
      },
      {
        question: 'How much magnesium should I take before bed?',
        answer:
          'This guide does not prescribe a universal bedtime dose. The 2025 bisglycinate trial tested 250 mg elemental magnesium daily for four weeks, but a study regimen is not a personalized dosing recommendation. Total supplemental exposure, kidney function, diet, medication spacing, and product labeling all matter.',
      },
      {
        question: 'Can magnesium be taken with melatonin?',
        answer:
          'A small direct combination trial exists, but the evidence is not strong enough to establish a universal magnesium-plus-melatonin stack. Combination decisions also need to account for the reason melatonin is being considered, medication use, next-day effects, and the difficulty of attributing benefit or side effects when two variables change together.',
      },
    ],
    cta: {
      title: 'Comparing magnesium products for sleep?',
      body: 'Prioritize transparent elemental-magnesium labeling, preparation matching, tolerability, medication safety, and independent quality signals before treating any form as a sleep winner.',
    },
    references: [
      { label: 'Magnesium bisglycinate sleep RCT (2025), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/40918053/' },
      { label: 'Oral magnesium for insomnia systematic review (2021), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
      { label: 'NIH ODS Magnesium Health Professional Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
      { label: 'NCCIH Sleep Disorders and Complementary Health Approaches', href: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches' },
    ],
  }
}

function calibrateBestMagnesium(content: SleepArticleContent): SleepArticleContent {
  return {
    ...content,
    eyebrow: 'Magnesium form evidence guide',
    tlDr: [
      'There is no proven “best magnesium for sleep” across forms. Direct sleep trials study particular preparations, populations, and regimens rather than establishing a universal form winner.',
      'Magnesium bisglycinate has a 2025 placebo-controlled trial in 155 adults with a small insomnia-severity effect after four weeks; magnesium L-threonate has separate branded-product trials, not head-to-head evidence against glycinate.',
      'Product choice can reasonably consider elemental-magnesium transparency, tolerability, bowel effects, medication spacing, price, and study-preparation matching—but those practical factors are not proof of superior sleep efficacy.',
    ],
    evidence: limitedEvidence(
      content,
      'Limited Form-Specific Sleep Evidence',
      'Some magnesium formulations now have direct human sleep trials, but no head-to-head sleep trial establishes a universal form winner and the observed effects are generally modest or product-specific.',
      [
        'The 2025 bisglycinate trial showed a small effect after four weeks and lacked objective sleep measurement.',
        'L-threonate sleep evidence is tied to branded Magtein studies with industry funding and does not establish class-wide superiority.',
        'Tolerability and elemental-magnesium labeling are practical buying factors, not evidence grades for sleep efficacy.',
      ],
      46,
    ),
    pathway: {
      ...content.pathway,
      title: 'Magnesium Form Choice: Evidence Before Marketing',
      summary:
        'Form names affect formulation, elemental exposure, tolerability, and study matching, but no direct sleep trial has established one magnesium salt as the universal winner.',
      nodes: content.pathway.nodes.map((node) =>
        node.label === 'Magnesium'
          ? { ...node, sublabel: 'Form-specific trials differ' }
          : node.label === 'Physical Calm'
            ? { ...node, sublabel: 'Mechanistic rationale' }
            : node.label === 'Sleep Quality'
              ? { ...node, sublabel: 'No head-to-head winner' }
              : node,
      ),
    },
    comparisonRows: [
      {
        name: 'Bisglycinate / glycinate',
        evidence: 'One recent placebo-controlled bisglycinate sleep RCT; small effect',
        dose: 'Study context: 250 mg elemental magnesium daily for 4 weeks',
        bestFor: 'A formulation with direct recent human sleep data—not a universal first choice',
        caution: 'No objective sleep measure; does not prove superiority over other forms',
      },
      {
        name: 'L-threonate',
        evidence: 'Separate branded Magtein sleep trials; no head-to-head comparison',
        dose: 'Study context: 1 g/day for 21 days and 2 g/day for 6 weeks',
        bestFor: 'Preparation-matched evidence when considering the branded trial literature',
        caution: 'Industry funding / product-specific evidence; not proof of overall sleep superiority',
      },
      {
        name: 'Citrate / oxide / other forms',
        evidence: 'No direct evidence that these forms are superior sleep treatments',
        dose: 'Use context depends on elemental exposure, indication, and tolerability',
        bestFor: 'Form choice may reflect bowel effects, cost, or another clinical/nutritional reason',
        caution: 'Do not infer sleep efficacy from absorption or mechanism claims alone',
      },
    ],
    sections: [
      {
        heading: 'What “best” can and cannot mean here',
        body: [
          'A form can be easier to tolerate, cheaper, easier to dose by elemental magnesium, or closer to a preparation used in a study. Those are legitimate product-selection factors. They are not the same as proof that the form produces better sleep.',
          'The direct question—whether glycinate, bisglycinate, L-threonate, citrate, oxide, or another magnesium form improves sleep more than the others—has not been answered by a head-to-head randomized sleep trial.',
        ],
      },
      {
        heading: 'The newer bisglycinate trial',
        body: [
          'The 2025 randomized placebo-controlled trial enrolled 155 adults with self-reported poor sleep and studied 250 mg elemental magnesium as bisglycinate daily for four weeks. The insomnia-severity difference favored magnesium, but the between-group effect was small (Cohen d=0.2), and objective sleep was not measured.',
          'That is meaningful direct evidence for the studied formulation. It still does not establish a same-night effect, a universal dose, or superiority over L-threonate or other forms.',
        ],
      },
      {
        heading: 'L-threonate is a separate evidence program',
        body: [
          'Magnesium L-threonate has placebo-controlled sleep studies using branded Magtein. Those trials are relevant to that preparation, but they do not directly compare L-threonate with glycinate or bisglycinate.',
          'Industry funding and product-specific intellectual-property relationships are part of the interpretation context. They do not automatically invalidate results, but they make independent replication and careful formulation matching especially important.',
        ],
      },
      {
        heading: 'Safety and product-selection boundaries',
        body: [
          'All supplemental magnesium forms share important safety considerations. Gastrointestinal effects vary by product and dose, and magnesium toxicity risk rises with impaired kidney function.',
          'Magnesium can reduce absorption of oral bisphosphonates and tetracycline or quinolone antibiotics. For a product guide, transparent elemental-magnesium labeling, independent quality signals, medication spacing, and tolerability are better filters than a “best form” badge.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is magnesium glycinate the best magnesium for sleep?',
        answer:
          'No form has been established as the universal sleep winner. A 2025 bisglycinate trial provides direct evidence for that studied preparation, but the effect was small and there is no head-to-head trial proving superiority over L-threonate or other forms.',
      },
      {
        question: 'Is magnesium L-threonate better because it reaches the brain?',
        answer:
          'Brain-bioavailability claims are mechanistic rationale, not proof of superior sleep outcomes. L-threonate has its own branded-product sleep trials, but no randomized sleep study has directly shown it works better than glycinate or bisglycinate.',
      },
      {
        question: 'What dose of magnesium is best for sleep?',
        answer:
          'There is no universal sleep dose established across magnesium forms. Trial regimens describe specific interventions; they should not be converted into personalized dosing without considering total elemental magnesium, diet, kidney function, medications, and the actual product.',
      },
    ],
    cta: {
      title: 'Buying magnesium for sleep?',
      body: 'Compare transparent elemental-magnesium labeling, studied preparation, tolerability, medication safety, independent quality signals, and cost—without treating a form name as proof of better sleep.',
    },
    references: [
      { label: 'Magnesium bisglycinate sleep RCT (2025), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/40918053/' },
      { label: 'Magnesium L-threonate sleep RCT (2024), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/39252819/' },
      { label: 'Magnesium L-threonate trial corrigendum (2025), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/40567408/' },
      { label: 'Magnesium L-threonate sleep/cognition RCT (2026), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/41601871/' },
      { label: 'NIH ODS Magnesium Health Professional Fact Sheet', href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
    ],
  }
}

function calibrateMagnesiumMelatonin(content: SleepArticleContent): SleepArticleContent {
  return {
    ...content,
    eyebrow: 'Sleep combination evidence guide',
    tlDr: [
      'Magnesium plus melatonin has limited direct combination evidence, but the evidence does not validate a universal “stack,” bedtime sequence, or dose pair.',
      'A 2024 randomized crossover trial studied 35 adults with poor sleep using a specific combined delivery system for four weeks. Older positive studies added zinc or B vitamins, so they cannot isolate the magnesium-plus-melatonin pair.',
      'Melatonin is best interpreted as a circadian-timing intervention in selected contexts, while magnesium sleep evidence remains limited. Chronic insomnia has a stronger first-line evidence standard in CBT-I.',
    ],
    evidence: limitedEvidence(
      content,
      'Limited Combination Evidence',
      'A small direct magnesium-plus-melatonin trial exists, and older multi-ingredient trials report sleep signals, but the studies are too small, product-specific, and heterogeneous to establish a universal combination protocol.',
      [
        'The direct 2024 combination trial enrolled only 35 participants and used a specific delivery system.',
        'Older positive studies included additional active ingredients such as zinc or B vitamins, preventing attribution to magnesium plus melatonin alone.',
        'Separate single-ingredient evidence does not prove synergy or define a universal dose pair.',
      ],
      40,
    ),
    pathway: {
      ...content.pathway,
      title: 'Magnesium + Melatonin: Combination Evidence Boundary',
      summary:
        'The pair has limited direct study, but magnesium and melatonin still address different biological questions. A small combination trial does not establish a universal stack or prove synergy.',
      nodes: content.pathway.nodes.map((node) =>
        node.label === 'Magnesium'
          ? { ...node, sublabel: 'Limited sleep evidence' }
          : node.label === 'Melatonin'
            ? { ...node, sublabel: 'Circadian-timing evidence' }
            : node.label === 'Better Sleep Fit'
              ? { ...node, sublabel: 'Combination benefit uncertain' }
              : node,
      ),
    },
    sections: [
      {
        heading: 'What direct combination evidence exists?',
        body: [
          'A 2024 double-blind randomized crossover trial enrolled 35 otherwise healthy adults with sleep disturbances. Participants received a specific supplement-delivery system providing 1.9 mg melatonin plus 200 mg elemental magnesium before sleep or placebo for four weeks, followed by crossover after washout. That is direct evidence for the studied combination and delivery system—not proof of a universal supplement stack.',
          'An older trial in 43 long-term-care residents studied melatonin, magnesium, and zinc together for eight weeks. Another insomnia study combined magnesium, melatonin, and several B vitamins. Positive findings from multi-ingredient formulas cannot identify which ingredient—or interaction—caused the effect.',
        ],
      },
      {
        heading: 'Why separate ingredient trials do not prove synergy',
        body: [
          'Magnesium has limited insomnia evidence, while melatonin has a more established role in circadian-timing contexts such as jet lag and some shift-work problems. Evidence for each ingredient separately does not prove that the pair is more effective than either alone.',
          'Changing two supplements at once also makes benefit, grogginess, gastrointestinal effects, and timing mistakes harder to attribute. This page therefore does not publish a magnesium-first sequence, a melatonin-first sequence, or a default dose pair.',
        ],
      },
      {
        heading: 'Safety and interaction boundaries',
        body: [
          'Magnesium requires extra caution with significant kidney disease and can reduce absorption of oral bisphosphonates and tetracycline or quinolone antibiotics. Melatonin has long-term safety uncertainty and deserves medication review in people using anticoagulants, seizure medicines, immunosuppressants, or other complex regimens.',
          'Avoid using a multi-supplement bedtime routine as a substitute for evaluation when sleep problems are persistent, severe, or accompanied by loud snoring or gasping, dangerous daytime sleepiness, restless-legs symptoms, or major mood changes.',
        ],
      },
      {
        heading: 'Chronic insomnia has a stronger first-line standard',
        body: [
          'CBT-I is the first-line evidence-based treatment for chronic insomnia. A supplement combination can be studied without becoming the preferred treatment for chronic insomnia.',
          'If melatonin is being considered for a circadian-timing problem, timing can matter as much as the product itself. That is a different decision from treating broad insomnia symptoms with a fixed nightly stack.',
        ],
      },
    ],
    faq: [
      {
        question: 'Do magnesium and melatonin work better together?',
        answer:
          'A small direct combination trial exists, but the evidence is not strong enough to show that the pair is generally better than either ingredient alone. Older positive trials often included additional ingredients, so they cannot isolate magnesium-plus-melatonin synergy.',
      },
      {
        question: 'Should I take magnesium before adding melatonin?',
        answer:
          'This evidence does not establish a magnesium-first sequence. The two ingredients have different evidence contexts, and a universal stepwise protocol has not been validated. The underlying sleep problem matters more than a generic stack order.',
      },
      {
        question: 'What magnesium and melatonin doses should I stack?',
        answer:
          'This guide does not prescribe a universal dose pair. Trial regimens describe specific research interventions and should not be converted into a default stack without considering the indication, medications, kidney function, total exposure, and product-specific labeling.',
      },
    ],
    productSlug: undefined,
    cta: {
      title: 'Considering more than one sleep supplement?',
      body: 'Use the safety checklist, identify the actual sleep problem, and avoid treating one small combination trial as a universal bedtime protocol.',
    },
    references: [
      { label: 'Magnesium + melatonin crossover trial (2024), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/38745424/' },
      { label: 'Melatonin + magnesium + zinc insomnia trial (2011), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/21226679/' },
      { label: 'Magnesium + melatonin + B-vitamin insomnia study, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/31850132/' },
      { label: 'NCCIH Sleep Disorders and Complementary Health Approaches', href: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches' },
    ],
  }
}

function calibrateTheanineForCalm(content: SleepArticleContent): SleepArticleContent {
  return {
    ...content,
    eyebrow: 'Calm and sleep evidence guide',
    tlDr: [
      'L-theanine has a promising but still limited sleep signal. A 2025 meta-analysis found small improvements in several subjective sleep outcomes, while emphasizing the shortage of pure L-theanine studies and unresolved dose/duration questions.',
      'The newer anxiety/stress literature does not establish reliable rapid anxiolysis, so a sleep page should not convert a study window into a 30–60-minute “racing thoughts” promise.',
      'Caffeine reduction, sleep opportunity, and chronic-insomnia care can matter more than adding a nighttime supplement; combination routines need their own evidence rather than inheriting claims from separate ingredients.',
    ],
    evidence: limitedEvidence(
      content,
      'Limited Human Sleep Evidence',
      'A 2025 meta-analysis found small subjective sleep signals, but directness is limited by mixed interventions and uncertainty about pure L-theanine dose and duration. Anxiety effects are also inconsistent across the newer trial literature.',
      [
        'Many sleep studies were not pure L-theanine interventions.',
        'The meta-analysis did not establish an optimal bedtime dose or duration.',
        'Evidence for acute stress or attention should not be relabeled as reliable acute anxiety relief.',
      ],
      48,
    ),
    pathway: {
      ...content.pathway,
      title: 'L-Theanine: Plausible Calm Pathways, Limited Sleep Directness',
      summary:
        'Human studies support possible calm and subjective sleep signals, but mechanism does not establish a rapid anxiety effect, an optimal bedtime dose, or a validated sleep stack.',
      nodes: content.pathway.nodes.map((node) =>
        node.label === 'L-Theanine'
          ? { ...node, sublabel: 'Dose/duration unresolved' }
          : node.label === 'Calm Alertness'
            ? { ...node, sublabel: 'Outcome varies by study' }
            : node,
      ),
    },
    sections: [
      {
        heading: 'What the sleep meta-analysis found',
        body: [
          'The 2025 systematic review and meta-analysis included 19 articles / 897 participants and reported small improvements in several subjective sleep outcomes. The authors also emphasized that many studies did not use pure L-theanine and that adequate dose and duration still need to be established.',
          'That is a promising sleep-disturbance signal, not proof that L-theanine reliably treats chronic insomnia or works as an as-needed bedtime rescue.',
        ],
      },
      {
        heading: 'Calm is not the same outcome as acute anxiety relief',
        body: [
          'The newer L-theanine randomized-trial synthesis separates attention, acute stress, and anxiety outcomes. Anxiety findings were inconsistent, so a same-night sleep guide should not promise that L-theanine will stop racing thoughts within a fixed window.',
          'If caffeine is contributing to evening arousal, reducing dose and moving caffeine earlier usually addresses the exposure more directly than relying on L-theanine to neutralize it later.',
        ],
      },
      {
        heading: 'Study context is not a universal bedtime dose',
        body: [
          'Trials use different L-theanine doses, durations, populations, and co-interventions. The sleep meta-analysis specifically called for more work to determine adequate dose and duration.',
          'This page therefore does not publish a fixed bedtime dose, a 30–90-minute timing rule, or a universal L-theanine-plus-magnesium stack.',
        ],
      },
      {
        heading: 'Persistent sleep problems deserve a broader assessment',
        body: [
          'For chronic insomnia, CBT-I has a stronger evidence base than supplement escalation. Persistent sleep problems can also reflect sleep apnea, restless legs, circadian disorders, medication effects, mood disorders, substance use, pain, or insufficient sleep opportunity.',
          'Short-term tolerability in trials does not establish long-term nightly safety for every population or medication regimen.',
        ],
      },
    ],
    faq: [
      {
        question: 'Does L-theanine make you sleepy?',
        answer:
          'L-theanine is not established as a heavy sedative. A 2025 meta-analysis found small changes in several subjective sleep outcomes, but the evidence does not establish a predictable immediate sleep effect for every person.',
      },
      {
        question: 'When should I take L-theanine for sleep?',
        answer:
          'The current evidence does not establish one universal bedtime timing rule. Trials differ in dose, duration, formulation, population, and outcome, and the 2025 sleep review specifically said adequate dose and duration still need clarification.',
      },
      {
        question: 'Can L-theanine cancel out caffeine so I can sleep?',
        answer:
          'That is not established. L-theanine and caffeine have been studied together for attention-related outcomes, but this does not prove that L-theanine reverses late caffeine exposure or restores normal sleep. Reducing and moving caffeine earlier is the more direct intervention.',
      },
    ],
    cta: {
      title: 'Looking for calmer evenings without overclaiming the evidence?',
      body: 'Compare the human sleep data, caffeine timing, chronic-insomnia care, and safety context before turning L-theanine into a fixed bedtime protocol.',
    },
    references: [
      { label: 'L-theanine sleep systematic review and meta-analysis (2025), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/40056718/' },
      { label: 'L-theanine randomized-trial meta-analysis (2026), PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/42410082/' },
      { label: 'L-theanine stress-related symptoms trial, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/31623400/' },
      { label: 'AASM CBT-I information', href: 'https://aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia/' },
    ],
  }
}

export function calibrateSleepArticlePublicCopy(content: SleepArticleContent): SleepArticleContent {
  switch (content.slug) {
    case 'magnesium-for-sleep':
      return calibrateMagnesiumForSleep(content)
    case 'best-magnesium-for-sleep':
      return calibrateBestMagnesium(content)
    case 'sleep-stack-magnesium-melatonin':
      return calibrateMagnesiumMelatonin(content)
    case 'l-theanine-for-calm':
      return calibrateTheanineForCalm(content)
    default:
      return content
  }
}

export { REVIEW_DATE as SLEEP_CLUSTER_EVIDENCE_REVIEW_DATE }
