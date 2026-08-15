import type { EditorialReviewRecord } from '@/lib/editorial-provenance'

/**
 * Append-only registry of real page-specific editorial review events.
 *
 * Do not add an entry because a page rebuilt, a template changed, or a date was
 * mechanically refreshed. Every event must identify the reviewer, review kind,
 * page, and actual review date. The empty initial ledger intentionally makes no
 * review claims that cannot yet be substantiated with a recorded event.
 */
export const editorialReviewEvents: EditorialReviewRecord[] = []
