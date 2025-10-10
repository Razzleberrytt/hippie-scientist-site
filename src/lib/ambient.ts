export function intensityHue(intensity?: string) {
  const i = (intensity||"").toLowerCase();
  if (i.includes("mild")) return 90;       // lime
  if (i.includes("moderate")) return 195;  // teal
  if (i.includes("strong")) return 280;    // purple
  if (i.includes("toxic")) return 8;       // red
  return 200; // default sky
}
