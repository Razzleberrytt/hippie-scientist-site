import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync('public/data/runtime-maps/ecosystem-map.json', 'utf8'))
const keys = Object.keys(data)
console.log(`Total keys: ${keys.length}`)
console.log("Sample keys:", keys.slice(0, 50))
console.log("Keys containing 'stress':", keys.filter(k => k.includes('stress')))
console.log("Keys containing 'sleep':", keys.filter(k => k.includes('sleep')))
console.log("Keys containing 'cogni':", keys.filter(k => k.includes('cogni')))
