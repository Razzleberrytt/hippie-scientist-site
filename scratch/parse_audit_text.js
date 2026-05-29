import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\scratch\\audit-text.txt';
try {
  let content = fs.readFileSync(filePath, 'utf16le');
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFE) {
    content = content.slice(1);
  }
  
  // Let's parse JSON lines or single line
  const lines = content.split('\n').filter(Boolean);
  console.log('Number of lines:', lines.length);
  
  lines.forEach((line, index) => {
    try {
      const obj = JSON.parse(line.trim());
      console.log(`Line ${index} parsed. Type: ${obj.type}, Content Length: ${obj.content ? obj.content.length : 'N/A'}`);
      if (obj.content && obj.content.includes('<USER_REQUEST>')) {
        const destPath = `c:\\hippies\\scratch\\audit-user-request-${index}.md`;
        fs.writeFileSync(destPath, obj.content, 'utf8');
        console.log('Wrote user request to:', destPath);
      }
    } catch (e) {
      console.error(`Error parsing line ${index}:`, e.message);
    }
  });
} catch (e) {
  console.error('Error:', e);
}
