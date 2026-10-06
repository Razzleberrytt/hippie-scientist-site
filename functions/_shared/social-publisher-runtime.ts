import {
  getPublicationJob,
  replacePublicationJob,
  type PublicationJob,
  type SocialPublisherQueueEnv,
} from './social-publisher-queue'
import {
  fetchTikTokPublishStatus,
  initializeTikTokDraftUpload,
  TikTokPublisherError,
  type TikTokPublisherEnv,
} from './tiktok-content-posting'

export type SocialPublisherRuntimeEnv = SocialPublisherQueueEnv & TikTokPublisherEnv

function clean(value: unknown): string {
  return String(value ?? '').trim()
}

function clone(job: PublicationJob): PublicationJob {
  return structuredClone(job)
}

function transitionTime(now: string, current: string): string {
  const candidate = Date.parse(now)
  const previous = Date.parse(current)
  if (!Number.isFinite(candidate)) throw new Error('publisher transition timestamp is invalid')
  return new Date(Math.max(candidate, Number.isFinite(previous) ? previous + 1 : candidate)).toISOString()
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : []
}

function artifacts(job: PublicationJob): string[] {
  return Array.isArray(job.artifacts) ? job.artifacts.map(clean).filter(Boolean) : []
}

function providerReceipts(job: PublicationJob): Record<string, unknown>[] {
  return records(job.providerReceipts)
}

function observerReceipts(job: PublicationJob): Record<string, unknown>[] {
  return records(job.observerReceipts)
}

function attempts(job: PublicationJob): Record<string, unknown>[] {
  return records(job.attempts)
}

function failure(job: PublicationJob): Record<string, unknown> | null {
  return job.failure && typeof job.failure === 'object' && !Array.isArray(job.failure)
    ? job.failure as Record<string, unknown>
    : null
}

function currentProviderOperation(job: PublicationJob): string {
  const receipt = job.providerReceipt && typeof job.providerReceipt === 'object' && !Array.isArray(job.providerReceipt)
    ? job.providerReceipt
    : {}
  return clean(receipt.providerOperationId || receipt.publishId || receipt.externalId)
}

function publicUrlForPlatform(platform: string, value: unknown): string {
  let url: URL
  try { url = new URL(clean(value)) } catch { throw new Error('manual publication URL is invalid') }
  if (url.protocol !== 'https:') throw new Error('manual publication URL must use HTTPS')
  const host = url.hostname.replace(/^www\./, '')
  const allowed: Record<string, string[]> = {
    tiktok: ['tiktok.com'],
    facebook: ['facebook.com', 'fb.watch'],
    instagram: ['instagram.com'],
    youtube: ['youtube.com', 'youtu.be'],
  }
  if (!(allowed[platform] || []).some((suffix) => host === suffix || host.endsWith('.' + suffix))) {
    throw new Error('manual publication URL does not match the publication platform')
  }
  return url.toString()
}

function dispatchable(job: PublicationJob): boolean {
  if (job.state === 'QUEUED') return true
  if (job.state !== 'FAILED') return false
  return failure(job)?.retryable !== false
}

function appendAttempt(job: PublicationJob, provider: string, at: string): PublicationJob {
  const next = clone(job)
  const prior = attempts(next)
  const attemptNumber = prior.length + 1
  next.state = 'DISPATCHING'
  next.attempts = [
    ...prior,
    {
      attemptId: next.publicationId + ':attempt:' + attemptNumber,
      attemptNumber,
      provider,
      state: 'DISPATCHING',
      startedAt: at,
      completedAt: null,
      providerReceipt: null,
      error: null,
    },
  ]
  next.failure = null
  next.updatedAt = at
  return next
}

function finishAttempt(job: PublicationJob, patch: Record<string, unknown>): void {
  const prior = attempts(job)
  if (!prior.length) return
  job.attempts = [
    ...prior.slice(0, -1),
    { ...prior.at(-1), ...patch },
  ]
}

export async function dispatchPublication(
  env: SocialPublisherRuntimeEnv,
  publicationId: string,
  {
    now = new Date().toISOString(),
    fetchImpl = fetch,
  }: { now?: string; fetchImpl?: typeof fetch } = {},
): Promise<{ status: string; job: PublicationJob }> {
  const current = await getPublicationJob(env, publicationId)
  if (!current) throw new Error('THS publication job does not exist')
  if (['PROVIDER_ACCEPTED', 'AWAITING_USER_POST', 'PUBLISHED'].includes(current.state)) {
    return { status: 'already-dispatched', job: current }
  }
  if (current.state === 'NEEDS_RECONCILIATION') {
    throw new Error('publication requires reconciliation before retry')
  }
  if (!dispatchable(current)) throw new Error('publication is not dispatchable from ' + current.state)
  if (clean(current.identity.platform) !== 'tiktok') {
    throw new Error('publisher adapter is not configured for ' + current.identity.platform)
  }
  const media = artifacts(current)
  if (media.length !== 1 || !media[0].toLowerCase().endsWith('.mp4')) {
    throw new Error('TikTok publisher adapter requires exactly one governed MP4 artifact')
  }

  const startedAt = transitionTime(now, current.updatedAt)
  const dispatching = appendAttempt(current, 'tiktok', startedAt)
  await replacePublicationJob(env, dispatching, current.updatedAt)

  try {
    const result = await initializeTikTokDraftUpload(env, media[0], fetchImpl)
    const acceptedAt = transitionTime(now, dispatching.updatedAt)
    const accepted = clone(dispatching)
    const receipt = {
      provider: 'tiktok',
      providerOperationId: result.publishId,
      publishId: result.publishId,
      requestId: result.logId,
      mode: 'draft-upload',
      publicationId: accepted.publicationId,
      artifactUrl: media[0],
      acceptedAt,
    }
    accepted.state = 'PROVIDER_ACCEPTED'
    accepted.providerReceipt = receipt
    accepted.providerReceipts = [...providerReceipts(accepted), receipt]
    accepted.updatedAt = acceptedAt
    finishAttempt(accepted, {
      state: 'PROVIDER_ACCEPTED',
      completedAt: acceptedAt,
      providerReceipt: receipt,
    })
    const stored = await replacePublicationJob(env, accepted, dispatching.updatedAt)
    return { status: 'provider-accepted', job: stored }
  } catch (error) {
    const failedAt = transitionTime(now, dispatching.updatedAt)
    const failed = clone(dispatching)
    const explicitFailure = error instanceof TikTokPublisherError
    failed.state = explicitFailure ? 'FAILED' : 'NEEDS_RECONCILIATION'
    failed.failure = {
      provider: 'tiktok',
      code: explicitFailure ? error.code : 'ambiguous_dispatch',
      message: explicitFailure ? error.message : 'Dispatch outcome is unknown; reconcile provider state before retrying.',
      at: failedAt,
      retryable: explicitFailure,
      ambiguousDispatch: !explicitFailure,
    }
    failed.updatedAt = failedAt
    finishAttempt(failed, {
      state: failed.state,
      completedAt: failedAt,
      error: clean((error as Error)?.message || error),
    })
    const stored = await replacePublicationJob(env, failed, dispatching.updatedAt)
    return { status: explicitFailure ? 'failed' : 'needs-reconciliation', job: stored }
  }
}

export async function observePublication(
  env: SocialPublisherRuntimeEnv,
  publicationId: string,
  {
    now = new Date().toISOString(),
    fetchImpl = fetch,
  }: { now?: string; fetchImpl?: typeof fetch } = {},
): Promise<{ status: string; job: PublicationJob; observation: Record<string, unknown> }> {
  const current = await getPublicationJob(env, publicationId)
  if (!current) throw new Error('THS publication job does not exist')
  if (current.state === 'PUBLISHED') {
    return { status: 'published', job: current, observation: {} }
  }
  if (clean(current.identity.platform) !== 'tiktok') {
    throw new Error('publisher observer is not configured for ' + current.identity.platform)
  }
  if (!['PROVIDER_ACCEPTED', 'AWAITING_USER_POST', 'NEEDS_RECONCILIATION'].includes(current.state)) {
    throw new Error('publication cannot be observed from ' + current.state)
  }
  const publishId = currentProviderOperation(current)
  if (!publishId) {
    throw new Error('publication has no provider receipt to reconcile; manual provider review is required')
  }

  const observation = await fetchTikTokPublishStatus(env, publishId, fetchImpl)
  const observedAt = transitionTime(now, current.updatedAt)
  const next = clone(current)
  next.observerReceipts = [
    ...observerReceipts(next),
    {
      provider: 'tiktok',
      status: observation.status || 'UNKNOWN',
      observedAt,
      receipt: observation,
    },
  ]
  next.updatedAt = observedAt

  if (observation.failed) {
    next.state = 'FAILED'
    next.failure = {
      provider: 'tiktok',
      code: 'provider_failed',
      message: clean(observation.failReason) || 'TikTok reported FAILED.',
      at: observedAt,
      retryable: false,
    }
  } else if (observation.publishComplete && observation.publicPostIds?.length) {
    const externalId = String(observation.publicPostIds[0])
    const receipt = {
      ...(next.providerReceipt || {}),
      provider: 'tiktok',
      providerOperationId: publishId,
      externalId,
      verifiedPublishedAt: observedAt,
      status: observation.status,
      observerLogId: observation.logId,
    }
    next.state = 'PUBLISHED'
    next.providerReceipt = receipt
    next.providerReceipts = [...providerReceipts(next), receipt]
    next.failure = null
    next.publishedAt = observedAt
  } else if (observation.inboxDelivered) {
    next.state = 'AWAITING_USER_POST'
    next.failure = null
  } else {
    next.state = 'PROVIDER_ACCEPTED'
    next.failure = null
  }

  const stored = await replacePublicationJob(env, next, current.updatedAt)
  return {
    status: stored.state === 'PUBLISHED'
      ? 'published'
      : stored.state === 'AWAITING_USER_POST'
        ? 'awaiting-user-post'
        : stored.state === 'FAILED'
          ? 'failed'
          : 'processing',
    job: stored,
    observation: observation as unknown as Record<string, unknown>,
  }
}

export async function recordManualPublication(
  env: SocialPublisherRuntimeEnv,
  publicationId: string,
  {
    publicUrl,
    publishedAt,
    now = new Date().toISOString(),
  }: { publicUrl: unknown; publishedAt: unknown; now?: string },
): Promise<PublicationJob> {
  const current = await getPublicationJob(env, publicationId)
  if (!current) throw new Error('THS publication job does not exist')
  if (current.state === 'PUBLISHED') return current
  if (current.state === 'CANCELLED') throw new Error('cancelled publication cannot be published')
  if (current.state === 'DISPATCHING') throw new Error('active provider dispatch must be reconciled before manual publication')
  const url = publicUrlForPlatform(clean(current.identity.platform), publicUrl)
  const published = new Date(clean(publishedAt))
  if (!Number.isFinite(published.getTime())) throw new Error('manual publishedAt is invalid')
  const updatedAt = transitionTime(now, current.updatedAt)
  const receipt = {
    provider: 'manual',
    providerOperationId: url,
    externalId: url,
    publicUrl: url,
    verifiedPublishedAt: published.toISOString(),
    publicationId: current.publicationId,
  }
  const next = clone(current)
  next.state = 'PUBLISHED'
  next.providerReceipt = receipt
  next.providerReceipts = [...providerReceipts(next), receipt]
  next.publicUrl = url
  next.publishedAt = published.toISOString()
  next.failure = null
  next.updatedAt = updatedAt
  return replacePublicationJob(env, next, current.updatedAt)
}
