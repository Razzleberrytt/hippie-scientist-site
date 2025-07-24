import * as raw from './masterHerbsAndCompounds';

export interface MasterEntry {
  name: string;
  slug?: string;
  type: 'herb' | 'compound';
  tags?: string[];
  effects?: string[];
  neurotransmitters?: string[];
  origin?: string;
  description?: string;
  image?: string;
  [key: string]: any;
}

const all: any[] = Object.values(raw).flatMap(v => (Array.isArray(v) ? v : []));

export const masterHerbsAndCompounds: MasterEntry[] = all.map((e: any) => ({
  type: e.type ? (e.type === 'herb' || e.type === 'compound' ? e.type : 'compound') : 'herb',
  ...e,
}));

export const herbs = masterHerbsAndCompounds.filter(e => e.type === 'herb');
export const compounds = masterHerbsAndCompounds.filter(e => e.type === 'compound');
