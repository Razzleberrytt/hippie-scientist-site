import type { ArticleCitationOverride } from './article-citation-overrides'

export const sleepRelationshipSlugAliases: Record<string, string> = {
  'medications-and-sleep': 'medications-and-sleep-effects',
  'nasal-obstruction-and-sleep-apnea': 'nasal-obstruction-snoring-and-sleep-apnea',
}

export const sleepBatch2CitationOverrides: Record<string, ArticleCitationOverride> = {
  'advanced-sleep-wake-phase-disorder': {
    relatedSlugs: [
      'delayed-sleep-wake-phase-vs-insomnia',
      'night-owl-chronotype-vs-delayed-sleep-phase',
      'morning-light-and-sleep-timing',
      'melatonin-timing-vs-dose',
      'sleep-regularity-health',
    ],
    canonicalConcepts: [
      'advanced sleep-wake phase disorder',
      'circadian phase advance',
      'early morning awakening',
      'evening light therapy',
      'actigraphy',
      'circadian rhythm',
      'reproductive and healthy aging',
    ],
    decisionRows: [
      { label: 'Core pattern', value: 'Sleepiness and waking occur earlier than desired, while sleep may be relatively normal when the person follows the earlier schedule.' },
      { label: 'Not enough for diagnosis', value: 'Being an early bird or preferring an early bedtime without distress or impairment.' },
      { label: 'Most direct lever', value: 'Circadian-timed evening light is the main phase-delaying intervention; timing matters more than generic brightness.' },
      { label: 'Melatonin caveat', value: 'Melatonin is not a simple bedtime sedative for this problem, and poorly timed use can shift the clock in the wrong direction.' },
    ],
    faqAnswers: [
      { question: 'How is advanced sleep-wake phase disorder different from being a morning person?', answer: 'A morning preference becomes a disorder only when the early sleep-wake timing is persistent and causes meaningful distress or functional impairment. Preference alone is not a diagnosis.' },
      { question: 'What treatment is used for advanced sleep-wake phase disorder?', answer: 'Timed evening light is the most direct circadian intervention used to delay the body clock. Treatment timing should be individualized because light at the wrong biological time can shift circadian phase differently.' },
      { question: 'Does melatonin treat early morning waking from advanced sleep phase?', answer: 'Melatonin timing is biologically important, but the evidence is less straightforward than using it as a bedtime sleeping pill. Unsupervised timing can be counterproductive when the goal is to delay an already-advanced clock.' },
    ],
  },
  'nasal-obstruction-snoring-and-sleep-apnea': {
    relatedSlugs: [
      'snoring-vs-sleep-apnea',
      'cpap-vs-oral-appliance-for-sleep-apnea',
      'home-sleep-apnea-test-vs-polysomnography',
      'mouth-taping-for-sleep',
      'sleep-apnea-in-women',
    ],
    canonicalConcepts: [
      'nasal obstruction',
      'nasal dilators',
      'snoring',
      'obstructive sleep apnea',
      'continuous positive airway pressure',
      'nasal surgery',
      'CPAP adherence',
    ],
    decisionRows: [
      { label: 'Nasal strips/dilators', value: 'May improve perceived airflow or comfort, but pooled evidence does not support them as OSA monotherapy.' },
      { label: 'Nasal surgery', value: 'Can improve obstruction, symptoms, and PAP tolerance in selected patients without reliably normalizing core OSA severity.' },
      { label: 'What proves OSA control', value: 'Objective sleep-disordered-breathing outcomes, not quieter snoring or easier nasal breathing alone.' },
      { label: 'Highest-value role', value: 'Treat a genuine nasal bottleneck when it impairs breathing comfort or PAP use while separately treating the collapsible airway disorder.' },
    ],
    faqAnswers: [
      { question: 'Do nasal strips treat obstructive sleep apnea?', answer: 'Current pooled evidence does not support nasal strips or internal dilators as stand-alone OSA treatment. They can still improve airflow comfort for some people with nasal obstruction.' },
      { question: 'Can nasal surgery cure sleep apnea?', answer: 'Isolated nasal surgery often improves nasal resistance, snoring, sleepiness, or PAP tolerance, but most modern reviews do not show a large reliable normalization of OSA severity by itself.' },
      { question: 'Can fixing nasal obstruction make CPAP easier to use?', answer: 'Yes. Treating significant nasal obstruction can reduce a practical barrier to PAP use and may lower required pressure in selected patients, even when untreated AHI changes little.' },
    ],
  },
  'medications-and-sleep-effects': {
    relatedSlugs: [
      'daytime-sleepiness-vs-fatigue',
      'otc-antihistamines-for-sleep',
      'depression-and-sleep',
      'cbt-i-vs-sleep-supplements',
      'alcohol-and-sleep',
    ],
    canonicalConcepts: [
      'medication-induced insomnia',
      'medication-induced somnolence',
      'sleep architecture',
      'antidepressants',
      'stimulants',
      'glucocorticoids',
      'next-day impairment',
    ],
    decisionRows: [
      { label: 'Sedation', value: 'Feeling drowsy is not the same endpoint as improved restorative sleep or treated insomnia.' },
      { label: 'Antidepressants', value: 'Sleep effects are drug-specific and can include insomnia, somnolence, REM changes, or altered sleep continuity.' },
      { label: 'Stimulants', value: 'Insomnia is a plausible adverse effect, but adult sleep outcomes are heterogeneous because treating ADHD can also improve routines and some sleep measures.' },
      { label: 'Safety boundary', value: 'Do not abruptly stop, skip, split, retime, or combine prescribed medication based on a sleep article; review meaningful sleep changes with the prescriber or pharmacist.' },
    ],
    faqAnswers: [
      { question: 'Does a medication making you sleepy mean it improves sleep quality?', answer: 'No. Sedation and restorative sleep are different outcomes. A drug can increase drowsiness while still altering sleep architecture, causing next-day impairment, or failing to treat the underlying insomnia mechanism.' },
      { question: 'Can antidepressants cause either insomnia or sleepiness?', answer: 'Yes. Modern comparative evidence shows that antidepressant sleep effects differ substantially by drug and dose, and some agents increase insomnia while others more often cause somnolence.' },
      { question: 'Should medication timing be changed when sleep gets worse?', answer: 'A timing relationship is useful information, but prescription timing should not be changed independently because it can affect symptom control, rebound effects, safety, and adherence. Review it with the prescriber or pharmacist.' },
    ],
  },
  'sleep-paralysis': {
    relatedSlugs: [
      'rem-sleep-behavior-disorder',
      'narcolepsy-excessive-daytime-sleepiness',
      'hypersomnolence-vs-insufficient-sleep',
      'ptsd-nightmares-and-sleep',
      'why-sleep-studies-disagree',
    ],
    canonicalConcepts: [
      'sleep paralysis',
      'REM atonia',
      'REM-wake dissociation',
      'hypnagogic hallucinations',
      'hypnopompic hallucinations',
      'narcolepsy differential',
      'sleep deprivation',
    ],
    decisionRows: [
      { label: 'Typical isolated episode', value: 'Awareness returns while REM-related muscle atonia briefly persists; frightening hallucinations can occur but are not required.' },
      { label: 'Common risk context', value: 'Sleep deprivation, irregular schedules, and jet lag can increase vulnerability without explaining every episode.' },
      { label: 'Narcolepsy clue', value: 'Persistent excessive daytime sleepiness, cataplexy, or other REM-intrusion symptoms raise the need for a narcolepsy workup.' },
      { label: 'First-line response', value: 'Education, adequate sleep opportunity, and schedule stabilization are more defensible than supplement or medication stacks for isolated episodes.' },
    ],
    faqAnswers: [
      { question: 'Are hallucinations during sleep paralysis a sign of psychosis?', answer: 'Not by themselves. Hallucinations tied specifically to falling asleep or waking during paralysis can be part of REM-wake dissociation. Hallucinations during sustained daytime wakefulness require a different clinical framework.' },
      { question: 'Is sleep paralysis a sign of narcolepsy?', answer: 'It can occur in narcolepsy, but isolated sleep paralysis is common outside narcolepsy. Persistent daytime sleepiness, cataplexy, and other narcolepsy features make the differential more important.' },
      { question: 'What helps recurrent sleep paralysis?', answer: 'The strongest first steps are correcting sleep deprivation, stabilizing sleep-wake timing, reducing major schedule disruption, and understanding the REM mechanism. Medication evidence for isolated sleep paralysis is limited.' },
    ],
  },
  'rem-sleep-behavior-disorder': {
    relatedSlugs: [
      'sleep-paralysis',
      'sleepwalking-nrem-parasomnias',
      'medications-and-sleep-effects',
      'melatonin-timing-vs-dose',
      'snoring-vs-sleep-apnea',
    ],
    canonicalConcepts: [
      'REM sleep behavior disorder',
      'REM sleep without atonia',
      'dream enactment',
      'video polysomnography',
      'synucleinopathy',
      'Parkinson disease',
      'injury prevention',
    ],
    decisionRows: [
      { label: 'Diagnostic boundary', value: 'Dream enactment alone is not enough; diagnosis requires the clinical pattern plus polysomnographic evidence of REM sleep without normal atonia or captured REM enactment.' },
      { label: 'Immediate priority', value: 'Reduce injury risk to the sleeper and bed partner while the diagnosis and treatment plan are being clarified.' },
      { label: 'Treatment evidence', value: 'AASM medication recommendations are conditional, and melatonin evidence is formulation-specific rather than a generic sleep-supplement claim.' },
      { label: 'Neurologic meaning', value: 'Confirmed isolated RBD is a strong marker of future synucleinopathy risk, but the individual timeline varies and one vivid dream does not carry that prognosis.' },
    ],
    faqAnswers: [
      { question: 'Is acting out a dream enough to diagnose REM sleep behavior disorder?', answer: 'No. RBD diagnosis requires the appropriate recurrent clinical history plus polysomnographic evidence of REM sleep without normal muscle atonia or captured REM dream enactment.' },
      { question: 'Does REM sleep behavior disorder mean Parkinson disease is inevitable?', answer: 'Confirmed isolated RBD is strongly associated with later synucleinopathy, but conversion timing and absolute risk vary across cohorts. The evidence does not justify predicting a fixed outcome for one individual.' },
      { question: 'How is RBD different from sleep paralysis?', answer: 'The motor physiology points in opposite directions: sleep paralysis is persistence of REM atonia into waking awareness, while RBD involves loss or reduction of normal REM atonia during sleep.' },
    ],
  },
  'sleep-environment-evidence-guide': {
    relatedSlugs: [
      'eye-masks-earplugs-and-sleep',
      'white-noise-and-sleep',
      'sleep-temperature-and-cooling',
      'bedroom-air-quality-ventilation-and-sleep',
      'sleep-position-osa-and-reflux',
      'warm-bath-shower-before-bed',
    ],
    canonicalConcepts: [
      'sleep environment',
      'nighttime light',
      'environmental noise',
      'thermal comfort',
      'bedroom ventilation',
      'sleep position',
      'environmental sleep disruption',
    ],
    decisionRows: [
      { label: 'Start with', value: 'The actual disturbance: light, intermittent noise, thermal discomfort, poor ventilation, or a condition-specific position problem.' },
      { label: 'Avoid', value: 'Buying a generic sleep gadget when the matching environmental bottleneck is absent.' },
      { label: 'Condition boundary', value: 'Environment changes can reduce disturbances, but white noise, cooling, air purifiers, or pillows do not diagnose or treat OSA, RLS, or chronic insomnia by themselves.' },
      { label: 'Best success metric', value: 'Removal of the identified disturbance without introducing a new one, not achieving a universal “perfect bedroom” target.' },
    ],
    faqAnswers: [
      { question: 'What bedroom change helps sleep the most?', answer: 'There is no universal winner. The highest-value change is usually the one that removes the disturbance actually present, such as unwanted light, intermittent noise, overheating, poor ventilation, or a condition-specific position problem.' },
      { question: 'Does everyone need a completely dark and silent bedroom?', answer: 'No. Darkness supports nighttime circadian signaling and disruptive noise can fragment sleep, but complete silence is not necessary for everyone and steady masking sound can be useful when unpredictable noise cannot be removed.' },
      { question: 'Can bedroom optimization treat chronic insomnia or sleep apnea?', answer: 'A better environment can remove aggravating factors, but it does not substitute for CBT-I when chronic insomnia is the main problem or for objective evaluation and treatment when obstructive sleep apnea is suspected.' },
    ],
  },
}
