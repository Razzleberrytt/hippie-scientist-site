import fs from 'fs';
import path from 'path';

const file99a5 = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\scratch\\subagent-99a5-full.md';
try {
  if (fs.existsSync(file99a5)) {
    const content = fs.readFileSync(file99a5, 'utf8');
    console.log('99a5 Full Size:', content.length);
    // Find lines with audit or search results
    const lines = content.split('\n');
    let auditCount = 0;
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes('audit') || line.toLowerCase().includes('remediation') || line.toLowerCase().includes('phase')) {
        auditCount++;
        if (auditCount < 30) {
          console.log(`Line ${i}: ${line.slice(0, 120)}`);
        }
      }
    });
    console.log('Total matching lines in 99a5:', auditCount);
  } else {
    console.log('99a5 file does not exist');
  }
} catch (e) {
  console.error(e);
}
