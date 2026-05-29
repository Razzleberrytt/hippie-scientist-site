import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'clean-audit-report.md');
try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find where the JSON starts. In our file, it starts with {"step_index":6830
  const jsonStart = content.indexOf('{"step_index":6830');
  if (jsonStart === -1) {
    throw new Error('Could not find JSON start');
  }
  
  const jsonStr = content.slice(jsonStart);
  const parsed = JSON.parse(jsonStr.trim());
  
  const destPath = path.join(__dirname, 'clean-audit.md');
  fs.writeFileSync(destPath, parsed.content, 'utf8');
  console.log('Successfully extracted clean audit to:', destPath);
} catch (e) {
  console.error('Error parsing JSON:', e);
}
