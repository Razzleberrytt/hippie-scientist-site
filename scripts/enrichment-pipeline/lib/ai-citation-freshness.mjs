const DAY_MS = 24 * 60 * 60 * 1000

export const DEFAULT_AI_CITATION_MAX_AGE_DAYS = 14

function snapshotEndMs(snapshotLabel) {
  if (typeof snapshotLabel !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(snapshotLabel)) return NaN

  const [year, month, day] = snapshotLabel.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return NaN

  return date.getTime()
}

export function aiCitationManifestFreshness(
  manifest = {},
  { now = Date.now(), maxAgeDays = DEFAULT_AI_CITATION_MAX_AGE_DAYS } = {},
) {
  const configuredMaxAge = Number(manifest?.freshnessPolicy?.maxAgeDays ?? maxAgeDays)

  if (!manifest?.snapshotLabel) {
    return {
      fresh: false,
      reason: 'missing_snapshot_label',
      snapshotLabel: null,
      maxAgeDays: Number.isFinite(configuredMaxAge) && configuredMaxAge >= 0 ? configuredMaxAge : null,
      ageDays: null,
      expiresAt: null,
    }
  }

  const snapshotMs = snapshotEndMs(manifest.snapshotLabel)
  const nowMs = Number(now)

  if (!Number.isFinite(configuredMaxAge) || configuredMaxAge < 0) {
    return {
      fresh: false,
      reason: 'invalid_max_age',
      snapshotLabel: manifest.snapshotLabel,
      maxAgeDays: null,
      ageDays: null,
      expiresAt: null,
    }
  }
  if (!Number.isFinite(snapshotMs)) {
    return {
      fresh: false,
      reason: 'invalid_snapshot_label',
      snapshotLabel: manifest.snapshotLabel,
      maxAgeDays: configuredMaxAge,
      ageDays: null,
      expiresAt: null,
    }
  }
  if (!Number.isFinite(nowMs)) {
    return {
      fresh: false,
      reason: 'invalid_clock',
      snapshotLabel: manifest.snapshotLabel,
      maxAgeDays: configuredMaxAge,
      ageDays: null,
      expiresAt: null,
    }
  }

  const ageMs = nowMs - snapshotMs
  const ageDays = Math.max(0, ageMs / DAY_MS)
  const expiresAt = new Date(snapshotMs + configuredMaxAge * DAY_MS).toISOString()

  // A same-day label points to the end of that UTC day, so allow that normal partial-day lead.
  if (ageMs < -DAY_MS) {
    return {
      fresh: false,
      reason: 'snapshot_in_future',
      snapshotLabel: manifest.snapshotLabel,
      maxAgeDays: configuredMaxAge,
      ageDays: 0,
      expiresAt,
    }
  }
  if (ageMs > configuredMaxAge * DAY_MS) {
    return {
      fresh: false,
      reason: 'snapshot_expired',
      snapshotLabel: manifest.snapshotLabel,
      maxAgeDays: configuredMaxAge,
      ageDays,
      expiresAt,
    }
  }

  return {
    fresh: true,
    reason: 'fresh',
    snapshotLabel: manifest.snapshotLabel,
    maxAgeDays: configuredMaxAge,
    ageDays,
    expiresAt,
  }
}

export function aiCitationSignalStatus({ manifestPresent = true, manifestValid = true, freshness = null } = {}) {
  if (!manifestPresent) return 'missing'
  if (!manifestValid) return 'invalid'
  if (freshness?.fresh) return 'active'
  if (freshness?.reason === 'snapshot_expired') return 'stale'
  return 'invalid'
}
