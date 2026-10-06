export type D1ResultLike = {
  success?: boolean
  meta?: { changes?: number }
}

export type D1PreparedStatementLike = {
  bind(...values: unknown[]): D1PreparedStatementLike
  run<T = Record<string, unknown>>(): Promise<D1ResultLike & { results?: T[] }>
  first<T = Record<string, unknown>>(): Promise<T | null>
}

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatementLike
}

export type SocialPublisherQueueEnv = {
  THS_PUBLISHER_DB?: D1DatabaseLike
  THS_PUBLISHER_ADMIN_TOKEN?: string
}

export type PublicationJob = {
  schemaVersion: 'ths-publication-job-v1'
  publicationId: string
  state: string
  identity: {
    publicationId: string
    experimentId: string
    artifactSha256: string
    platform: string
    intendedTime: string
  }
  attempts: unknown[]
  providerReceipt?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

type PublicationRow = {
  publication_id: string
  experiment_id: string
  artifact_sha256: string
  platform: string
  intended_time: string
  state: string
  attempts: number
  provider: string | null
  provider_operation_id: string | null
  job_json: string
  created_at: string
  updated_at: string
}

const STATES = new Set([
  'QUEUED',
  'DISPATCHING',
  'PROVIDER_ACCEPTED',
  'AWAITING_USER_POST',
  'PUBLISHED',
  'FAILED',
  'NEEDS_RECONCILIATION',
  'CANCELLED',
])

function clean(value: unknown): string {
  return String(value ?? '').trim()
}

function constantTimeEqual(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return mismatch === 0
}

function db(env: SocialPublisherQueueEnv): D1DatabaseLike {
  if (!env.THS_PUBLISHER_DB) throw new Error('THS Publisher D1 binding is not configured')
  return env.THS_PUBLISHER_DB
}

function validIso(value: unknown): string {
  const raw = clean(value)
  const parsed = new Date(raw)
  if (!raw || Number.isNaN(parsed.getTime())) throw new Error('THS publication timestamp is invalid')
  return parsed.toISOString()
}

export function requireSocialPublisherAdmin(request: Request, env: SocialPublisherQueueEnv): void {
  const expected = clean(env.THS_PUBLISHER_ADMIN_TOKEN)
  if (!expected) throw new Error('THS Publisher admin authentication is not configured')
  const authorization = clean(request.headers.get('Authorization'))
  const actual = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!constantTimeEqual(actual, expected)) throw new Error('Unauthorized')
}

export function assertPublicationJob(value: unknown): PublicationJob {
  const job = value as PublicationJob
  if (!job || job.schemaVersion !== 'ths-publication-job-v1') throw new Error('invalid THS publication job')
  if (clean(job.publicationId) !== clean(job.identity?.publicationId)) throw new Error('THS publication identity mismatch')
  if (!/^pub_[0-9a-f]{24}$/.test(clean(job.publicationId))) throw new Error('invalid THS publication_id')
  if (!clean(job.identity?.experimentId)) throw new Error('THS publication job requires experiment_id')
  if (!/^[0-9a-f]{64}$/.test(clean(job.identity?.artifactSha256))) throw new Error('invalid THS artifact_sha256')
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(clean(job.identity?.platform))) throw new Error('invalid THS publication platform')
  validIso(job.identity?.intendedTime)
  validIso(job.createdAt)
  validIso(job.updatedAt)
  if (!STATES.has(clean(job.state))) throw new Error('invalid THS publication state')
  if (!Array.isArray(job.attempts)) throw new Error('THS publication attempts must be an array')
  return structuredClone(job)
}

function providerFields(job: PublicationJob) {
  const receipt = job.providerReceipt && typeof job.providerReceipt === 'object' ? job.providerReceipt : {}
  return {
    provider: clean(receipt?.provider) || null,
    operationId: clean(receipt?.providerOperationId || receipt?.publishId || receipt?.externalId) || null,
  }
}

function parseRow(row: PublicationRow | null): PublicationJob | null {
  if (!row) return null
  let parsed: unknown
  try { parsed = JSON.parse(row.job_json) } catch { throw new Error('stored THS publication job is invalid JSON') }
  const job = assertPublicationJob(parsed)
  if (
    clean(job.publicationId) !== clean(row.publication_id) ||
    clean(job.identity.experimentId) !== clean(row.experiment_id) ||
    clean(job.identity.artifactSha256) !== clean(row.artifact_sha256) ||
    clean(job.identity.platform) !== clean(row.platform) ||
    validIso(job.identity.intendedTime) !== validIso(row.intended_time)
  ) {
    throw new Error('stored THS publication immutable identity does not match indexed columns')
  }
  return job
}

export async function getPublicationJob(env: SocialPublisherQueueEnv, publicationId: string): Promise<PublicationJob | null> {
  const id = clean(publicationId)
  if (!/^pub_[0-9a-f]{24}$/.test(id)) throw new Error('invalid THS publication_id')
  const row = await db(env)
    .prepare('SELECT * FROM ths_publications WHERE publication_id = ?1')
    .bind(id)
    .first<PublicationRow>()
  return parseRow(row)
}

export async function enqueuePublicationJob(env: SocialPublisherQueueEnv, value: unknown): Promise<PublicationJob> {
  const job = assertPublicationJob(value)
  const provider = providerFields(job)
  const database = db(env)
  await database.prepare(
    `INSERT OR IGNORE INTO ths_publications (
      publication_id, experiment_id, artifact_sha256, platform, intended_time, state,
      attempts, provider, provider_operation_id, job_json, created_at, updated_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`,
  ).bind(
    job.publicationId,
    job.identity.experimentId,
    job.identity.artifactSha256,
    job.identity.platform,
    validIso(job.identity.intendedTime),
    job.state,
    job.attempts.length,
    provider.provider,
    provider.operationId,
    JSON.stringify(job),
    validIso(job.createdAt),
    validIso(job.updatedAt),
  ).run()

  const stored = await getPublicationJob(env, job.publicationId)
  if (!stored) {
    const occupied = await database
      .prepare('SELECT publication_id FROM ths_publications WHERE platform = ?1 AND intended_time = ?2')
      .bind(job.identity.platform, validIso(job.identity.intendedTime))
      .first<{ publication_id: string }>()
    if (occupied?.publication_id) {
      throw new Error('THS publication slot is already owned by ' + occupied.publication_id)
    }
    throw new Error('THS Publisher failed to persist publication job')
  }
  if (
    stored.identity.experimentId !== job.identity.experimentId ||
    stored.identity.artifactSha256 !== job.identity.artifactSha256 ||
    stored.identity.platform !== job.identity.platform ||
    validIso(stored.identity.intendedTime) !== validIso(job.identity.intendedTime)
  ) {
    throw new Error('publication_id collision with different immutable identity')
  }
  return stored
}

export async function replacePublicationJob(
  env: SocialPublisherQueueEnv,
  value: unknown,
  expectedUpdatedAt: string,
): Promise<PublicationJob> {
  const job = assertPublicationJob(value)
  const expected = validIso(expectedUpdatedAt)
  const current = await getPublicationJob(env, job.publicationId)
  if (!current) throw new Error('THS publication job does not exist')
  if (validIso(current.updatedAt) !== expected) throw new Error('THS publication job changed concurrently')
  for (const field of ['experimentId', 'artifactSha256', 'platform', 'intendedTime'] as const) {
    const left = field === 'intendedTime' ? validIso(current.identity[field]) : clean(current.identity[field])
    const right = field === 'intendedTime' ? validIso(job.identity[field]) : clean(job.identity[field])
    if (left !== right) throw new Error(`THS publication immutable field changed: ${field}`)
  }
  const provider = providerFields(job)
  const result = await db(env).prepare(
    `UPDATE ths_publications SET
      state = ?1,
      attempts = ?2,
      provider = ?3,
      provider_operation_id = ?4,
      job_json = ?5,
      updated_at = ?6
    WHERE publication_id = ?7 AND updated_at = ?8`,
  ).bind(
    job.state,
    job.attempts.length,
    provider.provider,
    provider.operationId,
    JSON.stringify(job),
    validIso(job.updatedAt),
    job.publicationId,
    expected,
  ).run()
  if (Number(result.meta?.changes || 0) !== 1) throw new Error('THS publication job changed concurrently')
  const stored = await getPublicationJob(env, job.publicationId)
  if (!stored) throw new Error('THS Publisher lost publication job after update')
  return stored
}

export async function listDuePublicationJobs(
  env: SocialPublisherQueueEnv,
  {
    now = new Date().toISOString(),
    limit = 10,
  }: { now?: string; limit?: number } = {},
): Promise<PublicationJob[]> {
  const boundedLimit = Math.max(1, Math.min(50, Math.floor(Number(limit) || 10)))
  const cutoff = validIso(now)
  const result = await db(env)
    .prepare(
      `SELECT * FROM ths_publications
       WHERE state = 'QUEUED' AND intended_time <= ?1
       ORDER BY intended_time ASC, publication_id ASC
       LIMIT ?2`,
    )
    .bind(cutoff, boundedLimit)
    .run<PublicationRow>()
  return (result.results || []).map((row) => parseRow(row)).filter((job): job is PublicationJob => Boolean(job))
}

export function publisherQueueJson(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export function publisherQueueError(error: unknown): Response {
  const message = clean((error as Error)?.message || error)
  const status = message === 'Unauthorized' ? 401
    : /not configured/i.test(message) ? 503
      : /concurrent/i.test(message) ? 409
        : /does not exist/i.test(message) ? 404
          : 400
  if (status >= 500) console.error('THS Publisher queue error:', error)
  return publisherQueueJson({ ok: false, error: status >= 500 ? 'THS Publisher queue unavailable.' : message }, status)
}
