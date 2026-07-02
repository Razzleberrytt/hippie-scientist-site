export type EmailCaptureGoal =
  | 'sleep'
  | 'stress'
  | 'focus'
  | 'brain-fog'
  | 'fatigue'
  | 'overthinking'
  | 'anxiety'
  | 'pain'
  | 'inflammation'
  | 'safety-checklist'
  | 'default'

export type LeadMagnet = {
  goal: EmailCaptureGoal
  title: string
  description: string
  ctaLabel: string
}

export const emailCaptureProviderAction = mailchimpSignupConfig.action

export const emailCaptureProviderConfigured = true

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

export const emailCaptureProviderHoneypotName = mailchimpSignupConfig.honeypotName || getMailchimpHoneypotName(emailCaptureProviderAction)

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
  anxiety: {
    goal: 'anxiety',
    title: 'Get the anxiety support decision guide',
    description:
      'A cautious shortlist for comparing calming options with safety, medication context, and evidence limits kept visible.',
    ctaLabel: 'Get the anxiety guide',
  },
  pain: {
    goal: 'pain',
    title: 'Get the pain support decision guide',
    description:
      'Compare joint and discomfort options with evidence tiers, NSAID-adjacent cautions, and slow-onset expectations kept visible.',
    ctaLabel: 'Get the pain guide',
  },
  inflammation: {
    goal: 'inflammation',
    title: 'Get the inflammation support decision guide',
    description:
      'A practical framework for comparing anti-inflammatory supplements without overreading limited human trials.',
    ctaLabel: 'Get the inflammation guide',
  },
  'safety-checklist': {
    goal: 'safety-checklist',
    title: 'Free supplement safety checklist (avoid costly mistakes)',
    description:
      'One-page workflow: check medications, dose & form, stacking risks, and third-party quality markers before any purchase.',
    ctaLabel: 'Send me the free checklist',
  },
  default: {
    goal: 'default',
    title: 'Free supplement safety checklist (avoid costly mistakes)',
    description:
      'Get the evidence-based checklist — meds, dose, form, and stack risk — plus occasional research updates. Not medical advice.',
    ctaLabel: 'Get the free checklist',
  },
}

export function getLeadMagnet(goal: string | undefined): LeadMagnet {
  if (!goal) return leadMagnets.default
  return leadMagnets[(goal as EmailCaptureGoal)] ?? leadMagnets.default
}
import { mailchimpSignupConfig } from '@/lib/mailchimp-integration'
