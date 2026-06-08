export function AffiliateDisclosure() {
  return (
    <p className="mb-2 text-xs text-muted-foreground">
      <span className="font-medium">Affiliate disclosure:</span> Links below
      may earn us a small commission at no extra cost to you.{' '}
      <a href="/affiliate-disclosure" className="underline hover:no-underline">
        Learn more
      </a>
      .
    </p>
  )
}

export { default } from '../../components/AffiliateDisclosure'
