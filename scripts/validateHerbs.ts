import fs from 'fs'
import path from 'path'

const file = path.join(__dirname, '..', 'data', 'herbs.json')
const data = fs.readFileSync(file, 'utf-8')
const herbs = JSON.parse(data)

function isString(v: any): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

let invalid = 0
herbs.forEach((herb: any, index: number) => {
  const errors: string[] = []
  if (!isString(herb.name)) errors.push('name')
  if (!Array.isArray(herb.effects) || !herb.effects.every(isString)) {
    errors.push('effects')
  }
  if (herb.slug != null && !isString(herb.slug)) errors.push('slug')
  if (herb.category != null && !isString(herb.category)) errors.push('category')
  if (herb.region != null && !isString(herb.region)) errors.push('region')
  if (herb.tags != null && !Array.isArray(herb.tags)) errors.push('tags')
  if (errors.length) {
    console.warn(`Entry ${index} invalid: ${errors.join(', ')}`)
    invalid++
  }
})

if (invalid) {
  console.log(`Found ${invalid} invalid herb entries.`)
  process.exitCode = 1
} else {
  console.log('All herb entries valid.')
}
