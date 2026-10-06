import {
  initializeTikTokDraftUpload,
  requireTikTokAdmin,
  tiktokErrorResponse,
  tiktokJsonResponse,
  type TikTokPublisherEnv,
} from '../../_shared/tiktok-content-posting'

type PagesFunctionContext = { request: Request; env: TikTokPublisherEnv }

export const onRequest = async ({ request, env }: PagesFunctionContext): Promise<Response> => {
  if (request.method !== 'POST') return tiktokJsonResponse({ ok: false, error: 'Method not allowed.' }, 405)
  try {
    requireTikTokAdmin(request, env)
    const contentType = request.headers.get('Content-Type') || ''
    if (!contentType.includes('application/json')) return tiktokJsonResponse({ ok: false, error: 'Expected application/json.' }, 415)
    const raw = await request.text()
    if (raw.length > 4096) return tiktokJsonResponse({ ok: false, error: 'Request body too large.' }, 413)
    let body: { videoUrl?: unknown }
    try { body = JSON.parse(raw) } catch { return tiktokJsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400) }
    const result = await initializeTikTokDraftUpload(env, body.videoUrl)
    return tiktokJsonResponse({ ok: true, provider: 'tiktok', mode: 'draft-upload', ...result })
  } catch (error) {
    return tiktokErrorResponse(error)
  }
}
