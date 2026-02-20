/**
 * 1-Minute Deen - Popup Page
 * Main entry point for the popup extension
 */

// Import services
import { getTodaysReminder } from '../services/reminderService.js';
import { checkCurrentPrayer } from '../services/prayerService.js';
import { 
  getLanguage, 
  setLanguage, 
  getStreakData, 
  markTodayComplete, 
  validateStreak,
  get,
  set,
  getLocationSettings,
  setLocationSettings
} from '../storage/storageService.js';

/**
 * Create the reminder card HTML structure
 */
function createCardElement() {
  const card = document.createElement('div');
  card.className = 'reminder-card fade-in';
  card.innerHTML = `
    <!-- Streak Indicator -->
    <div class="streak-indicator" id="streakIndicator">
      <span class="flame">🔥</span>
      <span class="streak-count" id="streakCount">0</span>
      <span class="streak-label">days</span>
    </div>

    <!-- Actionable Title -->
    <h2 class="reminder-title" id="reminderTitle">Loading...</h2>

    <!-- Main Content Area -->
    <div class="reminder-content" id="reminderContent">
      <p class="reminder-text arabic-text" id="textArabic"></p>
      <p class="reminder-text english hidden" id="textEnglish"></p>
      <p class="reminder-text urdu hidden" id="textUrdu"></p>
    </div>

    <!-- Reference -->
    <p class="reminder-reference" id="reminderReference"></p>

    <!-- Translation Toggle -->
    <div class="translation-toggle" id="translationToggle">
      <button class="toggle-btn active" data-lang="arabic">Arabic</button>
      <button class="toggle-btn" data-lang="english">English</button>
      <button class="toggle-btn" data-lang="urdu">Urdu</button>
    </div>

    <!-- Done Button -->
    <button class="done-btn" id="doneBtn">
      <span>I practiced this today</span>
      <span class="checkmark">✓</span>
    </button>
  `;
  return card;
}

/**
 * Create prayer banner
 */
function createPrayerBanner() {
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
 * Update card content
 */
function updateCardContent(reminder) {
  document.getElementById('reminderTitle').textContent = reminder.title;
  document.getElementById('textArabic').textContent = reminder.arabic;
  document.getElementById('textEnglish').textContent = reminder.english;
  document.getElementById('textUrdu').textContent = reminder.urdu;
  document.getElementById('reminderReference').textContent = reminder.reference;
}

/**
 * Set active language
 */
function setActiveLanguage(lang) {
  const textArabic = document.getElementById('textArabic');
  const textEnglish = document.getElementById('textEnglish');
  const textUrdu = document.getElementById('textUrdu');

  textArabic.classList.toggle('hidden', lang !== 'arabic');
  textEnglish.classList.toggle('hidden', lang !== 'english');
  textUrdu.classList.toggle('hidden', lang !== 'urdu');

  const buttons = document.querySelectorAll('.toggle-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/**
 * Update streak display
 */
function updateStreakDisplay(streak, visible = true) {
  const indicator = document.getElementById('streakIndicator');
  const countEl = document.getElementById('streakCount');
  
  countEl.textContent = streak;
  indicator.classList.toggle('visible', visible && streak > 0);
  
  const label = indicator.querySelector('.streak-label');
  label.textContent = streak === 1 ? 'day' : 'days';
}

/**
 * Mark button as completed
 */
function markButtonCompleted() {
  const btn = document.getElementById('doneBtn');
  btn.classList.add('completed');
  btn.innerHTML = `
    <span>Completed today</span>
    <span class="checkmark">✓</span>
  `;
  btn.disabled = true;
}

/**
 * Show prayer banner
 */
function showPrayerBanner(prayerName) {
  const banner = document.getElementById('prayerBanner');
  const text = document.getElementById('prayerText');
  
  if (banner && text) {
    text.textContent = `${prayerName} time has entered`;
    banner.classList.add('visible');
  }
}

/**
 * Show error
 */
function showError(message) {
  const content = document.getElementById('reminderContent');
  if (content) {
    content.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
  }
}

/**
 * Initialize popup
 */
async function init() {
  const app = document.getElementById('app');
  
  try {
    app.innerHTML = '';
    
    // Add prayer banner
    app.appendChild(createPrayerBanner());
    
    // Add reminder card
    app.appendChild(createCardElement());

    // Load data
    const [reminder, language, streakData] = await Promise.all([
      getTodaysReminder(),
      getLanguage(),
      getStreakData()
    ]);

    updateCardContent(reminder);
    setActiveLanguage(language);
    
    const validStreak = await validateStreak();
    updateStreakDisplay(validStreak);

    if (streakData.completedToday) {
      markButtonCompleted();
    }

    // Setup events
      setupEventListeners();

      // Prefill settings inputs if available
      const savedLocation = await getLocationSettings();
      if (savedLocation) {
        const cityInput = document.getElementById('cityInput');
        const countryInput = document.getElementById('countryInput');
        if (cityInput && savedLocation.city) cityInput.value = savedLocation.city;
        if (countryInput && savedLocation.country) countryInput.value = savedLocation.country;
      }

    // Check prayer time
    const currentPrayer = await checkCurrentPrayer();
    if (currentPrayer) {
      showPrayerBanner(currentPrayer.prayer);
    }

    // Mark that user has seen reminder today
    await set('lastSeenDate', new Date().toDateString());
    
    // Clear badge since user opened popup
    chrome.action.setBadgeText({ text: '' });

  } catch (error) {
    console.error('Failed to initialize:', error);
    showError('Unable to load reminder.');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Translation toggle
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const lang = e.target.dataset.lang;
      if (lang) {
        setActiveLanguage(lang);
        await setLanguage(lang);
      }
    });
  });

  // Done button
  const doneBtn = document.getElementById('doneBtn');
  if (doneBtn) {
    doneBtn.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains('completed') || btn.disabled) return;

      const result = await markTodayComplete();
      markButtonCompleted();
      updateStreakDisplay(result.streak, true);
      
      btn.style.transform = 'scale(1.05)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    });
  }

  // Settings toggle
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const saveLocationBtn = document.getElementById('saveLocationBtn');
  const cancelLocationBtn = document.getElementById('cancelLocationBtn');

  if (openSettingsBtn && settingsPanel) {
    openSettingsBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
    });
  }

  if (cancelLocationBtn && settingsPanel) {
    cancelLocationBtn.addEventListener('click', () => {
      settingsPanel.classList.add('hidden');
    });
  }

  if (saveLocationBtn) {
    saveLocationBtn.addEventListener('click', async () => {
      const city = document.getElementById('cityInput').value.trim();
      const country = document.getElementById('countryInput').value.trim();
      if (!city || !country) {
        alert('Please enter both city and country.');
        return;
      }
      await setLocationSettings(city, country);
      settingsPanel.classList.add('hidden');
      // Optionally refresh prayer banner by re-checking prayer
      const currentPrayer = await checkCurrentPrayer();
      if (currentPrayer) showPrayerBanner(currentPrayer.prayer);
    });
  }
}

// Initialize
init();
