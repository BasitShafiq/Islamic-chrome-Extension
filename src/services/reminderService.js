/**
 * Reminder Service
 * Combines Quran and Hadith services
 * Handles daily reminder logic with caching
 */

import { getDailyIndex } from '../utils/dateUtils.js';
import { getCachedReminder, cacheReminder } from '../storage/storageService.js';
import { getTodaysQuranReminder } from './quranService.js';
import { getTodaysHadithReminder } from './hadithService.js';

/**
 * Determine whether to show Quran or Hadith today
 * Alternates based on day to provide variety
 * @returns {'quran' | 'hadith'}
 */
function getTodaysContentType() {
  // Use daily index to alternate between Quran and Hadith
  // This gives roughly 50/50 split with some variation
  const index = getDailyIndex();
  return index % 2 === 0 ? 'quran' : 'hadith';
}

/**
 * Get today's reminder (from cache or fetch new)
 * This is the main entry point for reminder content
 * @returns {Promise<Object>}
 */
export async function getTodaysReminder() {
  // Check cache first for instant load
  const cached = await getCachedReminder();
  if (cached) {
    return cached;
  }

  // Determine content type for today
  const contentType = getTodaysContentType();
  
  let reminder;

  // Always try hadith first as fallback (local, guaranteed to work)
  const hadithReminder = await getTodaysHadithReminder();

  if (contentType === 'quran') {
    try {
      reminder = await getTodaysQuranReminder();
    } catch (error) {
      console.log('Quran API unavailable, using hadith:', error.message);
      reminder = hadithReminder;
    }
  } else {
    reminder = hadithReminder;
  }

  // Cache the reminder for the day
  await cacheReminder(reminder);

  return reminder;
}

/**
 * Force refresh the reminder (for testing/debugging)
 * @returns {Promise<Object>}
 */
export async function refreshReminder() {
  const contentType = getTodaysContentType();
  
  let reminder;
  
  if (contentType === 'quran') {
    reminder = await getTodaysQuranReminder();
  } else {
    reminder = await getTodaysHadithReminder();
  }

  await cacheReminder(reminder);
  return reminder;
}
