export function hashLink(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return "/#/";
  }

  if (trimmed.startsWith("/#")) {
    return trimmed;
  }

  if (trimmed.startsWith("#/")) {
    return `/${trimmed}`;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `/#${normalized}`;
}
