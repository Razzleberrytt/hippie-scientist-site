import type { PublicCorrectionRecord } from '@/lib/editorial-provenance'

/**
 * Public scientific/content corrections ledger.
 *
 * Append meaningful corrections instead of silently rewriting this history.
 * `supersedes` may point to an older correction when a correction itself needs
 * clarification. The empty initial ledger intentionally makes no fabricated
 * correction claims.
 */
export const publicCorrections: PublicCorrectionRecord[] = []
