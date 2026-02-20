/**
 * Reminder Card Component
 * Main UI component displaying the daily reminder
 */

/**
 * Create the reminder card HTML structure
 * @returns {HTMLElement}
 */
export function createCardElement() {
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
 * Update card content with reminder data
 * @param {Object} reminder - Reminder object with translations
 */
export function updateCardContent(reminder) {
  document.getElementById('reminderTitle').textContent = reminder.title;
  document.getElementById('textArabic').textContent = reminder.arabic;
  document.getElementById('textEnglish').textContent = reminder.english;
  document.getElementById('textUrdu').textContent = reminder.urdu;
  document.getElementById('reminderReference').textContent = reminder.reference;
}

/**
 * Set the active language for display
 * @param {string} lang - "arabic" | "english" | "urdu"
 */
export function setActiveLanguage(lang) {
  // Update text visibility
  const textArabic = document.getElementById('textArabic');
  const textEnglish = document.getElementById('textEnglish');
  const textUrdu = document.getElementById('textUrdu');

  textArabic.classList.toggle('hidden', lang !== 'arabic');
  textEnglish.classList.toggle('hidden', lang !== 'english');
  textUrdu.classList.toggle('hidden', lang !== 'urdu');

  // Update button states
  const buttons = document.querySelectorAll('.toggle-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/**
 * Update streak display
 * @param {number} streak - Current streak count
 * @param {boolean} visible - Whether to show the indicator
 */
export function updateStreakDisplay(streak, visible = true) {
  const indicator = document.getElementById('streakIndicator');
  const countEl = document.getElementById('streakCount');
  
  countEl.textContent = streak;
  indicator.classList.toggle('visible', visible && streak > 0);
  
  // Update label for singular/plural
  const label = indicator.querySelector('.streak-label');
  label.textContent = streak === 1 ? 'day' : 'days';
}

/**
 * Mark the done button as completed
 */
export function markButtonCompleted() {
  const btn = document.getElementById('doneBtn');
  btn.classList.add('completed');
  btn.innerHTML = `
    <span>Completed today</span>
    <span class="checkmark">✓</span>
  `;
  btn.disabled = true;
}

/**
 * Show loading state
 */
export function showLoading() {
  const content = document.getElementById('reminderContent');
  if (content) {
    content.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading your reminder...</p>
      </div>
    `;
  }
}

/**
 * Show error state
 * @param {string} message - Error message
 */
export function showError(message) {
  const content = document.getElementById('reminderContent');
  if (content) {
    content.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}
