export type ComboGoal = 'relaxation' | 'focus' | 'sleep' | 'mood' | 'energy'

export const COMBO_GOAL_LABELS: Record<ComboGoal, string> = {
  relaxation: 'Relax',
  focus: 'Focus',
  sleep: 'Sleep',
  mood: 'Mood',
  energy: 'Energy',
}

export type PrebuiltCombo = {
  id: string
  name: string
  items: string[]
  goal: ComboGoal
  description: string
}
