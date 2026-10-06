import {
  enqueuePublicationJob,
  publisherQueueError,
  publisherQueueJson,
  requireSocialPublisherAdmin,
  type SocialPublisherQueueEnv,
} from '../../_shared/social-publisher-queue'

type Context = { request: Request; env: SocialPublisherQueueEnv }

export const onRequest = async ({ request, env }: Context): Promise<Response> => {
  if (request.method !== 'POST') return publisherQueueJson({ ok: false, error: 'Method not allowed.' }, 405)
  try {
    requireSocialPublisherAdmin(request, env)
    const raw = await request.text()
    if (raw.length > 128000) return publisherQueueJson({ ok: false, error: 'Request body too large.' }, 413)
    let body: { job?: unknown }
    try { body = JSON.parse(raw) } catch { return publisherQueueJson({ ok: false, error: 'Invalid JSON body.' }, 400) }
    const job = await enqueuePublicationJob(env, body.job)
    return publisherQueueJson({ ok: true, job })
  } catch (error) {
    return publisherQueueError(error)
  }
}
