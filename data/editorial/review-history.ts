import type { EditorialReviewRecord } from '@/lib/editorial-provenance'

/**
 * Public editorial review ledger.
 *
 * Append new review events. Do not rewrite an old event to make a page appear
 * more recently reviewed. If a prior entry needs correction, add a new event
 * that explains the correction in its summary.
 *
 * Empty is truthful: reviewer identity and qualifications are only displayed
 * after a real review event is recorded here.
 */
export const editorialReviewHistory: EditorialReviewRecord[] = []
