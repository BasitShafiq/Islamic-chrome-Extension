/**
 * Hadith Service
 * Provides hadith from Riyad as-Salihin
 * Uses static JSON fallback for reliability
 */

import { getDailyIndex } from '../utils/dateUtils.js';
import { HADITH_COLLECTION } from '../data/hadithData.js';

/**
 * Get hadith index for today
 * @returns {number}
 */
function getTodaysHadithIndex() {
  return getDailyIndex() % HADITH_COLLECTION.length;
}

/**
 * Get today's hadith reminder
 * @returns {Promise<Object>}
 */
export async function getTodaysHadithReminder() {
  const index = getTodaysHadithIndex();
  const hadith = HADITH_COLLECTION[index];
  
  return {
    id: `hadith_${hadith.number}`,
    type: 'hadith',
    arabic: hadith.arabic,
    english: hadith.english,
    urdu: hadith.urdu,
    reference: hadith.reference,
    title: hadith.title
  };
}

/**
 * Get hadith by specific number
 * @param {number} number - Hadith number in collection
 * @returns {Object|null}
 */
export function getHadithByNumber(number) {
  return HADITH_COLLECTION.find(h => h.number === number) || null;
}
