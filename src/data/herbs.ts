import type { Herb } from '../types';

export const herbs: Herb[] = [
  {
    name: 'Blue Lotus',
    effects: ['Relaxation', 'Mild euphoria'],
    origin: 'Egypt',
    safetyLevel: 'moderate',
    description:
      'Blue lotus has been used since ancient times for its calming properties and dreamlike state.',
    image: 'https://source.unsplash.com/featured/?lotus',
  },
  {
    name: 'Ashwagandha',
    effects: ['Stress relief', 'Anxiety reduction'],
    origin: 'India',
    safetyLevel: 'low',
    description:
      'Ashwagandha is an adaptogenic herb known for promoting relaxation and resilience to stress.',
    image: 'https://source.unsplash.com/featured/?ashwagandha',
  },
  {
    name: 'Yohimbe',
    effects: ['Stimulation', 'Mood enhancement'],
    origin: 'West Africa',
    safetyLevel: 'high',
    description:
      'Yohimbe bark has stimulating properties but should be used with caution due to its potency.',
    image: 'https://source.unsplash.com/featured/?yohimbe',
  },
];
