import fs from 'node:fs';
import path from 'node:path';

const mapsDir = 'public/data/runtime-maps';
const files = fs.readdirSync(mapsDir);

for (const file of files) {
  if (file.endsWith('.json')) {
    const filePath = path.join(mapsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const badKeys = [];
    const badTargetSlugs = [];

    for (const [key, value] of Object.entries(content)) {
      if (key.includes(' ')) {
        badKeys.push(key);
      }
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (entry?.slug && entry.slug.includes(' ')) {
            badTargetSlugs.push({ key, target: entry.slug });
          }
        }
      }
    }

    if (badKeys.length > 0) {
      console.log(`File: ${file} has bad source keys:`, badKeys);
    }
    if (badTargetSlugs.length > 0) {
      console.log(`File: ${file} has bad target slugs:`, badTargetSlugs.slice(0, 10));
    }
  }
}
