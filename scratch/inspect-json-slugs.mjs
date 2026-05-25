import fs from 'node:fs';

const herbs = JSON.parse(fs.readFileSync('public/data/herbs.json', 'utf8'));
const compounds = JSON.parse(fs.readFileSync('public/data/compounds.json', 'utf8'));

const badHerbs = herbs.map(r => r.slug).filter(slug => slug && slug.includes(' '));
const badCompounds = compounds.map(r => r.slug).filter(slug => slug && slug.includes(' '));

console.log('Bad herb slugs:', badHerbs);
console.log('Bad compound slugs:', badCompounds);
