export const runtime = 'edge'

type SubscribePayload = {
  email?: string
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  })
}

function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || process.env.SITE_URL || ''
  return raw
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('origin') || ''
  const allowedOrigins = parseAllowedOrigins()
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers.Vary = 'Origin'
  }

  return headers
}

export async function OPTIONS(request: Request) {
  return json(
    {
      ok: true,
      message: 'Preflight OK',
    },
    { status: 200, headers: corsHeaders(request) },
  )
}

export async function GET(request: Request) {
  return json(
    {
      ok: true,
      method: 'GET',
      hasApiKey: Boolean(process.env.RESEND_API_KEY),
      message: 'Subscribe API is reachable',
    },
    { status: 200, headers: corsHeaders(request) },
  )
}

export async function POST(request: Request) {
  let payload: SubscribePayload = {}

  try {
    payload = (await request.json()) as SubscribePayload
  } catch {
    return json(
      {
        ok: false,
        error: 'body-parse-failed',
        step: 'parse',
      },
      { status: 400, headers: corsHeaders(request) },
    )
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''

  return json(
    {
      ok: true,
      method: 'POST',
      email,
      hasApiKey: Boolean(process.env.RESEND_API_KEY),
      step: 'post-handler-reached',
    },
    { status: 200, headers: corsHeaders(request) },
  )
}
