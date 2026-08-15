export type DisclaimerVariant = 'standard' | 'high-risk'

export const DISCLAIMER_COPY: Record<DisclaimerVariant, {
  ariaLabel: string
  heading: string
  body: string
  showMethodologyLink: boolean
}> = {
  standard: {
    ariaLabel: 'Safety disclaimer',
    heading: 'Safety first · Harm reduction',
    body: 'This information is educational and not medical advice. Avoid risky combinations, and consult a licensed clinician before making health decisions—especially if you use medications, have diagnosed conditions, or are pregnant/breastfeeding.',
    showMethodologyLink: true,
  },
  'high-risk': {
    ariaLabel: 'High-risk substance disclaimer',
    heading: 'Important',
    body: 'This content is for informational and educational purposes only. Some substances discussed here have little to no human clinical safety data and can carry serious, poorly characterized risks. This is not medical advice or a recommendation to use them.',
    showMethodologyLink: false,
  },
}
