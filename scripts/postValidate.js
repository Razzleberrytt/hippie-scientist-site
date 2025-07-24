const fs = require('fs')

/**
 * Secondary validation run after data transformations.
 * Exits with non-zero status if any issues remain.
 */

const herbs = JSON.parse(fs.readFileSync('src/data/herbs/herbs.json', 'utf8'))

let valid = true

for (const herb of herbs) {
  if (typeof herb.name !== 'string') {
    console.error('Missing or invalid name for entry:', herb)
    valid = false
  }
  if (!Array.isArray(herb.tags)) {
    console.error('Tags not array for', herb.name)
    valid = false
  }
  if (!Array.isArray(herb.effects)) {
    console.error('Effects not array for', herb.name)
    valid = false
  }
}

if (!valid) {
  console.error('Post validation failed')
  process.exit(1)
}

console.log('Post validation complete. Herbs:', herbs.length)
