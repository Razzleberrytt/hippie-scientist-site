export const scientificHumanPrinciples = [
  'Explain uncertainty clearly.',
  'Prefer calm evidence framing over hype.',
  'Guide users toward understanding, not impulse decisions.',
  'Preserve scientific nuance and safety context.',
  'Optimize for readability before complexity.',
  'Encourage exploration through ecosystems and comparisons.',
]

export function buildScientificHumanTone() {
  return {
    headlineStyle: 'calm-authoritative',
    editorialStyle: 'scientific-but-human',
    trustStyle: 'evidence-informed',
    onboardingStyle: 'guided-exploration',
  }
}
