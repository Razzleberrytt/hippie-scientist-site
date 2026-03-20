type ApiRequest = {
  method?: string
  body?: unknown
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (payload: unknown) => ApiResponse
  setHeader: (name: string, value: string) => void
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  const hasApiKey = Boolean(process.env.RESEND_API_KEY)

  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      ok: true,
      message: 'Preflight OK',
    })
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      method: 'GET',
      hasApiKey,
      message: 'Subscribe API is reachable',
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET,POST,OPTIONS')
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
      hasApiKey,
      email: '',
    })
  }

  let payload: unknown

  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({
      ok: false,
      error: 'body-parse-failed',
      step: 'parse',
    })
  }

  const email =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { email?: unknown }).email === 'string'
      ? (payload as { email: string }).email.trim().toLowerCase()
      : ''

  return res.status(200).json({
    ok: true,
    method: 'POST',
    email,
    hasApiKey,
    step: 'post-handler-reached',
  })
}
