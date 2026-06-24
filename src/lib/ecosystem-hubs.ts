export type EcosystemHub = {
  slug: string
  title: string
  description: string
  onboardingPathway: string
  stimulationProfile: 'calming' | 'balanced' | 'activating'
  timelineProfile: 'acute' | 'mixed' | 'cumulative'
  beginnerProfiles: string[]
  comparisonProfiles: string[]
  guidance: string[]
}

const ECOSYSTEM_HUBS: EcosystemHub[] = [
  {
    slug: 'sleep',
    title: 'Sleep Support Ecosystem',
    description:
      'A guided ecosystem focused on sleep quality, nervous-system decompression, recovery support, and realistic sleep-oriented exploration.',
    onboardingPathway: 'sleep-support',
    stimulationProfile: 'calming',
    timelineProfile: 'mixed',
    beginnerProfiles: [
      'glycine',
      'theanine',
      'magnesium-glycinate',
      'ashwagandha',
    ],
    comparisonProfiles: [
      'taurine',
      'magnesium',
      'rhodiola',
    ],
    guidance: [
      'Compare calming intensity before comparing marketing claims.',
      'Sleep-adjacent support is often cumulative and context-dependent.',
      'Avoid stacking multiple calming agents immediately as a beginner.',
    ],
  },
  {
    slug: 'stress',
    title: 'Stress Support Ecosystem',
    description:
      'An ecosystem centered on stress resilience, recovery capacity, stimulation sensitivity, and adaptogenic comparison logic.',
    onboardingPathway: 'stress-support',
    stimulationProfile: 'balanced',
    timelineProfile: 'mixed',
    beginnerProfiles: [
      'ashwagandha',
      'rhodiola',
      'theanine',
      'saffron',
    ],
    comparisonProfiles: [
      'glycine',
      'magnesium',
      'taurine',
    ],
    guidance: [
      'Stress-support compounds differ heavily in stimulation profile.',
      'More activating does not automatically mean stronger.',
      'Recovery quality often shapes perceived response.',
    ],
  },
  {
    slug: 'cognition',
    title: 'Cognitive Support Ecosystem',
    description:
      'A guided cognition ecosystem balancing calm focus, cumulative support, stimulation management, and sustainable mental performance.',
    onboardingPathway: 'cognitive-support',
    stimulationProfile: 'activating',
    timelineProfile: 'mixed',
    beginnerProfiles: [
      'creatine',
      'theanine',
      'bacopa',
      'lions-mane',
    ],
    comparisonProfiles: [
      'rhodiola',
      'taurine',
      'nac',
    ],
    guidance: [
      'Acute focus and cumulative cognition support are not the same thing.',
      'Stimulation-sensitive users may prefer calmer comparison paths.',
      'More ingredients does not automatically improve cognitive outcomes.',
    ],
  },
  {
    slug: 'recovery',
    title: 'Recovery Support Ecosystem',
    description:
      'A recovery-oriented ecosystem focused on energy sustainability, training support, nervous-system recovery, and cumulative performance resilience.',
    onboardingPathway: 'recovery-support',
    stimulationProfile: 'balanced',
    timelineProfile: 'cumulative',
    beginnerProfiles: [
      'creatine',
      'taurine',
      'magnesium',
      'rhodiola',
    ],
    comparisonProfiles: [
      'glycine',
      'ashwagandha',
      'nac',
    ],
    guidance: [
      'Recovery support usually works better when sleep and workload are addressed first.',
      'Cumulative compounds often require consistency before judging results.',
      'Avoid treating recovery support as a replacement for recovery behaviors.',
    ],
  },
]

export function getEcosystemHubs() {
  return ECOSYSTEM_HUBS
}

export function getEcosystemHub(slug: string) {
  return ECOSYSTEM_HUBS.find((hub) => hub.slug === slug)
}
