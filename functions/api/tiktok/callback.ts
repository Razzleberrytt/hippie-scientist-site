import {
  consumeTikTokOAuthState,
  exchangeTikTokAuthorizationCode,
  tiktokErrorResponse,
  type TikTokPublisherEnv,
} from '../../_shared/tiktok-content-posting'

type PagesFunctionContext = { request: Request; env: TikTokPublisherEnv }

function html(message: string, status = 200): Response {
  const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }
  const safe = message.replace(/[<>&"']/g, (char) => entities[char] || char)
  return new Response('<!doctype html><meta name="robots" content="noindex,nofollow"><title>TikTok connection</title><main style="font:16px system-ui;max-width:44rem;margin:4rem auto;padding:1rem"><h1>TikTok connection</h1><p>' + safe + '</p><p>You can close this tab.</p></main>', {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  })
}

export const onRequest = async ({ request, env }: PagesFunctionContext): Promise<Response> => {
  if (request.method !== 'GET') return html('Method not allowed.', 405)
  const url = new URL(request.url)
  const state = url.searchParams.get('state') || ''
  try {
    await consumeTikTokOAuthState(env, state)
    const oauthError = url.searchParams.get('error')
    if (oauthError) return html('TikTok authorization was not completed: ' + oauthError, 400)
    const code = url.searchParams.get('code') || ''
    await exchangeTikTokAuthorizationCode(env, code)
    return html('TikTok is connected for governed draft uploads.')
  } catch (error) {
    const response = tiktokErrorResponse(error)
    const data = await response.json() as { error?: string }
    return html(data.error || 'TikTok connection failed.', response.status)
  }
}
