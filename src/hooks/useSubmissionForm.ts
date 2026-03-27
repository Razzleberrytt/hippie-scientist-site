import { useState } from 'react'
import {
  FORM_ERROR_COPY,
  FormSubmissionPayload,
  submitFormPayload,
  validateEmail,
} from '@/lib/formSubmission'

export type SubmissionStatus = 'idle' | 'pending' | 'success' | 'error'

type UseSubmissionFormConfig<TFields> = {
  successMessage: string
  buildPayload: (fields: TFields) => FormSubmissionPayload
  validate?: (fields: TFields) => string | null
  onSuccess?: () => void
}

export function useSubmissionForm<TFields>({
  successMessage,
  buildPayload,
  validate,
  onSuccess,
}: UseSubmissionFormConfig<TFields>) {
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [message, setMessage] = useState('')

  const clearFeedback = () => {
    if (status !== 'idle') {
      setStatus('idle')
      setMessage('')
    }
  }

  const submit = async (fields: TFields, options?: { honeypot?: string }) => {
    const payload = buildPayload(fields)
    const emailError = validateEmail(payload.email)

    if (emailError) {
      setStatus('error')
      setMessage(emailError)
      return false
    }

    const validationError = validate?.(fields)
    if (validationError) {
      setStatus('error')
      setMessage(validationError)
      return false
    }

    setStatus('pending')
    setMessage('')

    const result = await submitFormPayload(payload, options?.honeypot)

    if (!result.ok) {
      setStatus('error')
      setMessage(result.message || FORM_ERROR_COPY.network)
      return false
    }

    setStatus('success')
    setMessage(successMessage)
    onSuccess?.()
    return true
  }

  return {
    status,
    message,
    submit,
    clearFeedback,
  }
}
