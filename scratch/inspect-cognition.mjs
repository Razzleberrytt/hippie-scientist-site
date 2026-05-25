import fs from 'node:fs';

const html = fs.readFileSync('out/stacks/cognition/index.html', 'utf8');
const index = html.indexOf('/supernodes/acetylcholine-systems/');
if (index !== -1) {
  console.log(html.substring(Math.max(0, index - 200), Math.min(html.length, index + 200)));
} else {
  console.log('Link not found in the HTML file.');
}
