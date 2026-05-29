import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\scratch\\audit-text.txt';
try {
  // Read as utf16le
  const rawContent = fs.readFileSync(filePath, 'utf16le');
  
  // Try to parse it as JSON since it starts with { "step_index": ...
  // Remove BOM if present
  let cleanContent = rawContent;
  if (cleanContent.charCodeAt(0) === 0xFEFF || cleanContent.charCodeAt(0) === 0xFFFE) {
    cleanContent = cleanContent.slice(1);
  }
  
  const parsed = JSON.parse(cleanContent);
  const destPath = path.join(__dirname, 'decoded-audit-report.md');
  fs.writeFileSync(destPath, parsed.content || parsed, 'utf8');
  console.log('Successfully wrote decoded content to', destPath);
} catch (e) {
  console.error('Error parsing/writing:', e);
  
  // If JSON parse fails, just write the raw utf16le content converted to utf8 string
  try {
    const rawContent = fs.readFileSync(filePath, 'utf16le');
    const destPath = path.join(__dirname, 'decoded-audit-report-fallback.md');
    fs.writeFileSync(destPath, rawContent, 'utf8');
    console.log('Wrote fallback content to', destPath);
  } catch (err) {
    console.error('Fallback error:', err);
  }
}
