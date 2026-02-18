export interface Firearm {
  id: number;
  name: string;
  type: string;
  caliber: string;
  origin: string;
  description: string;
}

export const firearms: Firearm[] = [
  {
    id: 1,
    name: 'Alpha Rifle',
    type: 'Rifle',
    caliber: '5.56mm',
    origin: 'Country A',
    description: 'A popular service rifle used around the world.'
  },
  {
    id: 2,
    name: 'Bravo Pistol',
    type: 'Pistol',
    caliber: '9mm',
    origin: 'Country B',
    description: 'A compact pistol favored for its reliability.'
  },
  {
    id: 3,
    name: 'Charlie SMG',
    type: 'SMG',
    caliber: '9mm',
    origin: 'Country C',
    description: 'Submachine gun used in close quarters.'
  },
  {
    id: 4,
    name: 'Delta Shotgun',
    type: 'Shotgun',
    caliber: '12 gauge',
    origin: 'Country D',
    description: 'Pump-action shotgun with high stopping power.'
  },
  {
    id: 5,
    name: 'Echo Sniper',
    type: 'Sniper',
    caliber: '.308',
    origin: 'Country E',
    description: 'Precision rifle for long range engagements.'
  }
];
