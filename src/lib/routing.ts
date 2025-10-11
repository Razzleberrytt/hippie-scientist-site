export const toHash = (path: string): string => {
  if (!path || path === "/" || path === "#" || path === "#/" || path === "/#/") return "/#/";
  if (path.startsWith("http") || path.includes("://") || path.startsWith("mailto:")) return path;
  if (path.startsWith("tel:")) return path;
  if (path.startsWith("/#/")) return path;
  if (path.startsWith("#/")) return `/${path}`;
  if (path.startsWith("#")) {
    const rest = path.slice(1);
    return rest.startsWith("/") ? `/#${rest}` : `/#/${rest}`;
  }
  if (path.startsWith("/")) {
    const trimmed = path.replace(/^\/+/, "");
    return trimmed ? `/#/${trimmed}` : "/#/";
  }
  const trimmed = path.replace(/^\/+/, "");
  return trimmed ? `/#/${trimmed}` : "/#/";
};
