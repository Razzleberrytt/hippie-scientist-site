import fs from 'node:fs';

const html = fs.readFileSync('out/herbs/yohimbe/index.html', 'utf8');
const regex = /href="([^"]+)"/g;
let match;
while ((match = regex.exec(html)) !== null) {
  const href = match[1];
  if (href.includes('coenzyme') || href.includes('garlic') || href.includes('black') || href.includes('seed')) {
    console.log('Match found:', href);
  }
}
