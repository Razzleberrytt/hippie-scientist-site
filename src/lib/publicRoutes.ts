export const PUBLIC_ROUTES = {
  home: '/',
  herbs: '/herbs',
  compounds: '/compounds',
  build: '/build',
  blog: '/blog',
  learning: '/learning',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  disclaimer: '/disclaimer',
} as const

export type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES]

export const PRIMARY_NAV_LINKS: ReadonlyArray<{ href: PublicRoute; label: string }> = [
  { href: PUBLIC_ROUTES.home, label: 'Home' },
  { href: PUBLIC_ROUTES.herbs, label: 'Herbs' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: PUBLIC_ROUTES.blog, label: 'Blog' },
  { href: PUBLIC_ROUTES.learning, label: 'Learning' },
  { href: PUBLIC_ROUTES.about, label: 'About' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
]

export const PRIMARY_FOOTER_LINKS: ReadonlyArray<{ href: PublicRoute; label: string }> = [
  { href: PUBLIC_ROUTES.herbs, label: 'Herbs' },
  { href: PUBLIC_ROUTES.compounds, label: 'Compounds' },
  { href: PUBLIC_ROUTES.build, label: 'Build' },
  { href: PUBLIC_ROUTES.blog, label: 'Blog' },
  { href: PUBLIC_ROUTES.learning, label: 'Learning' },
  { href: PUBLIC_ROUTES.about, label: 'About' },
  { href: PUBLIC_ROUTES.contact, label: 'Contact' },
  { href: PUBLIC_ROUTES.disclaimer, label: 'Disclaimer' },
  { href: PUBLIC_ROUTES.privacy, label: 'Privacy' },
]
