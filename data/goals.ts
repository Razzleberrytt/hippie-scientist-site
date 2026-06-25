export type GoalOption = {
  slug: string
  name: string
  bestFor: string
  speed: string
  evidence: string
  risk: string
  avoidIf: string
  whyPeopleStop: string
  form: string
}

export type Goal = {
  slug: string
  title: string
  eyebrow: string
  description: string
  quickPicks: {
    need: string
    option: string
    slug: string
  }[]
  options: GoalOption[]
  relatedGoals: string[]
}

export const goals: Goal[] = [
  {
    slug: 'pain',
    title: 'Pain support',
    eyebrow: 'Goal guide',
    description: 'Compare common non-prescription options for everyday pain support based on fit, onset, evidence quality, and risk profile.',
    quickPicks: [
      { need: 'General joint discomfort', option: 'Curcumin', slug: 'curcumin' },
      { need: 'Short-term flare periods', option: 'Boswellia', slug: 'boswellia' },
      { need: 'Sensitive to NSAID-like effects', option: 'PEA', slug: 'pea' },
    ],
    options: [
      { slug: 'curcumin', name: 'Curcumin', bestFor: 'Joint discomfort with inflammatory component', speed: 'Days to weeks', evidence: 'Moderate to strong in osteoarthritis-adjacent pain', risk: 'Low to moderate', avoidIf: 'Gallbladder disease, anticoagulant use, active reflux sensitivity', whyPeopleStop: 'Delayed noticeable effect or GI upset', form: 'Standardized curcuminoid extract with absorption support' },
      { slug: 'boswellia', name: 'Boswellia', bestFor: 'Knee and mobility-related pain', speed: 'Days to 2 weeks', evidence: 'Moderate for pain and function in joint discomfort', risk: 'Low to moderate', avoidIf: 'Pregnancy or known resin sensitivity', whyPeopleStop: 'Cost or inconsistent response across brands', form: 'Boswellia serrata extract (AKBA-standardized)' },
      { slug: 'pea', name: 'PEA (Palmitoylethanolamide)', bestFor: 'Neuropathic-like or persistent discomfort patterns', speed: '2 to 8 weeks', evidence: 'Moderate but heterogeneous by indication', risk: 'Low', avoidIf: 'Use with clinician supervision in complex medication regimens', whyPeopleStop: 'Slow onset and less immediate feedback', form: 'Micronized or ultra-micronized PEA capsules' },
      { slug: 'magnesium', name: 'Magnesium', bestFor: 'Tension-related discomfort and poor recovery sleep', speed: 'Days to weeks', evidence: 'Limited to moderate depending on pain subtype', risk: 'Low', avoidIf: 'Advanced kidney disease without clinician clearance', whyPeopleStop: 'Loose stool with dose escalation', form: 'Magnesium glycinate or citrate' },
      { slug: 'omega-3', name: 'Omega-3 (EPA/DHA)', bestFor: 'Systemic soreness with inflammatory lifestyle load', speed: '2 to 8 weeks', evidence: 'Moderate for some chronic pain contexts', risk: 'Low to moderate', avoidIf: 'Bleeding disorders or anticoagulant dose changes without supervision', whyPeopleStop: 'Fishy aftertaste or delayed payoff', form: 'Concentrated fish oil softgels' },
    ],
    relatedGoals: ['inflammation', 'sleep', 'focus'],
  },
  {
    slug: 'inflammation',
    title: 'Inflammation support',
    eyebrow: 'Goal guide',
    description: 'Use this page to compare anti-inflammatory options by practical use case, likely onset, and tolerance constraints.',
    quickPicks: [
      { need: 'Joint stiffness and mobility', option: 'Curcumin', slug: 'curcumin' },
      { need: 'Short-course symptom support', option: 'Ginger', slug: 'ginger' },
      { need: 'Lifestyle cardiometabolic support', option: 'Omega-3', slug: 'omega-3' },
    ],
    options: [
      { slug: 'curcumin', name: 'Curcumin', bestFor: 'Broad inflammatory signaling support', speed: '1 to 4 weeks', evidence: 'Moderate to strong in several inflammatory conditions', risk: 'Low to moderate', avoidIf: 'Gallbladder issues, clotting medication adjustments', whyPeopleStop: 'Absorption complexity and product variability', form: 'Phytosome or enhanced-bioavailability curcumin' },
      { slug: 'boswellia', name: 'Boswellia', bestFor: 'Localized inflammatory discomfort', speed: 'Days to 2 weeks', evidence: 'Moderate for functional mobility outcomes', risk: 'Low to moderate', avoidIf: 'Resin hypersensitivity', whyPeopleStop: 'Benefit not obvious without consistent use', form: 'Standardized boswellic acids extract' },
      { slug: 'ginger', name: 'Ginger', bestFor: 'Mild inflammatory and digestive overlap symptoms', speed: 'Hours to days', evidence: 'Limited to moderate by endpoint', risk: 'Low', avoidIf: 'Reflux triggers or anticoagulant caution', whyPeopleStop: 'Taste burden or GI warmth sensation', form: 'Ginger extract capsules or tea' },
      { slug: 'omega-3', name: 'Omega-3 (EPA/DHA)', bestFor: 'Longer-term low-grade inflammation support', speed: '2 to 8 weeks', evidence: 'Moderate for inflammatory markers in select populations', risk: 'Low to moderate', avoidIf: 'Peri-procedural periods without clinician review', whyPeopleStop: 'Delayed subjective effects', form: 'High-EPA fish oil formulations' },
      { slug: 'tart-cherry', name: 'Tart Cherry', bestFor: 'Exercise-related soreness and recovery strain', speed: 'Days to 2 weeks', evidence: 'Limited to moderate, strongest in exercise recovery settings', risk: 'Low', avoidIf: 'Sugar-sensitive protocols when using juice concentrates', whyPeopleStop: 'Cost per dose and routine adherence', form: 'Concentrate shots or standardized capsules' },
    ],
    relatedGoals: ['pain', 'sleep', 'focus'],
  },
  {
    slug: 'focus',
    title: 'Focus support',
    eyebrow: 'Goal guide',
    description: 'Compare cognitive support options by stimulation profile, onset speed, evidence strength, and common dropout reasons.',
    quickPicks: [
      { need: 'Calm concentration', option: 'L-Theanine', slug: 'l-theanine' },
      { need: 'Stress-heavy workdays', option: 'Rhodiola', slug: 'rhodiola' },
      { need: 'Immediate alertness', option: 'Caffeine', slug: 'caffeine' },
    ],
    options: [
      { slug: 'l-theanine', name: 'L-Theanine', bestFor: 'Calmer attention, often with caffeine', speed: '30 to 90 minutes', evidence: 'Moderate for attention quality and stress buffering', risk: 'Low', avoidIf: 'Very low blood pressure tendency with sedating stacks', whyPeopleStop: 'Subtle effect when used solo', form: 'Capsules, often paired with caffeine' },
      { slug: 'rhodiola', name: 'Rhodiola', bestFor: 'Cognitive fatigue and stress resilience', speed: 'Days to 2 weeks', evidence: 'Limited to moderate with trial variability', risk: 'Low to moderate', avoidIf: 'Bipolar-spectrum risk without medical oversight', whyPeopleStop: 'Can feel overstimulating in sensitive users', form: 'Standardized Rhodiola rosea extract' },
      { slug: 'tyrosine', name: 'Tyrosine', bestFor: 'High-demand periods with sleep debt or acute stress', speed: '30 to 120 minutes', evidence: 'Moderate for performance under stress', risk: 'Low to moderate', avoidIf: 'Thyroid disorders or MAOI use unless supervised', whyPeopleStop: 'Inconsistent everyday benefit', form: 'L-tyrosine powder or capsules' },
      { slug: 'caffeine', name: 'Caffeine', bestFor: 'Fast alertness and reaction speed', speed: '15 to 60 minutes', evidence: 'Strong for vigilance and reaction-time endpoints', risk: 'Moderate', avoidIf: 'Panic-prone profiles, uncontrolled hypertension, late-day use', whyPeopleStop: 'Jitters, sleep disruption, tolerance drift', form: 'Coffee, tea, or measured capsules' },
      { slug: 'bacopa', name: 'Bacopa', bestFor: 'Memory retention and learning rate over time', speed: '4 to 12 weeks', evidence: 'Moderate for cognitive parameters in older/younger cohorts', risk: 'Low to moderate', avoidIf: 'Co-medication with acetylcholinesterase inhibitors', whyPeopleStop: 'Mild GI upset or lethargy', form: 'Standardized Bacopa extract (bacosides)' },
    ],
    relatedGoals: ['sleep', 'inflammation', 'pain', 'cognition'],
  },
  {
    slug: 'sleep',
    title: 'Sleep support',
    eyebrow: 'Goal guide',
    description: 'Evaluate common sleep aids by onset window, expected benefit profile, safety constraints, and adherence friction.',
    quickPicks: [
      { need: 'Sleep-onset difficulty', option: 'Melatonin', slug: 'melatonin' },
      { need: 'Racing mind at bedtime', option: 'L-Theanine', slug: 'l-theanine' },
      { need: 'Nightly relaxation routine', option: 'Magnesium', slug: 'magnesium' },
    ],
    options: [
      { slug: 'magnesium', name: 'Magnesium', bestFor: 'Wind-down support and muscle relaxation', speed: 'Days to 2 weeks', evidence: 'Limited to moderate depending on baseline status', risk: 'Low', avoidIf: 'Renal impairment without clinician guidance', whyPeopleStop: 'GI tolerance at higher doses', form: 'Magnesium glycinate in evening dosing' },
      { slug: 'l-theanine', name: 'L-Theanine', bestFor: 'Pre-sleep cognitive quieting', speed: '30 to 90 minutes', evidence: 'Moderate for relaxation-related sleep quality support', risk: 'Low', avoidIf: 'Concurrent sedative stacking without adjustment', whyPeopleStop: 'Too subtle for severe insomnia', form: 'Capsules or tea-derived supplements' },
      { slug: 'melatonin', name: 'Melatonin', bestFor: 'Sleep timing shift and sleep-onset support', speed: '30 to 60 minutes', evidence: 'Strong for circadian timing, moderate for general insomnia', risk: 'Low to moderate', avoidIf: 'Autoimmune caution or morning grogginess sensitivity', whyPeopleStop: 'Residual drowsiness or vivid dreams', form: 'Low-dose tablets or sublingual forms' },
      { slug: 'lemon-balm', name: 'Lemon Balm', bestFor: 'Mild anxiety-linked restlessness at night', speed: '30 minutes to several days', evidence: 'Limited to moderate, often in combination products', risk: 'Low', avoidIf: 'Sedative polypharmacy without supervision', whyPeopleStop: 'Variable potency across extracts', form: 'Standardized extract capsules or tea' },
    ],
    relatedGoals: ['focus', 'pain', 'inflammation', 'stress', 'anxiety'],
  },
  {
    slug: 'stress',
    title: 'Stress resilience',
    eyebrow: 'Goal guide',
    description: 'Compare adaptogens and relaxing compounds for coping with lifestyle stress, workload fatigue, and physical strain.',
    quickPicks: [
      { need: 'Chronic burnout feeling', option: 'Ashwagandha', slug: 'ashwagandha' },
      { need: 'Mental fatigue and burnout', option: 'Rhodiola', slug: 'rhodiola' },
      { need: 'Acute presentation stress', option: 'L-Theanine', slug: 'l-theanine' },
    ],
    options: [
      { slug: 'ashwagandha', name: 'Ashwagandha', bestFor: 'Chronic cortisol stress and anxiety resilience', speed: '2 to 8 weeks', evidence: 'Moderate to strong for subjective stress and anxiety', risk: 'Low to moderate', avoidIf: 'Autoimmune diseases, thyroid disorders, or pregnancy', whyPeopleStop: 'Emotional flattening (anhedonia) or stomach upset', form: 'Standardized KSM-66 or Shoden extract' },
      { slug: 'rhodiola', name: 'Rhodiola', bestFor: 'Mental performance under stress or exhaustion', speed: 'Days to 2 weeks', evidence: 'Moderate for stress-related fatigue and cognitive score', risk: 'Low', avoidIf: 'Bipolar disorder (manic potential)', whyPeopleStop: 'Overstimulation or mild insomnia', form: 'Rhodiola rosea extract (3% rosavins, 1% salidroside)' },
      { slug: 'l-theanine', name: 'L-Theanine', bestFor: 'Acute nervous tension and focus buffering', speed: '30 to 90 minutes', evidence: 'Moderate for stress symptoms and acute relaxation', risk: 'Low', avoidIf: 'Severe hypotension tendency', whyPeopleStop: 'Effect is subtle when used in high-stress settings', form: 'L-Theanine capsules' },
    ],
    relatedGoals: ['anxiety', 'sleep', 'focus'],
  },
  {
    slug: 'anxiety',
    title: 'Anxiety support',
    eyebrow: 'Goal guide',
    description: 'Compare non-clinical support options for everyday anxious thoughts, physical tension, and situational stress.',
    quickPicks: [
      { need: 'Bedtime worry loop', option: 'L-Theanine', slug: 'l-theanine' },
      { need: 'General physical tension', option: 'Ashwagandha', slug: 'ashwagandha' },
      { need: 'Social tension / wind-down', option: 'Kava', slug: 'kava' },
    ],
    options: [
      { slug: 'l-theanine', name: 'L-Theanine', bestFor: 'Quieting mental chatter without day-time drowsiness', speed: '30 to 90 minutes', evidence: 'Moderate for acute anxiety-like scores under stress', risk: 'Low', avoidIf: 'No major warnings; evaluate stack compatibility', whyPeopleStop: 'Subtle benefits or too mild for panic episodes', form: 'Pure L-Theanine capsules or green tea extracts' },
      { slug: 'ashwagandha', name: 'Ashwagandha', bestFor: 'Lowering overall daily cortisol-related tension', speed: '2 to 8 weeks', evidence: 'Moderate to strong for general anxiety scales', risk: 'Low to moderate', avoidIf: 'Thyroid medications, pregnancy, autoimmune conditions', whyPeopleStop: 'Delayed benefits or mild gastrointestinal effects', form: 'Root extract standardized (e.g. KSM-66)' },
      { slug: 'kava', name: 'Kava', bestFor: 'Social relaxation and rapid relief of nervous tension', speed: '20 to 60 minutes', evidence: 'Moderate to strong for general anxiety support', risk: 'Moderate', avoidIf: 'Liver disorders, heavy alcohol consumption, motor operating', whyPeopleStop: 'Bitter taste, numbing mouth sensation, or grogginess', form: 'Traditional root brew or high-quality CO2 extract' },
    ],
    relatedGoals: ['stress', 'sleep', 'focus'],
  },
  {
    slug: 'energy',
    title: 'Energy and vitality',
    eyebrow: 'Goal guide',
    description: 'Compare stimulatory, metabolic, and adaptogenic solutions for cellular energy, wakefulness, and stamina.',
    quickPicks: [
      { need: 'Immediate wakefulness', option: 'Caffeine', slug: 'caffeine' },
      { need: 'Physical endurance / stamina', option: 'Ginseng', slug: 'ginseng' },
      { need: 'Mitochondrial energy support', option: 'CoQ10', slug: 'coq10' },
    ],
    options: [
      { slug: 'caffeine', name: 'Caffeine', bestFor: 'Immediate mental wakefulness and physical performance', speed: '15 to 45 minutes', evidence: 'Strong for vigilance, attention, and physical power output', risk: 'Moderate', avoidIf: 'Severe hypertension, cardiac arrhythmia, late afternoon', whyPeopleStop: 'Sleep disruptions, heart palpitations, or jitters', form: 'Coffee, green tea, or caffeine anhydrous' },
      { slug: 'ginseng', name: 'Panax Ginseng', bestFor: 'Vitality, stamina, and immune-metabolic resilience', speed: '2 to 8 weeks', evidence: 'Limited to moderate for fatigue and general vitality', risk: 'Low to moderate', avoidIf: 'Estrogen-sensitive conditions, concurrent diabetes medications', whyPeopleStop: 'Insomnia when taken close to bed', form: 'Standardized Asian Ginseng extract (ginsenosides)' },
      { slug: 'coq10', name: 'CoQ10', bestFor: 'Cellular ATP production and mitochondrial health', speed: '2 to 8 weeks', evidence: 'Moderate for cardiovascular markers and statin-induced fatigue', risk: 'Low', avoidIf: 'Anticoagulant use (warfarin) without monitoring', whyPeopleStop: 'Slow onset and lack of acute feedback', form: 'Ubiquinol for enhanced bioavailability' },
    ],
    relatedGoals: ['focus', 'cognition', 'stress'],
  },
  {
    slug: 'cognition',
    title: 'Cognitive enhancement',
    eyebrow: 'Goal guide',
    description: 'Evaluate options targeting long-term memory consolidation, neuroprotection, and information processing speed.',
    quickPicks: [
      { need: 'Long-term memory retention', option: 'Bacopa', slug: 'bacopa' },
      { need: 'Neurogenesis / brain growth', option: 'Lions Mane', slug: 'lions-mane' },
      { need: 'Acetylcholine support / speed', option: 'Alpha-GPC', slug: 'alpha-gpc' },
    ],
    options: [
      { slug: 'bacopa', name: 'Bacopa Monnieri', bestFor: 'Long-term memory acquisition and retention', speed: '4 to 12 weeks', evidence: 'Moderate for cognitive retention in healthy and age-declining individuals', risk: 'Low to moderate', avoidIf: 'Thyroid conditions or anticholinergic drugs', whyPeopleStop: 'Mild GI cramping or fatigue', form: 'Standardized bacosides extract' },
      { slug: 'lions-mane', name: 'Lions Mane Mushroom', bestFor: 'BDNF support, neuroplasticity, and brain health', speed: '2 to 8 weeks', evidence: 'Limited but growing clinical evidence for mild cognitive decline', risk: 'Low', avoidIf: 'Known mushroom allergies', whyPeopleStop: 'Slow onset and subtle daily feedback', form: 'Fruiting body extract or mycelium biomass' },
      { slug: 'alpha-gpc', name: 'Alpha-GPC', bestFor: 'Rapid choline donation and focus stacking', speed: '30 to 90 minutes', evidence: 'Limited in young adults, moderate in age-related cognitive decline', risk: 'Low to moderate', avoidIf: 'High baseline cardiovascular risk (TMAO context)', whyPeopleStop: 'Brain fog if choline load is already saturated', form: 'Choline alphoscerate powder or capsules' },
    ],
    relatedGoals: ['focus', 'energy', 'longevity'],
  },
  {
    slug: 'longevity',
    title: 'Longevity and cellular health',
    eyebrow: 'Goal guide',
    description: 'Compare options targeted at aging markers, NAD+ synthesis, cellular protection, and inflammatory lifestyle support.',
    quickPicks: [
      { need: 'NAD+ precursor path', option: 'Nicotinamide Riboside', slug: 'nicotinamide-riboside' },
      { need: 'Sirtuin / pathway activation', option: 'Resveratrol', slug: 'resveratrol' },
      { need: 'Senolytic / immune support', option: 'Quercetin', slug: 'quercetin' },
    ],
    options: [
      { slug: 'resveratrol', name: 'Resveratrol', bestFor: 'Sirtuin pathway activation and antioxidant support', speed: 'Weeks to months', evidence: 'Limited in humans, strong preclinical cellular longevity markers', risk: 'Low to moderate', avoidIf: 'Estrogen-sensitive conditions (phytoestrogen effect)', whyPeopleStop: 'Subjective feedback is missing; long-term bet', form: 'Trans-resveratrol capsules' },
      { slug: 'coq10', name: 'CoQ10', bestFor: 'Anti-aging mitochondrial support and cardiovascular health', speed: '2 to 8 weeks', evidence: 'Moderate for cardiovascular markers and cellular recovery', risk: 'Low', avoidIf: 'Blood clotting medications without monitoring', whyPeopleStop: 'Requires daily consistency to maintain tissue levels', form: 'Ubiquinol or water-soluble CoQ10 formulation' },
      { slug: 'quercetin', name: 'Quercetin', bestFor: 'Senolytic aging support and seasonal histamine response', speed: 'Days to weeks', evidence: 'Limited for human longevity endpoints, moderate for immune/allergy support', risk: 'Low', avoidIf: 'Severe kidney disease without clinician check', whyPeopleStop: 'Low oral absorption rates in standard powders', form: 'Quercetin phytosome or paired with bromelain' },
    ],
    relatedGoals: ['cognition', 'inflammation', 'energy'],
  },
  {
    slug: 'gut-health',
    title: 'Gut health support',
    eyebrow: 'Goal guide',
    description: 'Compare fiber, digestion, and gut-support options by tolerance, timing, evidence strength, and medication-separation needs.',
    quickPicks: [
      { need: 'Fiber regularity support', option: 'Psyllium', slug: 'psyllium' },
      { need: 'Prebiotic fiber support', option: 'Inulin', slug: 'inulin' },
      { need: 'Digestive enzyme context', option: 'Digestive Enzymes', slug: 'digestive-enzymes' },
    ],
    options: [
      { slug: 'psyllium', name: 'Psyllium', bestFor: 'Fiber intake, regularity, and lipid-adjacent gut support', speed: 'Days to 2 weeks', evidence: 'Moderate to strong for fiber-related endpoints', risk: 'Low to moderate', avoidIf: 'Swallowing difficulty, inadequate fluid intake, or medication timing conflicts', whyPeopleStop: 'Bloating, texture, or routine friction', form: 'Psyllium husk powder or capsules with plenty of water' },
      { slug: 'inulin', name: 'Inulin', bestFor: 'Prebiotic fiber and microbiome-adjacent support', speed: 'Days to weeks', evidence: 'Moderate for prebiotic and stool-frequency endpoints', risk: 'Low to moderate', avoidIf: 'FODMAP sensitivity or significant bloating tendency', whyPeopleStop: 'Gas or abdominal discomfort during dose escalation', form: 'Low-dose inulin powder increased gradually' },
      { slug: 'digestive-enzymes', name: 'Digestive Enzymes', bestFor: 'Meal-specific digestion support when a clear food-pattern trigger exists', speed: 'Same day', evidence: 'Limited to moderate depending on enzyme and indication', risk: 'Low to moderate', avoidIf: 'Unexplained persistent GI symptoms without medical evaluation', whyPeopleStop: 'Unclear benefit or product mismatch', form: 'Targeted enzyme blend matched to meal pattern' },
      { slug: 'ginger', name: 'Ginger', bestFor: 'Nausea-adjacent or motility-related digestive support', speed: 'Hours to days', evidence: 'Moderate for nausea-related contexts', risk: 'Low', avoidIf: 'Reflux sensitivity or anticoagulant caution', whyPeopleStop: 'Taste or warming GI sensation', form: 'Ginger extract capsules, tea, or standardized gingerols' },
    ],
    relatedGoals: ['inflammation', 'stress', 'sleep'],
  },
  {
    slug: 'joint-support',
    title: 'Joint support',
    eyebrow: 'Goal guide',
    description: 'Compare joint-support supplements by evidence quality, mobility context, onset speed, and allergy or medication cautions.',
    quickPicks: [
      { need: 'Mobility and stiffness support', option: 'Glucosamine', slug: 'glucosamine' },
      { need: 'Inflammation-adjacent joint discomfort', option: 'Curcumin', slug: 'curcumin' },
      { need: 'Resin-based joint support', option: 'Boswellia', slug: 'boswellia' },
    ],
    options: [
      { slug: 'glucosamine', name: 'Glucosamine', bestFor: 'Longer-term joint comfort and mobility routines', speed: '4 to 12 weeks', evidence: 'Moderate but mixed for osteoarthritis-adjacent endpoints', risk: 'Low to moderate', avoidIf: 'Shellfish allergy concerns, diabetes monitoring changes, or warfarin use without supervision', whyPeopleStop: 'Slow onset or unclear subjective payoff', form: 'Glucosamine sulfate capsules' },
      { slug: 'chondroitin', name: 'Chondroitin', bestFor: 'Joint-support routines often paired with glucosamine', speed: '4 to 12 weeks', evidence: 'Moderate but mixed by population and endpoint', risk: 'Low to moderate', avoidIf: 'Anticoagulant use or peri-surgical periods without clinician review', whyPeopleStop: 'Large pills, cost, or slow feedback', form: 'Chondroitin sulfate capsules' },
      { slug: 'curcumin', name: 'Curcumin', bestFor: 'Inflammatory joint discomfort and stiffness support', speed: '1 to 4 weeks', evidence: 'Moderate to strong in osteoarthritis-adjacent trials', risk: 'Low to moderate', avoidIf: 'Gallbladder disease, anticoagulant use, or reflux sensitivity', whyPeopleStop: 'GI upset or inconsistent formulation quality', form: 'Enhanced-bioavailability curcumin extract' },
      { slug: 'boswellia', name: 'Boswellia', bestFor: 'Knee and mobility-related discomfort', speed: 'Days to 2 weeks', evidence: 'Moderate for pain and function outcomes', risk: 'Low to moderate', avoidIf: 'Pregnancy or resin sensitivity', whyPeopleStop: 'Cost or inconsistent brand response', form: 'AKBA-standardized Boswellia serrata extract' },
    ],
    relatedGoals: ['pain', 'inflammation', 'recovery'],
  },
  {
    slug: 'recovery',
    title: 'Recovery support',
    eyebrow: 'Goal guide',
    description: 'Compare recovery-support options for soreness, sleep quality, training load, and fatigue without treating recovery as a single supplement problem.',
    quickPicks: [
      { need: 'Muscle performance recovery', option: 'Creatine', slug: 'creatine' },
      { need: 'Exercise soreness context', option: 'Tart Cherry', slug: 'tart-cherry' },
      { need: 'Sleep-linked recovery', option: 'Magnesium', slug: 'magnesium' },
    ],
    options: [
      { slug: 'creatine', name: 'Creatine', bestFor: 'Strength, repeat-output, and training recovery support', speed: 'Days to 4 weeks', evidence: 'Strong for strength and performance-adjacent endpoints', risk: 'Low', avoidIf: 'Kidney disease without clinician clearance', whyPeopleStop: 'Water-weight change or inconsistent routine', form: 'Creatine monohydrate powder' },
      { slug: 'tart-cherry', name: 'Tart Cherry', bestFor: 'Exercise soreness and short-term recovery strain', speed: 'Days to 2 weeks', evidence: 'Limited to moderate in exercise recovery settings', risk: 'Low', avoidIf: 'Sugar-sensitive routines when using juice concentrates', whyPeopleStop: 'Cost or daily adherence friction', form: 'Tart cherry concentrate or standardized capsules' },
      { slug: 'magnesium', name: 'Magnesium', bestFor: 'Sleep-linked recovery and muscle relaxation context', speed: 'Days to 2 weeks', evidence: 'Limited to moderate depending on baseline status', risk: 'Low', avoidIf: 'Advanced kidney disease without clinician clearance', whyPeopleStop: 'Loose stool with dose escalation', form: 'Magnesium glycinate or citrate' },
      { slug: 'omega-3', name: 'Omega-3 (EPA/DHA)', bestFor: 'Systemic inflammatory load and soreness context', speed: '2 to 8 weeks', evidence: 'Moderate for inflammatory markers in select populations', risk: 'Low to moderate', avoidIf: 'Bleeding disorders or anticoagulant changes without supervision', whyPeopleStop: 'Fishy aftertaste or delayed subjective effect', form: 'Concentrated fish oil softgels' },
    ],
    relatedGoals: ['sleep', 'inflammation', 'energy'],
  },
  {
    slug: 'fat-loss',
    title: 'Fat loss support',
    eyebrow: 'Goal guide',
    description: 'Compare fat-loss supplement claims conservatively, with stimulant load, blood pressure, appetite context, and evidence limits kept visible.',
    quickPicks: [
      { need: 'Caffeine-based thermogenic support', option: 'Caffeine', slug: 'caffeine' },
      { need: 'Metabolic marker support', option: 'Berberine', slug: 'berberine' },
      { need: 'Appetite and fiber support', option: 'Psyllium', slug: 'psyllium' },
    ],
    options: [
      { slug: 'caffeine', name: 'Caffeine', bestFor: 'Short-term alertness and thermogenic context', speed: '15 to 60 minutes', evidence: 'Strong for alertness, modest for energy expenditure', risk: 'Moderate', avoidIf: 'Panic tendency, uncontrolled hypertension, arrhythmia, or late-day use', whyPeopleStop: 'Jitters, tolerance, sleep disruption', form: 'Measured caffeine from coffee, tea, or capsules' },
      { slug: 'green-tea-extract', name: 'Green Tea Extract', bestFor: 'Catechin and caffeine-adjacent metabolic support', speed: 'Days to weeks', evidence: 'Limited to moderate with modest effect sizes', risk: 'Moderate', avoidIf: 'Liver concerns or high-dose concentrated extract use without review', whyPeopleStop: 'GI upset or concern about concentrated extracts', form: 'Moderate-dose EGCG-containing green tea extract' },
      { slug: 'berberine', name: 'Berberine', bestFor: 'Metabolic marker support rather than direct fat loss', speed: '2 to 8 weeks', evidence: 'Moderate for glucose and lipid markers in select populations', risk: 'Moderate', avoidIf: 'Pregnancy, breastfeeding, diabetes medications, or complex medication use without clinician review', whyPeopleStop: 'GI side effects or medication-interaction concerns', form: 'Berberine capsules with meal timing context' },
      { slug: 'psyllium', name: 'Psyllium', bestFor: 'Satiety, fiber intake, and lipid-adjacent support', speed: 'Days to weeks', evidence: 'Moderate to strong for fiber-related endpoints', risk: 'Low to moderate', avoidIf: 'Medication timing conflicts or inadequate fluid intake', whyPeopleStop: 'Texture, bloating, or routine friction', form: 'Psyllium husk powder with water' },
    ],
    relatedGoals: ['energy', 'gut-health', 'blood-pressure'],
  },
  {
    slug: 'blood-pressure',
    title: 'Blood pressure support',
    eyebrow: 'Goal guide',
    description: 'Compare cardiovascular-support supplements with medication context, monitoring, and safety-first framing before any buying decision.',
    quickPicks: [
      { need: 'Nitric-oxide support', option: 'Beetroot Nitrate', slug: 'beetroot-nitrate' },
      { need: 'Mineral support context', option: 'Magnesium', slug: 'magnesium' },
      { need: 'Fiber and lipid overlap', option: 'Psyllium', slug: 'psyllium' },
    ],
    options: [
      { slug: 'beetroot-nitrate', name: 'Beetroot Nitrate', bestFor: 'Nitric-oxide and circulation-adjacent support', speed: 'Hours to weeks', evidence: 'Moderate for blood-pressure-related markers in select groups', risk: 'Low to moderate', avoidIf: 'Nitrate medications, low blood pressure tendency, or kidney stone concerns without review', whyPeopleStop: 'Taste, GI effects, or beeturia concern', form: 'Beetroot powder or nitrate-standardized extract' },
      { slug: 'magnesium', name: 'Magnesium', bestFor: 'Mineral support when intake or status may be low', speed: 'Days to weeks', evidence: 'Moderate with stronger relevance in low-intake contexts', risk: 'Low', avoidIf: 'Advanced kidney disease without clinician clearance', whyPeopleStop: 'Loose stool or unclear feedback', form: 'Magnesium glycinate or citrate' },
      { slug: 'psyllium', name: 'Psyllium', bestFor: 'Fiber, lipid, and cardiometabolic-adjacent support', speed: 'Days to weeks', evidence: 'Moderate to strong for fiber-related markers', risk: 'Low to moderate', avoidIf: 'Medication timing conflicts or inadequate fluid intake', whyPeopleStop: 'Bloating, texture, or routine friction', form: 'Psyllium husk powder separated from medications' },
      { slug: 'coq10', name: 'CoQ10', bestFor: 'Cardiovascular and mitochondrial support context', speed: '2 to 8 weeks', evidence: 'Moderate for some cardiovascular markers', risk: 'Low', avoidIf: 'Warfarin or anticoagulant changes without monitoring', whyPeopleStop: 'Slow onset or cost', form: 'Ubiquinol or enhanced-bioavailability CoQ10' },
    ],
    relatedGoals: ['energy', 'gut-health', 'inflammation'],
  },
  {
    slug: 'testosterone-support',
    title: 'Testosterone support',
    eyebrow: 'Goal guide',
    description: 'Evaluate testosterone-support supplements skeptically, emphasizing sleep, deficiency context, safety, and weak-claim filtering.',
    quickPicks: [
      { need: 'Stress and sleep-linked support', option: 'Ashwagandha', slug: 'ashwagandha' },
      { need: 'Mineral deficiency context', option: 'Zinc', slug: 'zinc' },
      { need: 'Low-intake mineral support', option: 'Magnesium', slug: 'magnesium' },
    ],
    options: [
      { slug: 'ashwagandha', name: 'Ashwagandha', bestFor: 'Stress, sleep, and testosterone-adjacent support in select studies', speed: '2 to 8 weeks', evidence: 'Moderate but context-dependent', risk: 'Low to moderate', avoidIf: 'Thyroid disorders, autoimmune conditions, pregnancy, or liver concerns without review', whyPeopleStop: 'GI effects, emotional flattening, or delayed feedback', form: 'Standardized root extract such as KSM-66 or Shoden' },
      { slug: 'zinc', name: 'Zinc', bestFor: 'Correcting low zinc intake or deficiency context', speed: 'Weeks to months', evidence: 'Stronger when deficiency is present; weak as a general booster', risk: 'Low to moderate', avoidIf: 'Long-term high dose without copper balance or clinician review', whyPeopleStop: 'Nausea or unclear benefit when not deficient', form: 'Zinc picolinate or citrate within conservative dosing' },
      { slug: 'magnesium', name: 'Magnesium', bestFor: 'Low-intake mineral support and sleep/recovery overlap', speed: 'Days to weeks', evidence: 'Limited to moderate depending on baseline status', risk: 'Low', avoidIf: 'Advanced kidney disease without clinician clearance', whyPeopleStop: 'Loose stool at higher doses', form: 'Magnesium glycinate or citrate' },
      { slug: 'tongkat-ali', name: 'Tongkat Ali', bestFor: 'Testosterone-interest users willing to review higher uncertainty', speed: '2 to 8 weeks', evidence: 'Limited to moderate with product-quality concerns', risk: 'Moderate', avoidIf: 'Hormone-sensitive conditions, mood instability, or medication complexity without clinician review', whyPeopleStop: 'Overstimulation, sleep disruption, or quality concerns', form: 'Standardized Eurycoma longifolia extract' },
    ],
    relatedGoals: ['energy', 'stress', 'sleep'],
  },
]

export function getGoal(slug: string): Goal | undefined {
  return goals.find((goal) => goal.slug === slug)
}

export type GoalConfig = {
  slug: string
  title: string
  summary: string
  compoundCandidates: string[]
  safetyNote: string
}

export const goalConfigs: GoalConfig[] = goals.map((goal) => ({
  slug: goal.slug,
  title: goal.title,
  summary: goal.description,
  compoundCandidates: goal.options.map((option) => option.slug),
  safetyNote: goal.options.map((option) => option.avoidIf).join('; '),
}))