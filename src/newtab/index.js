/**
 * 1-Minute Deen - New Tab Page
 * Main entry point for the extension
 * 
 * This module orchestrates:
 * - Loading and displaying the daily reminder
 * - Prayer time awareness
 * - Translation toggling
 * - Streak tracking
 */

// Import services
import { getTodaysReminder } from '../services/reminderService.js';
import { checkCurrentPrayer } from '../services/prayerService.js';
import { 
  getLanguage, 
  setLanguage, 
  getStreakData, 
  markTodayComplete, 
  validateStreak 
} from '../storage/storageService.js';

// Import components
import { 
  createCardElement, 
  updateCardContent, 
  setActiveLanguage, 
  updateStreakDisplay, 
  markButtonCompleted,
  showError 
} from '../components/Card.js';
import { createPrayerBanner, showPrayerBanner } from '../components/PrayerBanner.js';

/**
 * Initialize the application
 * Called when DOM is ready
 */
async function init() {
  const app = document.getElementById('app');
  
  try {
    // Create main UI structure
    app.innerHTML = '';
    
    // Add prayer banner (initially hidden)
    app.appendChild(createPrayerBanner());
    
    // Add reminder card
    app.appendChild(createCardElement());

    // Load data in parallel for faster init
    const [reminder, language, streakData] = await Promise.all([
      getTodaysReminder(),
      getLanguage(),
      getStreakData()
    ]);

    // Update UI with loaded data
    updateCardContent(reminder);
    setActiveLanguage(language);
    
    // Validate and display streak
    const validStreak = await validateStreak();
    updateStreakDisplay(validStreak);

    // Check if already completed today - show completed button
    if (streakData.completedToday) {
      markButtonCompleted();
    }

    // Setup event listeners
    setupEventListeners();

    // Check prayer time (non-blocking)
    checkPrayerTime();

  } catch (error) {
    console.error('Failed to initialize:', error);
    showError('Unable to load your reminder.');
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Translation toggle buttons
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', handleLanguageToggle);
  });

  // Done button
  const doneBtn = document.getElementById('doneBtn');
  if (doneBtn) {
    doneBtn.addEventListener('click', handleDoneClick);
  }
}

/**
 * Handle language toggle button click
 * @param {Event} event
 */
async function handleLanguageToggle(event) {
  const lang = event.target.dataset.lang;
  
  if (!lang) return;

  // Update UI immediately for responsiveness
  setActiveLanguage(lang);

  // Persist preference
  try {
    await setLanguage(lang);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
}

/**
 * Handle done button click
 * @param {Event} event
 */
async function handleDoneClick(event) {
  const btn = event.currentTarget;
  
  // Prevent double-clicks
  if (btn.classList.contains('completed') || btn.disabled) {
    return;
  }

  try {
    // Mark as completed and get new streak
    const result = await markTodayComplete();

    // Update UI
    markButtonCompleted();
    updateStreakDisplay(result.streak, true);

    // Brief celebration animation
    btn.style.transform = 'scale(1.05)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 200);

  } catch (error) {
    console.error('Failed to mark as complete:', error);
  }
}

/**
 * Check and display current prayer time
 * Non-blocking - errors are silently logged
 */
async function checkPrayerTime() {
  try {
    const currentPrayer = await checkCurrentPrayer();
    
    if (currentPrayer) {
      showPrayerBanner(currentPrayer.prayer);
    }
  } catch (error) {
    // Silently fail - prayer time is a nice-to-have feature
    console.log('Prayer time check failed:', error.message);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
