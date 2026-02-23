/**
 * Audio Service
 * Handles text-to-speech functionality for reciting Quran verses and Hadith
 * Uses the Web Speech API for reliable cross-platform audio
 */

// Track current audio state
let isPlaying = false;
let currentUtterance = null;
let voicesLoaded = false;

/**
 * Load and cache voices
 * @returns {Promise<SpeechSynthesisVoice[]>}
 */
function loadVoices() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    
    // Wait for voices to load
    speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      resolve(speechSynthesis.getVoices());
    };
    
    // Timeout fallback
    setTimeout(() => {
      resolve(speechSynthesis.getVoices());
    }, 1000);
  });
}

/**
 * Get available Arabic voice with multiple fallback options
 * @returns {SpeechSynthesisVoice|null}
 */
function getArabicVoice() {
  const voices = speechSynthesis.getVoices();
  
  // Try multiple Arabic language codes
  const arabicCodes = ['ar-SA', 'ar-EG', 'ar-AE', 'ar-QA', 'ar-KW', 'ar-MA', 'ar'];
  
  for (const code of arabicCodes) {
    const voice = voices.find(v => v.lang === code || v.lang.startsWith(code.split('-')[0]));
    if (voice) return voice;
  }
  
  // Try by name
  const arabicVoice = voices.find(voice => 
    voice.name.toLowerCase().includes('arabic') ||
    voice.name.toLowerCase().includes('arab')
  );
  
  return arabicVoice || null;
}

/**
 * Get available English voice
 * @returns {SpeechSynthesisVoice|null}
 */
function getEnglishVoice() {
  const voices = speechSynthesis.getVoices();
  // Prefer natural-sounding English voices
  const englishVoice = voices.find(voice => 
    voice.lang.startsWith('en') && 
    (voice.name.includes('Natural') || voice.name.includes('Premium') || voice.name.includes('Google'))
  ) || voices.find(voice => voice.lang.startsWith('en'));
  return englishVoice || null;
}

/**
 * Get available Urdu voice with Hindi fallback
 * @returns {SpeechSynthesisVoice|null}
 */
function getUrduVoice() {
  const voices = speechSynthesis.getVoices();
  
  // Try Urdu first
  const urduCodes = ['ur-PK', 'ur-IN', 'ur'];
  for (const code of urduCodes) {
    const voice = voices.find(v => v.lang === code || v.lang.startsWith('ur'));
    if (voice) return voice;
  }
  
  // Try by name
  let urduVoice = voices.find(voice => 
    voice.name.toLowerCase().includes('urdu')
  );
  if (urduVoice) return urduVoice;
  
  // Fallback to Hindi (similar script family, better than nothing)
  const hindiCodes = ['hi-IN', 'hi'];
  for (const code of hindiCodes) {
    const voice = voices.find(v => v.lang === code || v.lang.startsWith('hi'));
    if (voice) return voice;
  }
  
  return voices.find(voice => voice.name.toLowerCase().includes('hindi')) || null;
}

/**
 * Check if a specific language voice is available
 * @param {string} lang - 'arabic', 'english', 'urdu'
 * @returns {boolean}
 */
export function isVoiceAvailable(lang) {
  switch (lang) {
    case 'arabic':
      return getArabicVoice() !== null;
    case 'urdu':
      return getUrduVoice() !== null;
    case 'english':
    default:
      return getEnglishVoice() !== null;
  }
}

/**
 * Get available languages for audio
 * @returns {string[]}
 */
export function getAvailableAudioLanguages() {
  const available = [];
  if (getEnglishVoice()) available.push('english');
  if (getArabicVoice()) available.push('arabic');
  if (getUrduVoice()) available.push('urdu');
  return available;
}

/**
 * Speak text in the specified language
 * @param {string} text - Text to speak
 * @param {string} lang - Language code ('arabic', 'english', 'urdu')
 * @param {boolean} forceFallback - Whether to fallback to English if voice unavailable
 * @returns {Promise<{success: boolean, usedFallback: boolean, message?: string}>}
 */
function speakText(text, lang, forceFallback = true) {
  return new Promise((resolve) => {
    if (!text || !text.trim()) {
      resolve({ success: true, usedFallback: false });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;
    
    let voice = null;
    let usedFallback = false;
    
    // Set language and voice based on the selected language
    switch (lang) {
      case 'arabic':
        voice = getArabicVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else if (forceFallback) {
          // No Arabic voice - notify but don't fail
          resolve({ 
            success: false, 
            usedFallback: false, 
            message: 'Arabic voice not available on this device. Please install Arabic language pack in Windows Settings > Time & Language > Language.' 
          });
          return;
        }
        utterance.rate = 0.8;
        break;
        
      case 'urdu':
        voice = getUrduVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else if (forceFallback) {
          resolve({ 
            success: false, 
            usedFallback: false, 
            message: 'Urdu voice not available on this device. Please install Urdu language pack in Windows Settings > Time & Language > Language.' 
          });
          return;
        }
        utterance.rate = 0.85;
        break;
        
      case 'english':
      default:
        voice = getEnglishVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = 'en-US';
        }
        utterance.rate = 0.9;
        break;
    }

    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      resolve({ success: true, usedFallback });
    };

    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') {
        resolve({ success: true, usedFallback });
      } else {
        resolve({ 
          success: false, 
          usedFallback: false, 
          message: `Speech error: ${event.error}` 
        });
      }
    };

    speechSynthesis.speak(utterance);
  });
}

/**
 * Play the reminder content in the currently active language
 * @param {Object} reminder - The reminder object with text
 * @param {string} activeLanguage - Currently active language ('arabic', 'english', 'urdu')
 * @param {Function} onStart - Callback when playback starts
 * @param {Function} onEnd - Callback when playback ends (receives result object)
 * @param {Function} onError - Callback when voice not available
 */
export async function playReminder(reminder, activeLanguage, onStart, onEnd, onError) {
  if (!reminder) {
    console.error('No reminder to play');
    return { success: false, message: 'No reminder to play' };
  }

  // If already playing, stop it
  if (isPlaying) {
    stopPlayback();
    if (onEnd) onEnd({ stopped: true });
    return { success: true, stopped: true };
  }

  // Wait for voices to load if needed
  if (speechSynthesis.getVoices().length === 0) {
    await loadVoices();
  }

  // Get text based on active language
  let textToSpeak = '';
  switch (activeLanguage) {
    case 'arabic':
      textToSpeak = reminder.arabic;
      break;
    case 'urdu':
      textToSpeak = reminder.urdu;
      break;
    case 'english':
    default:
      textToSpeak = reminder.english;
      break;
  }

  isPlaying = true;
  if (onStart) onStart();

  try {
    const result = await speakText(textToSpeak, activeLanguage);
    
    if (!result.success && result.message) {
      // Voice not available - notify user
      if (onError) onError(result.message);
      isPlaying = false;
      if (onEnd) onEnd(result);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Audio playback error:', error);
    return { success: false, message: error.message };
  } finally {
    isPlaying = false;
    currentUtterance = null;
    if (onEnd) onEnd({ success: true });
  }
}

/**
 * Stop any current playback
 */
export function stopPlayback() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  isPlaying = false;
  currentUtterance = null;
}

/**
 * Check if audio is currently playing
 * @returns {boolean}
 */
export function isAudioPlaying() {
  return isPlaying;
}

/**
 * Check if Speech Synthesis is supported
 * @returns {boolean}
 */
export function isSpeechSupported() {
  return 'speechSynthesis' in window;
}

/**
 * Initialize voices (call early to preload)
 */
export function initVoices() {
  if (isSpeechSupported()) {
    // Trigger voice loading
    speechSynthesis.getVoices();
    
    // Some browsers need this event
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }
}
