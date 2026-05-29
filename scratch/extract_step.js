import fs from 'fs';
import readline from 'readline';

const filePath = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\.system_generated\\logs\\transcript.jsonl';
const targetStep = 6830;

async function run() {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes(`"step_index":${targetStep}`) || line.includes(`"step_index": ${targetStep}`)) {
      try {
        const obj = JSON.parse(line);
        const destPath = 'c:\\hippies\\scratch\\full-audit-from-log.md';
        fs.writeFileSync(destPath, obj.content, 'utf8');
        console.log('Successfully wrote untruncated step to', destPath);
        return;
      } catch (e) {
        console.error('Error parsing line:', e);
      }
    }
  }
  console.log('Step not found in transcript');
}

run();
