import herbsSummary from '@/public/data/herbs-summary.json'
import compoundsSummary from '@/public/data/compounds-summary.json'

export const HERB_COUNT = (herbsSummary as unknown[]).length        // 290
export const COMPOUND_COUNT = (compoundsSummary as unknown[]).length // 617
export const TOTAL_PROFILE_COUNT = HERB_COUNT + COMPOUND_COUNT       // 907
