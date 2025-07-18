import type { Herb } from '../types'
import raw from '../../Full100_extended.json?raw'

const cleaned = raw.replace(/NaN/g, 'null')
const herbs = JSON.parse(cleaned) as Herb[]

export default herbs
export { herbs }
