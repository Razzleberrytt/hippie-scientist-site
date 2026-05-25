import fs from 'node:fs';

const html = fs.readFileSync('out/herbs/yohimbe/index.html', 'utf8');
let index = 0;
while (true) {
  index = html.indexOf('/compounds/coenzyme q10/', index);
  if (index === -1) break;
  console.log(`\nOccurrence at index ${index}:`);
  console.log(html.substring(Math.max(0, index - 200), Math.min(html.length, index + 200)));
  index += '/compounds/coenzyme q10/'.length;
}
