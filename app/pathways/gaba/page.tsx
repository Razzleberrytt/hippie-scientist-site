import { PathwayHub, generatePathwayMetadata } from '../pathway-hub'

export const metadata = generatePathwayMetadata('gaba')

export default async function GabaPathwayPage() {
  return PathwayHub({ pathway: 'gaba' })
}
