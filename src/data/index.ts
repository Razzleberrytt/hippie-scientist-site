export { default as herbData } from './herbData'
export { herbBlurbs } from './herbs/blurbs'
export const herbs = herbData.filter(h => 'slug' in h)
export const compounds = herbData.filter(h => 'foundIn' in h)
export { learnSections } from "./learnContent.enrichedXL";
