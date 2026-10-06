import {
  publisherQueueError,
  publisherQueueJson,
  requireSocialPublisherAdmin,
} from '../../_shared/social-publisher-queue'
import {
  cancelPublication,
  type SocialPublisherRuntimeEnv,
} from '../../_shared/social-publisher-runtime'

type Context = { request: Request; env: SocialPublisherRuntimeEnv }

export const onRequest = async ({ request, env }: Context): Promise<Response> => {
  if (request.method !== 'POST') return publisherQueueJson({ ok: false, error: 'Method not allowed.' }, 405)
  try {
    requireSocialPublisherAdmin(request, env)
    const raw = await request.text()
    if (raw.length > 8192) return publisherQueueJson({ ok: false, error: 'Request body too large.' }, 413)
    let body: { publicationId?: unknown; reason?: unknown }
    try { body = JSON.parse(raw) } catch { return publisherQueueJson({ ok: false, error: 'Invalid JSON body.' }, 400) }
    const job = await cancelPublication(env, String(body.publicationId || ''), { reason: body.reason })
    return publisherQueueJson({ ok: true, job })
  } catch (error) {
    return publisherQueueError(error)
  }
}
