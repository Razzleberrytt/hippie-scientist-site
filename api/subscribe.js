/* eslint-env node */
import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { email } = req.body ?? {}
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.RESEND_TO_EMAIL
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !toEmail || !fromEmail) {
    // eslint-disable-next-line no-console
    console.error('Missing required Resend environment variables')
    return res.status(500).json({ error: 'Server is not configured' })
  }

  try {
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: 'New Hippie Scientist email signup',
      text: `New email captured: ${normalizedEmail}`,
      replyTo: normalizedEmail,
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Resend subscribe error:', error)
    return res.status(500).json({ error: 'Failed to process signup' })
  }
}
