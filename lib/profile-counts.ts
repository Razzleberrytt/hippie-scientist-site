import buildReport from '@/public/data/build-report.json'

export const HERB_COUNT = buildReport.counts.herbs
export const COMPOUND_COUNT = buildReport.counts.compounds
export const TOTAL_PROFILE_COUNT = HERB_COUNT + COMPOUND_COUNT

