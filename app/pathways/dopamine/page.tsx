import { PathwayHub, generatePathwayMetadata } from '../pathway-hub'

export const metadata = generatePathwayMetadata('dopamine')

export default async function DopaminePathwayPage() {
  return PathwayHub({ pathway: 'dopamine' })
}
