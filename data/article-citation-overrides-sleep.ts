import type { ArticleCitationOverride } from './article-citation-overrides'
import {
  sleepBatch2CitationOverrides,
  sleepRelationshipSlugAliases,
} from './article-citation-overrides-sleep-batch2'
import { sleepCoreCitationOverrides } from './article-citation-overrides-sleep-core'

export { sleepRelationshipSlugAliases }

export const sleepCitationOverrides: Record<string, ArticleCitationOverride> = {
  ...sleepBatch2CitationOverrides,
  ...sleepCoreCitationOverrides,
}
