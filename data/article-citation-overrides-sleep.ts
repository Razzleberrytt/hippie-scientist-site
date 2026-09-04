import type { ArticleCitationOverride } from './article-citation-overrides'
import {
  sleepBatch2CitationOverrides,
  sleepRelationshipSlugAliases,
} from './article-citation-overrides-sleep-batch2'
import { sleepBehaviorCitationOverrides } from './article-citation-overrides-sleep-behavior'
import { sleepCoreCitationOverrides } from './article-citation-overrides-sleep-core'
import { sleepInterventionCitationOverrides } from './article-citation-overrides-sleep-interventions'
import { sleepSafetyCitationOverrides } from './article-citation-overrides-sleep-safety'

export { sleepRelationshipSlugAliases }

export const sleepCitationOverrides: Record<string, ArticleCitationOverride> = {
  ...sleepBatch2CitationOverrides,
  ...sleepCoreCitationOverrides,
  ...sleepBehaviorCitationOverrides,
  ...sleepInterventionCitationOverrides,
  ...sleepSafetyCitationOverrides,
}
