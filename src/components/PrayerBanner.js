/**
 * Prayer Banner Component
 * Displays subtle notification when prayer time has entered
 */

/**
 * Create the prayer banner element
 * @returns {HTMLElement}
 */
export function createPrayerBanner() {
  const banner = document.createElement('div');
  banner.className = 'prayer-banner';
  banner.id = 'prayerBanner';
  banner.innerHTML = `
    <span class="prayer-icon">🕌</span>
    <span class="prayer-text" id="prayerText"></span>
  `;
  return banner;
}

/**
 * Show the prayer banner with prayer name
 * @param {string} prayerName - Name of the prayer (Fajr, Dhuhr, etc.)
 */
export function showPrayerBanner(prayerName) {
  const banner = document.getElementById('prayerBanner');
  const text = document.getElementById('prayerText');
  
  if (banner && text) {
    text.textContent = `${prayerName} time has entered`;
    banner.classList.add('visible');
    
    // Auto-hide after 10 seconds to not distract
    setTimeout(() => {
      hidePrayerBanner();
    }, 10000);
  }
}

/**
 * Hide the prayer banner
 */
export function hidePrayerBanner() {
  const banner = document.getElementById('prayerBanner');
  if (banner) {
    banner.classList.remove('visible');
  }
}
