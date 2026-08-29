import type { BotanicalAtlasRecord } from '@/components/atlas/BotanicalActivityAtlasClient'

export interface BotanicalAtlasCategory {
  slug: string
  title: string
  shortTitle: string
  description: string
  eyebrow: string
  intro: string
  safetyNote: string
  matches: (record: BotanicalAtlasRecord) => boolean
}

export const BOTANICAL_ATLAS_CATEGORIES: BotanicalAtlasCategory[] = [
  {
    slug: 'alkaloid-botanicals',
    title: 'Alkaloid-Containing Botanicals Compared',
    shortTitle: 'Alkaloid botanicals',
    description: 'Compare botanicals containing alkaloid-class constituents by effects, evidence, noticeability, timing, and safety signals.',
    eyebrow: 'Active Chemistry Guide',
    intro: 'Alkaloids are a broad chemical family that includes mild stimulants, medicinal constituents, and compounds with substantial interaction or dependence risks. This page groups botanicals whose structured profiles map to the alkaloid class; it does not imply that every product is intoxicating or equally potent.',
    safetyNote: 'Alkaloid content can vary sharply by species, plant part, extraction method, and product concentration. Stronger sensation does not establish purity, effectiveness, or safety.',
    matches: (record) => record.compoundClasses.includes('Alkaloids'),
  },
  {
    slug: 'natural-stimulants',
    title: 'Natural Stimulant Botanicals Compared',
    shortTitle: 'Natural stimulants',
    description: 'Compare stimulating and energy-associated botanicals by active chemistry, evidence, noticeability, timing, and cardiovascular safety signals.',
    eyebrow: 'Effect-Based Guide',
    intro: 'Botanicals described as stimulating may increase alertness, perceived energy, wakefulness, or physical drive through very different mechanisms. This comparison separates effect labels from evidence strength and highlights safety signals that matter when stimulants are combined.',
    safetyNote: 'Combining multiple stimulants can amplify insomnia, anxiety, blood-pressure changes, or heart-rate effects even when each ingredient is sold as natural.',
    matches: (record) => record.effects.includes('Stimulating / energy'),
  },
  {
    slug: 'calming-botanicals',
    title: 'Calming Botanicals Compared',
    shortTitle: 'Calming botanicals',
    description: 'Compare calming and relaxation-associated botanicals by evidence, noticeability, active chemistry, timing, and sedation risks.',
    eyebrow: 'Effect-Based Guide',
    intro: 'Calming botanicals range from subtle stress-support herbs to more noticeably sedating plants. This page distinguishes calming effect labels from sleep-promoting intensity and surfaces the evidence and safety context behind each profile.',
    safetyNote: 'Calming products may compound alcohol, sleep medications, antihistamines, or other sedatives. A mild label does not rule out impairment or interaction risk.',
    matches: (record) => record.effects.includes('Calming'),
  },
  {
    slug: 'dream-and-perception-herbs',
    title: 'Dream and Perception Botanicals Compared',
    shortTitle: 'Dream and perception herbs',
    description: 'Compare botanicals associated with dreams, lucid dreaming, perception changes, or psychoactive effects by evidence and safety.',
    eyebrow: 'Perception & Dream Guide',
    intro: 'Traditional dream herbs and perception-altering botanicals are often discussed together despite major differences in chemistry, evidence, and risk. This page collects profiles mapped to dream or perception effects while keeping weak evidence and toxicity concerns visible.',
    safetyNote: 'Perception-related effects can include confusion, impaired coordination, panic, or poisoning—not just vivid dreams. Avoid treating this category as a recreational recommendation list.',
    matches: (record) => record.effects.includes('Dream / perception'),
  },
  {
    slug: 'serotonergic-interaction-risk',
    title: 'Botanicals With Serotonergic Interaction Signals',
    shortTitle: 'Serotonergic interaction risks',
    description: 'Compare botanicals flagged for serotonergic or MAOI-related interaction concerns, including evidence, effects, and additional safety signals.',
    eyebrow: 'Medication Safety Guide',
    intro: 'This page gathers botanicals whose structured safety data contains serotonergic, SSRI, SNRI, MAOI, or monoamine-oxidase interaction language. It is designed as a screening aid, not a personalized interaction checker.',
    safetyNote: 'Do not start, stop, or combine a serotonergic botanical with antidepressants, stimulants, migraine medicines, or other psychoactive drugs based only on this page. A pharmacist or prescriber should review the full combination.',
    matches: (record) => record.safety.includes('Serotonergic'),
  },
]

export const getBotanicalAtlasCategory = (slug: string) =>
  BOTANICAL_ATLAS_CATEGORIES.find((category) => category.slug === slug)
