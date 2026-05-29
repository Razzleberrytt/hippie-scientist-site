import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'clean-audit-report.md');
try {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('File length:', content.length);
  console.log('First 200 chars:', JSON.stringify(content.slice(0, 200)));
} catch (e) {
  console.error(e);
}
