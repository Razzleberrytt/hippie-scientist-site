import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\scratch\\audit-full-utf8.txt';
try {
  const content = fs.readFileSync(filePath, 'utf8');
  const destPath = path.join(__dirname, 'clean-audit-report.md');
  fs.writeFileSync(destPath, content, 'utf8');
  console.log('Successfully wrote to', destPath);
} catch (e) {
  console.error('Error:', e);
}
