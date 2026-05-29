import fs from 'fs';
import path from 'path';

const appDir = 'app';
const matches = [];

function scan(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      const hasDarkClasses = content.includes('text-white') || content.includes('border-white') || content.includes('bg-white/[0.03]') || content.includes('bg-white/[0.04]') || content.includes('bg-white/5') || content.includes('text-emerald-100');
      // Exclude globals.css and layout.tsx if they are expected, but let's look at all files in app
      if (hasDarkClasses && !p.includes('globals.css') && !p.includes('layout.tsx') && !p.includes('scratch') && !p.includes('node_modules')) {
        matches.push(p);
      }
    }
  });
}

try {
  scan(appDir);
  console.log('Found files with dark-mode classes in app/:');
  matches.forEach(m => console.log(m));
} catch (e) {
  console.error(e);
}
