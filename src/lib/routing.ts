export const toHash = (path: string): string => {
  if (!path) return "#/";
  if (path.startsWith("#/")) return path;
  if (path.startsWith("#")) return path.startsWith("#/") ? path : `#/${path.slice(1)}`;
  if (path.startsWith("/")) return `#${path}`;
  return `#/${path}`;
};
