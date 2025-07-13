import herbsDataRaw from './herbs.json';
import type { Herb } from '../types/Herb';

/**
 * Full herb database loaded from JSON.
 * Each object in herbsDataRaw conforms to the Herb interface.
 */
export const herbsData: Herb[] = herbsDataRaw;
