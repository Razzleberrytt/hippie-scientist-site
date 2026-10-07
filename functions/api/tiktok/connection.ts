import {
  getTikTokConnectionSummary,
  requireTikTokAdmin,
  tiktokErrorResponse,
  tiktokJsonResponse,
  type TikTokPublisherEnv,
} from '../../_shared/tiktok-content-posting'

type PagesFunctionContext = { request: Request; env: TikTokPublisherEnv }

export const onRequest = async ({ request, env }: PagesFunctionContext): Promise<Response> => {
  if (request.method !== 'GET') return tiktokJsonResponse({ ok: false, error: 'Method not allowed.' }, 405)
  try {
    requireTikTokAdmin(request, env)
    return tiktokJsonResponse({ ok: true, ...(await getTikTokConnectionSummary(env)) })
  } catch (error) {
    return tiktokErrorResponse(error)
  }
}
