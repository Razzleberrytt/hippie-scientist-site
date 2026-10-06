import {
  publisherQueueError,
  publisherQueueJson,
  requireSocialPublisherAdmin,
} from '../../_shared/social-publisher-queue'
import {
  observePublication,
  type SocialPublisherRuntimeEnv,
} from '../../_shared/social-publisher-runtime'

type Context = { request: Request; env: SocialPublisherRuntimeEnv }

export const onRequest = async ({ request, env }: Context): Promise<Response> => {
  if (request.method !== 'POST') return publisherQueueJson({ ok: false, error: 'Method not allowed.' }, 405)
  try {
    requireSocialPublisherAdmin(request, env)
    const raw = await request.text()
    if (raw.length > 4096) return publisherQueueJson({ ok: false, error: 'Request body too large.' }, 413)
    let body: { publicationId?: unknown }
    try { body = JSON.parse(raw) } catch { return publisherQueueJson({ ok: false, error: 'Invalid JSON body.' }, 400) }
    const result = await observePublication(env, String(body.publicationId || ''))
    return publisherQueueJson({ ok: true, ...result })
  } catch (error) {
    return publisherQueueError(error)
  }
}
