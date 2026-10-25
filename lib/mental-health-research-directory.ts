/** Published P0 mental-health articles only. Draft manuscripts must not appear here. */
export type ResearchTopic = 'relationships' | 'personality' | 'emotions'
export interface ResearchReview {
  title: string
  description: string
  href: string
  topic: ResearchTopic
}

export const P0_RESEARCH_REVIEWS: ResearchReview[] = [
            {
              title: 'Limerence and obsessive love',
              description: 'The 2025–2026 limerence studies, validated measurement, uncertainty, compulsive checking and treatment limitations.',
              href: '/articles/limerence-obsessive-love-evidence-review/',
              topic: 'relationships',
            },
            {
              title: 'Limerence and a BPD partner',
              description: 'What attachment correlations and couple studies show, and why they cannot prove BPD causes limerence.',
              href: '/articles/limerence-borderline-partner-evidence-review/',
              topic: 'relationships',
            },
            {
              title: 'Loving someone with BPD',
              description: 'Published therapy meta-analyses, long-term prognosis, couple evidence, boundaries and partner support.',
              href: '/articles/loving-a-partner-with-bpd-evidence-review/',
              topic: 'relationships',
            },
            {
              title: 'Borderline personality disorder vs complex PTSD',
              description: 'Diagnostic overlap, official ICD-11 criteria, recent systematic reviews and interpersonal meta-analysis limits.',
              href: '/articles/bpd-vs-complex-ptsd-evidence-review/',
              topic: 'personality',
            },
            {
              title: 'Avoidant personality disorder vs social anxiety',
              description: 'Overlapping diagnoses, core differences and the randomized schema therapy versus CBT comparison.',
              href: '/articles/avoidant-personality-vs-social-anxiety-evidence-review/',
              topic: 'personality',
            },
            {
              title: 'Long-term personality-disorder recovery',
              description: 'What remission means, long-term cohort outcomes and why functioning may improve differently than symptoms.',
              href: '/articles/personality-disorder-recovery-long-term-evidence-review/',
              topic: 'personality',
            },
            {
              title: 'Emotional dysregulation across disorders',
              description: 'ADHD, BPD, trauma and a 188-study meta-analysis, with careful limits on causal claims.',
              href: '/articles/emotional-dysregulation-across-disorders-evidence-review/',
              topic: 'emotions',
            },
            {
              title: 'Attachment to people who hurt us',
              description: 'Relationship persistence, insecurity, housing barriers, material realities and survivor-centered safety.',
              href: '/articles/attachment-to-people-who-hurt-us-evidence-review/',
              topic: 'relationships',
            },
            {
              title: 'The anxious–avoidant relationship cycle',
              description: 'A 263-couple longitudinal study, demand–withdraw dynamics and what partner support can and cannot fix.',
              href: '/articles/anxious-avoidant-relationship-cycle-evidence-review/',
              topic: 'relationships',
            },
            {
              title: 'Rejection-sensitive dysphoria and ADHD',
              description: 'Direct positive and negative studies, rejected assumptions and why RSD is not a separate DSM diagnosis.',
              href: '/articles/rejection-sensitive-dysphoria-adhd-evidence-review/',
              topic: 'emotions',
            },
            {
              title: "Limerence vs relationship OCD",
              description: "How relationship-themed compulsions differ from persistent romantic longing, with explicit treatment-evidence limits.",
              href: '/articles/limerence-versus-relationship-ocd-evidence-review/',
              topic: 'relationships',
            },
            {
              title: "Excessive reassurance seeking",
              description: "What two meta-analyses actually reveal about reassurance, depression and interpersonal rejection.",
              href: '/articles/excessive-reassurance-seeking-relationships-evidence-review/',
              topic: 'relationships',
            },
            {
              title: "Social rejection and the brain",
              description: "Physical-pain overlap, conflicting fMRI interpretations and why social pain has no brain-scan diagnosis.",
              href: '/articles/social-rejection-pain-brain-evidence-review/',
              topic: 'emotions',
            },
            {
              title: "Grandiose vs vulnerable narcissism",
              description: "An individual-data meta-analysis, a 229-study synthesis and why traits do not diagnose partners.",
              href: '/articles/grandiose-vulnerable-narcissism-evidence-review/',
              topic: 'personality',
            },
            {
              title: "Breakup grief and recovery",
              description: "Longitudinal mood trajectories, romantic rejection imaging and the limits of social-media surveillance findings.",
              href: '/articles/romantic-breakup-recovery-grief-evidence-review/',
              topic: 'relationships',
            },
            {
              title: "Emotional unavailability and attachment",
              description: "Attachment avoidance, emotion-regulation flexibility and distinctions between labels and observable conduct.",
              href: '/articles/emotional-unavailability-attachment-avoidance-evidence-review/',
              topic: 'relationships',
            },
            {
              title: "Leaving unhealthy relationships",
              description: "Traumatic-bonding evidence, practical constraints and specialist safety-planning resources.",
              href: '/articles/leaving-unhealthy-relationships-safety-evidence-review/',
              topic: 'relationships',
            },
            {
              title: "Attachment styles and outcomes",
              description: "Large-scale attachment associations, dyadic coping and limits of predicting a particular couple's future.",
              href: '/articles/attachment-styles-relationship-outcomes-evidence-review/',
              topic: 'relationships',
            },
            {
              title: "Dependent personality vs attachment anxiety",
              description: "Classification, reassurance, practical dependence and the limits of personality-disorder treatment trials.",
              href: '/articles/dependent-personality-vs-attachment-anxiety-evidence-review/',
              topic: 'personality',
            },
            {
              title: "Rumination and negative thinking",
              description: "A 223-study meta-analysis, intervention trials, clinical overlap and careful interpretation of causal models.",
              href: '/articles/rumination-repetitive-negative-thinking-evidence-review/',
              topic: 'emotions',
            },
          ]
