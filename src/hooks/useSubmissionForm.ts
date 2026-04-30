import { useCallback, useMemo, useState } from 'react'
import {
  FORM_ERROR_COPY,
  submitFormPayload,
  type FormSubmissionPayload,
  validateEmail,
} from '@/lib/formSubmission'

type SubmissionStatus = 'idle' | 'pending' | 'success' | 'error'

type SubmissionFields = {
  email: string
}

type SubmitMeta = {
  honeypot?: string
}

type UseSubmissionFormOptions = {
  successMessage: string
  buildPayload: (fields: SubmissionFields) => FormSubmissionPayload
  onSuccess?: () => void
}

type UseSubmissionFormResult = {
  status: SubmissionStatus
  message: string
  submit: (fields: SubmissionFields, meta?: SubmitMeta) => Promise<boolean>
  clearFeedback: () => void
}

export function useSubmissionForm(options: UseSubmissionFormOptions): UseSubmissionFormResult {
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [message, setMessage] = useState('')

  const clearFeedback = useCallback(() => {
    setStatus('idle')
    setMessage('')
  }, [])

  const submit = useCallback(
    async (fields: SubmissionFields, meta?: SubmitMeta) => {
      const emailError = validateEmail(fields.email)
      if (emailError) {
        setStatus('error')
        setMessage(emailError)
        return false
      }

      const payload = options.buildPayload(fields)
      if (!payload.formType) {
        setStatus('error')
        setMessage(FORM_ERROR_COPY.requiredFields)
        return false
      }

      setStatus('pending')
      setMessage('')

      const result = await submitFormPayload(payload, meta?.honeypot)
      if (!result.ok) {
        setStatus('error')
        setMessage(result.message || FORM_ERROR_COPY.network)
        return false
      }

      setStatus('success')
      setMessage(options.successMessage)
      options.onSuccess?.()
      return true
    },
    [options]
  )

  return useMemo(
    () => ({
      status,
      message,
      submit,
      clearFeedback,
    }),
    [clearFeedback, message, status, submit]
  )
}
