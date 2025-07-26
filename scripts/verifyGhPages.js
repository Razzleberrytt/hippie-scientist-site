const { execSync } = require('child_process');
const fs = require('fs');

function run(command) {
  try {
    const output = execSync(command, { stdio: 'pipe' });
    console.log(output.toString());
    return output.toString();
  } catch (err) {
    console.error(`Error running "${command}":`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

try {
  console.log('Checking out gh-pages branch...');
  run('git checkout gh-pages');

  console.log('Listing files in gh-pages root:');
  const files = fs.readdirSync('.');
  files.forEach(f => console.log(f));

  if (!fs.existsSync('index.html')) {
    console.log('index.html not found. Running build and deploy...');
    run('npm run build');
    run('npm run deploy');
  } else {
    console.log('index.html exists. No action needed.');
  }
} catch (err) {
  console.error('An error occurred:', err.message);
}
