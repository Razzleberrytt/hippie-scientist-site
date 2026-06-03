import fs from 'node:fs'
const headers=fs.readFileSync('public/_headers','utf8')
const req=['Content-Security-Policy',"object-src 'none'",'frame-ancestors','X-Content-Type-Options: nosniff','Referrer-Policy','Permissions-Policy','Strict-Transport-Security']
const missing=req.filter(x=>!headers.includes(x))
if(!headers.includes('X-Frame-Options: DENY') && !headers.includes("frame-ancestors 'none'")) missing.push('X-Frame-Options: DENY or frame-ancestors')
if(missing.length){console.error('Missing security headers:\n'+missing.join('\n'));process.exit(1)}
console.log('validate-security-headers: OK')
