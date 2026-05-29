import fs from 'fs';
import path from 'path';

const scratchDir = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\scratch';

const files = [
  'audit-full-utf8.txt',
  'audit-full.txt',
  'audit-text-utf8.txt',
  'audit-text.txt',
  'audit-utf8.txt'
];

files.forEach(f => {
  const p = path.join(scratchDir, f);
  if (!fs.existsSync(p)) return;
  const buf = fs.readFileSync(p);
  // Detect if it is UTF-16 LE (starts with FF FE) or UTF-8
  let isUtf16 = buf[0] === 0xFF && buf[1] === 0xFE;
  let content = isUtf16 ? buf.toString('utf16le') : buf.toString('utf8');
  
  console.log(`=== File: ${f} (UTF-16: ${isUtf16}, Size: ${buf.length}) ===`);
  console.log('Sample content (first 300 chars):');
  console.log(content.slice(0, 300).replace(/\r\n/g, ' '));
  
  // Search for specific headings or strings
  const occurrences = [];
  const terms = ['###', 'CRITICAL BUGS', 'Total confirmed issues', 'www vs non-www'];
  terms.forEach(t => {
    let idx = 0;
    let count = 0;
    while ((idx = content.indexOf(t, idx)) !== -1) {
      count++;
      idx += t.length;
    }
    occurrences.push(`${t}: ${count}`);
  });
  console.log('Occurrences:', occurrences.join(', '));
  console.log('\n');
});
