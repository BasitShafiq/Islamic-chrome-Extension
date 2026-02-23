/**
 * 1-Minute Deen - New Tab Page
 * Main entry point for the extension
 * 
 * This module orchestrates:
 * - Loading and displaying the daily reminder
 * - Prayer time awareness
 * - Translation toggling
 * - Streak tracking
 * - Audio playback
 */

// Import services
import { getTodaysReminder } from '../services/reminderService.js';
import { checkCurrentPrayer } from '../services/prayerService.js';
import { 
  playReminder, 
  stopPlayback, 
  initVoices, 
  isSpeechSupported,
  isVoiceAvailable
} from '../services/audioService.js';
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
  showError,
  getCurrentReminder
} from '../components/Card.js';
import { createPrayerBanner, showPrayerBanner } from '../components/PrayerBanner.js';

// Track current language
let currentLanguage = 'arabic';

/**
 * Initialize the application
 * Called when DOM is ready
 */
async function init() {
  const app = document.getElementById('app');
  
  // Initialize speech synthesis early
  initVoices();
  
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

    // Store current language
    currentLanguage = language;
    
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

    // Hide audio button if not supported or not English
    updateAudioButtonVisibility(language);

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

  // Audio button
  const audioBtn = document.getElementById('audioBtn');
  if (audioBtn) {
    audioBtn.addEventListener('click', handleAudioClick);
  }
}

/**
 * Handle language toggle button click
 * @param {Event} event
 */
async function handleLanguageToggle(event) {
  const lang = event.target.dataset.lang;
  
  if (!lang) return;

  // Update current language
  currentLanguage = lang;
  
  // Update UI immediately for responsiveness
  setActiveLanguage(lang);
  
  // Show/hide audio button based on language (only English supported)
  updateAudioButtonVisibility(lang);

  // Persist preference
  try {
    await setLanguage(lang);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
}

/**
 * Update audio button visibility - only show for English
 * @param {string} lang - Current language
 */
function updateAudioButtonVisibility(lang) {
  const audioBtn = document.getElementById('audioBtn');
  if (!audioBtn) return;
  
  if (!isSpeechSupported() || lang !== 'english') {
    audioBtn.style.display = 'none';
  } else {
    audioBtn.style.display = '';
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
 * Handle audio button click
 */
function handleAudioClick() {
  const audioBtn = document.getElementById('audioBtn');
  const audioText = audioBtn.querySelector('.audio-text');
  const audioIcon = audioBtn.querySelector('.audio-icon');
  
  const reminder = getCurrentReminder();
  
  if (!reminder) {
    console.error('No reminder loaded for audio');
    return;
  }

  playReminder(
    reminder,
    currentLanguage,
    // On start callback
    () => {
      audioBtn.classList.add('playing');
      audioIcon.textContent = '⏸️';
      audioText.textContent = 'Stop';
    },
    // On end callback
    (result) => {
      audioBtn.classList.remove('playing');
      audioIcon.textContent = '🔊';
      audioText.textContent = 'Listen';
    },
    // On error callback - voice not available
    (message) => {
      showVoiceNotAvailableMessage(message);
    }
  );
}

/**
 * Show a notification when voice is not available
 * @param {string} message - The error message to display
 */
function showVoiceNotAvailableMessage(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'voice-notification';
  notification.innerHTML = `
    <div class="voice-notification-content">
      <span class="voice-notification-icon">🔇</span>
      <div class="voice-notification-text">
        <strong>Voice Not Available</strong>
        <p>${message}</p>
      </div>
      <button class="voice-notification-close">✕</button>
    </div>
  `;
  
  // Add styles if not already present
  if (!document.getElementById('voice-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'voice-notification-styles';
    style.textContent = `
      .voice-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid rgba(255, 215, 0, 0.3);
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-width: 90%;
        width: 450px;
        animation: slideUp 0.3s ease-out;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      
      .voice-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      
      .voice-notification-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .voice-notification-text {
        flex: 1;
        color: #e0e0e0;
      }
      
      .voice-notification-text strong {
        color: #ffd700;
        display: block;
        margin-bottom: 4px;
      }
      
      .voice-notification-text p {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        opacity: 0.9;
      }
      
      .voice-notification-close {
        background: none;
        border: none;
        color: #888;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
      }
      
      .voice-notification-close:hover {
        color: #fff;
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Close button handler
  const closeBtn = notification.querySelector('.voice-notification-close');
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideUp 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 8000);
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