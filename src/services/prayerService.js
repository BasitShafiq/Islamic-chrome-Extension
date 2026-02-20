/**
 * Prayer Times Service
 * Fetches prayer times from Aladhan API
 * Only checks when tab loads - no background polling
 */

import { timeStringToMinutes, getCurrentTimeMinutes, getTodayDateString } from '../utils/dateUtils.js';
import { getCachedPrayerTimes, cachePrayerTimes, getLocationSettings } from '../storage/storageService.js';

// Prayer names and their window (in minutes) for "just entered" notification
const PRAYERS = {
  Fajr: { name: 'Fajr', window: 30 },
  Dhuhr: { name: 'Dhuhr', window: 30 },
  Asr: { name: 'Asr', window: 30 },
  Maghrib: { name: 'Maghrib', window: 15 },  // Shorter window as Maghrib is time-sensitive
  Isha: { name: 'Isha', window: 30 }
};

/**
 * Fetch prayer times from Aladhan API
 * @param {Object} location - Location with latitude and longitude
 * @returns {Promise<Object>} Prayer times object
 */
async function fetchPrayerTimes(location) {
  try {
    const today = new Date();
    const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    // Using city-based endpoint (user provides city & country in settings)
    if (!location || !location.city || !location.country) {
      throw new Error('Location (city/country) not set');
    }
    const city = encodeURIComponent(location.city);
    const country = encodeURIComponent(location.country);
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200 || !data.data) {
      throw new Error('Invalid API response');
    }

    // Extract relevant prayer times
    const timings = data.data.timings;
    
    return {
      Fajr: timings.Fajr,
      Sunrise: timings.Sunrise,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
      date: getTodayDateString()
    };

  } catch (error) {
    console.error('Prayer times API error:', error);
    throw error;
  }
}

/**
 * Get prayer times for today (from cache or API)
 * @returns {Promise<Object|null>}
 */
export async function getTodaysPrayerTimes() {
  // Try cache first
  const cached = await getCachedPrayerTimes();
  if (cached) {
    return cached;
  }

  // Fetch from API
  try {
    const location = await getLocationSettings();
    if (!location || !location.city || !location.country) {
      return null
    }
    const times = await fetchPrayerTimes(location);
    
    // Cache for the day
    await cachePrayerTimes(times);
    
    return times;
  } catch (error) {
    console.error('Failed to get prayer times:', error);
    return null;
  }
}

/**
 * Check if any prayer time has just entered
 * Returns the prayer name if within the notification window
 * @returns {Promise<{prayer: string, time: string}|null>}
 */
export async function checkCurrentPrayer() {
  try {
    const times = await getTodaysPrayerTimes();
    
    if (!times) {
      return null;
    }

    const currentMinutes = getCurrentTimeMinutes();

    // Check each prayer
    for (const [prayerKey, config] of Object.entries(PRAYERS)) {
      const prayerTime = times[prayerKey];
      
      if (!prayerTime) continue;

      const prayerMinutes = timeStringToMinutes(prayerTime);
      
      // Check if current time is within the window after prayer entry
      const timeSincePrayer = currentMinutes - prayerMinutes;
      
      if (timeSincePrayer >= 0 && timeSincePrayer <= config.window) {
        return {
          prayer: config.name,
          time: prayerTime
        };
      }
    }

    return null;

  } catch (error) {
    console.error('Error checking prayer time:', error);
    return null;
  }
}

/**
 * Get the next prayer time
 * @returns {Promise<{prayer: string, time: string}|null>}
 */
export async function getNextPrayer() {
  try {
    const times = await getTodaysPrayerTimes();
    
    if (!times) {
      return null;
    }

    const currentMinutes = getCurrentTimeMinutes();

    // Find next prayer
    for (const [prayerKey, config] of Object.entries(PRAYERS)) {
      const prayerTime = times[prayerKey];
      
      if (!prayerTime) continue;

      const prayerMinutes = timeStringToMinutes(prayerTime);
      
      if (prayerMinutes > currentMinutes) {
        return {
          prayer: config.name,
          time: prayerTime
        };
      }
    }

    // All prayers passed, next is Fajr tomorrow
    return {
      prayer: 'Fajr',
      time: times.Fajr,
      tomorrow: true
    };

  } catch (error) {
    console.error('Error getting next prayer:', error);
    return null;
  }
}
