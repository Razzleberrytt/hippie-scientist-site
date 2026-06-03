export type IntentKey = 'sleep' | 'stress' | 'focus' | 'fat-loss' | 'gut-health' | 'blood-pressure' | 'joint-support' | 'testosterone-support'

export const INTENT_STORAGE_KEY = 'hs:last-intent'

export const intentLabels: Record<IntentKey, string> = {
  sleep: 'Sleep',
  stress: 'Stress',
  focus: 'Focus',
  'fat-loss': 'Fat Loss',
  'gut-health': 'Gut Health',
  'blood-pressure': 'Blood Pressure',
  'joint-support': 'Joint Support',
  'testosterone-support': 'Testosterone Support',
}

export const intentCtas: Record<IntentKey, string> = {
  sleep: 'Continue sleep support →',
  stress: 'Continue calming support →',
  focus: 'Continue focus support →',
  'fat-loss': 'Continue fat-loss support →',
  'gut-health': 'Continue gut-health support →',
  'blood-pressure': 'Continue cardiovascular support →',
  'joint-support': 'Continue joint-support picks →',
  'testosterone-support': 'Continue testosterone-support picks →',
}

export const isIntentKey = (value: string): value is IntentKey =>
  Object.prototype.hasOwnProperty.call(intentLabels, value)
