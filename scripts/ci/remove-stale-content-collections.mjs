import fs from 'node:fs'
const path = 'package.json'
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'))
delete pkg.dependencies?.['content-collections']
delete pkg.devDependencies?.['content-collections']
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n')
