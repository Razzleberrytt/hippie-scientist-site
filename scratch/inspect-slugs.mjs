import { getUnifiedRuntimeRecords } from '../src/lib/runtime-record-index.ts';

const { allRecords } = await getUnifiedRuntimeRecords();

const badSlugs = allRecords.map(r => r.slug).filter(slug => slug && slug.includes(' '));
console.log('Unslugified slugs in allRecords:', badSlugs);
