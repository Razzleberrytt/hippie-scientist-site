import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  console.log('outDir does not exist');
  process.exit(0);
}

console.log('Auditing HTML files in:', outDir);
let count = 0;

function checkHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (['_next', 'blogdata'].includes(entry.name)) continue;
      console.log(`Entering directory: ${res}`);
      checkHtmlFiles(res);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      count++;
      console.log(`[${count}] Reading: ${res}`);
      const html = fs.readFileSync(res, 'utf8');
      if (!html.includes('"FAQPage"')) continue;
      
      console.log(`Found FAQPage in: ${res}`);
      const faqSchemaMatches = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
      console.log(`Matches: ${faqSchemaMatches.length}`);
    }
  }
}

checkHtmlFiles(outDir);
console.log(`Total HTML files audited: ${count}`);
