/**
 * Conservative document-level soft-404 heuristic.
 *
 * Scientific articles often correctly say a trial, PK map or epidemiology
 * "does not exist". That is an evidence limitation, NOT a page-not-found.
 * HTTP 404/410, sitemap URLs, canonicals and redirects are checked elsewhere.
 */
function plainText(html){
  return String(html||'')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&(?:nbsp|#160);/gi,' ')
    .replace(/\s+/g,' ').trim().toLowerCase()
}

function taggedTexts(html,tag){
  const expression=new RegExp('<'+tag+'\\b[^>]*>([\\s\\S]*?)<\\/'+tag+'>','gi')
  return [...String(html||'').matchAll(expression)].map(match=>plainText(match[1]))
}

const pageErrorHeading=/^(?:404(?:\b|:)|not found\b|page not found\b|content not found\b|(?:the|this|requested) page (?:does not exist|was not found|could not be found)\b)/
const pageErrorBody=/\b(?:sorry[,!:\s]*)?(?:we (?:couldn['’]?t|cannot) find (?:the|this|that|your) page|(?:this|the|requested) page (?:does not exist|was not found|could not be found))\b/

export function looksLikeSoft404Page(html){
  const doc=String(html||'')
  if(taggedTexts(doc,'title').some(heading=>pageErrorHeading.test(heading)))return true
  if(taggedTexts(doc,'h1').some(heading=>pageErrorHeading.test(heading)))return true
  const main=doc.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||''
  // A document-level error banner appears near the start of the main content.
  // Searching the entire page would misclassify scientific absence language.
  return pageErrorBody.test(plainText(main).slice(0,420))
}
