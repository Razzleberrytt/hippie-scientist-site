import fs from 'node:fs';
import path from 'node:path';

const blogDir = 'content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

// Map of herb identification keywords (from filename/content) to correct active compounds
const correctActives = [
  { keys: ['cordyceps'], name: 'cordycepin' },
  { keys: ['valerian'], name: 'valerenic acid' },
  { keys: ['ashwagandha'], name: 'withanolides' },
  { keys: ['reishi'], name: 'ganoderic acids' },
  { keys: ['skullcap'], name: 'baicalin' },
  { keys: ['amanita'], name: 'muscimol' },
  { keys: ['damiana'], name: 'gonzalitosin' },
  { keys: ['kava'], name: 'kavalactones' },
  { keys: ['lion'], name: 'hericenones and erinacines' },
  { keys: ['mugwort'], name: 'vulgarin' },
  { keys: ['passionflower'], name: 'flavonoids and harmala alkaloids' },
  { keys: ['calea'], name: 'caleicines' },
  { keys: ['gotu-kola', 'gotu kola'], name: 'asiaticoside' },
  { keys: ['rhodiola'], name: 'rosavins and salidroside' },
  { keys: ['blue-lotus', 'blue lotus'], name: 'aporphine alkaloids' },
  { keys: ['turmeric', 'curcumin'], name: 'curcuminoids' }
];

// Hallucinated compound names to be replaced
const hallucinatedCompounds = [
  'Thujone', 'Harmine', 'Myriscin', 'Beta-caryophyllene', 'Mesembrine',
  'Apigenin', 'Hordenine', 'thujone', 'harmine', 'myriscin', 'beta-caryophyllene',
  'mesembrine', 'apigenin', 'hordenine', 'Myristicin', 'myristicin'
];

let fixedCount = 0;

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Determine herb type
  let matchedActive = null;
  const lowerFile = file.toLowerCase();
  
  // 1. Try filename match first (highly accurate)
  for (const item of correctActives) {
    if (item.keys.some(k => lowerFile.includes(k))) {
      matchedActive = item.name;
      break;
    }
  }
  
  // 2. Fallback to content match if no filename match
  if (!matchedActive) {
    for (const item of correctActives) {
      if (item.keys.some(k => content.toLowerCase().includes(k))) {
        matchedActive = item.name;
        break;
      }
    }
  }

  if (matchedActive) {
    for (const hc of hallucinatedCompounds) {
      const patterns = [
        `active compounds like ${hc}`,
        `compounds like ${hc}`
      ];

      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, `active compounds like ${matchedActive}`);
        }
      }
    }
  }

  // Also replace generic "active compounds like key active compounds"
  if (content.includes('active compounds like key active compounds')) {
    if (matchedActive) {
      content = content.replace(/active compounds like key active compounds/g, `active compounds like ${matchedActive}`);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${file} (matched: ${matchedActive})`);
    fixedCount++;
  }
}

console.log(`\nFinished: Fixed ${fixedCount} blog posts.`);
