export interface Herb {
  name: string;
  effects: string[];
  origin: string;
  safetyLevel: 'low' | 'moderate' | 'high';
  description: string;
  image: string;
}
