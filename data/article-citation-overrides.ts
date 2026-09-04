export type ArticleCitationOverride = {
  relatedSlugs?: string[]
  keyTakeaways?: string[]
  citationQuestions?: string[]
  canonicalConcepts?: string[]
  decisionRows?: Array<{ label: string; value: string }>
  faqAnswers?: Array<{ question: string; answer: string }>
}

export type CitationRelationshipTarget = {
  slug: string
  title: string
  category: string
  url: string
}

export const citationRelationshipTargets: Record<string, CitationRelationshipTarget> = {
  rhabdomyolysis: {
    slug: 'rhabdomyolysis',
    title: 'Rhabdomyolysis: How Muscle Breakdown Can Injure the Kidneys',
    category: 'Foundations',
    url: '/learn/rhabdomyolysis/',
  },
  'kratom-7oh-withdrawal-management': {
    slug: 'kratom-7oh-withdrawal-management',
    title: '7-OH Withdrawal: What the 2026 Evidence Actually Shows',
    category: 'Harm Reduction',
    url: '/guides/other/kratom-7oh-withdrawal-management/',
  },
}

export const articleCitationOverrides: Record<string, ArticleCitationOverride> = {
  'sleep-debt-and-recovery': {
    relatedSlugs: [
      'how-much-sleep-do-adults-need',
      'weekend-catch-up-sleep',
      'daytime-sleepiness-vs-fatigue',
      'insomnia-vs-sleep-deprivation',
      'sleep-inertia-grogginess-after-waking',
    ],
    canonicalConcepts: [
      'sleep debt',
      'recovery sleep',
      'sleep restriction',
      'weekend catch-up sleep',
      'vigilance',
      'executive function',
    ],
    decisionRows: [
      { label: 'Best-supported conclusion', value: 'Recovery sleep helps, but different outcomes recover on different timelines.' },
      { label: 'What one good night can do', value: 'Reduce sleepiness and improve some performance measures after acute sleep loss.' },
      { label: 'What it cannot guarantee', value: 'Full reversal of chronic restriction across attention, memory, mood, metabolism, and safety-sensitive performance.' },
      { label: 'Highest-value move', value: 'Restore adequate, regular sleep opportunity instead of relying on repeated catch-up cycles.' },
    ],
    faqAnswers: [
      { question: 'Can you fully repay sleep debt?', answer: 'Recovery sleep can reverse part of the impact of sleep loss, but the evidence does not support a universal hour-for-hour repayment rule. Different functions recover at different rates.' },
      { question: 'Does one good night fix a week of poor sleep?', answer: 'It can make someone feel substantially better, but chronic restriction can leave residual deficits after a single recovery night.' },
      { question: 'Does weekend catch-up sleep work?', answer: 'It can provide short-term relief, but it does not reliably erase the effects of chronic insufficient sleep and large schedule shifts can add social jet lag.' },
    ],
  },
  'daytime-sleepiness-vs-fatigue': {
    relatedSlugs: [
      'hypersomnolence-vs-insufficient-sleep',
      'sleep-debt-and-recovery',
      'snoring-vs-sleep-apnea',
      'home-sleep-apnea-test-vs-polysomnography',
      'medications-and-sleep',
    ],
    canonicalConcepts: [
      'excessive daytime sleepiness',
      'fatigue',
      'microsleep',
      'sleep propensity',
      'driving impairment',
      'sleep-disordered breathing',
    ],
    decisionRows: [
      { label: 'Sleepiness', value: 'An increased tendency to fall asleep, especially in passive situations.' },
      { label: 'Fatigue', value: 'Low energy, exhaustion, heaviness, or reduced capacity without necessarily being able to sleep.' },
      { label: 'Higher-urgency clue', value: 'Unintentional dozing, microsleeps, or fighting sleep while driving or operating equipment.' },
      { label: 'Next question', value: 'Check sleep opportunity, OSA risk, circadian timing, medications, and persistent hypersomnolence rather than treating “tired” as one diagnosis.' },
    ],
    faqAnswers: [
      { question: 'What is the difference between sleepiness and fatigue?', answer: 'Sleepiness is the propensity to fall asleep. Fatigue is a broader sense of depletion or exhaustion. They can coexist, but they point to different diagnostic pathways.' },
      { question: 'Can sleep apnea cause fatigue without obvious sleepiness?', answer: 'Yes. Some people with OSA emphasize fatigue, brain fog, poor sleep quality, or low energy rather than frequent daytime dozing.' },
      { question: 'What are microsleeps?', answer: 'Microsleeps are very brief involuntary sleep intrusions during wakefulness. They can create attention lapses and are especially important in driving and other safety-sensitive settings.' },
    ],
  },
  'sleep-bruxism-and-sleep-apnea': {
    relatedSlugs: [
      'snoring-vs-sleep-apnea',
      'sleep-apnea-vs-insomnia',
      'cpap-vs-oral-appliance-for-sleep-apnea',
      'home-sleep-apnea-test-vs-polysomnography',
      'why-sleep-studies-disagree',
    ],
    canonicalConcepts: [
      'sleep bruxism',
      'obstructive sleep apnea',
      'rhythmic masticatory muscle activity',
      'polysomnography',
      'dental sleep medicine',
      'autonomic arousal',
    ],
    decisionRows: [
      { label: 'Grinding alone', value: 'Weak evidence for OSA and not a diagnostic shortcut.' },
      { label: 'Association evidence', value: 'Mixed: recent reviews disagree on the strength of overlap and causality remains unresolved.' },
      { label: 'Dental treatment', value: 'A night guard can address dental consequences but does not establish or treat airway obstruction.' },
      { label: 'OSA workup trigger', value: 'Snoring, witnessed apneas, gasping, hypertension, and marked daytime sleepiness matter more than grinding alone.' },
    ],
    faqAnswers: [
      { question: 'Does teeth grinding mean sleep apnea?', answer: 'No. Sleep bruxism can coexist with OSA, but grinding by itself is not a reliable diagnostic sign of airway obstruction.' },
      { question: 'Does treating sleep apnea stop teeth grinding?', answer: 'Not reliably enough to make that a universal expectation. Bruxism and OSA should be assessed and followed as separate outcomes.' },
      { question: 'Does a night guard treat sleep apnea?', answer: 'A conventional dental night guard can protect teeth, but it is not the same as an evidence-based mandibular advancement device used to treat selected OSA patients.' },
    ],
  },
  'hypersomnolence-vs-insufficient-sleep': {
    relatedSlugs: [
      'daytime-sleepiness-vs-fatigue',
      'sleep-debt-and-recovery',
      'how-much-sleep-do-adults-need',
      'snoring-vs-sleep-apnea',
      'sleep-paralysis',
    ],
    canonicalConcepts: [
      'central disorders of hypersomnolence',
      'narcolepsy',
      'idiopathic hypersomnia',
      'multiple sleep latency test',
      'actigraphy',
      'insufficient sleep',
      'orexin',
    ],
    decisionRows: [
      { label: 'First exclusion', value: 'Chronic insufficient sleep, circadian mismatch, sedating medications, and sleep fragmentation such as OSA.' },
      { label: 'Narcolepsy clue', value: 'Persistent sleepiness with REM-intrusion features; cataplexy strongly shifts concern toward narcolepsy type 1.' },
      { label: 'Idiopathic hypersomnia clue', value: 'Long or unrefreshing sleep, severe sleep inertia, long naps, and persistent sleepiness despite adequate sleep opportunity.' },
      { label: 'Testing caveat', value: 'MSLT results depend on adequate prior sleep and clinical context; a short mean latency does not identify the cause by itself.' },
    ],
    faqAnswers: [
      { question: 'How is idiopathic hypersomnia different from being sleep deprived?', answer: 'Idiopathic hypersomnia requires persistent pathological sleepiness despite adequate sleep opportunity, while insufficient sleep can produce the same symptom because the person is simply not obtaining enough sleep.' },
      { question: 'Can not getting enough sleep cause an abnormal MSLT?', answer: 'Yes. Inadequate sleep before testing can shorten daytime sleep latency and make the MSLT look more pathologically sleepy.' },
      { question: 'What does the MSLT measure?', answer: 'The Multiple Sleep Latency Test measures how quickly someone falls asleep during repeated daytime nap opportunities and whether sleep-onset REM periods occur.' },
    ],
  },
  'sleep-apnea-in-women': {
    relatedSlugs: [
      'home-sleep-apnea-test-vs-polysomnography',
      'snoring-vs-sleep-apnea',
      'sleep-apnea-vs-insomnia',
      'menopause-and-sleep',
      'daytime-sleepiness-vs-fatigue',
    ],
    canonicalConcepts: [
      'obstructive sleep apnea in women',
      'REM-predominant obstructive sleep apnea',
      'menopause',
      'home sleep apnea testing',
      'polysomnography',
      'OSA screening',
    ],
    decisionRows: [
      { label: 'Why cases can be missed', value: 'Women may present with insomnia, fatigue, mood symptoms, or poor sleep quality instead of the classic loud-snoring-plus-sleepiness stereotype.' },
      { label: 'Stage pattern', value: 'Respiratory burden can be more concentrated in REM sleep in some women, which a whole-night average can flatten.' },
      { label: 'Life-stage modifier', value: 'OSA risk rises after menopause, but menopause is a risk factor rather than a diagnosis.' },
      { label: 'Diagnostic boundary', value: 'Symptoms and screening tools guide suspicion; objective sleep testing remains the diagnostic boundary.' },
    ],
    faqAnswers: [
      { question: 'Can women have sleep apnea without loud snoring?', answer: 'Yes. Snoring remains an important clue, but women with OSA may also present with insomnia, fatigue, mood symptoms, or poor sleep quality.' },
      { question: 'Does menopause increase sleep apnea risk?', answer: 'Risk rises across reproductive aging and after menopause, but menopause alone does not diagnose OSA.' },
      { question: 'Can a home sleep apnea test miss OSA in women?', answer: 'It can understate some mild, stage-specific, or otherwise discordant presentations, especially when the device does not measure sleep stages directly. A negative home test should be interpreted in clinical context.' },
    ],
  },
  'cpap-vs-oral-appliance-for-sleep-apnea': {
    relatedSlugs: [
      'home-sleep-apnea-test-vs-polysomnography',
      'snoring-vs-sleep-apnea',
      'sleep-position-osa-and-reflux',
      'nasal-obstruction-and-sleep-apnea',
      'sleep-apnea-in-women',
    ],
    canonicalConcepts: [
      'continuous positive airway pressure',
      'mandibular advancement device',
      'oral appliance therapy',
      'obstructive sleep apnea treatment',
      'treatment adherence',
      'residual apnea-hypopnea index',
    ],
    decisionRows: [
      { label: 'Stronger AHI/oxygen effect', value: 'CPAP on average.' },
      { label: 'Legitimate alternative', value: 'A custom titratable mandibular advancement device, especially in mild-to-moderate OSA or when PAP is poorly tolerated.' },
      { label: 'Key oral-appliance tradeoff', value: 'Long-term dental and bite changes require ongoing dental follow-up.' },
      { label: 'How to judge success', value: 'Actual use plus objective control of residual OSA, not comfort or snoring reduction alone.' },
    ],
    faqAnswers: [
      { question: 'Is CPAP better than an oral appliance for sleep apnea?', answer: 'CPAP is generally more effective at reducing AHI and oxygen desaturation. A custom oral appliance can still be an effective real-world treatment for selected patients.' },
      { question: 'Can an oral appliance replace CPAP?', answer: 'Sometimes, particularly in mild-to-moderate OSA or when PAP is poorly tolerated, but treatment choice should be individualized and effectiveness should be objectively reassessed.' },
      { question: 'Are store-bought anti-snoring mouthpieces equivalent to a custom MAD?', answer: 'No. Clinical evidence and guideline recommendations apply primarily to custom-fitted, titratable oral appliances rather than generic over-the-counter mouthpieces.' },
    ],
  },
  'home-sleep-apnea-test-vs-polysomnography': {
    relatedSlugs: [
      'sleep-apnea-in-women',
      'snoring-vs-sleep-apnea',
      'sleep-apnea-vs-insomnia',
      'cpap-vs-oral-appliance-for-sleep-apnea',
      'sleep-trackers-accuracy',
    ],
    canonicalConcepts: [
      'home sleep apnea testing',
      'polysomnography',
      'respiratory event index',
      'apnea-hypopnea index',
      'night-to-night variability',
      'REM sleep',
      'sleep staging',
    ],
    decisionRows: [
      { label: 'HSAT is best suited for', value: 'Selected uncomplicated adults with meaningful suspicion for moderate-to-severe OSA.' },
      { label: 'PSG adds', value: 'Direct sleep staging, cortical arousals, broader physiologic channels, and evaluation of more complex sleep disorders.' },
      { label: 'Common HSAT limitation', value: 'Recording time can exceed true sleep time and dilute the respiratory event index.' },
      { label: 'Negative home test', value: 'Does not always close the case when the study is inconclusive, technically poor, borderline, or discordant with strong clinical suspicion.' },
    ],
    faqAnswers: [
      { question: 'Is a home sleep apnea test as accurate as polysomnography?', answer: 'HSAT is a valid diagnostic pathway in selected adults, but PSG measures more physiology and directly identifies sleep stages and arousals, so the tests are not interchangeable in every clinical situation.' },
      { question: 'Why can home sleep apnea testing underestimate severity?', answer: 'Many systems use recording time rather than EEG-confirmed sleep time and may not identify REM or cortical arousals directly, which can dilute or hide some patterns.' },
      { question: 'What if a home sleep apnea test is negative but symptoms continue?', answer: 'When clinical suspicion remains high, a negative, inconclusive, or technically inadequate home test can warrant in-lab polysomnography or additional evaluation.' },
    ],
  },
  'corynoxine-b-opioid-addiction-evidence-review': {
    relatedSlugs: [
      'mitragynine',
      '7-hydroxymitragynine',
      'mitragynine-pseudoindoxyl',
      'kratom-7oh-withdrawal-management',
    ],
    keyTakeaways: [
      'Corynoxine B has meaningful in-vitro mu-opioid receptor activity in newer assays, but the exact potency and signaling profile remain assay-dependent.',
      'Mu-opioid receptor activity is a safety signal, not proof that corynoxine B causes addiction, physical dependence, withdrawal, or clinically significant opioid effects in humans.',
      'Human pharmacokinetic, toxicological, abuse-liability, and controlled clinical data for isolated corynoxine B remain major evidence gaps.',
    ],
    citationQuestions: [
      'Does corynoxine B activate the mu-opioid receptor?',
      'Is corynoxine B addictive or dependence-forming?',
      'Can corynoxine B treat opioid withdrawal or substance-use disorder?',
    ],
    canonicalConcepts: [
      'corynoxine B',
      'mu-opioid receptor',
      'G-protein bias',
      'physical dependence',
      'kratom alkaloids',
    ],
  },
  'failure-chains-injected-mushroom-tea': {
    relatedSlugs: [
      'rhabdomyolysis',
      'failure-chains-mptp-parkinsonism',
      'failure-chains-oklahoma-bromo-dragonfly',
      'failure-chains-25b-nbome-blotter',
    ],
    keyTakeaways: [
      'Intravenous injection bypasses barriers that normally limit exposure to microbes and particulate biological material.',
      'Blood-culture growth does not mean mushrooms physically fruited inside the bloodstream.',
      'A case report can establish that an event occurred, but it cannot estimate how often similar behavior produces the same outcome.',
    ],
    citationQuestions: [
      'Can injected mushroom tea cause bloodstream infection?',
      'Did mushrooms literally grow inside the patient’s blood?',
      'Why is intravenous exposure to nonsterile biological material dangerous?',
    ],
    canonicalConcepts: ['fungemia', 'bacteremia', 'sepsis', 'intravenous exposure', 'route of administration'],
  },
  'failure-chains-mptp-parkinsonism': {
    relatedSlugs: [
      'failure-chains-injected-mushroom-tea',
      'failure-chains-oklahoma-bromo-dragonfly',
      'failure-chains-25b-nbome-blotter',
    ],
    keyTakeaways: [
      'MPTP is converted to MPP+, which can selectively injure dopamine-producing neurons in the substantia nigra.',
      'Removing the drug does not reverse neuronal loss that has already occurred.',
      'The MPTP syndrome became a research model for Parkinsonian neurodegeneration without proving that ordinary Parkinson’s disease has the same cause.',
    ],
    citationQuestions: [
      'How did an illicit opioid batch produce permanent parkinsonism?',
      'Why does MPTP preferentially damage dopamine neurons?',
      'Does MPTP explain ordinary Parkinson’s disease?',
    ],
    canonicalConcepts: ['MPTP', 'MPP+', 'dopamine neurons', 'substantia nigra', 'parkinsonism'],
  },
  'failure-chains-oklahoma-bromo-dragonfly': {
    relatedSlugs: [
      'failure-chains-25b-nbome-blotter',
      'failure-chains-injected-mushroom-tea',
      'failure-chains-mptp-parkinsonism',
    ],
    keyTakeaways: [
      'Precise measurement cannot compensate for incorrect chemical identity.',
      'A shared preparation can distribute one upstream identity error across an entire group.',
      'Delayed onset reduces the usefulness of subjective feedback and can increase the danger of premature redosing.',
    ],
    citationQuestions: [
      'What caused the 2011 Oklahoma Bromo-DragonFLY poisoning?',
      'Why can precise dosing still fail when a drug is mislabeled?',
      'Why is delayed onset dangerous in potent hallucinogen exposure?',
    ],
    canonicalConcepts: ['Bromo-DragonFLY', 'drug mislabeling', 'vasoconstriction', 'delayed onset', 'seizures'],
  },
  'failure-chains-25b-nbome-blotter': {
    relatedSlugs: [
      'rhabdomyolysis',
      'failure-chains-oklahoma-bromo-dragonfly',
      'failure-chains-injected-mushroom-tea',
      'failure-chains-mptp-parkinsonism',
    ],
    keyTakeaways: [
      'Blotter paper is a delivery format, not proof that a sample contains LSD.',
      'Seizures, respiratory failure, hyperthermia, and muscle breakdown can reinforce one another during severe NBOMe poisoning.',
      'Case reports document possible severe outcomes but cannot determine the percentage of all exposures that become critical.',
    ],
    citationQuestions: [
      'Can blotter sold as LSD contain an NBOMe compound?',
      'How can seizures lead to rhabdomyolysis and acute kidney injury?',
      'Why can’t case reports estimate the frequency of critical NBOMe poisoning?',
    ],
    canonicalConcepts: ['25B-NBOMe', 'blotter', 'seizures', 'rhabdomyolysis', 'acute kidney injury'],
  },
}
