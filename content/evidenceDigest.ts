export type EvidenceDigestCadence = 'weekly' | 'biweekly'

export type EvidenceDigestEdition = {
  slug: string
  title: string
  description: string
  publishedAt: string
  editorialStatus: 'verified' | 'reviewing'
  indexable: boolean
  sections: readonly {
    heading: string
    body: readonly string[]
    href?: string
    linkLabel?: string
  }[]
}

export const evidenceDigestProgram = {
  cadence: 'biweekly' as EvidenceDigestCadence,
  retentionPromise:
    'Every edition should save the reader time by explaining one evidence or safety decision clearly, linking to the underlying site resources, and keeping uncertainty visible.',
  publicationRules: [
    'Only verified editorial editions may be indexable.',
    'A digest containing unverified study-level claims must remain noindex until source review is complete.',
    'Every edition needs at least one practical takeaway and at least one deeper research destination.',
    'Email and web editions must share one canonical content object rather than being rewritten independently.',
    'Digest links use campaign attribution but never place an email address or other subscriber identifier in the URL.',
  ] as const,
} as const

export const evidenceDigestEditions: readonly EvidenceDigestEdition[] = [
  {
    slug: '2026-08-evidence-literacy',
    title: 'Evidence Digest: Four Checks Before You Trust a Supplement Claim',
    description:
      'A practical evidence-literacy edition covering study type, ingredient form, dose relevance, and safety context without relying on unverified study cards.',
    publishedAt: '2026-08-15',
    editorialStatus: 'verified',
    indexable: true,
    sections: [
      {
        heading: '1. Ask what kind of evidence you are looking at',
        body: [
          'A mechanism, an animal experiment, an observational association, a randomized trial, and a systematic review answer different questions. Treating them as interchangeable is one of the fastest ways to overstate a supplement claim.',
          'Start by identifying the evidence class. Then make the conclusion no stronger than that class and the broader body of evidence can support.',
        ],
        href: '/learn/evidence-levels/',
        linkLabel: 'Review evidence levels',
      },
      {
        heading: '2. Check whether the product resembles what was studied',
        body: [
          'The ingredient name alone is not enough. Form, extract standardization, elemental amount, active-marker percentage, and serving size can determine whether a retail product meaningfully resembles the intervention used in research.',
          'This matters most when findings come from a specific extract or formulation that should not be generalized to every product using the same common ingredient name.',
        ],
        href: '/learn/product-quality/',
        linkLabel: 'Read the product-quality guide',
      },
      {
        heading: '3. Put the studied dose beside the claim',
        body: [
          'A useful evidence summary should distinguish a standardized medical dose from doses that happened to be studied in trials. It should also make the preparation or extract explicit when dose interpretation depends on it.',
          'If a consumer product delivers a very different amount or form, the research result may be less transferable even when the ingredient name matches.',
        ],
        href: '/info/dosing/',
        linkLabel: 'Review dosing basics',
      },
      {
        heading: '4. Treat safety as a separate question from efficacy',
        body: [
          'Strong evidence that something has an effect does not prove that it is appropriate for every person. Weak evidence of benefit does not automatically mean a substance is dangerous either.',
          'Use interaction, contraindication, sedation, stimulation, pregnancy, and medication context as a separate safety layer. When the dataset has no documented interaction, that should not be rewritten as proof that no interaction exists.',
        ],
        href: '/safety-checker/',
        linkLabel: 'Open the Safety Checker',
      },
    ],
  },
]

export function getEvidenceDigestEdition(slug: string): EvidenceDigestEdition | undefined {
  return evidenceDigestEditions.find((edition) => edition.slug === slug)
}
