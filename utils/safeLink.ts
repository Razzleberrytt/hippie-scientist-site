export function isValidSlug(slug: any): boolean {
  return typeof slug === "string" && slug.length > 0
}
