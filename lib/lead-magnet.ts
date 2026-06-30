export type LeadMagnetAsset = {
  slug: string
  title: string
  description: string
  href: string
  format: 'html'
  ctaLabel: string
  privacyNote: string
}

export const safetyChecklistLeadMagnet: LeadMagnetAsset = {
  slug: 'supplement-safety-checklist',
  title: 'Get the Safety Checklist: 5 Questions to Ask Before Taking Any Supplement',
  description:
    'A printable supplement safety workflow covering medications, dose and form, stacking risk, product quality, and when to ask a clinician.',
  href: '/info/supplement-safety-checklist',
  format: 'html',
  ctaLabel: 'Get the free checklist',
  privacyNote:
    'We use your email to send the checklist and occasional evidence-first supplement updates. Unsubscribe anytime.',
}

export const leadMagnets = {
  safetyChecklist: safetyChecklistLeadMagnet,
} as const
