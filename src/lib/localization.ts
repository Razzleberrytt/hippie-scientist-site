import type { Metadata } from 'next'
import { buildPageMetadata } from './seo'

export type LocalizedLink = {
  href: string
  label: string
  note?: string
}

export type LocalizedSection = {
  title: string
  body: string
  bullets?: readonly string[]
  links?: readonly LocalizedLink[]
}

export type LocalizedPageData = {
  path: string
  eyebrow: string
  title: string
  description: string
  intro: string
  sections: readonly LocalizedSection[]
  primaryCta?: LocalizedLink
  secondaryCta?: LocalizedLink
}

export type LocalizedUiCopy = {
  translationNotice: string
  nextStepLabel: string
  nextStepBody: string
  educationDisclaimer: string
}

export type LocaleSeoConfig = {
  openGraphLocale: string
  alternateOpenGraphLocales?: readonly string[]
}

export function buildLocalizedPageMetadata(
  page: LocalizedPageData,
  config: LocaleSeoConfig,
): Metadata {
  const metadata = buildPageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    openGraphType: 'website',
  })

  return {
    ...metadata,
    openGraph: metadata.openGraph
      ? {
          ...metadata.openGraph,
          locale: config.openGraphLocale,
          alternateLocale: [...(config.alternateOpenGraphLocales ?? [])],
        }
      : metadata.openGraph,
  }
}
