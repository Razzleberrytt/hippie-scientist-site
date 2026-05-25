import fs from 'node:fs';

const content = JSON.parse(fs.readFileSync('public/data/runtime-maps/related-profiles.json', 'utf8'));
console.log('Related to yohimbe:', content['yohimbe']);
