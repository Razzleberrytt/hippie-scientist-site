import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  let body: unknown

  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  const parsedBody = body && typeof body === 'object' ? (body as { email?: unknown }) : {}
  const email = typeof parsedBody.email === 'string' ? parsedBody.email.trim().toLowerCase() : ''

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Missing or invalid email' })
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.error('Missing RESEND_API_KEY')
    return res.status(500).json({ error: 'Server is not configured' })
  }

  try {
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: 'The Hippie Scientist <onboarding@resend.dev>',
      to: [email],
      subject: 'Thanks for subscribing to The Hippie Scientist',
      text: `Thanks for subscribing with ${email}. We'll share new herb research updates soon.`,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Resend subscribe error:', error)
    return res.status(500).json({ error: 'Failed to process subscription' })
  }
}
