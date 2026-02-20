/**
 * Storage Service
 * Handles all chrome.storage.local operations
 * 
 * Storage Keys:
 * - lastShownDate: Date when reminder was last shown (YYYY-MM-DD)
 * - reminderId: ID of the current reminder (e.g., "quran_262" or "hadith_45")
 * - language: User's preferred language ("arabic", "english", "urdu")
 * - streak: Current streak count
 * - lastCompletedDate: Last date user marked as completed (YYYY-MM-DD)
 * - cachedReminder: Cached reminder content for the day
 * - cachedPrayerTimes: Cached prayer times for the day
 */

import { getTodayDateString, isToday, isYesterday } from '../utils/dateUtils.js';

// Default values for initial state
const DEFAULTS = {
  language: 'arabic',
  streak: 0,
  lastCompletedDate: null,
  lastShownDate: null,
  reminderId: null
};

/**
 * Get a value from storage with optional default
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Promise<*>}
 */
export async function get(key, defaultValue = null) {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] !== undefined ? result[key] : defaultValue;
  } catch (error) {
    console.error(`Storage get error for ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Set a value in storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {Promise<void>}
 */
export async function set(key, value) {
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (error) {
    console.error(`Storage set error for ${key}:`, error);
    throw error;
  }
}

/**
 * Get multiple values from storage
 * @param {string[]} keys - Array of keys to retrieve
 * @returns {Promise<Object>}
 */
export async function getMultiple(keys) {
  try {
    return await chrome.storage.local.get(keys);
  } catch (error) {
    console.error('Storage getMultiple error:', error);
    return {};
  }
}

/**
 * Set multiple values in storage
 * @param {Object} items - Object with key-value pairs
 * @returns {Promise<void>}
 */
export async function setMultiple(items) {
  try {
    await chrome.storage.local.set(items);
  } catch (error) {
    console.error('Storage setMultiple error:', error);
    throw error;
  }
}

// ============================================
// Language Preference
// ============================================

/**
 * Get user's preferred language
 * @returns {Promise<string>} "arabic" | "english" | "urdu"
 */
export async function getLanguage() {
  return await get('language', DEFAULTS.language);
}

/**
 * Set user's preferred language
 * @param {string} lang - "arabic" | "english" | "urdu"
 */
export async function setLanguage(lang) {
  await set('language', lang);
}

// ============================================
// Streak Management
// ============================================

/**
 * Get current streak data
 * @returns {Promise<{streak: number, lastCompletedDate: string|null, completedToday: boolean}>}
 */
export async function getStreakData() {
  const data = await getMultiple(['streak', 'lastCompletedDate']);
  const streak = data.streak || DEFAULTS.streak;
  const lastCompletedDate = data.lastCompletedDate || DEFAULTS.lastCompletedDate;
  const completedToday = lastCompletedDate ? isToday(lastCompletedDate) : false;

  return {
    streak,
    lastCompletedDate,
    completedToday
  };
}

/**
 * Mark today as completed and update streak
 * @returns {Promise<{streak: number, alreadyCompleted: boolean}>}
 */
export async function markTodayComplete() {
  const today = getTodayDateString();
  const data = await getMultiple(['streak', 'lastCompletedDate']);
  
  const lastCompletedDate = data.lastCompletedDate;
  
  // Already completed today
  if (lastCompletedDate === today) {
    return {
      streak: data.streak || 0,
      alreadyCompleted: true
    };
  }

  let newStreak;

  if (lastCompletedDate && isYesterday(lastCompletedDate)) {
    // Consecutive day - increment streak
    newStreak = (data.streak || 0) + 1;
  } else {
    // Streak broken or first completion - start at 1
    newStreak = 1;
  }

  await setMultiple({
    streak: newStreak,
    lastCompletedDate: today
  });

  return {
    streak: newStreak,
    alreadyCompleted: false
  };
}

/**
 * Check if streak should be reset (missed a day)
 * This is called on app load to ensure streak accuracy
 * @returns {Promise<number>} Current valid streak
 */
export async function validateStreak() {
  const data = await getMultiple(['streak', 'lastCompletedDate']);
  const lastCompletedDate = data.lastCompletedDate;
  const currentStreak = data.streak || 0;

  // No completion history
  if (!lastCompletedDate) {
    return 0;
  }

  // Completed today - streak is valid
  if (isToday(lastCompletedDate)) {
    return currentStreak;
  }

  // Completed yesterday - streak is still valid (not yet confirmed today)
  if (isYesterday(lastCompletedDate)) {
    return currentStreak;
  }

  // Missed more than one day - reset streak
  await set('streak', 0);
  return 0;
}

// ============================================
// Daily Reminder Caching
// ============================================

/**
 * Get cached reminder if it's for today
 * @returns {Promise<Object|null>} Cached reminder or null if expired
 */
export async function getCachedReminder() {
  const data = await getMultiple(['cachedReminder', 'lastShownDate']);
  
  // Check if cache is for today
  if (data.lastShownDate && isToday(data.lastShownDate) && data.cachedReminder) {
    return data.cachedReminder;
  }

  return null;
}

/**
 * Cache reminder for the day
 * @param {Object} reminder - Reminder object with all translations
 */
export async function cacheReminder(reminder) {
  const today = getTodayDateString();
  await setMultiple({
    cachedReminder: reminder,
    lastShownDate: today,
    reminderId: reminder.id
  });
}

// ============================================
// Prayer Times Caching
// ============================================

/**
 * Get cached prayer times if for today
 * @returns {Promise<Object|null>}
 */
export async function getCachedPrayerTimes() {
  const data = await getMultiple(['cachedPrayerTimes', 'prayerTimesDate']);
  
  if (data.prayerTimesDate && isToday(data.prayerTimesDate) && data.cachedPrayerTimes) {
    return data.cachedPrayerTimes;
  }

  return null;
}

/**
 * Cache prayer times for the day
 * @param {Object} times - Prayer times object
 */
export async function cachePrayerTimes(times) {
  const today = getTodayDateString();
  await setMultiple({
    cachedPrayerTimes: times,
    prayerTimesDate: today
  });
}

// ============================================
// Location (City/Country) Settings
// ============================================

/**
 * Get saved location settings (city & country)
 * @returns {Promise<{city: string|null, country: string|null}>}
 */
export async function getLocationSettings() {
  const data = await getMultiple(['locationCity', 'locationCountry']);
  return {
    city: data.locationCity || null,
    country: data.locationCountry || null
  };
}

/**
 * Save location settings (city & country)
 * @param {string} city
 * @param {string} country
 */
export async function setLocationSettings(city, country) {
  await setMultiple({
    locationCity: city,
    locationCountry: country
  });
}
