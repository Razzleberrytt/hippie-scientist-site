function s(r,t){if(r==null)return t;if(Array.isArray(t))return Array.isArray(r)?r:[];if(typeof r=="string"){const n=r.trim();return n===""||n==="N/A"?t:r}return r}export{s};
