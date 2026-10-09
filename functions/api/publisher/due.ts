import {
  listDuePublicationJobs,
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
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 10)
    const jobs = await listDuePublicationJobs(env, { now: new Date().toISOString(), limit })
    return publisherQueueJson({ ok: true, jobs, count: jobs.length })
  } catch (error) {
    return publisherQueueError(error)
  }
}
