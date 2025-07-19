import type { Herb } from '../types'
import raw from '../../Full200.json?raw'

let herbs: Herb[] = []
try {
  const cleaned = raw.replace(/NaN/g, 'null')
  herbs = JSON.parse(cleaned) as Herb[]
} catch (err) {
  console.error('Failed to load herb data', err)
  herbs = []
}

export default herbs
export { herbs }
