/**
 * 1-Minute Deen - Service Worker
 * Handles background tasks:
 * - Badge notification for first open of day
 * - Badge notification for prayer times
 */

// Constants
const PRAYER_CHECK_ALARM = 'prayer-check';
const PRAYER_CHECK_INTERVAL = 40; // minutes

// Prayer windows (minutes after prayer time to show notification)
const PRAYERS = {
  Fajr: { window: 30 },
  Dhuhr: { window: 30 },
  Asr: { window: 30 },
  Maghrib: { window: 15 },
  Isha: { window: 30 }
};

/**
 * Get today's date string
 */
function getTodayString() {
  return new Date().toDateString();
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get current minutes since midnight
 */
function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Check if this is the first browser open today
 */
async function checkFirstOpenToday() {
  const result = await chrome.storage.local.get(['lastSeenDate', 'lastCompletedDate']);
  const today = getTodayString();
  
  // If user hasn't seen the reminder today
  if (result.lastSeenDate !== today) {
    // Show badge to prompt user to open
    await chrome.action.setBadgeText({ text: '1' });
    await chrome.action.setBadgeBackgroundColor({ color: '#4ecdc4' });
    return true;
  }
  
  return false;
}

/**
 * Check current prayer time and show badge if needed
 */
async function checkPrayerTime() {
  try {
    // Get cached prayer times
    const result = await chrome.storage.local.get(['cachedPrayerTimes', 'prayerTimesDate', 'lastPrayerNotified']);
    const today = new Date().toISOString().split('T')[0];
    
    // No cached times or outdated
    if (!result.cachedPrayerTimes || result.prayerTimesDate !== today) {
      return null;
    }

    const times = result.cachedPrayerTimes;
    const currentMinutes = getCurrentMinutes();
    const currentPrayerKey = `${today}-prayer`;

    // Check each prayer
    for (const [prayerName, config] of Object.entries(PRAYERS)) {
      const prayerTime = times[prayerName];
      if (!prayerTime) continue;

      const prayerMinutes = timeToMinutes(prayerTime);
      const timeSincePrayer = currentMinutes - prayerMinutes;

      // If prayer time just started (within window)
      if (timeSincePrayer >= 0 && timeSincePrayer <= config.window) {
        const notifyKey = `${currentPrayerKey}-${prayerName}`;
        
        // Only notify once per prayer
        if (result.lastPrayerNotified !== notifyKey) {
          await chrome.storage.local.set({ lastPrayerNotified: notifyKey });
          
          // Show prayer badge
          await chrome.action.setBadgeText({ text: '🕌' });
          await chrome.action.setBadgeBackgroundColor({ color: '#2d5a47' });
          await chrome.action.setTitle({ title: `${prayerName} time has entered` });

          // Create a system notification (if permission available)
          try {
            const iconUrl = chrome.runtime.getURL('icons/icons8-mosque-48.png');
            const notifId = `prayer-${today}-${prayerName}`;
            const title = `${prayerName} time has entered`;
            const message = `It's time for ${prayerName}. Click to open.`;

            if (chrome.notifications) {
              chrome.notifications.create(notifId, {
                type: 'basic',
                iconUrl,
                title,
                message,
                priority: 2
              });
            }
          } catch (nError) {
            console.warn('Notification error:', nError);
          }

          return prayerName;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Prayer check error:', error);
    return null;
  }
}

/**
 * Main check function - runs on startup and periodically
 */
async function runChecks() {
  // Check if first open today
  const isFirstOpen = await checkFirstOpenToday();
  
  // If not first open, check prayer time
  if (!isFirstOpen) {
    await checkPrayerTime();
  }
}

// ============================================
// Event Listeners
// ============================================

// On extension install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('1-Minute Deen installed');
  
  // Set up periodic alarm for prayer checks
  await chrome.alarms.create(PRAYER_CHECK_ALARM, {
    periodInMinutes: PRAYER_CHECK_INTERVAL
  });
  
  // Initial check
  await runChecks();
});

// On browser startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started - checking reminders');
  await runChecks();
});

// On alarm (periodic prayer check)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === PRAYER_CHECK_ALARM) {
    await checkPrayerTime();
  }
});

// When user clicks the extension icon
chrome.action.onClicked.addListener(async () => {
  // Clear badge when popup opens
  await chrome.action.setBadgeText({ text: '' });
});
