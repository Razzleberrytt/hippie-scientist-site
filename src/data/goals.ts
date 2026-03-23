export type GoalDefinition = {
  id: string
  label: string
  targetEffects: string[]
  classHints?: string[]
  contraindicationKeywords?: string[]
}

export const GOALS: GoalDefinition[] = [
  {
    id: 'relaxation',
    label: 'Relaxation',
    targetEffects: ['sedation', 'anxiolytic', 'muscle relaxation', 'calm'],
    classHints: ['depressant', 'calming', 'nervine'],
    contraindicationKeywords: ['cns depressants', 'sedatives'],
  },
  {
    id: 'focus',
    label: 'Focus',
    targetEffects: ['stimulation', 'cognitive enhancement', 'alertness', 'clarity'],
    classHints: ['nootropic', 'stimulant'],
    contraindicationKeywords: ['anxiety disorders', 'insomnia'],
  },
  {
    id: 'sleep',
    label: 'Sleep Support',
    targetEffects: ['sleep support', 'sedation', 'anxiety reduction', 'relaxation'],
    classHints: ['nervine', 'sedative'],
    contraindicationKeywords: ['daytime use', 'stimulants'],
  },
  {
    id: 'energy',
    label: 'Energy',
    targetEffects: ['stimulation', 'motivation', 'wakefulness', 'vitality'],
    classHints: ['stimulant', 'adaptogen'],
    contraindicationKeywords: ['heart conditions', 'hypertension'],
  },
  {
    id: 'introspection',
    label: 'Introspection',
    targetEffects: ['psychedelic', 'introspection', 'visual distortion', 'mystical states'],
    classHints: ['visionary', 'psychedelic', 'entheogen', 'ritual'],
    contraindicationKeywords: ['psychiatric conditions', 'ssris', 'maois'],
  },
  {
    id: 'mood-balance',
    label: 'Mood Balance',
    targetEffects: ['mood elevation', 'stress relief', 'emotional regulation', 'calm'],
    classHints: ['adaptogen', 'anxiolytic'],
    contraindicationKeywords: ['antidepressants', 'bipolar disorder'],
  },
]
