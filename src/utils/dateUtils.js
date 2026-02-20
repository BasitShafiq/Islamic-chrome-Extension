/**
 * Date Utilities
 * Helper functions for date comparison and formatting
 */

/**
 * Get today's date string in YYYY-MM-DD format (local time)
 * @returns {string} Date string
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string represents today (local time)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function isToday(dateString) {
  return dateString === getTodayDateString();
}

/**
 * Check if a date string represents yesterday (local time)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function isYesterday(dateString) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return dateString === `${year}-${month}-${day}`;
}

/**
 * Get a deterministic number from today's date (for selecting daily content)
 * This ensures the same content is shown throughout the day
 * @returns {number} A number derived from today's date
 */
export function getDailyIndex() {
  const today = getTodayDateString();
  // Simple hash from date string to get a consistent number
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    const char = today.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Parse a time string (HH:MM or HH:MM:SS) to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export function timeStringToMinutes(timeString) {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Get current time as minutes since midnight
 * @returns {number}
 */
export function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Format time string for display
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time (e.g., "5:30 PM")
 */
export function formatTimeForDisplay(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}
