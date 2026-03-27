export type FormSubmissionType = 'newsletter' | 'contact' | 'lead-capture'

export type FormSubmissionPayload = {
  formType: FormSubmissionType
  email: string
  name?: string
  firstName?: string
  subject?: string
  message?: string
  source?: string
  context?: string
  pagePath?: string
}

export type FormSubmissionResult = {
  ok: boolean
  message?: string
}

export const FORM_ERROR_COPY = {
  missingEndpoint: 'Form submissions are not configured yet. Please try again later.',
  invalidEmail: 'Please enter a valid email address.',
  requiredFields: 'Please fill in the required fields and try again.',
  honeypot: 'We could not send your submission. Please try again.',
  network: 'We could not send your submission right now. Please try again in a moment.',
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function validateEmail(email: string): string | null {
  const normalized = normalizeEmail(email)

  if (!normalized || !EMAIL_PATTERN.test(normalized)) {
    return FORM_ERROR_COPY.invalidEmail
  }

  return null
}

function resolveFormEndpoint(): string {
  const env = import.meta.env as Record<string, string | undefined>
  return env.VITE_FORM_ENDPOINT || ''
}

export async function submitFormPayload(
  payload: FormSubmissionPayload,
  honeypotValue?: string
): Promise<FormSubmissionResult> {
  if (honeypotValue && honeypotValue.trim()) {
    return {
      ok: false,
      message: FORM_ERROR_COPY.honeypot,
    }
  }

  const endpoint = resolveFormEndpoint()
  if (!endpoint) {
    return {
      ok: false,
      message: FORM_ERROR_COPY.missingEndpoint,
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        email: normalizeEmail(payload.email),
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      return {
        ok: false,
        message: FORM_ERROR_COPY.network,
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: FORM_ERROR_COPY.network,
    }
  }
}
