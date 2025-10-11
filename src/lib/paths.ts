export const href = (path: string) => `#${path.startsWith('/') ? path : `/${path}`}`;
