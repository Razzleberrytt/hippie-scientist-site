import {
  getPublicationJob,
  publisherQueueError,
  publisherQueueJson,
  requireSocialPublisherAdmin,
  type SocialPublisherQueueEnv,
} from '../../_shared/social-publisher-queue'

type Context = { request: Request; env: SocialPublisherQueueEnv }

export const onRequest = async ({ request, env }: Context): Promise<Response> => {
  if (request.method !== 'GET') return publisherQueueJson({ ok: false, error: 'Method not allowed.' }, 405)
  try {
    requireSocialPublisherAdmin(request, env)
    const id = new URL(request.url).searchParams.get('publication_id') || ''
    const job = await getPublicationJob(env, id)
    if (!job) return publisherQueueJson({ ok: false, error: 'Publication not found.' }, 404)
    return publisherQueueJson({ ok: true, job })
  } catch (error) {
    return publisherQueueError(error)
  }
}
