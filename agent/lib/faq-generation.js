export function generateFaqCandidates(compound = {}) {
  const name = compound.name || compound.slug || 'compound'

  return [
    `What is ${name} used for?`,
    `Does ${name} have human evidence?`,
    `What are the possible side effects of ${name}?`,
    `How long does ${name} take to work?`,
    `What compounds stack well with ${name}?`,
  ]
}
