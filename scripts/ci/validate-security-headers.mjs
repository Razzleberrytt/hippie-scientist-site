import fs from 'node:fs'
const headers=fs.readFileSync('public/_headers','utf8')
const req=['Content-Security-Policy','X-Content-Type-Options: nosniff','X-Frame-Options: DENY','Referrer-Policy: strict-origin-when-cross-origin','Permissions-Policy: camera=()','Strict-Transport-Security']
const missing=req.filter(x=>!headers.includes(x))
if(missing.length){console.error('Missing security headers:\n'+missing.join('\n'));process.exit(1)}
console.log('validate-security-headers: OK (targets present in public/_headers)')
