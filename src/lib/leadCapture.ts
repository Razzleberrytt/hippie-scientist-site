export type LeadCaptureInput = {
  email: string
  source: 'interaction-checker' | 'stack-builder'
  context?: 'after-report' | 'after-save' | 'after-share' | 'after-export' | string
}

export type LeadCaptureResult = {
  ok: boolean
  message?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function resolveLeadCaptureEndpoint(): string {
  const env = import.meta.env as Record<string, string | undefined>
  return env.VITE_LEAD_CAPTURE_ENDPOINT || env.VITE_NEWSLETTER_ENDPOINT || ''
}

export function validateLeadCaptureEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase()

  if (!normalized) {
    return 'Please enter an email address.'
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return 'Please enter a valid email address.'
  }

  return null
}

export async function submitLeadCapture(input: LeadCaptureInput): Promise<LeadCaptureResult> {
  const emailError = validateLeadCaptureEmail(input.email)
  if (emailError) {
    return { ok: false, message: emailError }
  }

  const endpoint = resolveLeadCaptureEndpoint()
  const normalizedEmail = input.email.trim().toLowerCase()
  const payload = {
    email: normalizedEmail,
    source: input.source,
    actionContext: input.context || 'after-report',
  }

  if (!endpoint) {
    return {
      ok: true,
      message: 'Saved locally. Add VITE_LEAD_CAPTURE_ENDPOINT to enable live submissions.',
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        ok: false,
        message: 'We could not save your email right now. Please try again in a moment.',
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'Network issue while saving your email. Please try again shortly.',
    }
  }
}
