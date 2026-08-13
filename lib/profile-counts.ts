import buildReport from '@/public/data/build-report.json'

// These are structured source/search inventory counts from the generated build report.
// They are not guaranteed to equal the stricter public browse/publish totals.
export const HERB_COUNT = buildReport.counts.herbs
export const COMPOUND_COUNT = buildReport.counts.compounds
export const TOTAL_PROFILE_COUNT = HERB_COUNT + COMPOUND_COUNT
