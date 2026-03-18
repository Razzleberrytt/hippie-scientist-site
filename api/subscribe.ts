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
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let payload: unknown

  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  const email =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { email?: unknown }).email === 'string'
      ? (payload as { email: string }).email.trim().toLowerCase()
      : ''

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Missing or invalid email' })
  }

  const toEmail = process.env.RESEND_TO_EMAIL

  if (!process.env.RESEND_API_KEY || !toEmail) {
    return res.status(200).json({ success: true })
  }

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: 'New Hippie Scientist signup',
      text: `New signup email: ${email}`,
    })
  } catch {
    // Keep this quiet so the frontend success flow still works.
  }

  return res.status(200).json({ success: true })
}
