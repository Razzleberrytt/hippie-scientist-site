export type CuratedExpansion = {
  intent: string
  methodology: string[]
  evidenceRows: Array<{
    name: string
    tier: string
    bestFor: string
    dose: string
    safety: string
    href?: string
  }>
  comparisonRows: Array<{
    scenario: string
    firstChoice: string
    why: string
  }>
  safetyNotes: string[]
  buyerChecklist: string[]
  references: Array<{
    label: string
    href: string
  }>
}

export const seoEntryExpansions: Record<string, CuratedExpansion> = {
  'best-supplements-for-sleep': {
    intent: 'Commercial investigation: compare sleep supplements by use case, evidence strength, timing, grogginess risk, and medication context before buying.',
    methodology: [
      'Prioritize human sleep outcomes first, then mechanism plausibility and real-world tolerability.',
      'Separate sleep-onset tools from sleep-quality or relaxation tools.',
      'Down-rank ingredients that require heavy sedation, unclear dosing, or risky stacking to feel noticeable.',
    ],
    evidenceRows: [
      { name: 'Melatonin', tier: 'Moderate', bestFor: 'Sleep onset and circadian timing', dose: '0.3-3 mg, 30-90 min before bed', safety: 'Possible vivid dreams or next-day grogginess; avoid casual high dosing.', href: '/compounds/melatonin' },
      { name: 'Magnesium glycinate', tier: 'Low to moderate', bestFor: 'Tension, low intake, evening relaxation', dose: '100-300 mg elemental magnesium in the evening', safety: 'Avoid unsupervised use with kidney disease; separate from some antibiotics.' },
      { name: 'Glycine', tier: 'Preliminary', bestFor: 'Subjective sleep quality and next-day freshness', dose: '3 g near bedtime in most trials', safety: 'Usually well tolerated; GI upset is possible.' },
      { name: 'L-theanine', tier: 'Preliminary to moderate', bestFor: 'Stress-related wakefulness and racing thoughts', dose: '100-200 mg in the evening', safety: 'May add to sedative effects in sensitive users.', href: '/compounds/l-theanine' },
      { name: 'Valerian', tier: 'Mixed', bestFor: 'People who prefer traditional herbal sleep aids', dose: '300-600 mg extract before bed', safety: 'Do not combine casually with alcohol, sedatives, or other sleep aids.', href: '/herbs/valerian' },
      { name: 'Apigenin', tier: 'Mechanistic', bestFor: 'Chamomile-adjacent relaxation experiments', dose: 'No consensus dose for insomnia outcomes', safety: 'Evidence is thinner than marketing suggests.' },
    ],
    comparisonRows: [
      { scenario: 'Trouble falling asleep', firstChoice: 'Melatonin or low-dose theanine', why: 'Melatonin targets timing; theanine targets arousal.' },
      { scenario: 'Tense body or low magnesium intake', firstChoice: 'Magnesium glycinate', why: 'Better fit for relaxation and deficiency context than circadian timing.' },
      { scenario: 'Avoiding morning fog', firstChoice: 'Glycine or theanine', why: 'Often less hangover-prone than stronger sedating herb stacks.' },
      { scenario: 'Herbal preference', firstChoice: 'Valerian, cautiously', why: 'Evidence is mixed and sedation interactions matter.' },
    ],
    safetyNotes: [
      'Do not stack multiple sedating supplements on the first night.',
      'Review sleep apnea, alcohol use, depression, bipolar history, pregnancy, and sedative medication context before experimenting.',
      'Persistent insomnia, loud snoring, gasping, or daytime sleepiness deserves clinical evaluation, not just a stronger stack.',
    ],
    buyerChecklist: [
      'Pick one primary job: sleep onset, physical relaxation, or stress-related wakefulness.',
      'Prefer transparent single-ingredient labels over proprietary sleep blends.',
      'Check elemental magnesium, melatonin dose, and third-party testing before comparing price.',
      'Track dose, timing, sleep latency, awakenings, and next-day grogginess for two weeks.',
    ],
    references: [
      { label: 'Melatonin meta-analysis for sleep latency and quality (PLOS One)', href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0063773' },
      { label: 'Valerian systematic review and meta-analysis (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4394901/' },
      { label: 'Dietary protocols and magnesium sleep evidence review (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13075487/' },
    ],
  },
  'best-supplements-for-stress': {
    intent: 'Commercial investigation: choose between acute calming supplements and longer-horizon adaptogens without treating stress formulas as interchangeable.',
    methodology: [
      'Rank ingredients by human stress outcomes, safety complexity, and whether the use case is acute or chronic.',
      'Keep adaptogens separate from same-day calming compounds.',
      'Require clear medication and pregnancy cautions for botanicals with endocrine, sedative, or liver-safety signals.',
    ],
    evidenceRows: [
      { name: 'Ashwagandha', tier: 'Moderate', bestFor: 'Perceived stress and cortisol-pattern support', dose: '300-600 mg/day standardized root extract', safety: 'Avoid in pregnancy; review thyroid, autoimmune, liver, and sedative context.', href: '/herbs/ashwagandha' },
      { name: 'Rhodiola', tier: 'Preliminary to moderate', bestFor: 'Stress fatigue and low-drive burnout patterns', dose: '200-400 mg/day standardized extract, often earlier in the day', safety: 'Can feel activating; caution with bipolar history or stimulants.', href: '/herbs/rhodiola' },
      { name: 'L-theanine', tier: 'Preliminary to moderate', bestFor: 'Same-day calm without heavy sedation', dose: '100-200 mg as needed or with caffeine', safety: 'Usually gentle; watch additive sedation or blood-pressure effects.', href: '/compounds/l-theanine' },
      { name: 'Magnesium', tier: 'Context dependent', bestFor: 'Low intake, muscle tension, sleep-stress overlap', dose: '100-300 mg elemental magnesium', safety: 'Kidney disease and medication spacing matter.' },
      { name: 'Holy basil', tier: 'Preliminary', bestFor: 'Traditional adaptogen users wanting a milder option', dose: '300-600 mg/day extract', safety: 'Caution with anticoagulants, hypoglycemics, fertility/pregnancy context.' },
    ],
    comparisonRows: [
      { scenario: 'Acute workday tension', firstChoice: 'L-theanine', why: 'Faster and less endocrine-active than adaptogens.' },
      { scenario: 'Chronic perceived stress', firstChoice: 'Ashwagandha', why: 'Best human stress/cortisol signal, but more contraindications.' },
      { scenario: 'Stress plus fatigue', firstChoice: 'Rhodiola', why: 'More energizing profile; avoid late-day dosing.' },
      { scenario: 'Stress plus poor sleep', firstChoice: 'Magnesium or theanine', why: 'Lower-risk starting points before sedative stacks.' },
    ],
    safetyNotes: [
      'Stress supplements do not treat anxiety disorders, depression, trauma, or burnout by themselves.',
      'Avoid combining sedatives, alcohol, kava, ashwagandha, and sleep aids without clinician guidance.',
      'Pregnancy, thyroid disease, bipolar history, liver disease, and complex medications change the risk calculation.',
    ],
    buyerChecklist: [
      'Decide whether you need acute calm or multi-week adaptogen support.',
      'Choose standardized extracts with marker compounds listed.',
      'Avoid proprietary cortisol blends that hide doses.',
      'Start one ingredient at a time and reassess after the expected response window.',
    ],
    references: [
      { label: 'Ashwagandha stress RCT (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6750292/' },
      { label: 'Ashwagandha stress and anxiety review (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/39348746/' },
      { label: 'Nutrition and ADHD/stress-related nutrient context (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10444659/' },
    ],
  },
  'best-supplements-for-focus': {
    intent: 'Commercial investigation: compare focus supplements by stimulant load, cognitive target, evidence strength, tolerance risk, and sleep tradeoffs.',
    methodology: [
      'Rank fast stimulants separately from calm-focus and longer-term cognitive-support options.',
      'Prefer ingredients with human attention or cognition outcomes over broad nootropic claims.',
      'Penalize stacks that hide caffeine, stack cholinergics, or ignore anxiety and sleep context.',
    ],
    evidenceRows: [
      { name: 'Caffeine + L-theanine', tier: 'Moderate for acute attention', bestFor: 'Fast focus with fewer jitters than caffeine alone', dose: '50-100 mg caffeine + 100-200 mg theanine', safety: 'Avoid late day; caution with anxiety, BP, stimulants.', href: '/articles/l-theanine-vs-caffeine-for-focus' },
      { name: 'Citicoline', tier: 'Preliminary to moderate', bestFor: 'Choline support and mental effort', dose: '250-500 mg/day', safety: 'Headache or GI effects in some users.', href: '/articles/citicoline-vs-alpha-gpc' },
      { name: 'Alpha-GPC', tier: 'Preliminary', bestFor: 'Choline-focused stacks', dose: '300-600 mg/day', safety: 'Do not stack multiple cholinergics aggressively.' },
      { name: "Lion's mane", tier: 'Preliminary', bestFor: 'Longer-horizon cognition and neurotrophic interest', dose: '500-1,000 mg extract/day or label-standardized equivalent', safety: 'Mushroom allergy and product quality matter.', href: '/herbs/lions-mane' },
      { name: 'Bacopa', tier: 'Moderate for memory, not acute focus', bestFor: 'Memory support over 8-12 weeks', dose: '300 mg/day standardized bacosides', safety: 'GI upset and sedation are common deal-breakers.' },
      { name: 'Rhodiola', tier: 'Preliminary to moderate', bestFor: 'Stress fatigue and mental endurance', dose: '200-400 mg earlier in the day', safety: 'Can feel activating; caution with bipolar history.' },
    ],
    comparisonRows: [
      { scenario: 'Need focus today', firstChoice: 'Caffeine + L-theanine', why: 'Most noticeable same-day option, but sleep cost matters.' },
      { scenario: 'Caffeine sensitive', firstChoice: 'L-theanine alone or citicoline', why: 'Less likely to raise jitteriness.' },
      { scenario: 'Brain fog from stress fatigue', firstChoice: 'Rhodiola', why: 'Targets fatigue more than raw stimulation.' },
      { scenario: 'Long-term cognition interest', firstChoice: "Lion's mane or bacopa", why: 'Not acute nootropics; evaluate over weeks.' },
    ],
    safetyNotes: [
      'Focus supplements can worsen insomnia, anxiety, blood pressure, or stimulant side effects.',
      'Do not compensate for poor sleep with escalating caffeine or multi-stimulant stacks.',
      'If focus problems are new, severe, or paired with depression, sleep apnea, anemia, thyroid symptoms, or medication changes, seek evaluation.',
    ],
    buyerChecklist: [
      'Check the caffeine amount per serving and per day.',
      'Choose single-ingredient trials before complex nootropic blends.',
      'Avoid stacking citicoline, Alpha-GPC, and high-dose choline without a reason.',
      'Track sleep, anxiety, heart rate, and timing, not just perceived focus.',
    ],
    references: [
      { label: 'Nutrition and ADHD/focus supplement review (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10444659/' },
      { label: "Lion's mane neurotrophic review (PubMed)", href: 'https://pubmed.ncbi.nlm.nih.gov/37958943/' },
      { label: 'Iron and zinc ADHD systematic review (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8618748/' },
    ],
  },
  'best-supplements-for-gut-health': {
    intent: 'Commercial investigation: compare gut-health supplements by symptom fit, evidence quality, strain/form specificity, tolerability, and medication timing.',
    methodology: [
      'Rank by human GI outcomes first, not broad microbiome marketing.',
      'Separate regularity, IBS-style bloating, gut-barrier claims, and digestive-enzyme use cases.',
      'Down-rank products that hide strains, fiber type, enzyme units, or dose.',
    ],
    evidenceRows: [
      { name: 'Psyllium / soluble fiber', tier: 'Moderate', bestFor: 'Regularity, stool form, and cardiometabolic overlap', dose: 'Start 3-5 g/day with water; titrate slowly', safety: 'Separate from medications; avoid with swallowing difficulty or bowel obstruction risk.' },
      { name: 'Probiotics', tier: 'Strain-specific / mixed', bestFor: 'Some IBS and antibiotic-associated contexts', dose: 'Use studied strain and CFU from the product label', safety: 'Avoid self-directed use if immunocompromised or critically ill.' },
      { name: 'Prebiotic fiber', tier: 'Context dependent', bestFor: 'Microbiome support when fermentable fibers are tolerated', dose: 'Start low, often 1-3 g/day', safety: 'Can worsen gas/bloating in IBS or FODMAP sensitivity.' },
      { name: 'Peppermint oil', tier: 'Moderate for IBS symptoms', bestFor: 'IBS-style cramping, bloating, and discomfort', dose: 'Enteric-coated capsules per label before meals', safety: 'Can worsen reflux; avoid with gallbladder disease unless cleared.' },
      { name: 'Digestive enzymes', tier: 'Specific-use only', bestFor: 'Lactase for lactose or targeted enzymes for known triggers', dose: 'Taken with the trigger meal', safety: 'Broad enzyme blends are often over-marketed.' },
      { name: 'Ginger', tier: 'Preliminary to moderate', bestFor: 'Nausea or motility-adjacent discomfort', dose: '500-1,000 mg/day or food/tea equivalent', safety: 'Caution with anticoagulants or surgery context.', href: '/herbs/ginger' },
      { name: 'Zinc carnosine / L-glutamine', tier: 'Preliminary', bestFor: 'Barrier-support interest, not general gut-health claims', dose: 'Product and context dependent', safety: 'Use clinician guidance for IBD, ulcers, or complex GI disease.', href: '/compounds/l-glutamine' },
    ],
    comparisonRows: [
      { scenario: 'Constipation or irregularity', firstChoice: 'Psyllium or another soluble fiber', why: 'Most practical first-line supplement category when tolerated.' },
      { scenario: 'Bloating after fermentable foods', firstChoice: 'Targeted enzyme or lower-FODMAP review', why: 'Prebiotics may worsen symptoms if fermentable fiber is the trigger.' },
      { scenario: 'IBS-style cramps', firstChoice: 'Enteric-coated peppermint oil', why: 'More targeted evidence than generic gut blends.' },
      { scenario: 'After antibiotics', firstChoice: 'Specific probiotic strain', why: 'Benefits are strain- and situation-specific, not guaranteed by high CFU alone.' },
    ],
    safetyNotes: [
      'New, severe, bloody, unexplained, or persistent GI symptoms need medical evaluation.',
      'Fiber can reduce absorption of medications and should be separated from drugs and minerals when advised.',
      'Probiotics are not automatically safe for immunocompromised, critically ill, or central-line patients.',
      'Peppermint oil can worsen reflux and is not the same as peppermint tea.',
    ],
    buyerChecklist: [
      'Choose by symptom: regularity, bloating, cramping, diarrhea, constipation, or post-antibiotic context.',
      'For probiotics, verify full strain names, CFU at expiration, and storage requirements.',
      'For fiber, check soluble versus fermentable type and start with a small dose.',
      'For enzymes, match the enzyme to the food trigger instead of buying a broad blend first.',
    ],
    references: [
      { label: 'Prebiotics and probiotics for gastrointestinal disorders (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10975713/' },
      { label: 'NCCIH IBS complementary approaches digest', href: 'https://www.nccih.nih.gov/health/providers/digest/irritable-bowel-syndrome-and-complementary-health-approaches-science' },
      { label: 'Probiotics, fibre, and herbal products for functional bowel symptoms (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5429330/' },
    ],
  },
  'best-supplements-for-fat-loss': {
    intent: 'High-scrutiny commercial investigation: compare fat-loss supplements by realistic effect size, safety, diet/training dependence, and medical context.',
    methodology: [
      'Rank supplements only as adjuncts to diet, protein adequacy, activity, sleep, and medical care.',
      'Prefer systematic reviews, official NIH safety summaries, and human body-composition outcomes.',
      'Penalize stimulant blends, GLP-1 replacement claims, and products that hide caffeine or botanical doses.',
    ],
    evidenceRows: [
      { name: 'Protein powder', tier: 'Moderate as diet support', bestFor: 'Satiety and preserving lean mass during calorie deficit', dose: 'Use to meet daily protein target, not as a fat burner', safety: 'Kidney disease or medically restricted diets need clinician guidance.' },
      { name: 'Soluble fiber / psyllium', tier: 'Mixed to moderate', bestFor: 'Fullness, regularity, and glycemic context', dose: '3-10 g/day, titrated with water', safety: 'Separate from medications; GI bloating can limit use.' },
      { name: 'Caffeine', tier: 'Modest acute effect', bestFor: 'Short-term energy expenditure and training support', dose: 'Keep total daily caffeine visible', safety: 'Can worsen anxiety, insomnia, BP, palpitations, and stimulant interactions.', href: '/compounds/caffeine' },
      { name: 'Green tea extract / EGCG', tier: 'Small effect, safety-limited', bestFor: 'People tolerating caffeine/catechins and avoiding empty-stomach extracts', dose: 'Varies widely; avoid high-dose EGCG self-experiments', safety: 'Liver injury reports exist, especially concentrated extracts.' },
      { name: 'Berberine', tier: 'Preliminary to moderate metabolic signal', bestFor: 'Metabolic-health context with clinician awareness', dose: 'Often >1 g/day in studies, split doses', safety: 'GI effects; medication, pregnancy, diabetes-drug, and bilirubin context matter.', href: '/compounds/berberine' },
      { name: 'L-carnitine', tier: 'Mixed', bestFor: 'Specific deficiency or training contexts, not broad fat loss', dose: 'Study-dependent; often grams/day', safety: 'GI effects and odor are common; evidence is not magic.' },
    ],
    comparisonRows: [
      { scenario: 'Best first purchase', firstChoice: 'Protein or fiber if they fix a real diet gap', why: 'They support adherence; they do not override calorie balance.' },
      { scenario: 'Stimulant-sensitive', firstChoice: 'Avoid caffeine-heavy fat burners', why: 'Sleep and anxiety costs can erase any tiny thermogenic benefit.' },
      { scenario: 'Metabolic labs are abnormal', firstChoice: 'Clinician-guided plan before berberine', why: 'Medication and glucose-lowering overlap matter.' },
      { scenario: 'Product says natural Ozempic', firstChoice: 'Skip the claim', why: 'Supplements do not match GLP-1 medication effect sizes.' },
    ],
    safetyNotes: [
      'Supplements do not replace medical obesity care, prescribed medication, nutrition therapy, or evaluation for endocrine causes.',
      'Avoid stimulant blends if you have uncontrolled blood pressure, arrhythmia, panic/anxiety, insomnia, pregnancy, or stimulant medication use.',
      'Green tea extract and some fat-loss botanicals have liver-safety concerns; stop for jaundice, dark urine, severe abdominal pain, or unusual fatigue.',
      'Berberine can interact with glucose-lowering drugs and is not appropriate for pregnancy or breastfeeding without medical guidance.',
    ],
    buyerChecklist: [
      'Reject proprietary blends that hide caffeine, synephrine, yohimbine, EGCG, or berberine dose.',
      'Ask what behavior the supplement helps: protein target, fullness, training energy, or metabolic-lab discussion.',
      'Track waist, weight trend, sleep, blood pressure, and side effects over weeks, not day-to-day noise.',
      'Choose third-party tested products and avoid products promising rapid or medication-like weight loss.',
    ],
    references: [
      { label: 'NIH ODS weight-loss supplement fact sheet', href: 'https://ods.od.nih.gov/factsheets/WeightLoss-HealthProfessional/' },
      { label: 'NCCIH berberine and weight loss evidence summary', href: 'https://www.nccih.nih.gov/health/berberine-and-weight-loss-what-you-need-to-know' },
      { label: 'Dietary supplements for weight management narrative review (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9099655/' },
      { label: 'Berberine randomized-trial meta-analysis (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/32690176/' },
    ],
  },
}

export const herbProfileExpansions: Record<string, CuratedExpansion> = {
  ashwagandha: {
    intent: 'Informational to commercial: understand what ashwagandha can and cannot support, then choose a standardized product with safety context.',
    methodology: [
      'Separate stress, sleep, testosterone, and anxiety claims instead of merging them into one adaptogen promise.',
      'Prioritize standardized root-extract trials and systematic reviews over traditional-use claims.',
      'Flag endocrine, pregnancy, liver, autoimmune, and sedative cautions before product guidance.',
    ],
    evidenceRows: [
      { name: 'Stress and perceived tension', tier: 'Moderate', bestFor: 'Adults with chronic perceived stress', dose: '300-600 mg/day standardized root extract', safety: 'Review thyroid, pregnancy, autoimmune, liver, and sedative context.' },
      { name: 'Sleep quality', tier: 'Moderate', bestFor: 'Stress-linked sleep disruption', dose: '300-600 mg/day, often evening or split dose', safety: 'Can add to sedating products.' },
      { name: 'Anxiety symptoms', tier: 'Preliminary to moderate', bestFor: 'Stress-anxiety overlap, not acute panic', dose: 'Trial windows usually 6-8 weeks', safety: 'Not a replacement for anxiety care.' },
      { name: 'Testosterone/fertility markers', tier: 'Preliminary', bestFor: 'Stress-related male fertility or training contexts', dose: 'Study-specific extracts; avoid broad hormone claims', safety: 'Endocrine history changes the risk/benefit picture.' },
    ],
    comparisonRows: [
      { scenario: 'KSM-66', firstChoice: 'Full-spectrum root extract', why: 'Often positioned for stress, sleep, performance, and general adaptogen use.' },
      { scenario: 'Sensoril', firstChoice: 'Root/leaf extract', why: 'Often more withanolide-dense; may feel more sedating for some users.' },
      { scenario: 'Gummies', firstChoice: 'Convenience only', why: 'Check dose, sugar alcohols, and whether extract standardization is disclosed.' },
    ],
    safetyNotes: [
      'Avoid self-directed use during pregnancy or breastfeeding.',
      'Use clinician guidance with thyroid disease or thyroid medication; ashwagandha may affect thyroid markers in susceptible users.',
      'Stop and seek care for jaundice, dark urine, severe abdominal pain, or unusual fatigue because rare liver injury reports exist.',
    ],
    buyerChecklist: [
      'Look for standardized withanolide content and the extract name.',
      'Match timing to the goal: evening for sleepiness, morning/split dosing for stress routines.',
      'Avoid stacking with alcohol, sedatives, or multiple calming herbs at first.',
      'Give stress and sleep trials several weeks; do not chase same-day effects.',
    ],
    references: [
      { label: 'Ashwagandha stress RCT (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6750292/' },
      { label: 'Ashwagandha sleep systematic review (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/34559859/' },
      { label: 'Ashwagandha stress and anxiety review (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/39348746/' },
    ],
  },
  'lions-mane': {
    intent: 'Informational to commercial: evaluate lion’s mane for cognition and neurotrophic interest while choosing between fruiting body, mycelium, and dual extracts.',
    methodology: [
      'Keep human cognition and mood data separate from NGF mechanism claims.',
      'Treat hericenones and erinacines as plausible constituents, not proof of a clinical effect.',
      'Rank products by disclosed mushroom part, beta-glucan testing, and contaminant controls.',
    ],
    evidenceRows: [
      { name: 'Cognition in older adults', tier: 'Preliminary', bestFor: 'Longer-term cognitive-support interest', dose: 'Often 1-3 g/day powder equivalent or extract, trial-dependent', safety: 'Not proven for dementia treatment or ADHD.' },
      { name: 'Mood and stress', tier: 'Preliminary', bestFor: 'Mild mood/stress overlap', dose: 'Study-specific preparations over weeks', safety: 'Do not replace mental-health care.' },
      { name: 'NGF / neurotrophic pathways', tier: 'Mechanistic', bestFor: 'Biological plausibility', dose: 'No clinical dose can be derived from cell/animal data', safety: 'Mechanism does not equal outcome.' },
      { name: 'Focus/nootropic use', tier: 'Limited', bestFor: 'Low-stimulation experiments', dose: 'Use label-standardized extract; evaluate over 4-8 weeks', safety: 'Expect subtle effects, not acute stimulation.' },
    ],
    comparisonRows: [
      { scenario: 'Fruiting body extract', firstChoice: 'Best default', why: 'Usually clearer beta-glucan and mushroom-part labeling.' },
      { scenario: 'Mycelium on grain', firstChoice: 'Use caution', why: 'Can be starch-heavy unless actives and beta-glucans are disclosed.' },
      { scenario: 'Dual extract', firstChoice: 'Reasonable premium option', why: 'May capture water- and alcohol-soluble fractions, but still needs testing data.' },
    ],
    safetyNotes: [
      'Avoid if you have a mushroom allergy or have reacted to fungal products.',
      'Use clinician guidance with immunosuppressants or complex immune conditions.',
      'Treat cognition claims as experimental; worsening mood, sleep, or GI symptoms means stop and reassess.',
    ],
    buyerChecklist: [
      'Prefer labels that clearly say fruiting body or disclose mycelium substrate.',
      'Look for beta-glucan testing instead of only polysaccharide claims.',
      'Choose third-party contaminant testing for heavy metals and microbes.',
      'Avoid products promising immediate focus or disease treatment.',
    ],
    references: [
      { label: "Hericium erinaceus neurotrophic review (PubMed)", href: 'https://pubmed.ncbi.nlm.nih.gov/37958943/' },
      { label: "Lion's mane narrative review (PubMed)", href: 'https://pubmed.ncbi.nlm.nih.gov/40284172/' },
      { label: 'Neuroprotective herbs review context (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/33917843/' },
    ],
  },
  turmeric: {
    intent: 'Informational to commercial: understand turmeric versus curcumin, bioavailability forms, joint/inflammation evidence, and safety cautions before buying.',
    methodology: [
      'Separate culinary turmeric from concentrated curcumin extracts.',
      'Rank forms by human evidence, bioavailability strategy, and safety tradeoffs.',
      'Make anticoagulant, gallbladder, surgery, pregnancy, and GI cautions visible before product guidance.',
    ],
    evidenceRows: [
      { name: 'Joint comfort / osteoarthritis', tier: 'Moderate', bestFor: 'Adults comparing non-NSAID joint-support options', dose: 'Often 500-1,000 mg/day curcuminoids or formulated equivalent', safety: 'Medication and gallbladder context matter.' },
      { name: 'Inflammatory signaling', tier: 'Mechanistic to moderate', bestFor: 'NF-kB/Nrf2 pathway context', dose: 'Form-dependent; do not infer from spice dose', safety: 'Do not treat inflammatory disease without care.' },
      { name: 'Gut and metabolic context', tier: 'Preliminary', bestFor: 'Curcumin-focused experiments', dose: 'Trial-dependent extracts', safety: 'Can aggravate reflux or GI upset.' },
      { name: 'Plain turmeric powder', tier: 'Low for targeted effects', bestFor: 'Food use, not high-potency supplementation', dose: 'Culinary amounts vary', safety: 'Low dose but lower bioavailability.' },
    ],
    comparisonRows: [
      { scenario: 'Curcumin phytosome', firstChoice: 'Best premium default', why: 'Improves absorption without relying on piperine interaction risk.' },
      { scenario: 'Curcumin + piperine', firstChoice: 'Potent but interaction-aware', why: 'Piperine can affect drug metabolism and tolerability.' },
      { scenario: 'Liposomal/nano forms', firstChoice: 'Consider if tested', why: 'Bioavailability claims need brand-specific evidence.' },
      { scenario: 'Turmeric powder', firstChoice: 'Food-first', why: 'Useful culinary ingredient, but not equivalent to studied extracts.' },
    ],
    safetyNotes: [
      'Use clinician guidance with anticoagulants, antiplatelets, bleeding disorders, or upcoming surgery.',
      'Avoid self-directed high-dose curcumin with gallstones, bile-duct obstruction, or severe reflux unless a clinician clears it.',
      'Piperine-containing products may change medication exposure; choose non-piperine forms when interaction risk is a concern.',
    ],
    buyerChecklist: [
      'Choose curcuminoid amount and form, not just total turmeric weight.',
      'Decide whether piperine is appropriate for your medication context.',
      'Prefer third-party tested products for heavy metals and adulterants.',
      'Expect gradual joint-support trials over weeks, not same-day pain relief.',
    ],
    references: [
      { label: 'Curcumin human health review (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5664031/' },
      { label: 'Bioavailability of oral curcumin systematic review context (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10891944/' },
      { label: 'Curcumin in osteoarthritis scoping review (PMC)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11959387/' },
    ],
  },
}
