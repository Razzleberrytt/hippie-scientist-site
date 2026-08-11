#!/usr/bin/env node
/**
 * Backward-compatible entrypoint.
 *
 * The education namespace was renamed to /learn. Keep this file so existing
 * npm/automation callers do not break, but delegate all behavior to the
 * current learn canonical audit.
 */
import { auditLearnCanonicals } from './check-learn-canonicals.mjs'

const { failures } = auditLearnCanonicals()
process.exit(failures.length > 0 ? 1 : 0)
