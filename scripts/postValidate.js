const fs = require('fs')
const herbs = JSON.parse(fs.readFileSync('src/data/herbs/herbs.json','utf8'))
herbs.forEach(herb => {
  console.assert(typeof herb.name === 'string', 'Missing name')
  console.assert(Array.isArray(herb.tags), 'Tags not array')
  console.assert(typeof herb.effects === 'string', 'Missing effects')
})
console.log('Post validation complete. Herbs:', herbs.length)
