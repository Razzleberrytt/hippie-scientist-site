import type { Goal } from '@/types/goals'

export type GoalDefinition = Goal

export const GOALS: GoalDefinition[] = [
  {
    id: 'relaxation',
    label: 'Relaxation',
    targetEffects: ['sedation', 'anxiolytic', 'muscle relaxation', 'calm'],
    classBoosts: ['depressant', 'calming', 'nervine'],
    warning: 'Use caution with CNS depressants and sedatives.',
  },
  {
    id: 'focus',
    label: 'Focus',
    targetEffects: ['stimulation', 'cognitive enhancement', 'alertness', 'clarity'],
    classBoosts: ['nootropic', 'stimulant'],
    warning: 'Avoid or reduce if prone to anxiety or insomnia.',
  },
  {
    id: 'sleep',
    label: 'Sleep Support',
    targetEffects: ['sleep support', 'sedation', 'anxiety reduction', 'relaxation'],
    classBoosts: ['nervine', 'sedative'],
    warning: 'Not for daytime use; avoid pairing with strong stimulants.',
  },
  {
    id: 'energy',
    label: 'Energy',
    targetEffects: ['stimulation', 'motivation', 'wakefulness', 'vitality'],
    classBoosts: ['stimulant', 'adaptogen'],
    warning: 'Use caution with heart conditions or hypertension.',
  },
  {
    id: 'introspection',
    label: 'Introspection',
    targetEffects: ['psychedelic', 'introspection', 'visual distortion', 'mystical states'],
    classBoosts: ['visionary', 'psychedelic', 'entheogen', 'ritual'],
    warning: 'Avoid with psychiatric instability or serotonergic medications.',
  },
  {
    id: 'mood-balance',
    label: 'Mood Balance',
    targetEffects: ['mood elevation', 'stress relief', 'emotional regulation', 'calm'],
    classBoosts: ['adaptogen', 'anxiolytic'],
    warning: 'Use caution with antidepressants or bipolar-spectrum conditions.',
  },
]
