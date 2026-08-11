import type {
  GoalContentExtension,
  GoalDosingNote,
  GoalEvidenceRow,
  GoalFaqItem,
} from '@/data/goal-content'

const FAQ_OVERRIDES: Record<string, Record<string, string>> = {
  sleep: {
    'What is the best evidence-based supplement for sleep onset?':
      'Melatonin has evidence for circadian-timing problems and may modestly shorten sleep-onset latency in some people, but clinical guidelines do not recommend it as a general treatment for chronic insomnia. Evidence for magnesium, L-Theanine, and valerian is more limited or inconsistent. Match any trial to the specific sleep problem and review safety before combining products.',
    'How do melatonin, valerian, and magnesium compare for sleep?':
      'Melatonin is a circadian timing signal and has the clearest role when sleep timing is the problem, such as jet lag or a delayed sleep schedule. Evidence for valerian in insomnia is inconsistent. Magnesium is essential for nerve and muscle function, but supplemental magnesium is not established as a general insomnia treatment. Use the detailed comparison to review evidence and safety rather than assuming these options are interchangeable.',
    'How long before bed should I take sleep supplements?':
      'Timing varies by ingredient, formulation, dose, and the sleep problem being targeted. Melatonin timing is especially context-dependent because it affects circadian timing. Follow product- or study-specific instructions and avoid assuming one universal pre-bed timing rule for all sleep supplements.',
    'Why do some sleep aids cause next-day grogginess?':
      'Melatonin and other sedating products can contribute to next-day drowsiness in some people, and combining multiple sedating products makes the cause harder to identify. If morning impairment is persistent or significant, stop the new product and review the situation with a qualified health professional.',
  },
  stress: {
    'Ashwagandha vs L-Theanine vs Magnesium — which fits my stress pattern?':
      'Some ashwagandha preparations have supportive human evidence for stress symptoms, but studies are often small and use different preparations, and long-term safety is not well established. L-Theanine and magnesium have different evidence bases and should not be ranked from mechanism or onset claims alone. Compare the profile evidence, dose/form, cautions, and medication context for each option.',
    'Ashwagandha vs rhodiola — which has better stress evidence?':
      'Ashwagandha has supportive human evidence for stress with important study and preparation differences. Rhodiola has a separate, variable evidence base for stress-related fatigue and performance outcomes. There is not a single head-to-head evidence ranking that makes one the default choice; compare the exact outcome, preparation, safety profile, and study quality.',
    'Why do some people feel emotionally flat on ashwagandha?':
      'New mood or emotional changes after starting a supplement deserve attention, but emotional blunting is not established as a common ashwagandha adverse effect in major clinical evidence summaries. If a meaningful mood change begins after starting a product, stop the new product and discuss it with a qualified health professional.',
  },
}

const EVIDENCE_OVERRIDES: Record<string, Record<string, Partial<GoalEvidenceRow>>> = {
  sleep: {
    'Valerian Root': {
      evidence: 'Inconsistent / insufficient',
      humanData: 'Small and mixed studies',
      limitation: 'Not recommended for chronic insomnia by AASM; long-term safety is uncertain',
    },
  },
  stress: {
    Ashwagandha: {
      evidence: 'Supportive human evidence for stress',
      humanData: 'Small trials using varied preparations',
      limitation: 'Preparation-specific results; long-term safety is uncertain',
    },
  },
}

const DOSING_OVERRIDES: Record<string, Record<string, string>> = {
  sleep: {
    'Valerian Root':
      'Research has used varied valerian preparations and doses, but evidence for insomnia remains inconsistent. Do not treat a commonly used dose as proof of effectiveness; follow the product label and review sedative interactions.',
  },
}

function publicFaq(slug: string, item: GoalFaqItem): GoalFaqItem {
  const answer = FAQ_OVERRIDES[slug]?.[item.question]
  return answer ? { ...item, answer } : item
}

function publicEvidenceRow(slug: string, row: GoalEvidenceRow): GoalEvidenceRow {
  const override = EVIDENCE_OVERRIDES[slug]?.[row.compound]
  return override ? { ...row, ...override } : row
}

function publicDosingNote(slug: string, note: GoalDosingNote): GoalDosingNote {
  const override = DOSING_OVERRIDES[slug]?.[note.compound]
  return override ? { ...note, note: override } : note
}

export function getPublicGoalContentExtension(
  slug: string,
  content: GoalContentExtension,
): GoalContentExtension {
  return {
    ...content,
    faqItems: content.faqItems.map((item) => publicFaq(slug, item)),
    evidenceRows: content.evidenceRows.map((row) => publicEvidenceRow(slug, row)),
    dosingNotes: content.dosingNotes.map((note) => publicDosingNote(slug, note)),
  }
}
