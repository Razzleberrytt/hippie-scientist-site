# Mental-health guide SEO standard

Mental-health guide pages use the shared `MentalHealthArticlePage` renderer and the data registry in `lib/mental-health-articles.ts`.

## Required page signals

- Unique, descriptive SEO title between 30 and 65 characters.
- Unique meta description between 110 and 190 characters.
- Lowercase, hyphen-separated canonical slug.
- Index/follow robots directives with unrestricted Google snippet and image previews.
- Canonical URL, Open Graph metadata, Twitter card metadata, author, publisher, and category fields.
- Article, FAQ, and Breadcrumb structured data.
- A concrete 1200×630 image in Article structured data.
- Visible H1, descriptive section headings, an on-page contents menu, and related internal links.
- Citation-backed claims and a full visible reference list.

## Hub signals

The mental-health hub publishes CollectionPage, ItemList, and Breadcrumb structured data and links to every guide in the collection.

## Build-time enforcement

The mental-health registry rejects malformed slugs, duplicate SEO titles, duplicate meta descriptions, titles or descriptions outside the accepted length ranges, unresolved citations, duplicate references, malformed reference URLs, and articles below the minimum depth standard.
