const DAY_MS = 24 * 60 * 60 * 1000

export const DEFAULT_AI_CITATION_MAX_AGE_DAYS = 14

function snapshotEndMs(snapshotLabel) {
  if (typeof snapshotLabel !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(snapshotLabel)) return NaN
  return Date.parse(`${snapshotLabel}T23:59:59.999Z`)
}

export function aiCitationManifestFreshness(
  manifest = {},
  { now = Date.now(), maxAgeDays = DEFAULT_AI_CITATION_MAX_AGE_DAYS } = {},
) {
  const configuredMaxAge = Number(manifest?.freshnessPolicy?.maxAgeDays ?? maxAgeDays)
  const snapshotMs = snapshotEndMs(manifest?.snapshotLabel)
  const nowMs = Number(now)

  if (!Number.isFinite(configuredMaxAge) || configuredMaxAge < 0) {
    return {
      fresh: false,
      reason: 'invalid_max_age',
      snapshotLabel: manifest?.snapshotLabel ?? null,
      maxAgeDays: null,
      ageDays: null,
      expiresAt: null,
    }
  }
  if (!Number.isFinite(snapshotMs)) {
    return {
      fresh: false,
      reason: 'invalid_snapshot_label',
      snapshotLabel: manifest?.snapshotLabel ?? null,
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
