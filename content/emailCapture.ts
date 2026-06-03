export type EmailCaptureGoal =
  | 'sleep'
  | 'stress'
  | 'focus'
  | 'brain-fog'
  | 'fatigue'
  | 'overthinking'
  | 'default'

export type LeadMagnet = {
  goal: EmailCaptureGoal
  title: string
  description: string
  ctaLabel: string
}

export const emailCaptureProviderAction =
  process.env.NEXT_PUBLIC_EMAIL_CAPTURE_ACTION?.trim() || ''

export const emailCaptureProviderConfigured = emailCaptureProviderAction.length > 0

function getMailchimpHoneypotName(action: string): string {
  try {
    const url = new URL(action)
    const userId = url.searchParams.get('u') || ''
    const listId = url.searchParams.get('id') || ''
    return userId && listId ? `b_${userId}_${listId}` : ''
  } catch {
    return ''
  }
}

export const emailCaptureProviderHoneypotName = getMailchimpHoneypotName(emailCaptureProviderAction)

export const leadMagnets: Record<EmailCaptureGoal, LeadMagnet> = {
  sleep: {
    goal: 'sleep',
    title: 'Get the sleep supplement decision guide',
    description:
      'A practical shortlist for comparing sleep-support supplements, timing, grogginess risk, and safety questions.',
    ctaLabel: 'Get the sleep guide',
  },
  stress: {
    goal: 'stress',
    title: 'Get the stress supplement decision guide',
    description:
      'Compare calming and adaptogen-style options with evidence, uncertainty, and safety context kept visible.',
    ctaLabel: 'Get the stress guide',
  },
  focus: {
    goal: 'focus',
    title: 'Get the focus supplement decision guide',
    description:
      'A clear way to separate stimulant-forward focus support from steadier non-stimulant options.',
    ctaLabel: 'Get the focus guide',
  },
  'brain-fog': {
    goal: 'brain-fog',
    title: 'Get the brain fog supplement decision guide',
    description:
      'A cautious framework for comparing cognitive-support supplements while keeping possible root causes in view.',
    ctaLabel: 'Get the brain fog guide',
  },
  fatigue: {
    goal: 'fatigue',
    title: 'Get the fatigue supplement decision guide',
    description:
      'Compare short-lift and recovery-oriented options without treating persistent fatigue as a supplement-only problem.',
    ctaLabel: 'Get the fatigue guide',
  },
  overthinking: {
    goal: 'overthinking',
    title: 'Get the overthinking support decision guide',
    description:
      'A calming-support shortlist focused on practical fit, safety context, and avoiding overconfident claims.',
    ctaLabel: 'Get the calming guide',
  },
  default: {
    goal: 'default',
    title: 'Get the supplement decision guide',
    description:
      'Evidence-aware notes for comparing supplements, safety context, and product-quality questions before buying.',
    ctaLabel: 'Get the guide',
  },
}

export function getLeadMagnet(goal: string | undefined): LeadMagnet {
  if (!goal) return leadMagnets.default
  return leadMagnets[(goal as EmailCaptureGoal)] ?? leadMagnets.default
}
