const fallbackAction = '/newsletter/confirmed'

function getMailchimpHoneypotName(action: string): string {
  try {
    const url = new URL(action)
    const userId = url.searchParams.get('u') || ''
    const listId = url.searchParams.get('id') || ''
    return userId && listId ? `b_${userId}_${listId}` : 'website'
  } catch {
    return 'website'
  }
}

const rawAction =
  process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION?.trim() ||
  process.env.NEXT_PUBLIC_EMAIL_CAPTURE_ACTION?.trim() ||
  fallbackAction

const isMailchimpAction = rawAction.includes('list-manage.com')

export const mailchimpSignupConfig = {
  action: rawAction,
  method: isMailchimpAction ? 'post' : 'get',
  emailFieldName: isMailchimpAction ? 'EMAIL' : 'email',
  honeypotName: getMailchimpHoneypotName(rawAction),
  isMailchimpAction,
  isConfigured: true,
  fallbackAction,
} as const

export function validateMailchimpConfig() {
  if (!mailchimpSignupConfig.action) {
    return {
      ok: false,
      message: 'Missing newsletter form action.',
    }
  }

  if (!mailchimpSignupConfig.isMailchimpAction) {
    return {
      ok: true,
      message: 'Using static local newsletter confirmation fallback.',
    }
  }

  try {
    const url = new URL(mailchimpSignupConfig.action)
    const hasListParams = Boolean(url.searchParams.get('u') && url.searchParams.get('id'))
    return {
      ok: hasListParams,
      message: hasListParams
        ? 'Mailchimp form action is configured.'
        : 'Mailchimp form action is missing u or id query parameters.',
    }
  } catch {
    return {
      ok: false,
      message: 'Mailchimp form action is not a valid URL.',
    }
  }
}
