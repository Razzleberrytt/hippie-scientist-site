import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENDER_EMAIL = 'The Hippie Scientist <onboarding@resend.dev>'

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  let payload: unknown

  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' })
  }

  console.log('[api/subscribe] incoming request body:', payload)

  const email =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { email?: unknown }).email === 'string'
      ? (payload as { email: string }).email.trim().toLowerCase()
      : ''

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, error: 'Missing or invalid email' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ ok: false, error: 'Missing RESEND_API_KEY environment variable' })
  }

  try {
    const sendResult = await resend.emails.send({
      from: SENDER_EMAIL,
      to: 'razzleberryt@gmail.com',
      subject: 'New Hippie Scientist signup',
      html: `<p>New signup: ${email}</p>`,
    })

    console.log('[api/subscribe] resend send result:', sendResult)
  } catch (error) {
    console.error('[api/subscribe] resend send error:', error)
    return res.status(500).json({ ok: false, error: 'Failed to send email' })
  }

  return res.status(200).json({ ok: true })
}
