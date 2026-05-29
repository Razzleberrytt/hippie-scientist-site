import fs from 'fs';
import path from 'path';

const topDir = 'app/top';
try {
  const dirs = fs.readdirSync(topDir);
  dirs.forEach(d => {
    const pagePath = path.join(topDir, d, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf8');
      const hasTextWhite = content.includes('text-white') || content.includes('border-white') || content.includes('bg-white/[0.04]') || content.includes('bg-white/[0.035]');
      console.log(`Page: ${d}/page.tsx, has dark-mode styles: ${hasTextWhite}`);
    }
  });
} catch (e) {
  console.error(e);
}
