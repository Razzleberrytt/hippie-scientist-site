export const has = (v: any) => (Array.isArray(v) ? v.length > 0 : !!v);
export const list = (arr?: string[], max?: number) =>
  Array.isArray(arr) ? (max ? arr.slice(0, max) : arr).join(", ") : "";
export const bullets = (arr?: string[]) =>
  Array.isArray(arr) ? arr.filter(Boolean) : [];
export const urlish = (s: string) => /^https?:\/\//i.test(s);
