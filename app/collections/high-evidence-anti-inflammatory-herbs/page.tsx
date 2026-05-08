import { generateCollectionMetadata, ScientificCollectionPage } from '../scientific-collection-page'

const slug = 'high-evidence-anti-inflammatory-herbs'

export function generateMetadata() {
  return generateCollectionMetadata(slug)
}

export default function Page() {
  return <ScientificCollectionPage slug={slug} />
}
