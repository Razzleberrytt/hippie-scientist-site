export const EFFECT_TAXONOMY = {
  sleep: ['sleep', 'insomnia', 'melatonin'],
  anxiety: ['anxiety', 'stress', 'calm'],
  focus: ['focus', 'attention', 'concentration'],
  recovery: ['recovery', 'exercise', 'muscle'],
  cognition: ['memory', 'cognitive', 'brain'],
}

export function classifyEffects(effects = []) {
  const joined = effects.join(' ').toLowerCase()

  return Object.entries(EFFECT_TAXONOMY)
    .filter(([, keywords]) => {
      return keywords.some(keyword => joined.includes(keyword))
    })
    .map(([label]) => label)
}
