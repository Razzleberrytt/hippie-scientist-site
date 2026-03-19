import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENDER_EMAIL = 'The Hippie Scientist <onboarding@resend.dev>'
const RECIPIENT_EMAIL = 'MY_REAL_EMAIL@gmail.com'

const resend = new Resend(process.env.RESEND_API_KEY)

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
  const hasApiKey = Boolean(process.env.RESEND_API_KEY)
  const responseForFailure = (statusCode: number, error: string, email = '') =>
    res.status(statusCode).json({
      ok: false,
      error,
      hasApiKey,
      email,
    })

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return responseForFailure(405, 'Method not allowed')
  }

  let payload: unknown

  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return responseForFailure(400, 'Invalid JSON body')
  }

  console.log('[api/subscribe] incoming request body:', payload)

  const email =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { email?: unknown }).email === 'string'
      ? (payload as { email: string }).email.trim().toLowerCase()
      : ''

  if (!EMAIL_REGEX.test(email)) {
    return responseForFailure(400, 'Missing or invalid email', email)
  }

  if (!hasApiKey) {
    return responseForFailure(500, 'Missing RESEND_API_KEY environment variable', email)
  }

  try {
    const sendResult = await resend.emails.send({
      from: SENDER_EMAIL,
      to: RECIPIENT_EMAIL,
      subject: 'New Hippie Scientist signup',
      html: `<p>New signup: ${email}</p>`,
    })

    console.log('[api/subscribe] resend send result:', sendResult)
  } catch (error) {
    console.error('[api/subscribe] resend send error:', error)
    return responseForFailure(500, 'Failed to send email', email)
  }

  return res.status(200).json({ ok: true, email, hasApiKey })
}
