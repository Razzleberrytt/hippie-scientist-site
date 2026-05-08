import { generateCollectionMetadata, ScientificCollectionPage } from '../scientific-collection-page'

const slug = 'cholinergic-compounds'

export function generateMetadata() {
  return generateCollectionMetadata(slug)
}

export default function Page() {
  return <ScientificCollectionPage slug={slug} />
}
