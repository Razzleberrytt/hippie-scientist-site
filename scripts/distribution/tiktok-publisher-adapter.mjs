import { transitionDistributionLifecycle } from './distribution-lifecycle.mjs'
import {
  acceptProviderReceipt,
  beginPublicationAttempt,
  markPublicationPublished,
  recordPublicationFailure,
  recordPublicationObservation,
  recordPublicationReconciliationRequired,
} from './social-publisher-core.mjs'
import {
  getGovernedTikTokDraftStatus,
  uploadGovernedTikTokDraft,
} from './tiktok-upload-provider.mjs'

function clean(value) {
  return String(value ?? '').trim()
}

function assertTikTokJob(job) {
  if (!job || job.schemaVersion !== 'ths-publication-job-v1') throw new Error('TikTok adapter requires a THS publication job')
  if (clean(job.identity?.platform).toLowerCase() !== 'tiktok') throw new Error('TikTok adapter requires platform=tiktok')
  if (!Array.isArray(job.artifacts) || job.artifacts.length !== 1) {
    throw new Error('TikTok draft adapter requires exactly one governed video artifact')
  }
}

export async function dispatchTikTokPublication({
  job,
  lifecycle,
  currentIdentity,
  adminToken,
  bridgeBase,
  fetchImpl = globalThis.fetch,
  uploadImpl = uploadGovernedTikTokDraft,
  now = new Date().toISOString(),
} = {}) {
  assertTikTokJob(job)

  const started = beginPublicationAttempt(job, { provider: 'tiktok', now })
  if (started.state !== 'DISPATCHING') {
    return {
      status: 'already-dispatched',
      job: started,
      lifecycle: structuredClone(lifecycle),
    }
  }

  try {
    const result = await uploadImpl({
      lifecycle,
      currentIdentity,
      videoUrl: started.artifacts[0],
      adminToken,
      bridgeBase,
      fetchImpl,
      now,
    })
    const nextJob = acceptProviderReceipt(started, {
      provider: 'tiktok',
      nextState: 'PROVIDER_ACCEPTED',
      receipt: {
        providerOperationId: result.publishId,
        publishId: result.publishId,
        requestId: result.requestId,
        mode: 'draft-upload',
        artifactUrl: result.videoUrl,
        publicationId: started.publicationId,
      },
      now,
    })
    return {
      status: 'provider-accepted',
      job: nextJob,
      lifecycle: result.lifecycle,
    }
  } catch (error) {
    const explicitProviderFailure = Boolean(clean(error?.code))
    return {
      status: explicitProviderFailure ? 'failed' : 'needs-reconciliation',
      job: explicitProviderFailure
        ? recordPublicationFailure(started, { provider: 'tiktok', error, now, retryable: true })
        : recordPublicationReconciliationRequired(started, { provider: 'tiktok', error, now }),
      lifecycle: structuredClone(lifecycle),
      error: clean(error?.message || error),
    }
  }
}

export async function observeTikTokPublication({
  job,
  lifecycle,
  currentIdentity,
  adminToken,
  bridgeBase,
  fetchImpl = globalThis.fetch,
  statusImpl = getGovernedTikTokDraftStatus,
  now = new Date().toISOString(),
} = {}) {
  assertTikTokJob(job)
  if (job.state === 'PUBLISHED') {
    return { status: 'published', job: structuredClone(job), lifecycle: structuredClone(lifecycle), observation: null }
  }
  if (!['PROVIDER_ACCEPTED', 'AWAITING_USER_POST'].includes(job.state)) {
    throw new Error(`TikTok observer cannot verify publication from ${job.state}`)
  }

  const publishId = clean(job.providerReceipt?.publishId || job.providerReceipt?.providerOperationId)
  if (!publishId) throw new Error('TikTok observer requires the provider publish_id receipt')

  const observation = await statusImpl({
    publishId,
    adminToken,
    bridgeBase,
    fetchImpl,
  })
  const observedJob = recordPublicationObservation(job, {
    provider: 'tiktok',
    status: observation.status || 'UNKNOWN',
    receipt: observation,
    nextState: observation.inboxDelivered || job.state === 'AWAITING_USER_POST'
      ? 'AWAITING_USER_POST'
      : 'PROVIDER_ACCEPTED',
    now,
  })

  if (observation.failed) {
    return {
      status: 'failed',
      job: recordPublicationFailure(observedJob, {
        provider: 'tiktok',
        error: observation.failReason || 'TikTok reported FAILED',
        providerReceipt: { ...(job.providerReceipt || {}), observation },
        retryable: false,
        now,
      }),
      lifecycle: structuredClone(lifecycle),
      observation,
    }
  }

  if (!observation.publishComplete) {
    return {
      status: observation.inboxDelivered ? 'awaiting-user-post' : 'processing',
      job: observedJob,
      lifecycle: structuredClone(lifecycle),
      observation,
    }
  }

  const externalId = clean(observation.publicPostIds?.[0])
  if (!externalId) {
    return {
      status: 'awaiting-public-proof',
      job: observedJob,
      lifecycle: structuredClone(lifecycle),
      observation,
    }
  }

  const publishedJob = markPublicationPublished(observedJob, {
    provider: 'tiktok',
    externalId,
    receipt: {
      ...(job.providerReceipt || {}),
      publishId,
      status: observation.status,
      publicPostIds: observation.publicPostIds,
      observerLogId: observation.logId,
    },
    now,
  })

  const publishedLifecycle = transitionDistributionLifecycle(lifecycle, 'published', {
    currentIdentity,
    now,
    provider: 'tiktok',
    externalId,
    requestId: publishId,
    dryRun: false,
  })

  return {
    status: 'published',
    job: publishedJob,
    lifecycle: publishedLifecycle,
    observation,
  }
}
