import {
  FormSubmissionPayload,
  FormSubmissionResult,
  normalizeEmail,
  submitFormPayload,
  validateEmail,
} from '@/lib/formSubmission'

export type LeadCaptureInput = {
  email: string
  source: 'interaction-checker' | 'stack-builder' | 'inline-capture'
  context?: 'after-report' | 'after-save' | 'after-share' | 'after-export' | string
}

export type LeadCaptureResult = FormSubmissionResult

export function validateLeadCaptureEmail(email: string): string | null {
  return validateEmail(email)
}

export async function submitLeadCapture(input: LeadCaptureInput): Promise<LeadCaptureResult> {
  const emailError = validateLeadCaptureEmail(input.email)
  if (emailError) {
    return { ok: false, message: emailError }
  }

  const payload: FormSubmissionPayload = {
    formType: 'lead-capture',
    email: normalizeEmail(input.email),
    source: input.source,
    context: input.context || 'after-report',
    pagePath: typeof window === 'undefined' ? undefined : window.location.pathname,
  }

  return submitFormPayload(payload)
}
